import React, { useState } from 'react';
import { ScrollView, View, Text, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { GradientBg, Button, Avatar } from '@/components/ui';
import { AuthField } from '@/components/AuthField';
import { useAuthStore } from '@/store/authStore';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(null);
    setBusy(true);
    try {
      await signIn({ email, password });
      // La redirection est gérée par le gate du layout racine.
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
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: insets.top + 48, paddingBottom: 40, flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginBottom: 28 }}>
            <Avatar initial="F" size={64} />
            <Text style={{ color: COLORS.text, fontSize: 26, fontWeight: '800', marginTop: 16, letterSpacing: -0.4 }}>Content de te revoir</Text>
            <Text style={{ color: COLORS.muted, fontSize: 14, marginTop: 4 }}>Connecte-toi pour continuer ton suivi.</Text>
          </View>

          <AuthField label="E-mail" value={email} onChangeText={setEmail} placeholder="toi@exemple.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <AuthField label="Mot de passe" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry autoCapitalize="none" />

          {error ? <Text style={{ color: COLORS.danger, fontSize: 13, marginBottom: 10 }}>{error}</Text> : null}

          <Button title={busy ? 'Connexion…' : 'Se connecter'} icon="arrow" onPress={submit} style={{ marginTop: 6 }} />

          <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 22, gap: 5 }}>
            <Text style={{ color: COLORS.muted, fontSize: 14 }}>Pas encore de compte ?</Text>
            <Pressable onPress={() => router.replace('/(auth)/signup')}>
              <Text style={{ color: COLORS.accent, fontSize: 14, fontWeight: '700' }}>Créer un compte</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
