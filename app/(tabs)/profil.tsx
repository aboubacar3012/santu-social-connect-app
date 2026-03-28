import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import ProfilEdit from '@/components/profil-edit';
import ProfilView from '@/components/profil-view';
import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signOut } = useAuth();

  const [editing, setEditing] = useState(false);

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const muted = isDark ? MUTED.dark : MUTED.light;

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <SafeScrollView screenBackgroundColor={pageBg} centerContent keyboardAvoiding>
      <View style={styles.hero}>
        <ThemedText style={[styles.heroKicker, { color: muted }]}>PROFIL</ThemedText>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>
          {editing ? 'Modifier le profil' : 'Mon compte'}
        </ThemedText>
      </View>

      {editing ? (
        <ProfilEdit onCancel={() => setEditing(false)} onSave={() => setEditing(false)} />
      ) : (
        <ProfilView onEdit={() => setEditing(true)} onLogout={handleLogout} />
      )}

      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 3,
    gap: 5,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    maxWidth: 320,
  },
  tabBarSpacer: {
    height: 76,
  },
});
