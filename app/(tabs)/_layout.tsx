import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          marginHorizontal: 16,
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: 20,
          borderRadius: 24,
          height: 64,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 6 },
          elevation: 10,
          borderTopWidth: 0,
        },
        tabBarItemStyle: {
          borderRadius: 20,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Rechercher',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="magnifyingglass" color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="vos-trajets"
        options={{
          title: 'Vos trajets',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="car.fill" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="publier"
        options={{
          title: 'Publier',
          tabBarIcon: ({ color }) => <IconSymbol size={24} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={24} name="person.crop.circle" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
