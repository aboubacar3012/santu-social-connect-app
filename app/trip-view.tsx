import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/shared/themed-text';
import { FAKE_TRIPS } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Numéro fictif pour la démo (Guinée +224) */
const DEMO_PHONE = '+224621000000';

/** CamelCase lisible : chaque mot commence par une majuscule (ex. « sam. 22 mars » → « Sam. 22 Mars »). */
function toCamelCaseWords(s: string): string {
  return s.replace(/[A-Za-zÀ-ÿ]+(?:['’][A-Za-zÀ-ÿ]+)*/g, (word) => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  });
}

const PALETTE = {
  light: {
    canvas: '#F0EDE8',
    surface: '#FFFFFF',
    surface2: '#FAF8F5',
    ink: '#0F0F12',
    inkMuted: '#6B6570',
    line: 'rgba(15,15,18,0.08)',
    glow: 'rgba(230,168,0,0.12)',
    accentBar: '#E6A800',
  },
  dark: {
    canvas: '#050508',
    surface: '#12141A',
    surface2: '#0A0C10',
    ink: '#F4F2EF',
    inkMuted: '#9A96A3',
    line: 'rgba(255,255,255,0.07)',
    glow: 'rgba(230,168,0,0.18)',
    accentBar: '#E6A800',
  },
} as const;

const ON_TINT = '#111111';

function StatChip({
  icon,
  value,
  caption,
  themeText,
  themeMuted,
  surface,
  line,
  glow,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  value: string;
  caption: string;
  themeText: string;
  themeMuted: string;
  surface: string;
  line: string;
  glow: string;
}) {
  return (
    <View style={[styles.statChip, { backgroundColor: surface, borderColor: line }]}>
      <View style={[styles.statIconWrap, { backgroundColor: glow }]}>
        <MaterialIcons name={icon} size={15} color="#C9A227" />
      </View>
      <ThemedText style={[styles.statChipValue, { color: themeText }]} numberOfLines={1}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statChipCaption, { color: themeMuted }]}>{caption}</ThemedText>
    </View>
  );
}

export default function TripViewModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const p = isDark ? PALETTE.dark : PALETTE.light;

  const heroFade = useRef(new Animated.Value(0)).current;
  const heroSlide = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(heroFade, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(heroSlide, {
        toValue: 0,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [heroFade, heroSlide]);

  const trip = useMemo(() => {
    return FAKE_TRIPS.find((t) => t.id === id) ?? FAKE_TRIPS[0];
  }, [id]);

  const handleCall = () => {
    void Linking.openURL(`tel:${DEMO_PHONE}`);
  };

  const priceFormatted = `${trip.priceGNF.toLocaleString('fr-FR')} GNF`;

  const seatsAvailableLabel = useMemo(() => {
    const n = trip.seatsLeft;
    if (n <= 0) return 'Aucune place disponible';
    if (n === 1) return 'Nombre de places disponibles : 1';
    return `Nombre de places disponibles : ${n}`;
  }, [trip.seatsLeft]);

  const dateLabelCamel = useMemo(() => toCamelCaseWords(trip.whenLabel), [trip.whenLabel]);

  return (
    <View style={[styles.root, { backgroundColor: p.canvas }]}>
    

      <View style={[styles.header, { paddingTop: 8 }]}>
        <View style={{ width: 40 }} />
        <ThemedText style={[styles.headerTitle, { color: p.inkMuted }]}>Détail du trajet</ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.closeFab,
            {
              backgroundColor: p.surface,
              borderColor: p.line,
              opacity: pressed ? 0.88 : 1,
              transform: [{ scale: pressed ? 0.96 : 1 }],
            },
          ]}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
        >
          <MaterialIcons name="close" size={18} color={p.ink} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 20) + 8 },
        ]}
      >
        <Animated.View
          style={{
            opacity: heroFade,
            transform: [{ translateY: heroSlide }],
          }}
        >
          {/* Carte héro — ticket / boarding pass */}
          <View style={[styles.heroCard, { backgroundColor: p.surface, borderColor: p.line }]}>
            <View style={[styles.accentStrip, { backgroundColor: p.accentBar }]} />
            <View style={styles.heroCardInner}>
              <View style={[styles.metaPill, styles.metaPillTop, { backgroundColor: p.surface2, borderColor: p.line }]}>
                <View style={[styles.metaIconBadge, { backgroundColor: isDark ? 'rgba(230,168,0,0.15)' : 'rgba(230,168,0,0.2)' }]}>
                  <MaterialIcons name="calendar-today" size={18} color={theme.tint} />
                </View>
                <View style={styles.metaTextCol}>
                  <Text style={[styles.heroDateTitle, { color: p.ink }]}>{dateLabelCamel}</Text>
                  <Text style={[styles.heroDateSub, { color: p.inkMuted }]}>
                    Départ {trip.departTime}
                  </Text>
                </View>
              </View>

              <ThemedText style={[styles.heroKicker, { color: p.inkMuted }]}>PRIX PAR PLACE</ThemedText>
              <ThemedText style={[styles.heroPrice, { color: theme.tint }]}>{priceFormatted}</ThemedText>

              <View style={[styles.dividerSoft, { backgroundColor: p.line }]} />

              {/* Parcours vertical : plus fluide qu’un bandeau horizontal */}
              <View style={styles.journeyColumn}>
                <View style={styles.journeyBlock}>
                  <ThemedText style={[styles.journeyLabel, { color: p.inkMuted }]}>Départ</ThemedText>
                  <ThemedText style={[styles.journeyCity, { color: p.ink }]} numberOfLines={3}>
                    {trip.from}
                  </ThemedText>
                </View>

                <View style={styles.connectorColumn}>
                  <View style={[styles.connectorDot, { borderColor: theme.tint, backgroundColor: p.surface2 }]} />
                  <View style={[styles.connectorLine, { backgroundColor: p.line }]} />
                  <View
                    style={[
                      styles.connectorPlane,
                      { backgroundColor: p.surface2, borderColor: p.line },
                    ]}
                  >
                    <MaterialIcons name="arrow-downward" size={14} color={theme.tint} />
                  </View>
                  <View style={[styles.connectorLine, { backgroundColor: p.line }]} />
                  <View style={[styles.connectorDot, { borderColor: theme.tint, backgroundColor: p.surface2 }]} />
                </View>

                <View style={styles.journeyBlock}>
                  <ThemedText style={[styles.journeyLabel, { color: p.inkMuted }]}>Arrivée</ThemedText>
                  <ThemedText style={[styles.journeyCity, { color: p.ink }]} numberOfLines={3}>
                    {trip.to}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.seatsRow, { backgroundColor: p.surface2, borderColor: p.line }]}>
                <MaterialIcons name="event-seat" size={14} color={theme.tint} />
                <ThemedText style={[styles.seatsRowText, { color: p.ink }]}>{seatsAvailableLabel}</ThemedText>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Stats — durée & distance */}
        <View style={styles.statsGrid}>
          <StatChip
            icon="timer"
            value={trip.durationLabel}
            caption="Durée"
            themeText={p.ink}
            themeMuted={p.inkMuted}
            surface={p.surface}
            line={p.line}
            glow={p.glow}
          />
          <StatChip
            icon="straighten"
            value={trip.distanceLabel}
            caption="Distance"
            themeText={p.ink}
            themeMuted={p.inkMuted}
            surface={p.surface}
            line={p.line}
            glow={p.glow}
          />
        </View>

        {/* Conducteur — carte avec filet d’accent */}
        <View style={[styles.driverCard, { backgroundColor: p.surface, borderColor: p.line }]}>
          <View style={[styles.driverAccent, { backgroundColor: theme.tint }]} />
          <View style={styles.driverInner}>
            <ThemedText style={[styles.sectionKicker, { color: p.inkMuted }]}>CONDUCTEUR</ThemedText>
            <View style={styles.driverRow}>
              <View style={[styles.driverAvatar, { backgroundColor: p.surface2, borderColor: p.line }]}>
                <MaterialIcons name="person" size={22} color={p.inkMuted} />
              </View>
              <View style={styles.driverText}>
                <ThemedText type="defaultSemiBold" style={[styles.driverName, { color: p.ink }]}>
                  {trip.driverName}
                </ThemedText>
                <ThemedText style={[styles.driverCar, { color: p.inkMuted }]}>{trip.carLabel}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.primaryCta,
            {
              backgroundColor: theme.tint,
              opacity: pressed ? 0.9 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
          onPress={handleCall}
        >
          <MaterialIcons name="phone-in-talk" size={18} color={ON_TINT} />
          <ThemedText style={styles.primaryCtaText}>Contacter le conducteur</ThemedText>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.textLinkWrap} hitSlop={8}>
          <ThemedText style={[styles.textLink, { color: p.inkMuted }]}>Fermer</ThemedText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingBottom: 2,
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  closeFab: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 2,
  },
  heroCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 18,
    elevation: 6,
  },
  accentStrip: {
    height: 3,
    width: '100%',
  },
  heroCardInner: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: 4,
  },
  heroPrice: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 32,
    marginBottom: 10,
  },
  dividerSoft: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  journeyColumn: {
    gap: 0,
  },
  journeyBlock: {
    marginBottom: 2,
  },
  journeyLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  journeyCity: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 20,
  },
  connectorColumn: {
    alignItems: 'center',
    marginVertical: 4,
  },
  connectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
  },
  connectorLine: {
    width: 2,
    height: 10,
    borderRadius: 1,
  },
  connectorPlane: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: 1,
  },
  seatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  seatsRowText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: -0.1,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  metaIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  metaPillTop: {
    marginTop: 0,
    marginBottom: 12,
  },
  heroDateTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  heroDateSub: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.05,
    lineHeight: 17,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  statChip: {
    flex: 1,
    minWidth: 0,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  statChipValue: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.35,
    textAlign: 'center',
  },
  statChipCaption: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.9,
    marginTop: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  driverCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  driverAccent: {
    width: 3,
  },
  driverInner: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  sectionKicker: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 8,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  driverText: {
    flex: 1,
  },
  driverName: {
    fontSize: 15,
    marginBottom: 2,
    letterSpacing: -0.25,
  },
  driverCar: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  primaryCta: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryCtaText: {
    color: ON_TINT,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  textLinkWrap: {
    marginTop: 10,
    alignItems: 'center',
    paddingVertical: 6,
  },
  textLink: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});
