import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import { IconSymbol } from '@/components/shared/icon-symbol';
import { filterTripsBySearch, type Trip } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Couleur d'accent : jaune La Poste */
const BBB_GREEN_LIGHT = '#FFCD00';
const BBB_GREEN_DARK = '#FFCD00';
const PAGE_BG_LIGHT = '#EDEFF2';
const PAGE_BG_DARK = '#0D0D0F';
const CARD_LIGHT = '#FFFFFF';
const CARD_DARK = '#1A1C1E';
const LINE_LIGHT = '#D8DADF';
const LINE_DARK = '#3A3D42';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || '?';
}

function formatPriceGNF(n: number): string {
  return `${n.toLocaleString('fr-FR')} GNF`;
}

export default function SearchResultsScreen() {
  const router = useRouter();
  const { from = '', to = '', places: placesParam } = useLocalSearchParams<{
    from?: string;
    to?: string;
    places?: string;
  }>();

  const placesMin = useMemo(() => {
    if (placesParam == null || placesParam === '') return null;
    const n = Number(placesParam);
    return Number.isFinite(n) ? n : null;
  }, [placesParam]);

  const trips = useMemo(
    () => filterTripsBySearch(from, to, placesMin),
    [from, to, placesMin]
  );

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const pageBg = isDark ? PAGE_BG_DARK : PAGE_BG_LIGHT;
  const bbbGreen = isDark ? BBB_GREEN_DARK : BBB_GREEN_LIGHT;
  const lineColor = isDark ? LINE_DARK : LINE_LIGHT;
  const cardBg = isDark ? CARD_DARK : CARD_LIGHT;

  const routeLabel = `${from.trim()} → ${to.trim()}`;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.hero}>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>{routeLabel}</ThemedText>
        <ThemedText style={[styles.heroMeta, { color: theme.icon }]}>
          {trips.length > 0
            ? `${trips.length} covoiturage${trips.length !== 1 ? 's' : ''} disponible${trips.length !== 1 ? 's' : ''}`
            : 'Aucun départ pour l’instant'}
          {placesMin != null
            ? ` · ${placesMin} passager${placesMin > 1 ? 's' : ''} min.`
            : ''}
        </ThemedText>
      </View>

      {trips.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: cardBg,
              shadowColor: '#000',
            },
          ]}
        >
          <View style={[styles.emptyIconWrap, { backgroundColor: pageBg }]}>
            <IconSymbol name="car.fill" size={28} color={theme.icon} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
            Aucun trajet ne correspond
          </ThemedText>
          <ThemedText style={[styles.emptyHint, { color: theme.icon }]}>
            Modifiez votre recherche (villes, nombre de places) ou revenez plus tard.
          </ThemedText>
          <Pressable
            style={[styles.emptyBtn, { backgroundColor: bbbGreen }]}
            onPress={() => router.back()}
          >
            <ThemedText style={styles.emptyBtnText}>Modifier la recherche</ThemedText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.list}>
          {trips.map((trip) => (
            <TripResultRow
              key={trip.id}
              trip={trip}
              theme={theme}
              cardBg={cardBg}
              pageBg={pageBg}
              lineColor={lineColor}
              bbbGreen={bbbGreen}
              onPress={() => router.push(`/trip-view?id=${trip.id}`)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function TripResultRow({
  trip,
  theme,
  cardBg,
  pageBg,
  lineColor,
  bbbGreen,
  onPress,
}: {
  trip: Trip;
  theme: (typeof Colors)['light'];
  cardBg: string;
  pageBg: string;
  lineColor: string;
  bbbGreen: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          shadowColor: '#000',
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.dateChip, { backgroundColor: pageBg }]}>
          <ThemedText style={[styles.dateChipText, { color: theme.text }]}>
            {trip.whenLabel}
          </ThemedText>
        </View>
        <ThemedText style={[styles.priceTop, { color: bbbGreen }]}>
          {formatPriceGNF(trip.priceGNF)}
        </ThemedText>
      </View>

      <View style={styles.timeAndRoute}>
        <ThemedText style={[styles.departTime, { color: theme.text }]}>
          {trip.departTime}
        </ThemedText>
        <View style={styles.routeBlock}>
          <View style={styles.routeRow}>
            <View style={[styles.dot, { backgroundColor: bbbGreen }]} />
            <ThemedText style={[styles.cityText, { color: theme.text }]} numberOfLines={1}>
              {trip.from}
            </ThemedText>
          </View>
          <View style={styles.connector}>
            <View style={[styles.vertLine, { backgroundColor: lineColor }]} />
          </View>
          <View style={styles.routeRow}>
            <View style={[styles.dot, styles.dotOutline, { borderColor: lineColor }]} />
            <ThemedText style={[styles.cityText, { color: theme.text }]} numberOfLines={1}>
              {trip.to}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.driverBlock, { borderTopColor: lineColor }]}>
        <View style={[styles.avatar, { backgroundColor: pageBg }]}>
          <ThemedText style={[styles.avatarText, { color: theme.text }]}>
            {initials(trip.driverName)}
          </ThemedText>
        </View>
        <View style={styles.driverTextCol}>
          <ThemedText style={[styles.driverName, { color: theme.text }]} numberOfLines={1}>
            {trip.driverName}
          </ThemedText>
          <ThemedText style={[styles.carLine, { color: theme.icon }]} numberOfLines={2}>
            {trip.carLabel} · {trip.seatsLeft} place{trip.seatsLeft > 1 ? 's' : ''} disponible
            {trip.seatsLeft > 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  hero: {
    marginBottom: 8,
    gap: 6,
    paddingTop: 4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  heroMeta: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 14,
    paddingBottom: 8,
  },
  card: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  dateChip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 8,
    flexShrink: 0,
  },
  priceTop: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    textAlign: 'right',
    flexShrink: 0,
    maxWidth: '58%',
    marginTop: 1,
  },
  dateChipText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  timeAndRoute: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    minWidth: 0,
  },
  departTime: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.8,
    minWidth: 58,
    lineHeight: 30,
  },
  routeBlock: {
    flex: 1,
    minWidth: 0,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  connector: {
    marginLeft: 3,
    paddingVertical: 2,
  },
  vertLine: {
    width: 2,
    height: 14,
    marginLeft: 0,
    borderRadius: 1,
  },
  cityText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  driverBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  driverTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  driverName: {
    fontSize: 15,
    fontWeight: '600',
  },
  carLine: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    borderRadius: 12,
    padding: 28,
    alignItems: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 21,
    paddingHorizontal: 8,
  },
  emptyBtn: {
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    minWidth: '100%',
    alignItems: 'center',
  },
  emptyBtnText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 16,
  },
});
