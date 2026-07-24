import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { GradientBg, Button, Avatar } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { AuthField } from '@/components/AuthField';
import { ProfileForm, emptyProfileDraft } from '@/components/ProfileForm';
import { useAuthStore } from '@/store/authStore';
import { validateSignup, validateProfile, normalizeEmail, type ProfileDraft } from '@/lib/authValidation';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [draft, setDraft] = useState<ProfileDraft>(emptyProfileDraft());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Étape 1 → 2 : on valide d'abord les identifiants.
  const next = () => {
    const err = validateSignup({ name, email: normalizeEmail(email), password });
    if (err) { setError(err); return; }
    setError(null);
    setStep(2);
  };

  // Étape 2 : on valide le profil puis on crée le compte.
  const submit = async () => {
    const res = validateProfile(draft);
    if (res.error !== null) { setError(res.error); return; }
    setError(null);
    setBusy(true);
    try {
      await signUp({ name, email: normalizeEmail(email), password, profile: res.profile });
      // Redirection gérée par le gate du layout racine.
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
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 32, paddingBottom: 40, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 22 }}>
            <Avatar initial="F" size={60} />
            <Text style={{ color: COLORS.text, fontSize: 25, fontWeight: '800', marginTop: 14, letterSpacing: -0.4 }}>
              {step === 1 ? 'Crée ton compte' : 'Parle-moi de toi'}
            </Text>
            <Text style={{ color: COLORS.muted, fontSize: 13.5, marginTop: 4, textAlign: 'center' }}>
              {step === 1 ? 'Ton suivi nutrition & muscu, rien qu\'à toi.' : 'Pour calculer tes besoins caloriques sur-mesure.'}
            </Text>
          </View>

          {/* Indicateur d'étape */}
          <StepDots step={step} />

          {step === 1 ? (
            <>
              <AuthField label="Prénom" value={name} onChangeText={setName} placeholder="Nathan" autoCapitalize="words" autoComplete="name" />
              <AuthField label="E-mail" value={email} onChangeText={setEmail} placeholder="toi@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
              <AuthField label="Mot de passe" value={password} onChangeText={setPassword} placeholder="8 caractères min., 1 lettre + 1 chiffre" secureTextEntry autoCapitalize="none" />

              {error ? <Text style={{ color: COLORS.danger, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}

              <Button title="Continuer" icon="arrow" onPress={next} style={{ marginTop: 6 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, gap: 5 }}>
                <Text style={{ color: COLORS.muted, fontSize: 14 }}>Déjà un compte ?</Text>
                <Pressable onPress={() => router.replace('/(auth)/login')}>
                  <Text style={{ color: COLORS.accent, fontSize: 14, fontWeight: '700' }}>Se connecter</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <ProfileForm value={draft} onChange={setDraft} />

              {error ? <Text style={{ color: COLORS.danger, fontSize: 13, marginTop: 10 }}>{error}</Text> : null}

              <Button title={busy ? 'Création…' : 'Créer mon compte'} icon="check" onPress={submit} style={{ marginTop: 14 }} />

              <Pressable onPress={() => { setError(null); setStep(1); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 16 }}>
                <Icon name="chevLeft" size={16} color={COLORS.muted} />
                <Text style={{ color: COLORS.muted, fontSize: 13.5 }}>Retour</Text>
              </Pressable>

              <Text style={{ color: COLORS.faint, fontSize: 11, textAlign: 'center', marginTop: 12, lineHeight: 16 }}>
                En créant un compte, tu acceptes que tes données soient stockées pour ton suivi. Tu peux tout modifier ou supprimer ton compte à tout moment.
              </Text>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function StepDots({ step }: { step: 1 | 2 }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 7, marginBottom: 22 }}>
      {[1, 2].map((n) => (
        <View
          key={n}
          style={{
            height: 6, borderRadius: 3,
            width: n === step ? 26 : 6,
            backgroundColor: n === step ? COLORS.accent : COLORS.border,
          }}
        />
      ))}
    </View>
  );
}
