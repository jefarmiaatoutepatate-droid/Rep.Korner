/** Composants UI réutilisables — design system « Clair » (base blanche). */
import React from 'react';
import { View, Text, Pressable, ViewStyle, StyleSheet, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, BG_GRADIENT, withAlpha } from '@/constants/theme';
import { Icon } from '@/components/Icon';

/** Fond dégradé clair, à placer en absolute derrière le contenu d'un écran. */
export function GradientBg() {
  return (
    <LinearGradient
      colors={BG_GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 0.4 }}
      style={StyleSheet.absoluteFill}
    />
  );
}

type CardVariant = 'default' | 'accent';

/** Carte : blanche par défaut, ou accent plein (dégradé) pour les mises en avant. */
export function Card({
  children,
  style,
  variant = 'default',
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: CardVariant;
}) {
  if (variant === 'accent') {
    return (
      <LinearGradient
        colors={[COLORS.accent, COLORS.accentDark] as const}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.cardBase, styles.accentShadow, { borderWidth: 0 }, style]}
      >
        {children}
      </LinearGradient>
    );
  }
  return <View style={[styles.cardBase, styles.card, styles.softShadow, style]}>{children}</View>;
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
        primary && styles.accentShadow,
        style,
      ]}
    >
      {icon ? <Icon name={icon} size={17} color={primary ? COLORS.onAccent : COLORS.text} strokeWidth={2} /> : null}
      <Text style={{ color: primary ? COLORS.onAccent : COLORS.text, fontWeight: '700', fontSize: 14.5 }}>{title}</Text>
    </Pressable>
  );
}

export function Pill({ label, active, onPress, color = COLORS.accent }: { label: string; active?: boolean; onPress?: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: active ? color : COLORS.surface,
        borderWidth: 1,
        borderColor: active ? color : COLORS.border,
        marginRight: 8,
      }}
    >
      <Text style={{ color: active ? COLORS.onAccent : COLORS.muted, fontWeight: '700', fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  );
}

/** Vignette « logo coloré » : icône pleine sur pastille teintée de la même couleur. */
export function Thumb({ icon, size = 44, color = COLORS.accent }: { icon: string; size?: number; color?: string }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.31,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: withAlpha(color, 0.13),
        borderWidth: 1,
        borderColor: withAlpha(color, 0.2),
      }}
    >
      <Icon name={icon} size={size * 0.46} color={color} strokeWidth={1.8} />
    </View>
  );
}

export function Avatar({ initial, size = 46 }: { initial: string; size?: number }) {
  return (
    <LinearGradient
      colors={[COLORS.accent, COLORS.accentDark] as const}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size * 0.33, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.4 }}>{initial}</Text>
    </LinearGradient>
  );
}

export function IconButton({ icon, onPress, dot, color = COLORS.muted }: { icon: string; onPress?: () => void; dot?: boolean; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        { width: 40, height: 40, borderRadius: 13, backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
        styles.softShadow,
      ]}
    >
      <Icon name={icon} size={19} color={color} />
      {dot ? (
        <View style={{ position: 'absolute', top: 9, right: 10, width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.danger, borderWidth: 2, borderColor: COLORS.surface }} />
      ) : null}
    </Pressable>
  );
}

/** Tuile de statistique — pastille icône colorée + valeur. */
export function StatTile({ label, value, unit, icon, color = COLORS.accent }: { label: string; value: string; unit?: string; icon?: string; color?: string }) {
  return (
    <View style={[styles.cardBase, styles.card, styles.softShadow, { padding: 13 }]}>
      {icon ? (
        <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: withAlpha(color, 0.13), alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <Icon name={icon} size={16} color={color} strokeWidth={1.9} />
        </View>
      ) : null}
      <Text style={styles.statK}>{label}</Text>
      <Text style={styles.statV}>
        {value}
        {unit ? <Text style={styles.statUnit}> {unit}</Text> : null}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardBase: { borderRadius: 22, padding: 16 },
  card: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border },
  softShadow: {
    shadowColor: '#1B2A4A',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  accentShadow: {
    shadowColor: COLORS.accent,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  secH: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12, paddingHorizontal: 2 },
  secTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  secAction: { color: COLORS.accent, fontSize: 12, fontWeight: '600' },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1.6, fontSize: 10.5, fontWeight: '700' },
  statK: { color: COLORS.faint, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.8 },
  statV: { color: COLORS.text, fontSize: 19, fontWeight: '700', marginTop: 4 } as TextStyle,
  statUnit: { color: COLORS.muted, fontSize: 11, fontWeight: '500' },
});
