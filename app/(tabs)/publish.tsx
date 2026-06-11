import { Redirect, useRouter } from 'expo-router';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { CreateEvent, type EventFormData } from '@/components/events/create-event';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { isUserAdmin } from '@/libs/auth';
import { buildCreateEventPayloadFromForm } from '@/libs/event-form';
import { createEventApi } from '@/services/event-create.service';

const PAGE_BG = '#F2F4F7';

export default function PublishScreen() {
  const router = useRouter();
  const { user, token } = useAuth();
  const theme = Colors.light;
  const pageBg = PAGE_BG;

  if (!isUserAdmin(user)) {
    return <Redirect href="/(tabs)/profil" />;
  }

  const handleSubmit = async (data: EventFormData) => {
    if (!token) {
      Alert.alert('Session expirée', 'Reconnectez-vous pour publier un événement.');
      return;
    }

    try {
      const payload = await buildCreateEventPayloadFromForm(token, data);
      const { event } = await createEventApi(token, payload);
      Alert.alert('Événement publié', `« ${event.title} » a été enregistré.`, [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Impossible de publier cet événement.';
      Alert.alert('Publication', message);
      throw error;
    }
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
