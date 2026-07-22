/** Petits composants UI réutilisables (Card, Section, Pill, Button). */
import React from 'react';
import { View, Text, Pressable, ViewStyle } from 'react-native';
import { COLORS } from '@/constants/theme';

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.card,
          borderRadius: 18,
          padding: 16,
          borderWidth: 1,
          borderColor: COLORS.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ color: COLORS.text, fontSize: 18, fontWeight: '800', marginBottom: 10 }}>
      {children}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: primary ? COLORS.accent : 'transparent',
          borderColor: COLORS.accent,
          borderWidth: primary ? 0 : 1.5,
          paddingVertical: 12,
          paddingHorizontal: 18,
          borderRadius: 12,
          alignItems: 'center',
          opacity: pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: primary ? '#fff' : COLORS.accent, fontWeight: '700', fontSize: 15 }}>
        {title}
      </Text>
    </Pressable>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 7,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: active ? COLORS.accent : COLORS.bgElevated,
        borderWidth: 1,
        borderColor: active ? COLORS.accent : COLORS.border,
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? '#fff' : COLORS.muted, fontWeight: '600', fontSize: 13 }}>
        {label}
      </Text>
    </Pressable>
  );
}
