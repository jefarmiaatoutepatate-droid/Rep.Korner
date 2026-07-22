/** Composants UI réutilisables — design system « Nocturne ». */
import React from 'react';
import { View, Text, Pressable, ViewStyle, StyleSheet, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BG_GRADIENT } from '@/constants/theme';
import { Icon } from '@/components/Icon';

/** Fond dégradé encre, à placer en absolute derrière le contenu d'un écran. */
export function GradientBg() {
  return (
    <LinearGradient
      colors={BG_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.55 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

type CardVariant = 'default' | 'light';

export function Card({
  children,
  style,
  variant = 'default',
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
}) {
  const light = variant === 'light';
  return (
    <View
      style={[
        {
          backgroundColor: light ? COLORS.surfaceLight : COLORS.surface,
          borderRadius: 22,
          padding: 16,
          borderWidth: 1,
          borderColor: light ? COLORS.lightBorder : COLORS.border,
        },
        light && styles.lightShadow,
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** Texte qui s'adapte à une carte claire ou sombre. */
export function onCard(light: boolean | undefined, key: 'text' | 'muted' | 'faint'): string {
  if (light) return key === 'text' ? COLORS.onLight : COLORS.onLightMuted;
  return key === 'text' ? COLORS.text : key === 'muted' ? COLORS.muted : COLORS.faint;
}

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <View style={styles.secH}>
      <Text style={styles.secTitle}>{title}</Text>
      {action ? <Text style={styles.secAction}>{action}</Text> : null}
    </View>
  );
}

export function Eyebrow({ children, color = COLORS.faint }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  icon?: string;
  style?: ViewStyle;
}) {
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          backgroundColor: primary ? COLORS.accent : 'transparent',
          borderColor: primary ? 'transparent' : COLORS.hairline,
          borderWidth: primary ? 0 : 1,
          paddingVertical: 13,
          paddingHorizontal: 18,
          borderRadius: 15,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={17} color={primary ? COLORS.bg : COLORS.text} strokeWidth={2} /> : null}
      <Text style={{ color: primary ? COLORS.bg : COLORS.text, fontWeight: '700', fontSize: 14.5 }}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ label, active, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: active ? COLORS.accent : COLORS.surface,
        borderWidth: 1,
        borderColor: active ? COLORS.accent : COLORS.border,
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? COLORS.bg : COLORS.muted, fontWeight: '700', fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  );
}

/** Vignette carrée (icône en trait sur fond dégradé). */
export function Thumb({ icon, size = 44, light = false }: { icon: string; size?: number; light?: boolean }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.31,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: light ? '#E7EAF8' : COLORS.surfaceHi,
        borderWidth: 1,
        borderColor: light ? COLORS.lightBorder : COLORS.hairline,
      }}
    >
      <Icon name={icon} size={size * 0.46} color={light ? COLORS.accentInk : COLORS.accent2} strokeWidth={1.6} />
    </View>
  );
}

export function Avatar({ initial, size = 46 }: { initial: string; size?: number }) {
  return (
    <LinearGradient
      colors={[COLORS.accent, '#4E5FC7'] as const}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.33, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>{initial}</Text>
    </LinearGradient>
  );
}

export function IconButton({ icon, onPress, dot }: { icon: string; onPress?: () => void; dot?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 40,
        height: 40,
        borderRadius: 13,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon name={icon} size={19} color={COLORS.muted} />
      {dot ? (
        <View
          style={{
            position: 'absolute',
            top: 9,
            right: 10,
            width: 7,
            height: 7,
            borderRadius: 4,
            backgroundColor: COLORS.accent,
            borderWidth: 2,
            borderColor: COLORS.surface,
          }}
        />
      ) : null}
    </Pressable>
  );
}

/** Tuile de statistique compacte (Poids / Objectif / Eau…). */
export function StatTile({ label, value, unit, valueColor }: { label: string; value: string; unit?: string; valueColor?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statK}>{label}</Text>
      <Text style={[styles.statV, valueColor ? { color: valueColor } : null]}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lightShadow: {
    shadowColor: '#02060F',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  secH: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  secTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  secAction: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1.6, fontSize: 10.5, fontWeight: '700' },
  stat: { flex: 1, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: 18, padding: 13 },
  statK: { color: COLORS.faint, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8 },
  statV: { color: COLORS.text, fontSize: 19, fontWeight: '700', marginTop: 5 } as TextStyle,
  statUnit: { color: COLORS.muted, fontSize: 11, fontWeight: '500' },
});
