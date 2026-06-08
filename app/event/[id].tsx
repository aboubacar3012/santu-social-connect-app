import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EventDetail } from '@/components/events/event-detail';
import { ThemedText } from '@/components/shared/themed-text';
import {
  EVENT_TYPE_LABELS,
  findEventById,
  formatEventDate,
  isEventPast,
} from '@/constants/mock-events';
import { Colors } from '@/constants/theme';
import { useEventFavorites } from '@/contexts/event-favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

export default function EventModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const { isFavorite, toggleFavorite } = useEventFavorites();

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const event = id ? findEventById(id) : undefined;

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {event ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <EventDetail
            title={event.title}
            typeLabel={EVENT_TYPE_LABELS[event.type]}
            image={event.image}
            description={event.description}
            dateLabel={formatEventDate(event.date)}
            time={event.time}
            address={event.address}
            links={event.links}
            isFavorite={isFavorite(event.id)}
            isPast={isEventPast(event)}
            onToggleFavorite={() => toggleFavorite(event.id)}
          />
        </ScrollView>
      ) : (
        <View style={styles.notFound}>
          <MaterialIcons name="event-busy" size={36} color={theme.icon} />
          <ThemedText style={[styles.notFoundText, { color: theme.icon }]}>Événement introuvable.</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundText: { fontSize: 15, fontWeight: '500' },
});
