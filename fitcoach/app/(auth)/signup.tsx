import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { GradientBg, Button, Avatar } from '@/components/ui';
import { AuthField } from '@/components/AuthField';
import { useAuthStore } from '@/store/authStore';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUp({ name, email, password });
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
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, paddingBottom: 40, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 24 }}>
            <Avatar initial="F" size={64} />
            <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '800', marginTop: 16, letterSpacing: -0.4 }}>Crée ton compte</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 4, textAlign: 'center' }}>Ton suivi nutrition & muscu, rien qu'à toi.</Text>
          </View>

          <AuthField label="Prénom" value={name} onChangeText={setName} placeholder="Nathan" autoCapitalize="words" autoComplete="name" />
          <AuthField label="E-mail" value={email} onChangeText={setEmail} placeholder="toi@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthField label="Mot de passe" value={password} onChangeText={setPassword} placeholder="8 caractères min., 1 lettre + 1 chiffre" secureTextEntry autoCapitalize="none" />

          {error ? <Text style={{ color: COLORS.danger, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}

          <Button title={busy ? 'Création…' : 'Créer mon compte'} icon="check" onPress={submit} style={{ marginTop: 6 }} />

          <Text style={{ color: COLORS.faint, fontSize: 11.5, textAlign: 'center', marginTop: 14, lineHeight: 17 }}>
            En créant un compte, tu acceptes que tes données soient stockées pour ton suivi. Tu peux supprimer ton compte à tout moment.
          </Text>

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 18, gap: 5 }}>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>Déjà un compte ?</Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={{ color: COLORS.accent, fontSize: 14, fontWeight: '700' }}>Se connecter</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
