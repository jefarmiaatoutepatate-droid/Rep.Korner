/** Barre de progression d'une macro — piste fine, étiquettes sobres. */
import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';
import { progress } from '@/lib/macros';

interface Props {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, value, target, color, unit = 'g' }: Props) {
  const p = progress(value, target);
  return (
    <View style={{ marginVertical: 7 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
        <Text style={{ color: COLORS.text, fontSize: 12, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          {Math.round(value)} / {target} {unit}
        </Text>
      </View>
      <View style={{ height: 6, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
        <View style={{ height: '100%', width: `${p * 100}%`, backgroundColor: color, borderRadius: 4 }} />
      </View>
    </View>
  );
}
