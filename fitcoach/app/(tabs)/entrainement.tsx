import React from 'react';
import { ScrollView, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PROGRAM } from '@/constants/program';
import { COLORS } from '@/constants/theme';
import { Card, SectionHeader, GradientBg, Thumb, IconButton } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { startOfWeek, toISODate, todayISO } from '@/lib/dates';

const DAY_FR: Record<string, string> = { monday: 'lundi', tuesday: 'mardi', thursday: 'jeudi', saturday: 'samedi' };
const DOW_SHORT = ['dim', 'lun', 'mar', 'mer', 'jeu', 'ven', 'sam'];
const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

// Un logo coloré par séance
const SESSION_COLOR: Record<string, string> = {
  lower_a: '#F2683C', // corail
  upper_a: '#8B5CF6', // violet
  lower_b: '#22B07D', // vert
  upper_b: '#2FA8E0', // bleu
};

export default function EntrainementScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = todayISO();

  const monday = startOfWeek(new Date());
  const weekDays = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  const monthLabel = MONTHS[new Date().getMonth()];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: insets.top + 12, paddingBottom: 110 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 18 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.muted, fontSize: 12.5 }}>Programme</Text>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>Upper / Lower</Text>
          </View>
          <IconButton icon="search" />
        </View>

        {/* Sélecteur de mois */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 14, marginBottom: 14 }}>
          <Icon name="chevLeft" size={18} color={COLORS.muted} />
          <Text style={{ color: COLORS.text, fontWeight: '700', fontSize: 15, textTransform: 'capitalize' }}>{monthLabel}</Text>
          <Icon name="chevRight" size={18} color={COLORS.muted} />
        </View>

        {/* Semaine */}
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 6 }}>
          {weekDays.map((d) => {
            const iso = toISODate(d);
            const on = iso === today;
            return (
              <View
                key={iso}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderRadius: 16,
                  backgroundColor: on ? COLORS.accent : COLORS.surface,
                  borderWidth: 1,
                  borderColor: on ? COLORS.accent : COLORS.border,
                }}
              >
                <Text style={{ color: on ? '#fff' : COLORS.text, fontSize: 15, fontWeight: '700' }}>{d.getDate()}</Text>
                <Text style={{ color: on ? 'rgba(255,255,255,0.75)' : COLORS.faint, fontSize: 10, marginTop: 3 }}>{DOW_SHORT[d.getDay()]}</Text>
              </View>
            );
          })}
        </View>

        <SectionHeader title="Séances" action="4 / semaine" />
        <View style={{ gap: 12 }}>
          {PROGRAM.sessions.map((s, i) => {
            const accentCard = i === 0;
            const c = SESSION_COLOR[s.id] ?? COLORS.accent;
            const eyebrowColor = accentCard ? 'rgba(255,255,255,0.85)' : c;
            const titleColor = accentCard ? '#fff' : COLORS.text;
            const metaColor = accentCard ? 'rgba(255,255,255,0.85)' : COLORS.muted;
            return (
              <Pressable key={s.id} onPress={() => router.push(`/workout/${s.id}`)}>
                <Card variant={accentCard ? 'accent' : 'default'} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Thumb emoji={s.id.startsWith('lower') ? '🦵' : '💪'} size={58} color={accentCard ? '#FFFFFF' : c} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: eyebrowColor, fontSize: 9.5, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>
                      {i === 0 ? 'À venir · ' : ''}{DAY_FR[s.day] ?? s.day}
                    </Text>
                    <Text style={{ color: titleColor, fontSize: 15, fontWeight: '800', marginVertical: 3, letterSpacing: -0.2 }}>{s.name}</Text>
                    <View style={{ flexDirection: 'row', gap: 13 }}>
                      <SessMeta icon="dumbbell" text={`${s.exercises.length} exos`} color={metaColor} />
                      <SessMeta icon="clock" text="60 min" color={metaColor} />
                    </View>
                  </View>
                  <Icon name="chevRight" size={20} color={accentCard ? '#fff' : c} />
                </Card>
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title="Cette semaine" />
        <Card>
          <Row label="Séances effectuées" value="3 / 4" />
          <Row label="Volume total" value="41 850 kg" divider />
          <Row label="Record" value="Squat · 102,5 kg" valueColor={COLORS.success} divider />
        </Card>
      </ScrollView>
    </View>
  );
}

function SessMeta({ icon, text, color }: { icon: string; text: string; color: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <Icon name={icon} size={13} color={color} strokeWidth={1.7} />
      <Text style={{ color, fontSize: 11.5 }}>{text}</Text>
    </View>
  );
}

function Row({ label, value, valueColor, divider }: { label: string; value: string; valueColor?: string; divider?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderTopWidth: divider ? 1 : 0, borderTopColor: COLORS.border }}>
      <Text style={{ color: COLORS.muted, fontSize: 13.5 }}>{label}</Text>
      <Text style={{ color: valueColor ?? COLORS.text, fontSize: 13.5, fontWeight: '700' }}>{value}</Text>
    </View>
  );
}
