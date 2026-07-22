/** Anneau de progression calorique (SVG) — accent périwinkle, piste discrète. */
import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@/constants/theme';

interface Props {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0..1
  value: number;
  target: number;
  compact?: boolean;
}

export function ProgressRing({ size = 128, strokeWidth = 10, progress, value, target, compact }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(progress, 1));
  const offset = circumference * (1 - clamped);
  const over = value > target;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={over ? COLORS.warn : COLORS.accent}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ color: COLORS.text, fontSize: compact ? 25 : 30, fontWeight: '800' }}>{Math.round(value)}</Text>
        <Text style={{ color: COLORS.muted, fontSize: compact ? 10.5 : 12, marginTop: 2 }}>/ {target} kcal</Text>
      </View>
    </View>
  );
}
