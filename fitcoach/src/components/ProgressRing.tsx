/** Anneau de progression calorique (SVG). Cœur visuel du dashboard Home. */
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  value: number; // kcal consommées
  target: number; // kcal cible
}

export function ProgressRing({ size = 190, strokeWidth = 16, progress, value, target }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(progress, 1));
  const offset = circumference * (1 - clamped);
  const remaining = Math.max(target - value, 0);
  const over = value > target;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={over ? COLORS.danger : COLORS.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: COLORS.text, fontSize: 34, fontWeight: '800' }}>{Math.round(value)}</Text>
        <Text style={{ color: COLORS.muted, fontSize: 13 }}>/ {target} kcal</Text>
        <Text style={{ color: over ? COLORS.danger : COLORS.accent, fontSize: 12, marginTop: 4 }}>
          {over ? `+${Math.round(value - target)} dépassé` : `${Math.round(remaining)} restantes`}
        </Text>
      </View>
    </View>
  );
}
