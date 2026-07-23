import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDatabase } from '@/hooks/useDatabase';
import { useAuthStore } from '@/store/authStore';
import { scheduleRecurringReminders } from '@/lib/notifications';
import { COLORS } from '@/constants/theme';

function Splash({ error }: { error?: string | null }) {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Text style={{ color: COLORS.accent, fontSize: 30, fontWeight: '900', marginBottom: 16 }}>FitCoach</Text>
      {error ? <Text style={{ color: COLORS.danger, textAlign: 'center' }}>{error}</Text> : <ActivityIndicator color={COLORS.accent} />}
    </View>
  );
}

function useAuthGate(ready: boolean) {
  const status = useAuthStore((s) => s.status);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!ready || status === 'loading') return;
    const inAuth = segments[0] === '(auth)';
    if (status === 'guest' && !inAuth) {
      router.replace('/(auth)/login');
    } else if (status === 'authed' && inAuth) {
      router.replace('/(tabs)');
    }
  }, [ready, status, segments, router]);
}

export default function RootLayout() {
  const { ready, error } = useDatabase();
  const restore = useAuthStore((s) => s.restore);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    if (ready) restore();
  }, [ready, restore]);

  useEffect(() => {
    if (status === 'authed') scheduleRecurringReminders().catch(() => {});
  }, [status]);

  useAuthGate(ready);

  if (error) return <Splash error={`Erreur base de données :\n${error}`} />;
  if (!ready || status === 'loading') return <Splash />;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="workout/[id]" options={{ presentation: 'card' }} />
          <Stack.Screen name="settings" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
