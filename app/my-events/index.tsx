import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { EVENT_TYPE_LABELS, type EventItem } from '@/constants/mock-events';
import { formatEventSchedule, isEventPast } from '@/libs/event-schedule';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { isUserAdmin } from '@/libs/auth';
import { deleteEventApi } from '@/services/event-delete.service';
import { listMyEventsApi } from '@/services/event-my-list.service';

const PAGE_BG = '#F2F4F7';
const ACCENT = '#0077B6';

export default function MyEventsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;
  const { user, token } = useAuth();

  const pageBg = PAGE_BG;
  const cardBg = '#FFFFFF';
  const divider = 'rgba(0,0,0,0.06)';
  const chipBg = 'rgba(0,0,0,0.05)';

  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    if (!token) {
      setEvents([]);
      setLoading(false);
      setError('Session expirée. Reconnectez-vous.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { events: data } = await listMyEventsApi(token);
      setEvents(data);
    } catch (err: unknown) {
      setEvents([]);
      setError(err instanceof Error ? err.message : 'Impossible de charger vos événements.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      void fetchEvents();
    }, [fetchEvents]),
  );

  const handleDelete = (event: EventItem) => {
    if (!token || deletingId) return;

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
              setDeletingId(event.id);
              try {
                await deleteEventApi(token, event.id);
                setEvents((prev) => prev.filter((item) => item.id !== event.id));
              } catch (err: unknown) {
                const message =
                  err instanceof Error ? err.message : 'Impossible de supprimer cet événement.';
                Alert.alert('Suppression', message);
              } finally {
                setDeletingId(null);
              }
            })();
          },
        },
      ],
    );
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
        <ThemedText style={[styles.topTitle, { color: theme.text }]}>Mes événements</ThemedText>
        <View style={styles.backBtn} />
      </View>

      <SafeScrollView screenBackgroundColor={pageBg}>
        <View style={styles.header}>
          <ThemedText style={[styles.kicker, { color: theme.icon }]}>ORGANISATION</ThemedText>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Événements publiés
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
            Retrouvez et modifiez les rendez-vous que vous avez ajoutés au réseau.
          </ThemedText>
        </View>

        {error ? (
          <View style={[styles.banner, { backgroundColor: cardBg, borderColor: divider }]}>
            <MaterialIcons name="error-outline" size={18} color="#E82127" />
            <ThemedText style={[styles.bannerText, { color: theme.text }]}>{error}</ThemedText>
            <Pressable onPress={() => void fetchEvents()}>
              <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={ACCENT} />
            <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
              Chargement…
            </ThemedText>
          </View>
        ) : events.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: cardBg, borderColor: divider }]}>
            <MaterialIcons name="event-busy" size={32} color={theme.icon} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              Aucun événement
            </ThemedText>
            <ThemedText style={[styles.emptyBody, { color: theme.icon }]}>
              Vous n&apos;avez pas encore publié d&apos;événement.
            </ThemedText>
            <Pressable
              onPress={() => router.push('/(tabs)/publish')}
              style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.9 }]}
            >
              <MaterialIcons name="add" size={18} color="#FFF" />
              <ThemedText style={styles.emptyBtnText}>Créer un événement</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {events.map((event) => {
              const past = isEventPast(event);
              const schedule = formatEventSchedule(event);
              return (
                <View
                  key={event.id}
                  style={[styles.eventCard, { backgroundColor: cardBg, borderColor: divider }]}
                >
                  <View style={styles.eventMain}>
                    <View style={[styles.typeChip, { backgroundColor: chipBg }]}>
                      <ThemedText style={[styles.typeChipText, { color: ACCENT }]}>
                        {EVENT_TYPE_LABELS[event.type]}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.eventTitle, { color: theme.text }]} numberOfLines={2}>
                      {event.title}
                    </ThemedText>
                    <View style={styles.metaRow}>
                      <MaterialIcons name="event" size={14} color={theme.icon} />
                      <ThemedText style={[styles.metaText, { color: theme.icon }]}>
                        {schedule.dateLabel} · {schedule.time}
                      </ThemedText>
                    </View>
                    <View style={styles.metaRow}>
                      <MaterialIcons name="place" size={14} color={theme.icon} />
                      <ThemedText style={[styles.metaText, { color: theme.icon }]} numberOfLines={1}>
                        {event.address}
                      </ThemedText>
                    </View>
                    {past ? (
                      <View style={[styles.pastBadge, { backgroundColor: `${theme.icon}18` }]}>
                        <ThemedText style={[styles.pastBadgeText, { color: theme.icon }]}>
                          Passé
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.eventActions}>
                    <Pressable
                      onPress={() => router.push(`/event/edit/${event.id}`)}
                      style={({ pressed }) => [
                        styles.actionChip,
                        styles.actionChipPrimary,
                        { backgroundColor: ACCENT, opacity: pressed ? 0.9 : 1 },
                      ]}
                    >
                      <MaterialIcons name="edit" size={16} color="#FFF" />
                      <ThemedText style={[styles.actionChipText, { color: '#FFF' }]}>
                        Modifier
                      </ThemedText>
                    </Pressable>
                    <Pressable
                      disabled={deletingId === event.id}
                      onPress={() => handleDelete(event)}
                      style={({ pressed }) => [
                        styles.actionChip,
                        styles.actionChipDanger,
                        {
                          backgroundColor: '#FFF5F5',
                          opacity: pressed || deletingId === event.id ? 0.85 : 1,
                        },
                      ]}
                    >
                      {deletingId === event.id ? (
                        <ActivityIndicator color="#E82127" size="small" />
                      ) : (
                        <>
                          <MaterialIcons name="delete-outline" size={16} color="#E82127" />
                          <ThemedText style={[styles.actionChipText, { color: '#E82127' }]}>
                            Supprimer
                          </ThemedText>
                        </>
                      )}
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

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
  header: { marginBottom: 18, gap: 4 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2.2 },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -1, lineHeight: 34 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, maxWidth: 320 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  retryText: { fontSize: 13, fontWeight: '700' },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 40,
  },
  loadingText: { fontSize: 13, fontWeight: '500' },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    padding: 28,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  emptyBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: ACCENT,
  },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  list: { gap: 12 },
  eventCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 14,
  },
  eventMain: { gap: 8 },
  typeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeChipText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  eventTitle: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { flex: 1, fontSize: 13, lineHeight: 18 },
  pastBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 2,
  },
  pastBadgeText: { fontSize: 11, fontWeight: '600' },
  eventActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionChip: {
    flexGrow: 1,
    flexBasis: '30%',
    minWidth: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  actionChipPrimary: {},
  actionChipDanger: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8212722',
  },
  actionChipText: { fontSize: 13, fontWeight: '600' },
  tabBarSpacer: { height: 32 },
});
