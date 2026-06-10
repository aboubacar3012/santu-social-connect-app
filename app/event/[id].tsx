import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventDetail } from '@/components/events/event-detail';
import { ThemedText } from '@/components/shared/themed-text';
import { EVENT_TYPE_LABELS, type EventItem } from '@/constants/mock-events';
import { formatEventSchedule, isEventPast } from '@/libs/event-schedule';
import { Colors } from '@/constants/theme';
import { useEventFavorites } from '@/contexts/event-favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getEventByIdApi } from '@/services/event-detail.service';

const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;
const ACCENT = '#0077B6';

export default function EventModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { isFavorite, toggleFavorite } = useEventFavorites();

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setEvent(null);
      setLoading(false);
      setError(null);
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

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : event ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          {(() => {
            const schedule = formatEventSchedule(event);
            return (
              <EventDetail
                title={event.title}
                typeLabel={EVENT_TYPE_LABELS[event.type]}
                image={event.image}
                description={event.description}
                dateLabel={schedule.dateLabel}
                time={schedule.time}
                address={event.address}
                links={event.links}
                isFavorite={isFavorite(event.id)}
                isPast={isEventPast(event)}
                onToggleFavorite={() => toggleFavorite(event.id)}
              />
            );
          })()}
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <MaterialIcons name="event-busy" size={36} color={theme.icon} />
          <ThemedText style={[styles.notFoundText, { color: theme.icon }]}>
            {error ?? 'Événement introuvable.'}
          </ThemedText>
          {error ? (
            <Pressable onPress={() => void fetchEvent()}>
              <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  retryText: { fontSize: 14, fontWeight: '700' },
});
