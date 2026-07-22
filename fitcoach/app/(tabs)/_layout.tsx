import React from 'react';
import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { COLORS } from '@/constants/theme';

function TabIcon({ emoji, color }: { emoji: string; color: string }) {
  return <Text style={{ fontSize: 20, color, opacity: color === COLORS.muted ? 0.7 : 1 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: {
          backgroundColor: COLORS.navy,
          borderTopColor: COLORS.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color }) => <TabIcon emoji="🏠" color={color} /> }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: 'Nutrition', tabBarIcon: ({ color }) => <TabIcon emoji="🍽️" color={color} /> }}
      />
      <Tabs.Screen
        name="entrainement"
        options={{ title: 'Training', tabBarIcon: ({ color }) => <TabIcon emoji="💪" color={color} /> }}
      />
      <Tabs.Screen
        name="progression"
        options={{ title: 'Progression', tabBarIcon: ({ color }) => <TabIcon emoji="📈" color={color} /> }}
      />
      <Tabs.Screen
        name="bilan"
        options={{ title: 'Bilan', tabBarIcon: ({ color }) => <TabIcon emoji="📊" color={color} /> }}
      />
    </Tabs>
  );
}
