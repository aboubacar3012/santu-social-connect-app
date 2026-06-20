import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useQuery } from '@tanstack/react-query';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  EventFloatingFilters,
  hasActiveEventFilters,
  type EventTypeFilter,
} from '@/components/events/event-floating-filters';
import { EventCard } from '@/components/events/event-card';
import { FeaturedEventCard } from '@/components/events/featured-event-card';
import { hasEventImage } from '@/components/events/event-image-placeholder';
import { ThemedText } from '@/components/shared/themed-text';
import {
  EVENT_TYPE_LABELS,
  type EventItem,
} from '@/constants/mock-events';
import {
  formatEventSchedule,
  isEventPast,
} from '@/libs/event-schedule';
import { eventsQueryKeys, fetchEventsList } from '@/libs/tanstack/events-query';
import { Colors } from '@/constants/theme';
import { useEventFavorites } from '@/contexts/event-favorites-context';
import { useTabChrome } from '@/contexts/tab-chrome-context';

const ACCENT = '#0077B6';
const PAGE_BG = '#F2F4F7';

export default function EventsScreen() {
  const theme = Colors.light;
  const insets = useSafeAreaInsets();
  const { isFavorite, toggleFavorite } = useEventFavorites();
  const { chromeVisible, scrollY, onScroll, setChromeVisible } = useTabChrome();
  const { height: windowHeight } = useWindowDimensions();

  const pageBg = PAGE_BG;
  const cardBg = '#FFFFFF';
  const divider = 'rgba(0,0,0,0.06)';

  const [typeFilter, setTypeFilter] = useState<EventTypeFilter>('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [expandedTitleEventId, setExpandedTitleEventId] = useState<string | null>(null);
  const [expandedDescriptionEventId, setExpandedDescriptionEventId] = useState<string | null>(null);

  const {
    data: allEvents = [],
    isPending: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: eventsQueryKeys.list(typeFilter),
    queryFn: () => fetchEventsList(typeFilter),
  });

  const error = queryError instanceof Error
    ? queryError.message
    : queryError
      ? 'Impossible de charger les événements.'
      : null;

  useFocusEffect(
    useCallback(() => {
      setChromeVisible(true);
      void refetch();
    }, [refetch, setChromeVisible]),
  );

  const events = useMemo(() => {
    const now = Date.now();
    let list = allEvents.filter((e) => {
      if (favoritesOnly && !isFavorite(e.id)) return false;
      return true;
    });

    const upcoming = list
      .filter((e) => e.startsAt >= now)
      .sort((a, b) => a.startsAt - b.startsAt);
    const past = list
      .filter((e) => e.startsAt < now)
      .sort((a, b) => b.startsAt - a.startsAt);

    return [...upcoming, ...past];
  }, [allEvents, favoritesOnly, isFavorite]);

  const hasActiveFilters = hasActiveEventFilters(typeFilter, favoritesOnly);

  const { featuredEvent, listEvents } = useMemo(() => {
    if (events.length === 0) {
      return { featuredEvent: null, listEvents: [] as EventItem[] };
    }

    if (hasActiveFilters) {
      return { featuredEvent: null, listEvents: events };
    }

    const featuredIndex = events.findIndex((event) => hasEventImage(event.image));
    const featuredEvent = featuredIndex === -1 ? events[0] : events[featuredIndex];

    return {
      featuredEvent,
      listEvents: events,
    };
  }, [events, hasActiveFilters]);

  const resetFilters = () => {
    setTypeFilter('All');
    setFavoritesOnly(false);
  };

  const showFeatured = !loading && featuredEvent != null;
  const darkBlur = showFeatured && scrollY < windowHeight * 0.55;

  const renderFeaturedEventCard = (event: EventItem) => {
    const schedule = formatEventSchedule(event);
    return (
      <FeaturedEventCard
        key={`featured-${event.id}`}
        title={event.title}
        image={event.image}
        description={event.description}
        dateLabel={schedule.dateLabel}
        time={schedule.time}
        address={event.address}
        links={event.links}
        isPast={isEventPast(event)}
      />
    );
  };

  const renderEventCard = (event: EventItem, index: number) => {
    const schedule = formatEventSchedule(event);
    return (
      <EventCard
        key={event.id}
        index={index}
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
        isTitleExpanded={expandedTitleEventId === event.id}
        onToggleTitleExpand={() =>
          setExpandedTitleEventId((current) => (current === event.id ? null : event.id))
        }
        isDescriptionExpanded={expandedDescriptionEventId === event.id}
        onToggleDescriptionExpand={() =>
          setExpandedDescriptionEventId((current) =>
            current === event.id ? null : event.id,
          )
        }
        onToggleFavorite={() => toggleFavorite(event.id)}
      />
    );
  };

  return (
    <View style={[styles.screen, { backgroundColor: pageBg }]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        scrollEventThrottle={16}
        onScroll={onScroll}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={ACCENT} />
          </View>
        ) : events.length === 0 ? (
          <View style={[styles.empty, styles.padded, { backgroundColor: cardBg, borderColor: divider, marginTop: insets.top + 80 }]}>
            <MaterialIcons name="event-busy" size={32} color={theme.icon} />
            <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
              {favoritesOnly
                ? 'Aucun favori pour ces filtres. Ajoutez des événements avec le cœur.'
                : 'Aucun événement pour ces filtres.'}
            </ThemedText>
          </View>
        ) : (
          <>
            {showFeatured ? renderFeaturedEventCard(featuredEvent!) : null}
            {listEvents.length > 0 ? (
              <View
                style={[
                  styles.list,
                  !showFeatured && { paddingTop: insets.top + 52 },
                ]}
              >
                {listEvents.map((event, index) => renderEventCard(event, index))}
              </View>
            ) : null}
          </>
        )}

        <View style={styles.listBottomSpacer} />
      </ScrollView>

      <View
        style={[styles.filtersOverlay, { paddingTop: insets.top + 8 }]}
        pointerEvents="box-none"
      >
        {error ? (
          <View style={[styles.banner, { backgroundColor: cardBg, borderColor: divider }]}>
            <MaterialIcons name="error-outline" size={18} color="#E82127" />
            <ThemedText style={[styles.bannerText, { color: theme.text }]}>{error}</ThemedText>
            <Pressable onPress={() => void refetch()}>
              <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : null}

        <EventFloatingFilters
          darkBlur={darkBlur}
          visible={chromeVisible}
          typeFilter={typeFilter}
          favoritesOnly={favoritesOnly}
          onTypeChange={setTypeFilter}
          onFavoritesChange={setFavoritesOnly}
          onReset={resetFilters}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  filtersOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    gap: 8,
  },
  padded: {
    marginHorizontal: 20,
    marginTop: 100,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  retryText: { fontSize: 13, fontWeight: '700' },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 120,
  },
  list: {
    gap: 22,
    paddingTop: 22,
    paddingBottom: 6,
  },
  listBottomSpacer: {
    height: 96,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', maxWidth: 280, },
});
