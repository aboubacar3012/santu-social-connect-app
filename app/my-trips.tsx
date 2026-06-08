import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { mapApiTripsToMyPublishedTrips } from '@/libs/trip';
import { listPublishedTripsApi } from '@/services/trip-list.service';
import type { MyPublishedTripVm } from '@/types/trip';

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;

const TABS = [
  { key: 'published', label: 'Mes trajets' },
  { key: 'reservations', label: 'Mes réservations' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

function formatPrice(gnf: number) {
  return `${gnf.toLocaleString('fr-FR')} GNF`;
}

function PublishedRow({
  trip,
  themeText,
  muted,
  borderSubtle,
  tint,
  onPress,
}: {
  trip: MyPublishedTripVm;
  themeText: string;
  muted: string;
  borderSubtle: string;
  tint: string;
  onPress: () => void;
}) {
  const booked = trip.placesBooked;
  const free = Math.max(0, trip.placesTotal - booked);
  const nRes = booked;
  const sub =
    nRes === 0
      ? `${booked}/${trip.placesTotal} places`
      : `${booked}/${trip.placesTotal} places · ${nRes} réservation${nRes > 1 ? 's' : ''}`;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: borderSubtle, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.rowMain}>
        <ThemedText style={[styles.route, { color: themeText }]} numberOfLines={1}>
          {trip.from} → {trip.to}
        </ThemedText>
        <ThemedText style={[styles.lineMeta, { color: muted }]} numberOfLines={1}>
          {trip.whenLabel} · {trip.departTime} · {formatPrice(trip.priceGNF)}
        </ThemedText>
        <ThemedText style={[styles.lineSub, { color: muted }]} numberOfLines={1}>
          {sub}
          {free === 0 ? ' · Complet' : ''}
        </ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={tint} />
    </Pressable>
  );
}

/**
 * Mes trajets — 2 onglets : trajets publiés, mes réservations (à venir + historique via API).
 */
export default function MyTripsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const tabLine = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)';
  const { user } = useAuth();
  const [tab, setTab] = useState<TabKey>('published');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishedTrips, setPublishedTrips] = useState<MyPublishedTripVm[]>([]);

  const goTrip = (id: string) => {
    router.push({ pathname: '/trip-view', params: { id } });
  };

  const loadTrips = useCallback(async () => {
    if (!user?.id) {
      setPublishedTrips([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { trips } = await listPublishedTripsApi();
      setPublishedTrips(mapApiTripsToMyPublishedTrips(trips, user.id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Chargement des trajets impossible.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      void loadTrips();
    }, [loadTrips]),
  );

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      style={[styles.scrollRoot, { backgroundColor: pageBg }]}
      contentContainerStyle={styles.scrollViewContent}
    >
      <View style={styles.tabBarWrap}>
        <View style={styles.tabRow}>
          {TABS.map(({ key, label }) => {
            const active = tab === key;
            return (
              <Pressable
                key={key}
                onPress={() => setTab(key)}
                style={({ pressed }) => [
                  styles.tabPress,
                  {
                    borderBottomColor: active ? theme.tint : 'transparent',
                    opacity: pressed ? 0.75 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tabLabel,
                    { color: active ? theme.text : muted },
                    active && styles.tabLabelActive,
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[styles.tabBarLine, { backgroundColor: tabLine }]} />
      </View>

      <View style={[styles.panel, { backgroundColor: surface, borderColor: borderSubtle }]}>
        {tab === 'published' && (
          <>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={theme.tint} />
                <ThemedText style={[styles.emptyText, { color: muted }]}>Chargement…</ThemedText>
              </View>
            ) : null}
            {!loading && error ? (
              <ThemedText style={[styles.emptyText, { color: muted }]}>{error}</ThemedText>
            ) : null}
            {!loading && !error && publishedTrips.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: muted }]}>
                Aucun trajet publié pour le moment.
              </ThemedText>
            ) : null}
            {!loading &&
              !error &&
              publishedTrips.map((trip) => (
                <PublishedRow
                  key={trip.id}
                  trip={trip}
                  themeText={theme.text}
                  muted={muted}
                  borderSubtle={borderSubtle}
                  tint={theme.tint}
                  onPress={() => goTrip(trip.id)}
                />
              ))}
          </>
        )}

        {tab === 'reservations' && (
          <ThemedText style={[styles.emptyText, { color: muted }]}>
            Tes réservations à venir et ton historique de trajets réservés s’afficheront ici (bientôt
            côté API).
          </ThemedText>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollRoot: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  tabBarWrap: {
    marginHorizontal: -20,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
  },
  tabPress: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
  },
  tabBarLine: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  tabLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },
  panel: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 8,
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  route: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    minWidth: 0,
  },
  lineMeta: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  lineSub: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
});
