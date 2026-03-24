import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
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

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

type MainTab = 'compte' | 'trajets';

function SectionCard({
  children,
  surface,
  borderColor,
  style,
}: {
  children: React.ReactNode;
  surface: string;
  borderColor: string;
  style?: object;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: surface, borderColor }, style]}>{children}</View>
  );
}

function SectionKicker({ children, color }: { children: string; color: string }) {
  return <ThemedText style={[styles.sectionKicker, { color }]}>{children}</ThemedText>;
}

function ProfileTabSwitch({
  active,
  onChange,
  themeText,
  muted,
  trackBg,
  activeBg,
  borderSubtle,
}: {
  active: MainTab;
  onChange: (t: MainTab) => void;
  themeText: string;
  muted: string;
  trackBg: string;
  activeBg: string;
  borderSubtle: string;
}) {
  return (
    <View style={[styles.tabSwitchTrack, { backgroundColor: trackBg, borderColor: borderSubtle }]}>
      <Pressable
        onPress={() => onChange('compte')}
        style={[
          styles.tabSwitchBtn,
          active === 'compte' && [styles.tabSwitchBtnActive, { backgroundColor: activeBg }],
        ]}
      >
        <MaterialIcons
          name="person-outline"
          size={20}
          color={active === 'compte' ? ON_TINT : muted}
        />
        <ThemedText
          style={[
            styles.tabSwitchLabel,
            { color: active === 'compte' ? ON_TINT : muted },
            active === 'compte' && styles.tabSwitchLabelActive,
          ]}
        >
          Compte
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onChange('trajets')}
        style={[
          styles.tabSwitchBtn,
          active === 'trajets' && [styles.tabSwitchBtnActive, { backgroundColor: activeBg }],
        ]}
      >
        <MaterialIcons
          name="route"
          size={20}
          color={active === 'trajets' ? ON_TINT : muted}
        />
        <ThemedText
          style={[
            styles.tabSwitchLabel,
            { color: active === 'trajets' ? ON_TINT : muted },
            active === 'trajets' && styles.tabSwitchLabelActive,
          ]}
        >
          Trajets
        </ThemedText>
      </Pressable>
    </View>
  );
}

function VerifyRow({
  icon,
  title,
  subtitle,
  done,
  themeText,
  muted,
  iconWrapBg,
  tint,
  showDivider,
  borderColor,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  done: boolean;
  themeText: string;
  muted: string;
  iconWrapBg: string;
  tint: string;
  showDivider?: boolean;
  borderColor: string;
}) {
  return (
    <>
      <View style={styles.verifyRow}>
        <View style={[styles.verifyIconWrap, { backgroundColor: iconWrapBg }]}>
          <MaterialIcons name={icon} size={20} color={muted} />
        </View>
        <View style={styles.verifyText}>
          <ThemedText style={[styles.verifyTitle, { color: themeText }]}>{title}</ThemedText>
          <ThemedText style={[styles.verifySubtitle, { color: muted }]}>{subtitle}</ThemedText>
        </View>
        <MaterialIcons
          name={done ? 'check-circle' : 'radio-button-unchecked'}
          size={22}
          color={done ? tint : muted}
        />
      </View>
      {showDivider ? <View style={[styles.rowDivider, { backgroundColor: borderColor }]} /> : null}
    </>
  );
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
        <MaterialIcons name="person-outline" size={20} color={muted} />
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
        <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={28} color={muted} />
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
            <MaterialIcons name="open-in-new" size={18} color={tint} />
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
        <MaterialIcons name="chevron-right" size={22} color={pendingColor} />
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
        <MaterialIcons name="check-circle" size={22} color={tint} style={styles.completedIcon} />
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
        <MaterialIcons name="chevron-right" size={22} color={tint} />
      </View>
    </Pressable>
  );
}

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [mainTab, setMainTab] = useState<MainTab>('compte');
  const [expandedTripId, setExpandedTripId] = useState<string | null>(
    FAKE_MY_PUBLISHED_TRIPS[0]?.id ?? null
  );

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconWrapBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tintSoft = isDark ? 'rgba(230,168,0,0.14)' : 'rgba(230,168,0,0.18)';
  const avatarRing = isDark ? 'rgba(230,168,0,0.4)' : 'rgba(230,168,0,0.5)';
  const innerBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const okGreen = isDark ? '#6BCF7F' : '#1B5E20';
  const pendingAmber = theme.tint;
  const tabTrackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const prefs = ['Discussion modérée', 'Musique OK', 'Pause possible', 'Non-fumeur'];

  return (
    <SafeScrollView screenBackgroundColor={pageBg}>
      <View style={styles.hero}>
        <ThemedText style={[styles.heroKicker, { color: muted }]}>PROFIL</ThemedText>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>
          {mainTab === 'compte' ? 'Mon compte' : 'Mes trajets'}
        </ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: muted }]}>
          {mainTab === 'compte'
            ? 'Identité, vérifications et préférences.'
            : 'Annonces publiées, réservations à venir et trajets effectués.'}
        </ThemedText>
      </View>

      <ProfileTabSwitch
        active={mainTab}
        onChange={setMainTab}
        themeText={theme.text}
        muted={muted}
        trackBg={tabTrackBg}
        activeBg={theme.tint}
        borderSubtle={borderSubtle}
      />

      {mainTab === 'compte' ? (
        <>
          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>IDENTITÉ</SectionKicker>
            </View>
            <View style={styles.identityRow}>
              <View
                style={[
                  styles.avatar,
                  {
                    backgroundColor: isDark ? '#1C1C1F' : '#F0F1F4',
                    borderColor: avatarRing,
                  },
                ]}
              >
                <ThemedText style={[styles.avatarText, { color: theme.tint }]}>AB</ThemedText>
              </View>
              <View style={styles.identityText}>
                <ThemedText style={[styles.name, { color: theme.text }]}>Aboubacar Bah</ThemedText>
                <ThemedText style={[styles.smallMuted, { color: muted }]}>
                  Membre depuis mars 2024
                </ThemedText>
              </View>
            </View>
          </SectionCard>

          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>VÉRIFICATIONS</SectionKicker>
            </View>
            <VerifyRow
              icon="mail"
              title="Adresse e-mail vérifiée"
              subtitle="aboubacar@example.com"
              done
              themeText={theme.text}
              muted={muted}
              iconWrapBg={iconWrapBg}
              tint={theme.tint}
              showDivider
              borderColor={borderSubtle}
            />
            <VerifyRow
              icon="phone"
              title="Numéro de téléphone vérifié"
              subtitle="+224 621 00 00 00"
              done
              themeText={theme.text}
              muted={muted}
              iconWrapBg={iconWrapBg}
              tint={theme.tint}
              showDivider
              borderColor={borderSubtle}
            />
            <VerifyRow
              icon="badge"
              title="Pièce d'identité"
              subtitle="Ajoutez votre pièce pour rassurer les passagers"
              done={false}
              themeText={theme.text}
              muted={muted}
              iconWrapBg={iconWrapBg}
              tint={theme.tint}
              borderColor={borderSubtle}
            />
          </SectionCard>

          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>PRÉFÉRENCES</SectionKicker>
            </View>
            <View style={styles.tagsWrap}>
              {prefs.map((label) => (
                <View
                  key={label}
                  style={[
                    styles.tagPill,
                    {
                      borderColor: borderSubtle,
                      backgroundColor: tintSoft,
                    },
                  ]}
                >
                  <ThemedText style={[styles.tagText, { color: theme.text }]}>{label}</ThemedText>
                </View>
              ))}
            </View>
          </SectionCard>

          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>VÉHICULE PRINCIPAL</SectionKicker>
            </View>
            <View style={styles.carRow}>
              <View
                style={[
                  styles.carIconHub,
                  {
                    backgroundColor: isDark ? '#1C1C1F' : '#F0F1F4',
                    borderColor: isDark ? 'rgba(230,168,0,0.35)' : 'rgba(230,168,0,0.45)',
                  },
                ]}
              >
                <MaterialIcons name="directions-car" size={22} color={theme.tint} />
              </View>
              <View style={styles.carText}>
                <ThemedText style={[styles.carTitle, { color: theme.text }]}>Toyota RAV4 · Gris</ThemedText>
                <ThemedText style={[styles.smallMuted, { color: muted }]}>
                  4 places · Climatisation
                </ThemedText>
              </View>
            </View>
          </SectionCard>

          <Pressable
            style={({ pressed }) => [
              styles.primaryCta,
              { backgroundColor: theme.tint, opacity: pressed ? 0.92 : 1 },
            ]}
          >
            <MaterialIcons name="edit" size={22} color={ON_TINT} />
            <ThemedText style={styles.primaryCtaText}>Modifier mon profil</ThemedText>
          </Pressable>
        </>
      ) : (
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
                  onToggle={() =>
                    setExpandedTripId((id) => (id === trip.id ? null : trip.id))
                  }
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
      )}

      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 6,
    gap: 8,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 360,
  },
  tabSwitchTrack: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
    marginBottom: 18,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 11,
  },
  tabSwitchBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tabSwitchLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tabSwitchLabelActive: {
    fontWeight: '700',
  },
  sectionCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  kickerBlock: {
    marginBottom: 14,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  identityRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  identityText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  smallMuted: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  verifyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  verifySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  carIconHub: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexShrink: 0,
  },
  carText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primaryCta: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryCtaText: {
    color: ON_TINT,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabBarSpacer: {
    height: 88,
  },
  sectionHint: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: -6,
    marginBottom: 14,
  },
  publishedList: {
    gap: 12,
  },
  publishedTripCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: 'hidden',
  },
  publishedTripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 10,
  },
  publishedTripHeaderText: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  publishedRoute: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  publishedMeta: {
    fontSize: 13,
    fontWeight: '500',
  },
  publishedSeats: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  publishedBody: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  bookingsTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.6,
    marginBottom: 2,
  },
  emptyBookings: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    paddingVertical: 8,
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  bookingRowLast: {
    borderBottomWidth: 0,
  },
  bookingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  bookingText: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  bookingName: {
    fontSize: 15,
    fontWeight: '600',
  },
  bookingMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexShrink: 0,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tripDetailBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
  },
  tripDetailBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  passengerTripCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    padding: 14,
    gap: 6,
  },
  passengerTripTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  passengerRoute: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    flex: 1,
    minWidth: 0,
  },
  passengerMeta: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  passengerDriver: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  passengerChevronRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 2,
    marginTop: 4,
  },
  passengerLink: {
    fontSize: 14,
    fontWeight: '700',
  },
  completedTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  completedIcon: {
    marginTop: 2,
  },
  completedTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
});
