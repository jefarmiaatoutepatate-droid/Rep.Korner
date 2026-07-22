import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PROGRAM } from '@/constants/program';
import { COLORS } from '@/constants/theme';
import { Card } from '@/components/ui';

const DAY_FR: Record<string, string> = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  thursday: 'Jeudi',
  saturday: 'Samedi',
};

export default function EntrainementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: COLORS.bg }}
      contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 40 }}
    >
      <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '900' }}>Entraînement</Text>
      <Text style={{ color: COLORS.muted, marginBottom: 18 }}>{PROGRAM.name}</Text>

      {PROGRAM.sessions.map((s) => (
        <Pressable key={s.id} onPress={() => router.push(`/workout/${s.id}`)}>
          <Card style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: COLORS.accent, fontSize: 12, fontWeight: '700' }}>
                  {DAY_FR[s.day] ?? s.day}
                </Text>
                <Text style={{ color: COLORS.text, fontSize: 17, fontWeight: '800', marginTop: 2 }}>{s.name}</Text>
                <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 4 }}>
                  {s.exercises.length} exercices · {s.exercises.reduce((n, e) => n + e.sets, 0)} séries
                </Text>
              </View>
              <Text style={{ color: COLORS.accent, fontSize: 22 }}>›</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}
