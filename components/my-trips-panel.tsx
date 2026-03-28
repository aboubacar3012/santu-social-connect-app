import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
  type TripBooking,
} from '@/constants/fake-profile-published';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;

function SectionCard({
  children,
  surface,
  borderColor,
}: {
  children: React.ReactNode;
  surface: string;
  borderColor: string;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: surface, borderColor }]}>{children}</View>
  );
}

function SectionKicker({ children, color }: { children: string; color: string }) {
  return <ThemedText style={[styles.sectionKicker, { color }]}>{children}</ThemedText>;
}

function BookingRow({
  booking,
  themeText,
  muted,
  okColor,
  pendingColor,
  isLast,
}: {
  booking: TripBooking;
  themeText: string;
  muted: string;
  okColor: string;
  pendingColor: string;
  isLast?: boolean;
}) {
  const isOk = booking.status === 'confirmé';
  return (
    <View style={[styles.bookingRow, isLast && styles.bookingRowLast]}>
      <View style={styles.bookingLeft}>
        <MaterialIcons name="person-outline" size={16} color={muted} />
        <View style={styles.bookingText}>
          <ThemedText style={[styles.bookingName, { color: themeText }]} numberOfLines={1}>
            {booking.passengerName}
          </ThemedText>
          <ThemedText style={[styles.bookingMeta, { color: muted }]}>
            {booking.seats} place{booking.seats > 1 ? 's' : ''}
          </ThemedText>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: isOk ? `${okColor}18` : `${pendingColor}22` },
        ]}
      >
        <ThemedText style={[styles.statusBadgeText, { color: isOk ? okColor : pendingColor }]}>
          {booking.status === 'confirmé' ? 'Confirmé' : 'En attente'}
        </ThemedText>
      </View>
    </View>
  );
}

function PublishedTripAccordion({
  trip,
  expanded,
  onToggle,
  themeText,
  muted,
  borderSubtle,
  innerBg,
  tint,
  okColor,
  pendingColor,
  onOpenTrip,
}: {
  trip: MyPublishedTrip;
  expanded: boolean;
  onToggle: () => void;
  themeText: string;
  muted: string;
  borderSubtle: string;
  innerBg: string;
  tint: string;
  okColor: string;
  pendingColor: string;
  onOpenTrip: () => void;
}) {
  const booked = placesBookedForTrip(trip);
  const free = Math.max(0, trip.placesTotal - booked);
  const seatsHint =
    free === 0
      ? 'Complet'
      : `${free} place${free > 1 ? 's' : ''} libre${free > 1 ? 's' : ''}`;

  return (
    <View style={[styles.publishedTripCard, { borderColor: borderSubtle }]}>
      <Pressable onPress={onToggle} style={styles.publishedTripHeader}>
        <View style={styles.publishedTripHeaderText}>
          <ThemedText style={[styles.publishedRoute, { color: themeText }]} numberOfLines={1}>
            {trip.from} → {trip.to}
          </ThemedText>
          <ThemedText style={[styles.publishedMeta, { color: muted }]}>
            {trip.whenLabel} · {trip.departTime} · {trip.priceGNF.toLocaleString('fr-FR')} GNF
          </ThemedText>
          <ThemedText style={[styles.publishedSeats, { color: muted }]}>
            {booked}/{trip.placesTotal} places réservées · {seatsHint}
          </ThemedText>
        </View>
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={22} color={muted} />
      </Pressable>

      {expanded ? (
        <View style={[styles.publishedBody, { backgroundColor: innerBg, borderColor: borderSubtle }]}>
          <ThemedText style={[styles.bookingsTitle, { color: muted }]}>RÉSERVATIONS</ThemedText>
          {trip.bookings.length === 0 ? (
            <ThemedText style={[styles.emptyBookings, { color: muted }]}>
              Aucune réservation pour le moment.
            </ThemedText>
          ) : (
            trip.bookings.map((b, i) => (
              <BookingRow
                key={b.id}
                booking={b}
                themeText={themeText}
                muted={muted}
                okColor={okColor}
                pendingColor={pendingColor}
                isLast={i === trip.bookings.length - 1}
              />
            ))
          )}
          <Pressable
            onPress={onOpenTrip}
            style={({ pressed }) => [styles.tripDetailBtn, { opacity: pressed ? 0.85 : 1 }]}
          >
            <ThemedText style={[styles.tripDetailBtnText, { color: tint }]}>Voir l’annonce</ThemedText>
            <MaterialIcons name="open-in-new" size={15} color={tint} />
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function ReservedTripCard({
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
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.passengerTripCard,
        { borderColor: borderSubtle, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.passengerTripTop}>
        <ThemedText style={[styles.passengerRoute, { color: themeText }]} numberOfLines={1}>
          {trip.from} → {trip.to}
        </ThemedText>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: ok ? `${okColor}18` : `${pendingColor}22` },
          ]}
        >
          <ThemedText style={[styles.statusBadgeText, { color: ok ? okColor : pendingColor }]}>
            {ok ? 'Confirmé' : 'En attente'}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.passengerMeta, { color: muted }]}>
        {trip.whenLabel} · {trip.departTime} · {trip.priceGNF.toLocaleString('fr-FR')} GNF
      </ThemedText>
      <ThemedText style={[styles.passengerDriver, { color: muted }]}>
        Conducteur : {trip.driverName} · {trip.seats} place{trip.seats > 1 ? 's' : ''}
      </ThemedText>
      <View style={styles.passengerChevronRow}>
        <ThemedText style={[styles.passengerLink, { color: pendingColor }]}>Détails</ThemedText>
        <MaterialIcons name="chevron-right" size={18} color={pendingColor} />
      </View>
    </Pressable>
  );
}

function CompletedTripCard({
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
        styles.passengerTripCard,
        { borderColor: borderSubtle, opacity: pressed ? 0.92 : 1 },
      ]}
    >
      <View style={styles.completedTop}>
        <MaterialIcons name="check-circle" size={18} color={tint} style={styles.completedIcon} />
        <View style={styles.completedTextWrap}>
          <ThemedText style={[styles.passengerRoute, { color: themeText }]} numberOfLines={1}>
            {trip.from} → {trip.to}
          </ThemedText>
          <ThemedText style={[styles.passengerMeta, { color: muted }]}>
            {trip.whenLabel} · {trip.departTime}
          </ThemedText>
          <ThemedText style={[styles.passengerDriver, { color: muted }]}>
            {trip.driverName} · {trip.seats} place{trip.seats > 1 ? 's' : ''} ·{' '}
            {trip.priceGNF.toLocaleString('fr-FR')} GNF
          </ThemedText>
        </View>
      </View>
      <View style={styles.passengerChevronRow}>
        <ThemedText style={[styles.passengerLink, { color: tint }]}>Voir le trajet</ThemedText>
        <MaterialIcons name="chevron-right" size={18} color={tint} />
      </View>
    </Pressable>
  );
}

/** Liste « Mes trajets » (publiés, réservés, effectués) — utilisée sous l’onglet Publier. */
export default function MyTripsPanel() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const innerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const okGreen = isDark ? '#6BCF7F' : '#1B5E20';
  const pendingAmber = theme.tint;

  const [expandedTripId, setExpandedTripId] = useState<string | null>(
    FAKE_MY_PUBLISHED_TRIPS[0]?.id ?? null
  );

  return (
    <>
      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PUBLIÉS</SectionKicker>
        </View>
        <ThemedText style={[styles.sectionHint, { color: muted }]}>
          Vos annonces et les réservations des passagers.
        </ThemedText>
        <View style={styles.publishedList}>
          {FAKE_MY_PUBLISHED_TRIPS.map((trip) => (
            <PublishedTripAccordion
              key={trip.id}
              trip={trip}
              expanded={expandedTripId === trip.id}
              onToggle={() => setExpandedTripId((id) => (id === trip.id ? null : trip.id))}
              themeText={theme.text}
              muted={muted}
              borderSubtle={borderSubtle}
              innerBg={innerBg}
              tint={theme.tint}
              okColor={okGreen}
              pendingColor={pendingAmber}
              onOpenTrip={() => router.push({ pathname: '/trip-view', params: { id: trip.id } })}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>RÉSERVÉS</SectionKicker>
        </View>
        <ThemedText style={[styles.sectionHint, { color: muted }]}>
          Trajets à venir dont vous êtes passager.
        </ThemedText>
        <View style={styles.publishedList}>
          {FAKE_MY_RESERVED_TRIPS.map((trip) => (
            <ReservedTripCard
              key={trip.id}
              trip={trip}
              themeText={theme.text}
              muted={muted}
              borderSubtle={borderSubtle}
              okColor={okGreen}
              pendingColor={pendingAmber}
              onPress={() => router.push({ pathname: '/trip-view', params: { id: trip.id } })}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>EFFECTUÉS</SectionKicker>
        </View>
        <ThemedText style={[styles.sectionHint, { color: muted }]}>
          Historique de vos trajets en tant que passager.
        </ThemedText>
        <View style={styles.publishedList}>
          {FAKE_MY_COMPLETED_TRIPS.map((trip) => (
            <CompletedTripCard
              key={`${trip.id}-${trip.whenLabel}`}
              trip={trip}
              themeText={theme.text}
              muted={muted}
              borderSubtle={borderSubtle}
              tint={theme.tint}
              onPress={() => router.push({ pathname: '/trip-view', params: { id: trip.id } })}
            />
          ))}
        </View>
      </SectionCard>
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  kickerBlock: {
    marginBottom: 8,
  },
  sectionKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  sectionHint: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginTop: -6,
    marginBottom: 10,
  },
  publishedList: {
    gap: 8,
  },
  publishedTripCard: {
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
  },
  publishedTripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 6,
  },
  publishedTripHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  publishedRoute: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  publishedMeta: {
    fontSize: 11,
    fontWeight: '500',
  },
  publishedSeats: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  publishedBody: {
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  bookingsTitle: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  emptyBookings: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    paddingVertical: 5,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  bookingRowLast: {
    borderBottomWidth: 0,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  bookingText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bookingName: {
    fontSize: 13,
    fontWeight: '600',
  },
  bookingMeta: {
    fontSize: 10,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tripDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingTop: 5,
  },
  tripDetailBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  passengerTripCard: {
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: 10,
    gap: 3,
  },
  passengerTripTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  passengerRoute: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    minWidth: 0,
  },
  passengerMeta: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  passengerDriver: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  passengerChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: 1,
  },
  passengerLink: {
    fontSize: 12,
    fontWeight: '700',
  },
  completedTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  completedIcon: {
    marginTop: 1,
  },
  completedTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
});
