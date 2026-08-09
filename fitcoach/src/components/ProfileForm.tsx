/**
 * Formulaire de profil (onboarding + édition). Contrôlé : reçoit un brouillon et
 * remonte les changements. Affiche en direct les cibles caloriques calculées.
 */
import React from 'react';
import { View, Text, TextInput, Pressable } from 'react-native';
import { COLORS, withAlpha } from '@/constants/theme';
import { computeTargets, GOAL_LABELS, type Goal, type Sex } from '@/lib/nutritionCalc';
import { validateProfile, type ProfileDraft } from '@/lib/authValidation';

export function emptyProfileDraft(): ProfileDraft {
  return { sex: 'male', age: '', height_cm: '', weight_kg: '', weight_target_kg: '', goal: 'maintain', sessions_per_week: 4 };
}

const SESSIONS = [0, 1, 2, 3, 4, 5, 6, 7];

export function ProfileForm({ value, onChange }: { value: ProfileDraft; onChange: (d: ProfileDraft) => void }) {
  const set = <K extends keyof ProfileDraft>(key: K, v: ProfileDraft[K]) => onChange({ ...value, [key]: v });

  const parsed = validateProfile(value);
  const targets = parsed.error === null ? computeTargets(parsed.profile) : null;

  return (
    <View style={{ gap: 4 }}>
      {/* Sexe */}
      <Field label="Sexe">
        <Segmented
          options={[{ key: 'male', label: 'Homme' }, { key: 'female', label: 'Femme' }]}
          value={value.sex}
          onSelect={(k) => set('sex', k as Sex)}
        />
      </Field>

      {/* Âge / Taille */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Âge">
            <NumInput value={value.age} onChangeText={(t) => set('age', t)} placeholder="ans" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Taille (cm)">
            <NumInput value={value.height_cm} onChangeText={(t) => set('height_cm', t)} placeholder="cm" />
          </Field>
        </View>
      </View>

      {/* Poids actuel / cible */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Poids (kg)">
            <NumInput value={value.weight_kg} onChangeText={(t) => set('weight_kg', t)} placeholder="kg" />
          </Field>
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Poids cible (kg)">
            <NumInput value={value.weight_target_kg} onChangeText={(t) => set('weight_target_kg', t)} placeholder="kg" />
          </Field>
        </View>
      </View>

      {/* Objectif */}
      <Field label="Objectif">
        <Segmented
          options={(Object.keys(GOAL_LABELS) as Goal[]).map((g) => ({ key: g, label: GOAL_LABELS[g] }))}
          value={value.goal}
          onSelect={(k) => set('goal', k as Goal)}
          small
        />
      </Field>

      {/* Séances / semaine */}
      <Field label="Séances de sport / semaine">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {SESSIONS.map((n) => {
            const active = value.sessions_per_week === n;
            return (
              <Pressable
                key={n}
                onPress={() => set('sessions_per_week', n)}
                style={{
                  width: 38, height: 38, borderRadius: 12,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: active ? COLORS.accent : COLORS.surface,
                  borderWidth: 1, borderColor: active ? COLORS.accent : COLORS.border,
                }}
              >
                <Text style={{ color: active ? '#fff' : COLORS.text, fontWeight: '700', fontSize: 14 }}>{n === 7 ? '7+' : n}</Text>
              </Pressable>
            );
          })}
        </View>
      </Field>

      {/* Aperçu des cibles calculées */}
      <View
        style={{
          marginTop: 8, borderRadius: 16, padding: 14,
          backgroundColor: withAlpha(COLORS.accent, 0.08),
          borderWidth: 1, borderColor: withAlpha(COLORS.accent, 0.25),
        }}
      >
        <Text style={{ color: COLORS.muted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 }}>
          Tes cibles calculées
        </Text>
        {targets ? (
          <>
            <Text style={{ color: COLORS.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.3 }}>
              {targets.daily_kcal} kcal<Text style={{ color: COLORS.muted, fontSize: 13, fontWeight: '600' }}> / jour</Text>
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 13, marginTop: 4 }}>
              P {targets.protein_g} g · G {targets.carbs_g} g · L {targets.fat_g} g · 💧 {targets.water_l} L
            </Text>
            <Text style={{ color: COLORS.faint, fontSize: 11.5, marginTop: 4 }}>
              Maintenance estimée ≈ {targets.tdee_kcal} kcal
            </Text>
          </>
        ) : (
          <Text style={{ color: COLORS.faint, fontSize: 13 }}>Remplis tes infos pour voir tes besoins caloriques.</Text>
        )}
      </View>
    </View>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: COLORS.muted, fontSize: 12.5, fontWeight: '600', marginBottom: 7 }}>{label}</Text>
      {children}
    </View>
  );
}

function NumInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (t: string) => void; placeholder?: string }) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      keyboardType="numeric"
      placeholder={placeholder}
      placeholderTextColor={COLORS.faint}
      style={{
        backgroundColor: COLORS.surface, borderColor: COLORS.border, borderWidth: 1,
        borderRadius: 14, paddingHorizontal: 14, paddingVertical: 13, color: COLORS.text, fontSize: 15,
      }}
    />
  );
}

function Segmented({ options, value, onSelect, small }: {
  options: { key: string; label: string }[];
  value: string;
  onSelect: (key: string) => void;
  small?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {options.map((o) => {
        const active = value === o.key;
        return (
          <Pressable
            key={o.key}
            onPress={() => onSelect(o.key)}
            style={{
              flex: 1, alignItems: 'center', justifyContent: 'center',
              paddingVertical: 12, borderRadius: 13,
              backgroundColor: active ? COLORS.accent : COLORS.surface,
              borderWidth: 1, borderColor: active ? COLORS.accent : COLORS.border,
            }}
          >
            <Text style={{ color: active ? '#fff' : COLORS.text, fontWeight: '700', fontSize: small ? 12 : 14, textAlign: 'center' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
