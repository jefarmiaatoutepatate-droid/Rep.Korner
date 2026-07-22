import React, { useCallback } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDayStore } from '@/store/dayStore';
import { TARGETS } from '@/constants/profile';
import { PROGRAM } from '@/constants/program';
import { COLORS, MEAL_TYPES } from '@/constants/theme';
import { ProgressRing } from '@/components/ProgressRing';
import { MacroBar } from '@/components/MacroBar';
import { Card, SectionTitle } from '@/components/ui';
import { progress } from '@/lib/macros';

const WEEKDAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

/** Prochaine séance = 1re séance du programme dont le jour >= aujourd'hui. */
function nextSession() {
  const today = new Date().getDay();
  const order = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const sorted = [...PROGRAM.sessions].sort(
    (a, b) => order.indexOf(a.day) - order.indexOf(b.day),
  );
  return (
    sorted.find((s) => order.indexOf(s.day) >= today) ?? sorted[0]
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totals, entries, daily, refresh, addWater, toggleCreatine } = useDayStore();

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const session = nextSession();
  const dateLabel = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const entriesByMeal = (mealKey: string) => entries.filter((e) => e.meal_type === mealKey);
  const waterPct = progress(daily.water_l, TARGETS.water_l);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 30 }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={COLORS.accent} />}
    >
      <Text style={{ color: COLORS.muted, fontSize: 13, textTransform: 'capitalize' }}>{dateLabel}</Text>
      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900', marginBottom: 16 }}>
        Aujourd'hui
      </Text>

      {/* Anneau calorique + macros */}
      <Card style={{ alignItems: 'center' }}>
        <ProgressRing progress={progress(totals.kcal, TARGETS.daily_kcal)} value={totals.kcal} target={TARGETS.daily_kcal} />
        <View style={{ width: '100%', marginTop: 14 }}>
          <MacroBar label="Protéines" value={totals.protein_g} target={TARGETS.protein_g} color={COLORS.protein} />
          <MacroBar label="Glucides" value={totals.carbs_g} target={TARGETS.carbs_g} color={COLORS.carbs} />
          <MacroBar label="Lipides" value={totals.fat_g} target={TARGETS.fat_g} color={COLORS.fat} />
        </View>
      </Card>

      {/* Hydratation + créatine */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 14 }}>
        <Card style={{ flex: 1 }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', marginBottom: 6 }}>💧 Hydratation</Text>
          <Text style={{ color: COLORS.protein, fontSize: 22, fontWeight: '800' }}>
            {daily.water_l.toFixed(1)}
            <Text style={{ color: COLORS.muted, fontSize: 13 }}> / {TARGETS.water_l} L</Text>
          </Text>
          <View style={{ height: 7, borderRadius: 4, backgroundColor: COLORS.border, marginVertical: 8, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${waterPct * 100}%`, backgroundColor: COLORS.protein }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <WaterBtn label="+25cl" onPress={() => addWater(0.25)} />
            <WaterBtn label="+50cl" onPress={() => addWater(0.5)} />
          </View>
        </Card>

        <Card style={{ flex: 1, justifyContent: 'space-between' }}>
          <Text style={{ color: COLORS.text, fontWeight: '700', marginBottom: 6 }}>💊 Créatine</Text>
          <Text style={{ color: COLORS.muted, fontSize: 12, marginBottom: 10 }}>5 g / jour</Text>
          <Pressable
            onPress={toggleCreatine}
            style={{
              backgroundColor: daily.creatine_taken ? COLORS.success : COLORS.bgElevated,
              borderColor: daily.creatine_taken ? COLORS.success : COLORS.border,
              borderWidth: 1,
              paddingVertical: 12,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: daily.creatine_taken ? '#fff' : COLORS.muted, fontWeight: '700' }}>
              {daily.creatine_taken ? '✓ Prise' : 'À prendre'}
            </Text>
          </Pressable>
        </Card>
      </View>

      {/* Prochaine séance */}
      <Pressable onPress={() => router.push('/entrainement')} style={{ marginTop: 14 }}>
        <Card style={{ backgroundColor: COLORS.navyLight, borderColor: COLORS.accent }}>
          <Text style={{ color: COLORS.muted, fontSize: 12 }}>Prochaine séance · {WEEKDAYS_FR[dayIndex(session.day)]}</Text>
          <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 4 }}>{session.name}</Text>
          <Text style={{ color: COLORS.accent, fontSize: 13, marginTop: 6 }}>
            {session.exercises.length} exercices → Commencer ›
          </Text>
        </Card>
      </Pressable>

      {/* Blocs repas */}
      <View style={{ marginTop: 20 }}>
        <SectionTitle>Repas du jour</SectionTitle>
        {MEAL_TYPES.map((meal) => {
          const items = entriesByMeal(meal.key);
          const kcal = items.reduce((s, e) => s + e.kcal, 0);
          return (
            <Pressable
              key={meal.key}
              onPress={() => router.push({ pathname: '/nutrition', params: { meal: meal.key } })}
            >
              <Card style={{ marginBottom: 10, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 22, marginRight: 12 }}>{meal.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.text, fontWeight: '700' }}>{meal.label}</Text>
                  <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
                    {items.length === 0 ? 'Rien de logué' : `${items.length} aliment(s)`}
                  </Text>
                </View>
                <Text style={{ color: kcal > 0 ? COLORS.accent : COLORS.muted, fontWeight: '700' }}>
                  {Math.round(kcal)} kcal
                </Text>
                <Text style={{ color: COLORS.muted, fontSize: 20, marginLeft: 8 }}>＋</Text>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function WaterBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        backgroundColor: COLORS.bgElevated,
        borderColor: COLORS.border,
        borderWidth: 1,
        paddingVertical: 8,
        borderRadius: 10,
        alignItems: 'center',
      }}
    >
      <Text style={{ color: COLORS.protein, fontWeight: '700', fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

function dayIndex(day: string): number {
  const order = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return order.indexOf(day);
}
