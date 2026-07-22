import React from 'react';
import { View, Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TAB_COLOR, TAB_EMOJI, withAlpha } from '@/constants/theme';

/** Logo d'onglet réaliste (emoji) dans une pastille teintée quand actif. */
function TabIcon({ emoji, color, focused }: { emoji: string; color: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 42,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? withAlpha(color, 0.16) : 'transparent',
      }}
    >
      <Text style={{ fontSize: focused ? 20 : 18, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.text,
        tabBarInactiveTintColor: COLORS.faint,
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 10.5, fontWeight: '600', marginTop: 2 },
        tabBarItemStyle: { paddingVertical: 6 },
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom,
          height: 62,
          borderRadius: 22,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: COLORS.border,
          borderTopColor: COLORS.border,
          paddingHorizontal: 6,
          shadowColor: '#1B2A4A',
          shadowOpacity: 0.14,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 16,
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon emoji={TAB_EMOJI.index} color={TAB_COLOR.index} focused={focused} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ focused }) => <TabIcon emoji={TAB_EMOJI.nutrition} color={TAB_COLOR.nutrition} focused={focused} /> }} />
      <Tabs.Screen name="entrainement" options={{ title: 'Training', tabBarIcon: ({ focused }) => <TabIcon emoji={TAB_EMOJI.entrainement} color={TAB_COLOR.entrainement} focused={focused} /> }} />
      <Tabs.Screen name="progression" options={{ title: 'Progression', tabBarIcon: ({ focused }) => <TabIcon emoji={TAB_EMOJI.progression} color={TAB_COLOR.progression} focused={focused} /> }} />
      <Tabs.Screen name="bilan" options={{ title: 'Bilan', tabBarIcon: ({ focused }) => <TabIcon emoji={TAB_EMOJI.bilan} color={TAB_COLOR.bilan} focused={focused} /> }} />
    </Tabs>
  );
}
