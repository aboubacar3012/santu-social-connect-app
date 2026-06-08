import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { CreateEvent, type EventFormData } from '@/components/events/create-event';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isUserAdmin } from '@/libs/auth';

const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

export default function PublishScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;

  if (!isUserAdmin(user)) {
    return <Redirect href="/(tabs)/profil" />;
  }

  const handleSubmit = async (data: EventFormData) => {
    Alert.alert(
      'Événement publié',
      `« ${data.title} » a été enregistré. Il apparaîtra bientôt dans la liste.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }],
    );
  };

  return (
    <SafeScrollView screenBackgroundColor={pageBg} keyboardAvoiding>
      <View style={styles.header}>
        <ThemedText style={[styles.kicker, { color: theme.icon }]}>ORGANISER</ThemedText>
        <ThemedText style={[styles.title, { color: theme.text }]}>Créer un événement</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Partagez un rendez-vous avec le réseau entrepreneurial marseillais.
        </ThemedText>
      </View>

      <CreateEvent onSubmit={handleSubmit} />

      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18, gap: 4 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2.2 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, maxWidth: 320 },
  tabBarSpacer: { height: 96 },
});
