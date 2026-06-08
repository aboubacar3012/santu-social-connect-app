import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { EventCard } from '@/components/events/event-card';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import {
  EVENT_TYPE_LABELS,
  formatEventDate,
  MOCK_EVENTS,
  type EventItem,
  type EventType,
} from '@/constants/mock-events';
import { Colors } from '@/constants/theme';
import { useEventFavorites } from '@/contexts/event-favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';
const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

type DateFilter = 'upcoming' | 'this_week' | 'this_month' | 'past';
type DateSort = 'soonest' | 'recent';
type SelectKey = 'type' | 'date' | null;

type SelectOption<T extends string> = { value: T; label: string };

const TYPE_OPTIONS: SelectOption<EventType | 'All'>[] = [
  { value: 'All', label: 'Tous les types' },
  { value: 'Afterwork', label: 'Afterwork' },
  { value: 'Conference', label: 'Conférence' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Workshop', label: 'Atelier' },
  { value: 'Concert', label: 'Concert' },
  { value: 'Exposition', label: 'Exposition' },
  { value: 'Sortie', label: 'Sortie' },
  { value: 'Autre', label: 'Autre' },
];

const DATE_OPTIONS: SelectOption<DateFilter>[] = [
  { value: 'upcoming', label: 'À venir' },
  { value: 'this_week', label: 'Cette semaine' },
  { value: 'this_month', label: 'Ce mois' },
  { value: 'past', label: 'Passés' },
];

type FilterSelectProps<T extends string> = {
  label: string;
  placeholder: string;
  value: T;
  defaultValue: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  textColor: string;
  mutedColor: string;
  surfaceColor: string;
  borderColor: string;
  /** Affiche le libellé sélectionné même pour la valeur par défaut */
  showSelectedWhenDefault?: boolean;
};

function FilterSelect<T extends string>({
  label,
  placeholder,
  value,
  defaultValue,
  options,
  onChange,
  open,
  onOpen,
  onClose,
  textColor,
  mutedColor,
  surfaceColor,
  borderColor,
  showSelectedWhenDefault = false,
}: FilterSelectProps<T>) {
  const selected = options.find((o) => o.value === value);
  const isDefault = value === defaultValue;
  const showLabel = showSelectedWhenDefault || !isDefault;
  const triggerLabel = showLabel ? (selected?.label ?? placeholder) : placeholder;

  return (
    <>
      <View style={styles.selectField}>
        <Pressable
          onPress={onOpen}
          style={[styles.selectTrigger, { backgroundColor: surfaceColor, borderColor }]}
        >
          <ThemedText
            style={[styles.selectValue, { color: showLabel ? textColor : mutedColor }]}
            numberOfLines={1}
          >
            {triggerLabel}
          </ThemedText>
          <MaterialIcons name="keyboard-arrow-down" size={18} color={mutedColor} />
        </Pressable>
      </View>

      <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
        <Pressable style={styles.selectOverlay} onPress={onClose}>
          <Pressable
            style={[styles.selectSheet, { backgroundColor: surfaceColor, borderColor }]}
            onPress={(e) => e.stopPropagation()}
          >
            <ThemedText style={[styles.selectSheetTitle, { color: textColor }]}>{label}</ThemedText>
            {options.map((opt) => {
              const active = opt.value === value;
              return (
                <Pressable
                  key={opt.value}
                  onPress={() => {
                    onChange(opt.value);
                    onClose();
                  }}
                  style={[
                    styles.selectOption,
                    active && { backgroundColor: `${ACCENT}14` },
                    { borderBottomColor: borderColor },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.selectOptionText,
                      { color: active ? ACCENT : textColor, fontWeight: active ? '700' : '500' },
                    ]}
                  >
                    {opt.label}
                  </ThemedText>
                  {active ? <MaterialIcons name="check" size={20} color={ACCENT} /> : null}
                </Pressable>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function isThisWeek(ts: number, now: Date): boolean {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  const day = start.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + diffToMonday);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);
  return ts >= start.getTime() && ts < end.getTime();
}

function isThisMonth(ts: number, now: Date): boolean {
  return (
    new Date(ts).getFullYear() === now.getFullYear() &&
    new Date(ts).getMonth() === now.getMonth()
  );
}

function matchesDateFilter(event: EventItem, filter: DateFilter, now: Date): boolean {
  const ts = event.startsAt;
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  switch (filter) {
    case 'upcoming':
      return ts >= todayStart.getTime();
    case 'this_week':
      return isThisWeek(ts, now);
    case 'this_month':
      return isThisMonth(ts, now);
    case 'past':
      return ts < todayStart.getTime();
  }
}

export default function EventsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { isFavorite, toggleFavorite } = useEventFavorites();

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [typeFilter, setTypeFilter] = useState<EventType | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('upcoming');
  const dateSort: DateSort = 'soonest';
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [openSelect, setOpenSelect] = useState<SelectKey>(null);

  const events = useMemo(() => {
    const now = new Date();
    let list = MOCK_EVENTS.filter((e) => {
      if (typeFilter !== 'All' && e.type !== typeFilter) return false;
      if (!matchesDateFilter(e, dateFilter, now)) return false;
      if (favoritesOnly && !isFavorite(e.id)) return false;
      return true;
    });

    list.sort((a, b) =>
      dateSort === 'soonest' ? a.startsAt - b.startsAt : b.startsAt - a.startsAt
    );
    return list;
  }, [typeFilter, dateFilter, dateSort, favoritesOnly, isFavorite]);

  const hasActiveFilters =
    typeFilter !== 'All' || dateFilter !== 'upcoming' || favoritesOnly;

  const resetFilters = () => {
    setTypeFilter('All');
    setDateFilter('upcoming');
    setFavoritesOnly(false);
  };

  return (
    <SafeScrollView screenBackgroundColor={pageBg}>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Événements</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Retrouvez les événements pour vous connecter avec d&apos;autres entrepreneurs
        </ThemedText>
      </View>

      <View style={styles.filtersRow}>
        <Pressable
          onPress={() => setFavoritesOnly((v) => !v)}
          style={[
            styles.filterIconBtn,
            {
              backgroundColor: favoritesOnly ? `${ACCENT}18` : cardBg,
              borderColor: favoritesOnly ? ACCENT : divider,
            },
          ]}
        >
          <MaterialIcons
            name={favoritesOnly ? 'favorite' : 'favorite-border'}
            size={20}
            color={ACCENT}
          />
        </Pressable>
        <FilterSelect
          label="Date"
          placeholder="À venir"
          value={dateFilter}
          defaultValue="upcoming"
          options={DATE_OPTIONS}
          onChange={setDateFilter}
          open={openSelect === 'date'}
          onOpen={() => setOpenSelect('date')}
          onClose={() => setOpenSelect(null)}
          textColor={theme.text}
          mutedColor={theme.icon}
          surfaceColor={cardBg}
          borderColor={divider}
          showSelectedWhenDefault
        />
        <FilterSelect
          label="Type d'événement"
          placeholder="Type"
          value={typeFilter}
          defaultValue="All"
          options={TYPE_OPTIONS}
          onChange={setTypeFilter}
          open={openSelect === 'type'}
          onOpen={() => setOpenSelect('type')}
          onClose={() => setOpenSelect(null)}
          textColor={theme.text}
          mutedColor={theme.icon}
          surfaceColor={cardBg}
          borderColor={divider}
        />


        {hasActiveFilters ? (
          <Pressable
            onPress={resetFilters}
            hitSlop={8}
            style={[styles.filterIconBtn, { backgroundColor: cardBg, borderColor: divider }]}
          >
            <MaterialIcons name="refresh" size={20} color={ACCENT} />
          </Pressable>
        ) : null}
      </View>

      <ThemedText style={[styles.resultCount, { color: theme.icon }]}>
        {events.length} événement{events.length > 1 ? 's' : ''}
      </ThemedText>

      <View style={styles.list}>
        {events.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: cardBg, borderColor: divider }]}>
            <MaterialIcons name="event-busy" size={32} color={theme.icon} />
            <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
              {favoritesOnly
                ? 'Aucun favori pour ces filtres. Ajoutez des événements avec le cœur.'
                : 'Aucun événement pour ces filtres.'}
            </ThemedText>
          </View>
        ) : (
          events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              typeLabel={EVENT_TYPE_LABELS[event.type]}
              image={event.image}
              description={event.description}
              dateLabel={formatEventDate(event.date)}
              time={event.time}
              address={event.address}
              links={event.links}
              isFavorite={isFavorite(event.id)}
              isPast={event.startsAt < new Date().setHours(0, 0, 0, 0)}
              onToggleFavorite={() => toggleFavorite(event.id)}
              onPress={() => router.push(`/event/${event.id}`)}
            />
          ))
        )}
      </View>

      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 2, gap: 4 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, maxWidth: 320 },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  selectField: { flex: 1 },
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    height: 40,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  selectValue: { flex: 1, fontSize: 13, fontWeight: '600' },
  filterIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 32,
  },
  selectSheet: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    maxHeight: '70%',
  },
  selectSheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  selectOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  selectOptionText: { fontSize: 15 },
  resultCount: { fontSize: 12, fontWeight: '600', marginBottom: 2, letterSpacing: 0.2 },
  list: { gap: 12 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', maxWidth: 280 },
  tabBarSpacer: { height: 96 },
});
