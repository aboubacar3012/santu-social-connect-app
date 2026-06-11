import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CreateEvent, type EventFormData } from '@/components/events/create-event';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { isUserAdmin } from '@/libs/auth';
import {
  buildUpdateEventPayloadFromForm,
  eventItemToFormData,
} from '@/libs/event-form';
import { deleteEventApi } from '@/services/event-delete.service';
import { getEventByIdApi } from '@/services/event-detail.service';
import { updateEventApi } from '@/services/event-update.service';
import type { EventItem } from '@/types/event';

const PAGE_BG = '#F2F4F7';

export default function EditEventScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;
  const { user, token } = useAuth();

  const pageBg = PAGE_BG;
  const divider = 'rgba(0,0,0,0.06)';

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setEvent(null);
      setLoading(false);
      setError('Événement introuvable.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { event: data } = await getEventByIdApi(id);
      setEvent(data);
    } catch (err: unknown) {
      setEvent(null);
      setError(err instanceof Error ? err.message : 'Événement introuvable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchEvent();
  }, [fetchEvent]);

  const initialForm = useMemo<EventFormData | undefined>(
    () => (event ? eventItemToFormData(event) : undefined),
    [event],
  );

  const handleDelete = () => {
    if (!event || !token || !id || deleting) return;

    Alert.alert(
      'Supprimer l\'événement',
      `« ${event.title} » sera définitivement supprimé. Cette action est irréversible.`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              setDeleting(true);
              try {
                await deleteEventApi(token, id);
                Alert.alert('Événement supprimé', 'L\'événement a été retiré.', [
                  { text: 'OK', onPress: () => router.replace('/my-events') },
                ]);
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Impossible de supprimer cet événement.';
                Alert.alert('Suppression', message);
              } finally {
                setDeleting(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handleSubmit = async (data: EventFormData) => {
    if (!token || !id) {
      Alert.alert('Session expirée', 'Reconnectez-vous pour modifier cet événement.');
      return;
    }

    try {
      const payload = await buildUpdateEventPayloadFromForm(token, data);
      const { event: updated } = await updateEventApi(token, id, payload);
      Alert.alert('Événement mis à jour', `« ${updated.title} » a été enregistré.`, [
        { text: 'OK', onPress: () => router.replace('/my-events') },
      ]);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Impossible de modifier cet événement.';
      Alert.alert('Modification', message);
      throw err;
    }
  };

  if (!isUserAdmin(user)) {
    return <Redirect href="/(tabs)/profil" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: pageBg, paddingTop: insets.top }]}>
      <View style={[styles.topBar, { borderBottomColor: divider }]}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <MaterialIcons name="arrow-back" size={22} color={theme.text} />
        </Pressable>
        <ThemedText style={[styles.topTitle, { color: theme.text }]}>Modifier</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <SafeScrollView screenBackgroundColor={pageBg} keyboardAvoiding>
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator color="#0077B6" />
            <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
              Chargement de l&apos;événement…
            </ThemedText>
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <ThemedText style={[styles.errorText, { color: theme.text }]}>{error}</ThemedText>
            <Pressable onPress={() => void fetchEvent()}>
              <ThemedText style={styles.retryText}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : initialForm ? (
          <>
            <CreateEvent
              key={id}
              initial={initialForm}
              submitLabel="Enregistrer les modifications"
              resetOnSubmit={false}
              onSubmit={handleSubmit}
            />
            <Pressable
              disabled={deleting}
              onPress={handleDelete}
              style={({ pressed }) => [
                styles.deleteBtn,
                {
                  borderColor: '#E8212722',
                  backgroundColor: '#FFF5F5',
                  opacity: pressed || deleting ? 0.85 : 1,
                },
              ]}
            >
              {deleting ? (
                <ActivityIndicator color="#E82127" />
              ) : (
                <>
                  <MaterialIcons name="delete-outline" size={20} color="#E82127" />
                  <ThemedText style={styles.deleteBtnText}>Supprimer l&apos;événement</ThemedText>
                </>
              )}
            </Pressable>
          </>
        ) : null}

        <View style={styles.tabBarSpacer} />
      </SafeScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontSize: 17, fontWeight: '700' },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 48,
  },
  loadingText: { fontSize: 13, fontWeight: '500' },
  errorText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryText: { fontSize: 14, fontWeight: '700', color: '#0077B6' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  deleteBtnText: { fontSize: 15, fontWeight: '700', color: '#E82127' },
  tabBarSpacer: { height: 32 },
});
