import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useDatabase } from '@/hooks/useDatabase';
import { scheduleRecurringReminders } from '@/lib/notifications';
import { COLORS } from '@/constants/theme';

export default function RootLayout() {
  const { ready, error } = useDatabase();

  useEffect(() => {
    if (ready) {
      // Programme bilan dimanche 20h + rappels pesée (best-effort).
      scheduleRecurringReminders().catch(() => {});
    }
  }, [ready]);

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: COLORS.danger, textAlign: 'center' }}>Erreur base de données :{'\n'}{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: COLORS.accent, fontSize: 28, fontWeight: '900', marginBottom: 16 }}>FitCoach</Text>
        <ActivityIndicator color={COLORS.accent} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: COLORS.bg } }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="workout/[id]" options={{ presentation: 'card' }} />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
