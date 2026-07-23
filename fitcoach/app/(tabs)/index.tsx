import React, { useCallback } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDayStore } from '@/store/dayStore';
import { TARGETS, USER } from '@/constants/profile';
import { PROGRAM } from '@/constants/program';
import { COLORS, MEAL_TYPES, CATEGORY, withAlpha } from '@/constants/theme';
import { ProgressRing } from '@/components/ProgressRing';
import { MacroBar } from '@/components/MacroBar';
import { Card, SectionHeader, GradientBg, Avatar, IconButton, Thumb, StatTile } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { progress } from '@/lib/macros';
import { useAuthStore } from '@/store/authStore';

const WEEKDAYS_FR = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const ORDER = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function nextSession() {
  const today = new Date().getDay();
  const sorted = [...PROGRAM.sessions].sort((a, b) => ORDER.indexOf(a.day) - ORDER.indexOf(b.day));
  return sorted.find((s) => ORDER.indexOf(s.day) >= today) ?? sorted[0];
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totals, entries, daily, refresh, addWater, toggleCreatine } = useDayStore();
  const user = useAuthStore((s) => s.user);
  const firstName = user?.name?.split(' ')[0] ?? '';
  const initial = (user?.name?.[0] ?? 'F').toUpperCase();

  useFocusEffect(useCallback(() => { refresh(); }, [refresh]));

  const session = nextSession();
  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const waterPct = progress(daily.water_l, TARGETS.water_l);
  const mealKcal = (key: string) => entries.filter((e) => e.meal_type === key).reduce((s, e) => s + e.kcal, 0);
  const mealCount = (key: string) => entries.filter((e) => e.meal_type === key).length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: insets.top + 10, paddingBottom: 110 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={COLORS.accent} />}
      >
        {/* En-tête */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <Pressable onPress={() => router.push('/settings')}>
            <Avatar initial={initial} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.muted, fontSize: 12.5, textTransform: 'capitalize' }}>{dateLabel}</Text>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>
              {firstName ? `Salut ${firstName}` : "Aujourd'hui"}
            </Text>
          </View>
          <IconButton icon="bell" dot onPress={() => router.push('/settings')} />
        </View>

        {/* Carte hero — prochaine séance (accent) */}
        <Pressable onPress={() => router.push(`/workout/${session.id}`)}>
          <Card variant="accent" style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <View style={{ alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, paddingHorizontal: 9, borderRadius: 999 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Prochaine séance · {WEEKDAYS_FR[ORDER.indexOf(session.day)]}
                  </Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 12, letterSpacing: -0.3 }}>{session.name}</Text>
                <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                  <Meta icon="dumbbell" text={`${session.exercises.length} exercices`} />
                  <Meta icon="clock" text="~65 min" />
                </View>
              </View>
              <View style={{ width: 46, height: 46, borderRadius: 15, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="arrow" size={20} color={COLORS.accent} strokeWidth={2.2} />
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Stats — pastilles colorées */}
        <View style={{ flexDirection: 'row', gap: 11, marginTop: 13 }}>
          <StatTile label="Poids" value="78.6" unit="kg" emoji="⚖️" color={COLORS.accent} />
          <StatTile label="Objectif" value={String(USER.weight_target_kg)} unit="kg" emoji="🎯" color={COLORS.success} />
          <StatTile label="Eau" value={daily.water_l.toFixed(1)} unit={`/ ${TARGETS.water_l} L`} emoji="💧" color={CATEGORY.post_workout} />
        </View>

        {/* Aujourd'hui : anneau + macros */}
        <SectionHeader title="Aujourd'hui" action="Détails" />
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <ProgressRing progress={progress(totals.kcal, TARGETS.daily_kcal)} value={totals.kcal} target={TARGETS.daily_kcal} compact />
            <View style={{ flex: 1 }}>
              <MacroBar label="Protéines" value={totals.protein_g} target={TARGETS.protein_g} color={COLORS.protein} />
              <MacroBar label="Glucides" value={totals.carbs_g} target={TARGETS.carbs_g} color={COLORS.carbs} />
              <MacroBar label="Lipides" value={totals.fat_g} target={TARGETS.fat_g} color={COLORS.fat} />
            </View>
          </View>
        </Card>

        {/* Hydratation + créatine */}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
          <Card style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
              <Icon name="drop" size={16} color={CATEGORY.post_workout} />
              <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 13.5 }}>Hydratation</Text>
            </View>
            <View style={{ height: 6, borderRadius: 4, backgroundColor: COLORS.trackBg, overflow: 'hidden', marginBottom: 10 }}>
              <View style={{ height: '100%', width: `${waterPct * 100}%`, backgroundColor: CATEGORY.post_workout }} />
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <WaterBtn label="+25cl" onPress={() => addWater(0.25)} />
              <WaterBtn label="+50cl" onPress={() => addWater(0.5)} />
            </View>
          </Card>
          <Card style={{ flex: 1, justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <Icon name="flame" size={16} color={COLORS.warn} />
              <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 13.5 }}>Créatine</Text>
            </View>
            <Pressable
              onPress={toggleCreatine}
              style={{
                marginTop: 12,
                backgroundColor: daily.creatine_taken ? COLORS.success : COLORS.surfaceHi,
                borderColor: daily.creatine_taken ? COLORS.success : COLORS.border,
                borderWidth: 1,
                paddingVertical: 12,
                borderRadius: 13,
                alignItems: 'center',
              }}
            >
              <Text style={{ color: daily.creatine_taken ? '#fff' : COLORS.muted, fontWeight: '700', fontSize: 13 }}>
                {daily.creatine_taken ? '✓ Prise' : 'À prendre'}
              </Text>
            </Pressable>
          </Card>
        </View>

        {/* Repas — logos colorés par catégorie */}
        <SectionHeader title="Repas" action="Tout voir" />
        <View style={{ gap: 12 }}>
          {MEAL_TYPES.map((meal) => {
            const kcal = mealKcal(meal.key);
            const count = mealCount(meal.key);
            return (
              <Pressable key={meal.key} onPress={() => router.push({ pathname: '/nutrition', params: { meal: meal.key } })}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 13 }}>
                  <Thumb emoji={meal.emoji} color={meal.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.text, fontWeight: '600', fontSize: 14 }}>{meal.label}</Text>
                    <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 1 }}>
                      {count === 0 ? 'Rien de logué' : `${count} aliment(s)`}
                    </Text>
                  </View>
                  {kcal > 0 ? (
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 13.5 }}>{Math.round(kcal)}</Text>
                      <Text style={{ color: COLORS.faint, fontSize: 11 }}>kcal</Text>
                    </View>
                  ) : (
                    <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: withAlpha(meal.color, 0.13), alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name="plus" size={17} color={meal.color} strokeWidth={2.2} />
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Meta({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Icon name={icon} size={14} color="rgba(255,255,255,0.85)" strokeWidth={1.8} />
      <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5 }}>{text}</Text>
    </View>
  );
}

function WaterBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{ flex: 1, backgroundColor: COLORS.surfaceHi, borderColor: COLORS.border, borderWidth: 1, paddingVertical: 8, borderRadius: 11, alignItems: 'center' }}
    >
      <Text style={{ color: CATEGORY.post_workout, fontWeight: '700', fontSize: 12 }}>{label}</Text>
    </Pressable>
  );
}
