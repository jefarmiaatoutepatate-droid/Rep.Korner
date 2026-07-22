/** Barre de progression d'une macro (protéines / glucides / lipides). */
import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '@/constants/theme';
import { progress, pct } from '@/lib/macros';

interface Props {
  label: string;
  value: number;
  target: number;
  color: string;
  unit?: string;
}

export function MacroBar({ label, value, target, color, unit = 'g' }: Props) {
  const p = progress(value, target);
  const percent = pct(value, target);

  return (
    <View style={{ marginVertical: 6 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ color: COLORS.text, fontSize: 13, fontWeight: '600' }}>{label}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 12 }}>
          {Math.round(value)} / {target} {unit} · {percent}%
        </Text>
      </View>
      <View style={{ height: 9, borderRadius: 5, backgroundColor: COLORS.border, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${p * 100}%`,
            backgroundColor: color,
            borderRadius: 5,
          }}
        />
      </View>
    </View>
  );
}
