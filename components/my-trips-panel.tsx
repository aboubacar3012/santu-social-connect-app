import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import {
  FAKE_MY_COMPLETED_TRIPS,
  FAKE_MY_RESERVED_TRIPS,
  type CompletedTrip,
  type ReservedAsPassenger,
} from '@/constants/fake-profile-passenger';
import {
  FAKE_MY_PUBLISHED_TRIPS,
  placesBookedForTrip,
  type MyPublishedTrip,
} from '@/constants/fake-profile-published';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;

function formatPrice(gnf: number) {
  return `${gnf.toLocaleString('fr-FR')} GNF`;
}

function Section({
  title,
  count,
  children,
  surface,
  borderColor,
  muted,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  surface: string;
  borderColor: string;
  muted: string;
}) {
  return (
    <View style={[styles.section, { backgroundColor: surface, borderColor }]}>
      <ThemedText style={[styles.sectionTitle, { color: muted }]}>
        {title}
        {count > 0 ? ` · ${count}` : ''}
      </ThemedText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function PublishedRow({
  trip,
  themeText,
  muted,
  borderSubtle,
  tint,
  onPress,
}: {
  trip: MyPublishedTrip;
  themeText: string;
  muted: string;
  borderSubtle: string;
  tint: string;
  onPress: () => void;
}) {
  const booked = placesBookedForTrip(trip);
  const free = Math.max(0, trip.placesTotal - booked);
  const nRes = trip.bookings.length;
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

function ReservedRow({
  trip,
  themeText,
  muted,
  borderSubtle,
  okColor,
  pendingColor,
  onPress,
}: {
  trip: ReservedAsPassenger;
  themeText: string;
  muted: string;
  borderSubtle: string;
  okColor: string;
  pendingColor: string;
  onPress: () => void;
}) {
  const ok = trip.bookingStatus === 'confirmé';
  const c = ok ? okColor : pendingColor;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: borderSubtle, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <View style={styles.rowMain}>
        <View style={styles.rowTop}>
          <ThemedText style={[styles.route, { color: themeText }]} numberOfLines={1}>
            {trip.from} → {trip.to}
          </ThemedText>
          <View style={[styles.pill, { backgroundColor: `${c}20` }]}>
            <ThemedText style={[styles.pillText, { color: c }]}>{ok ? 'Confirmé' : 'En attente'}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.lineMeta, { color: muted }]} numberOfLines={1}>
          {trip.whenLabel} · {trip.departTime} · {formatPrice(trip.priceGNF)}
        </ThemedText>
        <ThemedText style={[styles.lineSub, { color: muted }]} numberOfLines={1}>
          {trip.seats} place{trip.seats > 1 ? 's' : ''}
        </ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={pendingColor} />
    </Pressable>
  );
}

function CompletedRow({
  trip,
  themeText,
  muted,
  borderSubtle,
  tint,
  onPress,
}: {
  trip: CompletedTrip;
  themeText: string;
  muted: string;
  borderSubtle: string;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { borderColor: borderSubtle, opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <MaterialIcons name="check-circle" size={20} color={tint} style={styles.doneIcon} />
      <View style={styles.rowMain}>
        <ThemedText style={[styles.route, { color: themeText }]} numberOfLines={1}>
          {trip.from} → {trip.to}
        </ThemedText>
        <ThemedText style={[styles.lineMeta, { color: muted }]} numberOfLines={1}>
          {trip.whenLabel} · {trip.departTime} · {formatPrice(trip.priceGNF)}
        </ThemedText>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={muted} />
    </Pressable>
  );
}

/** Mes trajets : listes compactes (détail dans l’écran trajet). */
export default function MyTripsPanel() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const okGreen = isDark ? '#6BCF7F' : '#1B5E20';

  const goTrip = (id: string) => {
    router.push({ pathname: '/trip-view', params: { id } });
  };

  return (
    <>
      <Section
        title="Publiés"
        count={FAKE_MY_PUBLISHED_TRIPS.length}
        surface={surface}
        borderColor={borderSubtle}
        muted={muted}
      >
        {FAKE_MY_PUBLISHED_TRIPS.map((trip) => (
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
      </Section>

      <Section
        title="Réservés"
        count={FAKE_MY_RESERVED_TRIPS.length}
        surface={surface}
        borderColor={borderSubtle}
        muted={muted}
      >
        {FAKE_MY_RESERVED_TRIPS.map((trip) => (
          <ReservedRow
            key={trip.id}
            trip={trip}
            themeText={theme.text}
            muted={muted}
            borderSubtle={borderSubtle}
            okColor={okGreen}
            pendingColor={theme.tint}
            onPress={() => goTrip(trip.id)}
          />
        ))}
      </Section>

      <Section
        title="Effectués"
        count={FAKE_MY_COMPLETED_TRIPS.length}
        surface={surface}
        borderColor={borderSubtle}
        muted={muted}
      >
        {FAKE_MY_COMPLETED_TRIPS.map((trip) => (
          <CompletedRow
            key={`${trip.id}-${trip.whenLabel}`}
            trip={trip}
            themeText={theme.text}
            muted={muted}
            borderSubtle={borderSubtle}
            tint={theme.tint}
            onPress={() => goTrip(trip.id)}
          />
        ))}
      </Section>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    marginBottom: 8,
  },
  sectionBody: {
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
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
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
  pill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    flexShrink: 0,
  },
  pillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  doneIcon: {
    marginTop: 2,
  },
});
