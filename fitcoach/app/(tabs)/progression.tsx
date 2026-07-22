import React, { useCallback, useState } from 'react';
import { ScrollView, View, Text, TextInput, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-gifted-charts';
import { COLORS } from '@/constants/theme';
import { Card, SectionHeader, Button, Pill, GradientBg } from '@/components/ui';
import { USER } from '@/constants/profile';
import { KEY_LIFTS } from '@/constants/program';
import { todayISO } from '@/lib/dates';
import { addMeasurement, getMeasurements, getLastSetsForExercise } from '@/db/repositories';
import type { BodyMeasurement } from '@/types';

export default function ProgressionScreen() {
  const insets = useSafeAreaInsets();
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [weightInput, setWeightInput] = useState('');
  const [lift, setLift] = useState(KEY_LIFTS[0]);
  const [liftData, setLiftData] = useState<{ value: number }[]>([]);

  const load = useCallback(async () => {
    const m = await getMeasurements();
    setMeasurements(m);
    const sets = await getLastSetsForExercise(lift, 30);
    setLiftData(sets.slice().reverse().map((s) => ({ value: s.weight_kg })));
  }, [lift]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const weightPoints = measurements.filter((m) => m.weight_kg != null).slice(0, 30).reverse().map((m) => ({ value: m.weight_kg as number }));

  const addWeight = async () => {
    const w = parseFloat(weightInput.replace(',', '.'));
    if (!w || w <= 0) { Alert.alert('Poids invalide'); return; }
    await addMeasurement({ date: todayISO(), weight_kg: w, waist_cm: null, chest_cm: null, arm_r_cm: null, arm_l_cm: null, thigh_r_cm: null, thigh_l_cm: null, calf_cm: null, photo_uri: null });
    setWeightInput('');
    await load();
  };

  const chartWidth = Dimensions.get('window').width - 84;
  const latest = measurements.find((m) => m.weight_kg != null)?.weight_kg;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 110 }}>
        <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3, marginBottom: 6 }}>Progression</Text>

        <SectionHeader title="Poids" action={`${latest ? latest + ' kg' : '—'} · cible ${USER.weight_target_kg}`} />
        <Card>
          {weightPoints.length > 1 ? (
            <LineChart
              data={weightPoints}
              width={chartWidth}
              height={160}
              color={COLORS.accent}
              thickness={3}
              dataPointsColor={COLORS.accent}
              hideRules
              yAxisTextStyle={{ color: COLORS.faint, fontSize: 10 }}
              xAxisColor={COLORS.border}
              yAxisColor={COLORS.border}
              initialSpacing={10}
            />
          ) : (
            <Text style={{ color: COLORS.faint }}>Ajoute au moins 2 pesées pour voir la courbe.</Text>
          )}
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
            <TextInput
              value={weightInput}
              onChangeText={setWeightInput}
              keyboardType="numeric"
              placeholder="Poids du jour (kg)"
              placeholderTextColor={COLORS.faint}
              style={{ flex: 1, backgroundColor: COLORS.surfaceHi, borderColor: COLORS.hairline, borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, color: COLORS.text }}
            />
            <Button title="Peser" icon="scale" onPress={addWeight} />
          </View>
        </Card>

        <SectionHeader title="Charges — exos clés" />
        <Card>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {KEY_LIFTS.map((l) => <Pill key={l} label={l.split(' ')[0]} active={lift === l} onPress={() => setLift(l)} />)}
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
              yAxisTextStyle={{ color: COLORS.faint, fontSize: 10 }}
              xAxisColor={COLORS.border}
              yAxisColor={COLORS.border}
              initialSpacing={10}
            />
          ) : (
            <Text style={{ color: COLORS.faint }}>Pas encore assez de séries loguées pour {lift}.</Text>
          )}
        </Card>

        <SectionHeader title="Dernières mensurations" />
        <Card>
          {measurements.filter((m) => m.waist_cm || m.chest_cm || m.arm_r_cm).slice(0, 3).map((m) => (
            <View key={m.id} style={{ marginBottom: 8 }}>
              <Text style={{ color: COLORS.faint, fontSize: 11.5 }}>{m.date}</Text>
              <Text style={{ color: COLORS.text, fontSize: 13 }}>
                Taille {m.waist_cm ?? '—'} · Poitrine {m.chest_cm ?? '—'} · Bras {m.arm_r_cm ?? '—'} · Cuisse {m.thigh_r_cm ?? '—'} · Mollet {m.calf_cm ?? '—'}
              </Text>
            </View>
          ))}
          <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 4 }}>Astuce : prends tes mensurations toutes les 2 semaines.</Text>
        </Card>
      </ScrollView>
    </View>
  );
}
