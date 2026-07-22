import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PROGRAM, type ProgramExercise } from '@/constants/program';
import { COLORS } from '@/constants/theme';
import { Card, Button } from '@/components/ui';
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
    if (session) {
      createWorkout(todayISO(), session.id as Workout['session_type']).then(setWorkoutId);
    }
  }, [session?.id]);

  // Timer de repos
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
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 80 }}
    >
      <Pressable onPress={() => router.back()}>
        <Text style={{ color: COLORS.accent, marginBottom: 8 }}>‹ Retour</Text>
      </Pressable>
      <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '900' }}>{session.name}</Text>
      <Text style={{ color: COLORS.muted, marginBottom: 16 }}>{session.exercises.length} exercices</Text>

      {session.exercises.map((ex) => (
        <ExerciseBlock
          key={ex.name}
          exercise={ex}
          workoutId={workoutId}
          onStartRest={(sec) => setRest(sec)}
        />
      ))}

      <Button
        title="Terminer la séance"
        onPress={() => { Alert.alert('Séance enregistrée', 'Bien joué 💪'); router.back(); }}
        style={{ marginTop: 10 }}
      />

      {/* Timer flottant */}
      {rest != null && (
        <Pressable onPress={() => setRest(null)} style={{ position: 'absolute', bottom: insets.bottom + 16, alignSelf: 'center', backgroundColor: COLORS.accent, paddingVertical: 12, paddingHorizontal: 26, borderRadius: 30 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>⏱ Repos {rest}s (tap pour stopper)</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function ExerciseBlock({
  exercise,
  workoutId,
  onStartRest,
}: {
  exercise: ProgramExercise;
  workoutId: number | null;
  onStartRest: (sec: number) => void;
}) {
  const [last, setLast] = useState<WorkoutSet[]>([]);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [logged, setLogged] = useState<{ weight: number; reps: number }[]>([]);
  const setCounter = useRef(0);

  useEffect(() => {
    getLastSetsForExercise(exercise.name).then(setLast).catch(() => {});
  }, [exercise.name]);

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
    await addSet({
      workout_id: workoutId,
      exercise_name: exercise.name,
      set_number: setCounter.current,
      weight_kg: w,
      reps: r,
      rir: null,
    });
    setLogged((l) => [...l, { weight: w, reps: r }]);
    onStartRest(exercise.rest_sec);
  };

  const bump = (dw: number) => {
    const base = parseFloat(weight.replace(',', '.')) || (last.length ? last[0].weight_kg : 0);
    setWeight(String(Math.round((base + dw) * 100) / 100));
  };

  return (
    <Card style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={{ color: COLORS.text, fontWeight: '800', fontSize: 16, flex: 1 }}>{exercise.name}</Text>
        {exercise.type === 'compound' && (
          <Text style={{ color: COLORS.accent, fontSize: 11, fontWeight: '700' }}>COMPOUND</Text>
        )}
      </View>
      <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 2 }}>
        {exercise.sets} × {exercise.reps} · repos {exercise.rest_sec}s
        {exercise.technique ? ` · ${exercise.technique}` : ''}
      </Text>
      {lastLabel && (
        <Text style={{ color: COLORS.protein, fontSize: 12, marginTop: 4 }}>Dernière fois : {lastLabel}</Text>
      )}

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 10, alignItems: 'center' }}>
        <TextInput value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="kg" placeholderTextColor={COLORS.muted} style={numInput} />
        <TextInput value={reps} onChangeText={setReps} keyboardType="numeric" placeholder="reps" placeholderTextColor={COLORS.muted} style={numInput} />
        <Pressable onPress={() => bump(2.5)} style={bumpBtn}><Text style={bumpTxt}>+2,5kg</Text></Pressable>
        <Pressable onPress={logSet} style={{ backgroundColor: COLORS.accent, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '800' }}>✓</Text>
        </Pressable>
      </View>

      {logged.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {logged.map((s, i) => (
            <View key={i} style={{ backgroundColor: COLORS.bgElevated, borderRadius: 8, paddingVertical: 4, paddingHorizontal: 8 }}>
              <Text style={{ color: COLORS.text, fontSize: 12 }}>S{i + 1}: {s.weight}×{s.reps}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const numInput = {
  width: 62,
  backgroundColor: COLORS.bgElevated,
  borderColor: COLORS.border,
  borderWidth: 1,
  borderRadius: 10,
  paddingVertical: 10,
  color: COLORS.text,
  textAlign: 'center',
  fontSize: 15,
} as const;

const bumpBtn = {
  backgroundColor: COLORS.bgElevated,
  borderColor: COLORS.accent,
  borderWidth: 1,
  paddingVertical: 10,
  paddingHorizontal: 8,
  borderRadius: 10,
} as const;

const bumpTxt = { color: COLORS.accent, fontWeight: '700', fontSize: 12 } as const;
