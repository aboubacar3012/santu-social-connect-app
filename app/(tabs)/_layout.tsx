import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { AnimatedTabBar } from '@/components/shared/animated-tab-bar';
import { HapticTab } from '@/components/shared/haptic-tab';
import { TabChromeProvider } from '@/contexts/tab-chrome-context';
import { useAuth } from '@/hooks/use-auth';

const ACCENT = '#0077B6';
const TAB_BAR_SCRIM = 'rgba(242,244,247,0.82)';

const TAB_BAR_STYLE = {
  marginHorizontal: 20,
  position: 'absolute' as const,
  left: 20,
  right: 20,
  bottom: 16,
  borderRadius: 22,
  height: 58,
  paddingBottom: 8,
  paddingTop: 8,
  backgroundColor: 'transparent',
  borderTopWidth: 0,
  elevation: 0,
  shadowOpacity: 0,
};

export default function TabLayout() {
  const { isReady, isAuthenticated } = useAuth();

  if (!isReady) {
    return null;
  }
  if (!isAuthenticated) {
    return <Redirect href="/auth" />;
  }

  return (
    <TabChromeProvider>
      <Tabs
        tabBar={(props) => <AnimatedTabBar {...props} />}
        screenOptions={{
          tabBarActiveTintColor: ACCENT,
          tabBarInactiveTintColor: 'rgba(60,60,67,0.55)',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: TAB_BAR_STYLE,
          tabBarBackground: () => (
            <View style={styles.tabBarBlurShell}>
              <View style={styles.tabBarScrim} />
              <BlurView intensity={48} tint="light" style={StyleSheet.absoluteFillObject} />
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.1,
            marginTop: -2,
          },
          tabBarItemStyle: {
            borderRadius: 16,
            paddingVertical: 2,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Événements',
            tabBarIcon: ({ color }) => <MaterialIcons name="event" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="annuaire"
          options={{
            title: 'Annuaire',
            tabBarIcon: ({ color }) => <MaterialIcons name="groups" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profil"
          options={{
            title: 'Mon profil',
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={22} color={color} />,
          }}
        />

        <Tabs.Screen name="publish" options={{ href: null }} />
        <Tabs.Screen name="messages" options={{ href: null }} />
      </Tabs>
    </TabChromeProvider>
  );
}

const styles = StyleSheet.create({
  tabBarBlurShell: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  tabBarScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: TAB_BAR_SCRIM,
  },
});
