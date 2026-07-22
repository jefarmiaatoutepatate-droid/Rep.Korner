import React from 'react';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';
import { Icon } from '@/components/Icon';

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.faint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 6 },
        // Barre flottante, verre sombre arrondi
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom,
          height: 62,
          borderRadius: 22,
          backgroundColor: 'rgba(18,28,52,0.94)',
          borderWidth: 1,
          borderColor: COLORS.hairline,
          borderTopColor: COLORS.hairline,
          paddingHorizontal: 6,
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 14 },
          elevation: 16,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <Icon name="home" color={color} size={22} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ color }) => <Icon name="food" color={color} size={22} /> }} />
      <Tabs.Screen name="entrainement" options={{ title: 'Training', tabBarIcon: ({ color }) => <Icon name="dumbbell" color={color} size={22} /> }} />
      <Tabs.Screen name="progression" options={{ title: 'Progression', tabBarIcon: ({ color }) => <Icon name="chart" color={color} size={22} /> }} />
      <Tabs.Screen name="bilan" options={{ title: 'Bilan', tabBarIcon: ({ color }) => <Icon name="report" color={color} size={22} /> }} />
    </Tabs>
  );
}
