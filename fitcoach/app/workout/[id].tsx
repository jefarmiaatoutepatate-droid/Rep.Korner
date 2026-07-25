import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PROGRAM, type ProgramExercise } from '@/constants/program';
import { COLORS } from '@/constants/theme';
import { Card, Button, GradientBg } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { todayISO } from '@/lib/dates';
import { createWorkout, addSet, getLastSetsForExercise } from '@/db/repositories';
import type { Workout, WorkoutSet } from '@/types';

export default function WorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const session = PROGRAM.sessions.find((s) => s.id === id);

  const [workoutId, setWorkoutId] = useState<number | null>(null);
  const [rest, setRest] = useState<number | null>(null);

  useEffect(() => {
    // `session` provient du tableau constant PROGRAM → référence stable.
    if (session) createWorkout(todayISO(), session.id as Workout['session_type']).then(setWorkoutId);
  }, [session]);

  useEffect(() => {
    if (rest == null) return;
    if (rest <= 0) { setRest(null); return; }
    const t = setTimeout(() => setRest((r) => (r == null ? null : r - 1)), 1000);
    return () => clearTimeout(t);
  }, [rest]);

  if (!session) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.muted }}>Séance introuvable.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 90 }}>
        <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <Icon name="chevLeft" size={18} color={COLORS.accent} />
          <Text style={{ color: COLORS.accent, fontSize: 14 }}>Retour</Text>
        </Pressable>
        <Text style={{ color: COLORS.text, fontSize: 23, fontWeight: '800', letterSpacing: -0.3 }}>{session.name}</Text>
        <Text style={{ color: COLORS.muted, marginBottom: 16, marginTop: 2 }}>{session.exercises.length} exercices</Text>

        <View style={{ gap: 12 }}>
          {session.exercises.map((ex) => (
            <ExerciseBlock key={ex.name} exercise={ex} workoutId={workoutId} onStartRest={setRest} />
          ))}
        </View>

        <Button title="Terminer la séance" icon="check" onPress={() => { Alert.alert('Séance enregistrée', 'Bien joué 💪'); router.back(); }} style={{ marginTop: 14 }} />
      </ScrollView>

      {rest != null && (
        <Pressable
          onPress={() => setRest(null)}
          style={{ position: 'absolute', bottom: insets.bottom + 18, alignSelf: 'center', backgroundColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, flexDirection: 'row', alignItems: 'center', gap: 8 }}
        >
          <Icon name="clock" size={17} color={COLORS.bg} strokeWidth={2} />
          <Text style={{ color: COLORS.bg, fontWeight: '800', fontSize: 15 }}>Repos {rest}s · stopper</Text>
        </Pressable>
      )}
    </View>
  );
}

function ExerciseBlock({ exercise, workoutId, onStartRest }: { exercise: ProgramExercise; workoutId: number | null; onStartRest: (sec: number) => void }) {
  const [last, setLast] = useState<WorkoutSet[]>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [logged, setLogged] = useState<{ weight: number; reps: number }[]>([]);
  const setCounter = useRef(0);

  useEffect(() => { getLastSetsForExercise(exercise.name).then(setLast).catch(() => {}); }, [exercise.name]);

  const lastLabel = useMemo(() => {
    if (!last.length) return null;
    const top = last.reduce((a, b) => (b.weight_kg > a.weight_kg ? b : a));
    return `${top.weight_kg} kg × ${top.reps}`;
  }, [last]);

  const logSet = async () => {
    const w = parseFloat(weight.replace(',', '.'));
    const r = parseInt(reps, 10);
    if (!w || !r || workoutId == null) return;
    setCounter.current += 1;
    await addSet({ workout_id: workoutId, exercise_name: exercise.name, set_number: setCounter.current, weight_kg: w, reps: r, rir: null });
    setLogged((l) => [...l, { weight: w, reps: r }]);
    onStartRest(exercise.rest_sec);
  };

  const bump = (dw: number) => {
    const base = parseFloat(weight.replace(',', '.')) || (last.length ? last[0].weight_kg : 0);
    setWeight(String(Math.round((base + dw) * 100) / 100));
  };

  return (
    <Card>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 15, flex: 1 }}>{exercise.name}</Text>
        {exercise.type === 'compound' && <Text style={{ color: COLORS.accent2, fontSize: 10, fontWeight: '700', letterSpacing: 0.8 }}>COMPOUND</Text>}
      </View>
      <Text style={{ color: COLORS.muted, fontSize: 11.5, marginTop: 3 }}>
        {exercise.sets} × {exercise.reps} · repos {exercise.rest_sec}s{exercise.technique ? ` · ${exercise.technique}` : ''}
      </Text>
      {lastLabel && <Text style={{ color: COLORS.protein, fontSize: 11.5, marginTop: 5 }}>Dernière fois : {lastLabel}</Text>}

      <View style={{ flexDirection: 'row', gap: 7, marginTop: 12, alignItems: 'center' }}>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="kg" placeholderTextColor={COLORS.faint} style={numInput} />
        <TextInput value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="reps" placeholderTextColor={COLORS.faint} style={numInput} />
        <Pressable onPress={() => bump(2.5)} style={{ backgroundColor: COLORS.surfaceHi, borderColor: COLORS.accent, borderWidth: 1, paddingVertical: 11, paddingHorizontal: 9, borderRadius: 11 }}>
          <Text style={{ color: COLORS.accent, fontWeight: '700', fontSize: 12 }}>+2,5</Text>
        </Pressable>
        <Pressable onPress={logSet} style={{ backgroundColor: COLORS.accent, paddingVertical: 11, paddingHorizontal: 15, borderRadius: 11 }}>
          <Icon name="check" size={17} color={COLORS.bg} strokeWidth={2.4} />
        </Pressable>
      </View>

      {logged.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
          {logged.map((s, i) => (
            <View key={i} style={{ backgroundColor: COLORS.surfaceHi, borderRadius: 9, paddingVertical: 4, paddingHorizontal: 9 }}>
              <Text style={{ color: COLORS.text, fontSize: 11.5 }}>S{i + 1}: {s.weight}×{s.reps}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const numInput = {
  width: 58,
  backgroundColor: COLORS.surfaceHi,
  borderColor: COLORS.hairline,
  borderWidth: 1,
  borderRadius: 11,
  paddingVertical: 10,
  color: COLORS.text,
  textAlign: 'center' as const,
  fontSize: 14,
};
