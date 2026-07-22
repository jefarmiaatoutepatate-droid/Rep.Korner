import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, MEAL_TYPES, type MealType } from '@/constants/theme';
import { Card, SectionHeader, Button, Pill, GradientBg, Thumb } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { useDayStore } from '@/store/dayStore';
import { todayISO } from '@/lib/dates';
import { computeMacros } from '@/lib/macros';
import { searchLocal, searchOpenFoodFacts, estimateWithClaude, parseQuickAdd, type FoodSuggestion } from '@/lib/foodService';
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
        setRemote([{
          name: query,
          kcal_per_100g: Math.round(est.kcal * factor),
          protein_per_100g: Math.round(est.protein_g * factor * 10) / 10,
          carbs_per_100g: Math.round(est.carbs_g * factor * 10) / 10,
          fat_per_100g: Math.round(est.fat_g * factor * 10) / 10,
          source: 'claude',
        }]);
      } else {
        Alert.alert('Introuvable', 'Aucun résultat. Configure le proxy Claude ou saisis les macros manuellement.');
      }
    } catch {
      Alert.alert('Erreur réseau', 'Impossible de joindre OpenFoodFacts / le proxy Claude.');
    }
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
    await addMealEntry({ date: todayISO(), meal_type: meal, food: { ...selected, id: foodId, usage_count: 0 } as Food, quantity_g: q });
    setSelected(null);
    setQuery('');
    setRemote([]);
    setLocal([]);
    await refresh();
  };

  const preview = selected ? computeMacros(selected, parseFloat(quantity.replace(',', '.')) || 0) : null;
  const todayEntries = entries.filter((e) => e.meal_type === meal);
  const mealLabel = MEAL_TYPES.find((m) => m.key === meal)?.label;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 110 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 14 }}>Nutrition</Text>

        {/* Sélecteur de repas */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
          {MEAL_TYPES.map((m) => (
            <Pill key={m.key} label={m.label} active={meal === m.key} onPress={() => setMeal(m.key)} />
          ))}
        </ScrollView>

        {/* Recherche */}
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 }}>
          <Icon name="search" size={19} color={COLORS.faint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Rechercher un aliment…"
            placeholderTextColor={COLORS.faint}
            style={{ flex: 1, color: COLORS.text, fontSize: 15, padding: 0 }}
          />
          <TextInput
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
            style={{ backgroundColor: COLORS.surfaceHi, borderColor: COLORS.hairline, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, color: COLORS.text, fontSize: 13, fontWeight: '600', minWidth: 52, textAlign: 'center' }}
          />
        </Card>
        <Button title={loadingRemote ? 'Recherche…' : 'Chercher en ligne'} onPress={runRemoteSearch} variant="ghost" icon="search" style={{ marginTop: 10 }} />

        {/* Suggestions locales */}
        {local.length > 0 && !selected && (
          <>
            <SectionHeader title="Cache local" />
            <View style={{ gap: 10 }}>
              {local.slice(0, 6).map((f) => <SuggestionRow key={f.id} c={f} icon="food" onPress={() => setSelected(f)} />)}
            </View>
          </>
        )}

        {loadingRemote && <ActivityIndicator color={COLORS.accent} style={{ marginTop: 14 }} />}
        {remote.length > 0 && !selected && (
          <>
            <SectionHeader title="En ligne" />
            <View style={{ gap: 10 }}>
              {remote.map((f, i) => <SuggestionRow key={`${f.name}-${i}`} c={f} icon="apple" onPress={() => setSelected(f)} />)}
            </View>
          </>
        )}

        {/* Aperçu (surface claire) */}
        {selected && preview && (
          <>
            <SectionHeader title="Aperçu" />
            <Card variant="light">
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Thumb icon="run" light />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.onLight, fontWeight: '700', fontSize: 15 }}>{selected.name}</Text>
                  <Text style={{ color: COLORS.onLightMuted, fontSize: 12, marginTop: 2 }}>{quantity} g · source {selected.source}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 13, paddingTop: 13, borderTopWidth: 1, borderTopColor: 'rgba(20,27,51,0.10)' }}>
                <MacroCell label="kcal" value={preview.kcal} color="#4E5FC7" />
                <MacroCell label="Prot" value={preview.protein_g} color="#3E7FB8" />
                <MacroCell label="Gluc" value={preview.carbs_g} color="#B0842A" />
                <MacroCell label="Lip" value={preview.fat_g} color="#A85E86" />
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                <Button title="Annuler" onPress={() => setSelected(null)} variant="ghost" style={{ flex: 1, borderColor: 'rgba(20,27,51,0.18)' }} />
                <Button title="Ajouter au repas" onPress={save} style={{ flex: 2 }} />
              </View>
            </Card>
          </>
        )}

        <QuickAdd meal={meal} onDone={refresh} />

        {/* Historique */}
        <SectionHeader title={`Logué · ${mealLabel}`} />
        {todayEntries.length === 0 && <Text style={{ color: COLORS.faint }}>Rien pour ce repas aujourd'hui.</Text>}
        <View style={{ gap: 8 }}>
          {todayEntries.map((e) => (
            <Card key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Thumb icon="food" size={40} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 13.5 }}>{e.food_name}</Text>
                <Text style={{ color: COLORS.faint, fontSize: 11.5 }}>
                  {e.quantity_g} g · {Math.round(e.kcal)} kcal · P{Math.round(e.protein_g)} G{Math.round(e.carbs_g)} L{Math.round(e.fat_g)}
                </Text>
              </View>
              <Pressable onPress={async () => { await deleteMealEntry(e.id); await refresh(); }} hitSlop={8}>
                <Icon name="trash" size={18} color={COLORS.danger} />
              </Pressable>
            </Card>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

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
        await addMealEntry({ date: todayISO(), meal_type: meal, food: { ...cand, id: foodId, usage_count: 0 } as Food, quantity_g: qty });
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
    <>
      <SectionHeader title="Ajout rapide" />
      <Card>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="180g poulet + 100g riz + brocolis"
          placeholderTextColor={COLORS.faint}
          style={{ backgroundColor: COLORS.surfaceHi, borderColor: COLORS.hairline, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 11, color: COLORS.text, fontSize: 14 }}
        />
        <Button title={busy ? 'Résolution…' : 'Parser & ajouter'} onPress={run} icon="plus" style={{ marginTop: 10 }} />
      </Card>
    </>
  );
}

function SuggestionRow({ c, icon, onPress }: { c: Candidate; icon: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Thumb icon={icon} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 13.5 }}>{c.name}</Text>
          <Text style={{ color: COLORS.faint, fontSize: 11.5 }}>
            /100g · {Math.round(c.kcal_per_100g)} kcal · P{c.protein_per_100g} G{c.carbs_per_100g} L{c.fat_per_100g}
          </Text>
        </View>
        <Icon name="plus" size={18} color={COLORS.accent} strokeWidth={2} />
      </Card>
    </Pressable>
  );
}

function MacroCell({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ color, fontSize: 17, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: COLORS.onLightMuted, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
