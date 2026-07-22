import React from 'react';
import { View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TAB_COLOR, withAlpha } from '@/constants/theme';
import { Icon } from '@/components/Icon';

/** Icône d'onglet colorée : pastille teintée quand l'onglet est actif. */
function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  return (
    <View
      style={{
        width: 40,
        height: 32,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? withAlpha(color, 0.14) : 'transparent',
      }}
    >
      <Icon name={name} size={22} color={focused ? color : withAlpha(color, 0.55)} strokeWidth={focused ? 2 : 1.8} />
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
        // Barre flottante blanche arrondie
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
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="home" color={TAB_COLOR.index} focused={focused} /> }} />
      <Tabs.Screen name="nutrition" options={{ title: 'Nutrition', tabBarIcon: ({ focused }) => <TabIcon name="food" color={TAB_COLOR.nutrition} focused={focused} /> }} />
      <Tabs.Screen name="entrainement" options={{ title: 'Training', tabBarIcon: ({ focused }) => <TabIcon name="dumbbell" color={TAB_COLOR.entrainement} focused={focused} /> }} />
      <Tabs.Screen name="progression" options={{ title: 'Progression', tabBarIcon: ({ focused }) => <TabIcon name="chart" color={TAB_COLOR.progression} focused={focused} /> }} />
      <Tabs.Screen name="bilan" options={{ title: 'Bilan', tabBarIcon: ({ focused }) => <TabIcon name="report" color={TAB_COLOR.bilan} focused={focused} /> }} />
    </Tabs>
  );
}
