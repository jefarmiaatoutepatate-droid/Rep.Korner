import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { GradientBg, Button } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { ProfileForm, emptyProfileDraft } from '@/components/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { validateProfile, type ProfileDraft } from '@/lib/authValidation';
import type { ProfileInput } from '@/lib/nutritionCalc';

/** Pré-remplit le formulaire avec le profil existant du compte. */
function draftFromUser(profile: ProfileInput | null): ProfileDraft {
  if (!profile) return emptyProfileDraft();
  return {
    sex: profile.sex,
    age: String(profile.age),
    height_cm: String(profile.height_cm),
    weight_kg: String(profile.weight_kg),
    weight_target_kg: String(profile.weight_target_kg),
    goal: profile.goal,
    sessions_per_week: profile.sessions_per_week,
  };
}

export default function ProfileEditScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);

  const [draft, setDraft] = useState<ProfileDraft>(() => draftFromUser(user?.profile ?? null));
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    const res = validateProfile(draft);
    if (res.error !== null) { setError(res.error); return; }
    setError(null);
    setBusy(true);
    try {
      await updateProfile(res.profile);
      router.back();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <GradientBg />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 12, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 }}>
            <Icon name="chevLeft" size={18} color={COLORS.accent} />
            <Text style={{ color: COLORS.accent, fontSize: 14 }}>Retour</Text>
          </Pressable>

          <Text style={{ color: COLORS.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.3 }}>Mon profil</Text>
          <Text style={{ color: COLORS.muted, fontSize: 13.5, marginTop: 4, marginBottom: 18 }}>
            Mets à jour tes infos — tes cibles caloriques se recalculent automatiquement.
          </Text>

          <ProfileForm value={draft} onChange={setDraft} />

          {error ? <Text style={{ color: COLORS.danger, fontSize: 13, marginTop: 10 }}>{error}</Text> : null}

          <Button title={busy ? 'Enregistrement…' : 'Enregistrer'} icon="check" onPress={save} style={{ marginTop: 14 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
