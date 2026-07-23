/** Champ de formulaire d'auth (label + input stylé). */
import React from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { COLORS } from '@/constants/theme';

export function AuthField({ label, ...props }: { label: string } & TextInputProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: COLORS.muted, fontSize: 12.5, fontWeight: '600', marginBottom: 7 }}>{label}</Text>
      <TextInput
        placeholderTextColor={COLORS.faint}
        style={{
          backgroundColor: COLORS.surface,
          borderColor: COLORS.border,
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 14,
          paddingVertical: 13,
          color: COLORS.text,
          fontSize: 15,
        }}
        {...props}
      />
    </View>
  );
}
