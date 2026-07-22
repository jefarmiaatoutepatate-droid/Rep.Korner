import React, { useCallback, useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, MEAL_TYPES, type MealType } from '@/constants/theme';
import { Card, SectionTitle, Button, Pill } from '@/components/ui';
import { useDayStore } from '@/store/dayStore';
import { todayISO } from '@/lib/dates';
import { computeMacros } from '@/lib/macros';
import {
  searchLocal,
  searchOpenFoodFacts,
  estimateWithClaude,
  parseQuickAdd,
  type FoodSuggestion,
} from '@/lib/foodService';
import { upsertFood, addMealEntry, deleteMealEntry } from '@/db/repositories';
import type { Food } from '@/types';

type Candidate = Omit<Food, 'id' | 'usage_count'> & { id?: number };

export default function NutritionScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ meal?: string }>();
  const { entries, refresh } = useDayStore();

  const [meal, setMeal] = useState<MealType>((params.meal as MealType) ?? 'breakfast');
  const [query, setQuery] = useState('');
  const [quantity, setQuantity] = useState('100');
  const [local, setLocal] = useState<Food[]>([]);
  const [remote, setRemote] = useState<FoodSuggestion[]>([]);
  const [selected, setSelected] = useState<Candidate | null>(null);
  const [loadingRemote, setLoadingRemote] = useState(false);

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));
  useEffect(() => { if (params.meal) setMeal(params.meal as MealType); }, [params.meal]);

  // Niveau 1 : cache local en direct
  useEffect(() => {
    let alive = true;
    if (query.trim().length < 2) { setLocal([]); return; }
    searchLocal(query).then((r) => alive && setLocal(r)).catch(() => {});
    return () => { alive = false; };
  }, [query]);

  const runRemoteSearch = async () => {
    if (query.trim().length < 2) return;
    setLoadingRemote(true);
    setRemote([]);
    try {
      const off = await searchOpenFoodFacts(query, 3);
      setRemote(off);
      if (off.length === 0) await tryClaude();
    } catch {
      await tryClaude();
    } finally {
      setLoadingRemote(false);
    }
  };

  const tryClaude = async () => {
    try {
      const q = parseInt(quantity, 10) || 100;
      const est = await estimateWithClaude(query, q);
      if (est) {
        const factor = 100 / q;
        setRemote([
          {
            name: query,
            kcal_per_100g: Math.round(est.kcal * factor),
            protein_per_100g: Math.round(est.protein_g * factor * 10) / 10,
            carbs_per_100g: Math.round(est.carbs_g * factor * 10) / 10,
            fat_per_100g: Math.round(est.fat_g * factor * 10) / 10,
            source: 'claude',
          },
        ]);
      } else {
        Alert.alert('Introuvable', 'Aucun résultat. Configure le proxy Claude ou saisis les macros manuellement.');
      }
    } catch {
      Alert.alert('Erreur réseau', 'Impossible de joindre OpenFoodFacts / le proxy Claude.');
    }
  };

  const pick = (c: Candidate) => {
    setSelected(c);
  };

  const save = async () => {
    if (!selected) return;
    const q = parseFloat(quantity.replace(',', '.'));
    if (!q || q <= 0) { Alert.alert('Quantité invalide'); return; }
    const foodId = await upsertFood({
      name: selected.name,
      kcal_per_100g: selected.kcal_per_100g,
      protein_per_100g: selected.protein_per_100g,
      carbs_per_100g: selected.carbs_per_100g,
      fat_per_100g: selected.fat_per_100g,
      source: selected.source,
    });
    await addMealEntry({
      date: todayISO(),
      meal_type: meal,
      food: { ...selected, id: foodId, usage_count: 0 } as Food,
      quantity_g: q,
    });
    setSelected(null);
    setQuery('');
    setRemote([]);
    setLocal([]);
    await refresh();
  };

  const preview = selected ? computeMacros(selected, parseFloat(quantity.replace(',', '.')) || 0) : null;
  const todayEntries = entries.filter((e) => e.meal_type === meal);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900', marginBottom: 14 }}>Nutrition</Text>

      {/* Sélecteur de repas */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        {MEAL_TYPES.map((m) => (
          <Pill key={m.key} label={`${m.icon} ${m.label}`} active={meal === m.key} onPress={() => setMeal(m.key)} />
        ))}
      </ScrollView>

      {/* Recherche + quantité */}
      <Card>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un aliment…"
            placeholderTextColor={COLORS.muted}
            style={inputStyle}
          />
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            placeholder="g"
            placeholderTextColor={COLORS.muted}
            style={[inputStyle, { width: 74, textAlign: 'center' }]}
          />
        </View>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
          <Button title={loadingRemote ? '…' : 'Chercher en ligne'} onPress={runRemoteSearch} variant="ghost" style={{ flex: 1 }} />
        </View>
      </Card>

      {/* Suggestions locales */}
      {local.length > 0 && !selected && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>Cache local</Text>
          {local.slice(0, 6).map((f) => (
            <SuggestionRow key={f.id} c={f} onPress={() => pick(f)} />
          ))}
        </View>
      )}

      {/* Suggestions distantes */}
      {loadingRemote && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 12 }} />}
      {remote.length > 0 && !selected && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 6 }}>En ligne</Text>
          {remote.map((f, i) => (
            <SuggestionRow key={`${f.name}-${i}`} c={f} onPress={() => pick(f)} />
          ))}
        </View>
      )}

      {/* Aperçu + validation */}
      {selected && preview && (
        <Card style={{ marginTop: 12, borderColor: COLORS.accent }}>
          <Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 16 }}>{selected.name}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
            {quantity} g · source {selected.source}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
            <Macro label="kcal" value={preview.kcal} color={COLORS.accent} />
            <Macro label="P" value={preview.protein_g} color={COLORS.protein} />
            <Macro label="G" value={preview.carbs_g} color={COLORS.carbs} />
            <Macro label="L" value={preview.fat_g} color={COLORS.fat} />
          </View>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Button title="Annuler" onPress={() => setSelected(null)} variant="ghost" style={{ flex: 1 }} />
            <Button title="Ajouter au repas" onPress={save} style={{ flex: 2 }} />
          </View>
        </Card>
      )}

      <QuickAdd meal={meal} onDone={refresh} />

      {/* Historique du repas sélectionné */}
      <View style={{ marginTop: 22 }}>
        <SectionTitle>Logué · {MEAL_TYPES.find((m) => m.key === meal)?.label}</SectionTitle>
        {todayEntries.length === 0 && <Text style={{ color: COLORS.muted }}>Rien pour ce repas aujourd'hui.</Text>}
        {todayEntries.map((e) => (
          <Card key={e.id} style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: COLORS.text, fontWeight: '600' }}>{e.food_name}</Text>
              <Text style={{ color: COLORS.muted, fontSize: 12 }}>
                {e.quantity_g} g · {Math.round(e.kcal)} kcal · P{Math.round(e.protein_g)} G{Math.round(e.carbs_g)} L{Math.round(e.fat_g)}
              </Text>
            </View>
            <Pressable onPress={async () => { await deleteMealEntry(e.id); await refresh(); }}>
              <Text style={{ color: COLORS.danger, fontSize: 18, paddingHorizontal: 6 }}>🗑</Text>
            </Pressable>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

/** Widget d'ajout rapide : "180g poulet + 100g riz" → résolution + ajout groupé. */
function QuickAdd({ meal, onDone }: { meal: MealType; onDone: () => void }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const run = async () => {
    const items = parseQuickAdd(text);
    if (items.length === 0) return;
    setBusy(true);
    let added = 0;
    const failed: string[] = [];
    try {
      for (const it of items) {
        const qty = it.quantity_g ?? 100;
        let cand: Candidate | null = null;
        const localHits = await searchLocal(it.name);
        if (localHits[0]) cand = localHits[0];
        if (!cand) {
          const off = await searchOpenFoodFacts(it.name, 1).catch(() => []);
          if (off[0]) cand = off[0];
        }
        if (!cand) { failed.push(it.name); continue; }
        const foodId = await upsertFood({
          name: cand.name,
          kcal_per_100g: cand.kcal_per_100g,
          protein_per_100g: cand.protein_per_100g,
          carbs_per_100g: cand.carbs_per_100g,
          fat_per_100g: cand.fat_per_100g,
          source: cand.source,
        });
        await addMealEntry({
          date: todayISO(),
          meal_type: meal,
          food: { ...cand, id: foodId, usage_count: 0 } as Food,
          quantity_g: qty,
        });
        added++;
      }
    } finally {
      setBusy(false);
      setText('');
      onDone();
      if (failed.length) Alert.alert('Ajout partiel', `${added} ajouté(s). Introuvables : ${failed.join(', ')}`);
    }
  };

  return (
    <Card style={{ marginTop: 14 }}>
      <Text style={{ color: COLORS.text, fontWeight: '700', marginBottom: 8 }}>⚡ Ajout rapide</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="180g poulet + 100g riz + brocolis"
        placeholderTextColor={COLORS.muted}
        style={inputStyle}
      />
      <Button title={busy ? 'Résolution…' : 'Parser & ajouter'} onPress={run} style={{ marginTop: 10 }} />
    </Card>
  );
}

function SuggestionRow({ c, onPress }: { c: Candidate; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontWeight: '600' }}>{c.name}</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>
            /100g · {Math.round(c.kcal_per_100g)} kcal · P{c.protein_per_100g} G{c.carbs_per_100g} L{c.fat_per_100g}
          </Text>
        </View>
        <Text style={{ color: COLORS.accent, fontSize: 20 }}>＋</Text>
      </Card>
    </Pressable>
  );
}

function Macro({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: COLORS.muted, fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const inputStyle = {
  flex: 1,
  backgroundColor: COLORS.bgElevated,
  borderColor: COLORS.border,
  borderWidth: 1,
  borderRadius: 10,
  paddingHorizontal: 12,
  paddingVertical: 10,
  color: COLORS.text,
  fontSize: 15,
} as const;
