import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TextInput, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '@/constants/theme';
import { Card, SectionTitle, Button, Pill } from '@/components/ui';
import { TARGETS, USER } from '@/constants/profile';
import { KEY_LIFTS } from '@/constants/program';
import { todayISO } from '@/lib/dates';
import { addMeasurement, getMeasurements, getLastSetsForExercise } from '@/db/repositories';
import type { BodyMeasurement } from '@/types';

export default function ProgressionScreen() {
  const insets = useSafeAreaInsets();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [lift, setLift] = useState(KEY_LIFTS[0]);
  const [liftData, setLiftData] = useState<{ value: number; label?: string }[]>([]);

  const load = useCallback(async () => {
    const m = await getMeasurements();
    setMeasurements(m);
    const sets = await getLastSetsForExercise(lift, 30);
    // top set par date (approx : garde le max par index inverse)
    const points = sets
      .slice()
      .reverse()
      .map((s) => ({ value: s.weight_kg }));
    setLiftData(points);
  }, [lift]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const weightPoints = measurements
    .filter((m) => m.weight_kg != null)
    .slice(0, 30)
    .reverse()
    .map((m) => ({ value: m.weight_kg as number }));

  const addWeight = async () => {
    const w = parseFloat(weightInput.replace(',', '.'));
    if (!w || w <= 0) { Alert.alert('Poids invalide'); return; }
    await addMeasurement({
      date: todayISO(), weight_kg: w,
      waist_cm: null, chest_cm: null, arm_r_cm: null, arm_l_cm: null,
      thigh_r_cm: null, thigh_l_cm: null, calf_cm: null, photo_uri: null,
    });
    setWeightInput('');
    await load();
  };

  const chartWidth = Dimensions.get('window').width - 80;
  const latest = measurements.find((m) => m.weight_kg != null)?.weight_kg;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}
    >
      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900', marginBottom: 16 }}>Progression</Text>

      {/* Poids */}
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
          <SectionTitle>Poids</SectionTitle>
          <Text style={{ color: COLORS.accent, fontWeight: '800' }}>
            {latest ? `${latest} kg` : '—'}{' '}
            <Text style={{ color: COLORS.muted, fontSize: 12 }}>/ cible {USER.weight_target_kg}</Text>
          </Text>
        </View>
        {weightPoints.length > 1 ? (
          <LineChart
            data={weightPoints}
            width={chartWidth}
            height={160}
            color={COLORS.accent}
            thickness={3}
            dataPointsColor={COLORS.accent}
            hideRules
            yAxisTextStyle={{ color: COLORS.muted, fontSize: 10 }}
            xAxisColor={COLORS.border}
            yAxisColor={COLORS.border}
            hideYAxisText={false}
            initialSpacing={10}
          />
        ) : (
          <Text style={{ color: COLORS.muted }}>Ajoute au moins 2 pesées pour voir la courbe.</Text>
        )}
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
          <TextInput
            value={weightInput}
            onChangeText={setWeightInput}
            keyboardType="numeric"
            placeholder="Poids du jour (kg)"
            placeholderTextColor={COLORS.muted}
            style={{ flex: 1, backgroundColor: COLORS.bgElevated, borderColor: COLORS.border, borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, color: COLORS.text }}
          />
          <Button title="Peser" onPress={addWeight} />
        </View>
      </Card>

      {/* Charges par exercice */}
      <Card style={{ marginTop: 14 }}>
        <SectionTitle>Charges — exos clés</SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          {KEY_LIFTS.map((l) => (
            <Pill key={l} label={l.split(' ')[0]} active={lift === l} onPress={() => setLift(l)} />
          ))}
        </ScrollView>
        {liftData.length > 1 ? (
          <LineChart
            data={liftData}
            width={chartWidth}
            height={150}
            color={COLORS.protein}
            thickness={3}
            dataPointsColor={COLORS.protein}
            hideRules
            yAxisTextStyle={{ color: COLORS.muted, fontSize: 10 }}
            xAxisColor={COLORS.border}
            yAxisColor={COLORS.border}
            initialSpacing={10}
          />
        ) : (
          <Text style={{ color: COLORS.muted }}>Pas encore assez de séries loguées pour {lift}.</Text>
        )}
      </Card>

      {/* Mensurations */}
      <Card style={{ marginTop: 14 }}>
        <SectionTitle>Dernières mensurations</SectionTitle>
        {measurements.filter((m) => m.waist_cm || m.chest_cm || m.arm_r_cm).slice(0, 3).map((m) => (
          <View key={m.id} style={{ marginBottom: 8 }}>
            <Text style={{ color: COLORS.muted, fontSize: 12 }}>{m.date}</Text>
            <Text style={{ color: COLORS.text, fontSize: 13 }}>
              Taille {m.waist_cm ?? '—'} · Poitrine {m.chest_cm ?? '—'} · Bras {m.arm_r_cm ?? '—'} · Cuisse {m.thigh_r_cm ?? '—'} · Mollet {m.calf_cm ?? '—'}
            </Text>
          </View>
        ))}
        <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>
          Astuce : prends tes mensurations toutes les 2 semaines.
        </Text>
      </Card>
    </ScrollView>
  );
}
