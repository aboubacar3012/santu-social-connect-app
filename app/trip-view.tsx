import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { FAKE_TRIPS } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Numéro fictif pour la démo (Guinée +224) */
const DEMO_PHONE = '+224621000000';

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

function StatBlock({
  value,
  caption,
  themeText,
  themeMuted,
}: {
  value: string;
  caption: string;
  themeText: string;
  themeMuted: string;
}) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color: themeText }]}>{value}</ThemedText>
      <ThemedText style={[styles.statCaption, { color: themeMuted }]}>{caption}</ThemedText>
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
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;

  const trip = useMemo(() => {
    return FAKE_TRIPS.find((t) => t.id === id) ?? FAKE_TRIPS[0];
  }, [id]);

  const handleCall = () => {
    void Linking.openURL(`tel:${DEMO_PHONE}`);
  };

  const priceFormatted = `${trip.priceGNF.toLocaleString('fr-FR')} GNF`;

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <View style={[styles.header, { paddingTop: 8 }]}>
        
        <View style={styles.headerSpacer} />
        <ThemedText style={[styles.headerTitle, { color: muted }]}>Détail du trajet</ThemedText>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.headerBtnPressed]}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Fermer"
        >
          <MaterialIcons name="close" size={22} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 28) + 8 },
        ]}
      >
        {/* Hero — typographie forte type tableau de bord */}
        <View style={styles.hero}>
          <ThemedText style={[styles.heroKicker, { color: muted }]}>PRIX PAR PLACE</ThemedText>
          <ThemedText style={[styles.heroPrice, { color: theme.tint }]}>{priceFormatted}</ThemedText>
          <View
            style={[
              styles.routeCard,
              {
                backgroundColor: surface,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              },
            ]}
          >
            <View style={styles.routeJourneyRow}>
              <View style={styles.routeEndpoint}>
                <ThemedText style={[styles.routeEndpointLabel, { color: muted }]}>Départ</ThemedText>
                <ThemedText
                  style={[styles.routeEndpointCity, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {trip.from}
                </ThemedText>
              </View>

              <View
                style={[
                  styles.routeHub,
                  {
                    backgroundColor: isDark ? '#1C1C1F' : '#F0F1F4',
                    borderColor: isDark ? 'rgba(230,168,0,0.35)' : 'rgba(230,168,0,0.45)',
                  },
                ]}
              >
                <MaterialIcons name="arrow-forward" size={22} color={theme.tint} />
              </View>

              <View style={[styles.routeEndpoint, styles.routeEndpointEnd]}>
                <ThemedText style={[styles.routeEndpointLabel, { color: muted }]}>Arrivée</ThemedText>
                <ThemedText
                  style={[styles.routeEndpointCity, styles.routeEndpointCityEnd, { color: theme.text }]}
                  numberOfLines={2}
                >
                  {trip.to}
                </ThemedText>
              </View>
            </View>
          </View>

          <ThemedText style={[styles.heroMeta, { color: muted }]}>
            {trip.whenLabel} · Départ {trip.departTime}
          </ThemedText>
        </View>

        {/* Stats rapides — scan visuel */}
        <View style={[styles.statsRow, { backgroundColor: surface }]}>
          <StatBlock
            value={trip.durationLabel}
            caption="Durée"
            themeText={theme.text}
            themeMuted={muted}
          />
          <View style={[styles.statDivider, { backgroundColor: isDark ? '#2A2A2E' : '#E5E7EB' }]} />
          <StatBlock
            value={String(trip.seatsLeft)}
            caption={trip.seatsLeft > 1 ? 'Places' : 'Place'}
            themeText={theme.text}
            themeMuted={muted}
          />
          <View style={[styles.statDivider, { backgroundColor: isDark ? '#2A2A2E' : '#E5E7EB' }]} />
          <StatBlock value={trip.distanceLabel} caption="Distance" themeText={theme.text} themeMuted={muted} />
        </View>

        {/* Bloc conducteur */}
        <View style={[styles.surfaceCard, { backgroundColor: surface }]}>
          <ThemedText style={[styles.sectionKicker, { color: muted }]}>CONDUCTEUR</ThemedText>
          <View style={styles.driverRow}>
            <View style={[styles.driverAvatar, { backgroundColor: isDark ? '#1F1F22' : '#F3F4F6' }]}>
              <MaterialIcons name="person" size={28} color={muted} />
            </View>
            <View style={styles.driverText}>
              <ThemedText type="defaultSemiBold" style={[styles.driverName, { color: theme.text }]}>
                {trip.driverName}
              </ThemedText>
              <ThemedText style={[styles.driverCar, { color: muted }]}>{trip.carLabel}</ThemedText>
            </View>
          </View>
        </View>

        {trip.tags.length > 0 ? (
          <View style={[styles.surfaceCard, { backgroundColor: surface }]}>
            <ThemedText style={[styles.sectionKicker, { color: muted }]}>OPTIONS</ThemedText>
            <View style={styles.tagsRow}>
              {trip.tags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    {
                      borderColor: isDark ? '#2E2E32' : '#E5E7EB',
                      backgroundColor: 'transparent',
                    },
                  ]}
                >
                  <ThemedText style={[styles.tagText, { color: theme.text }]}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.primaryCta,
            { backgroundColor: theme.tint, opacity: pressed ? 0.92 : 1 },
          ]}
          onPress={handleCall}
        >
          <MaterialIcons name="phone-in-talk" size={22} color={ON_TINT} />
          <ThemedText style={styles.primaryCtaText}>Contacter le conducteur</ThemedText>
        </Pressable>

        <Pressable onPress={() => router.back()} style={styles.textLinkWrap} hitSlop={8}>
          <ThemedText style={[styles.textLink, { color: muted }]}>Fermer</ThemedText>
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
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  headerBtnPressed: {
    opacity: 0.55,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerSpacer: {
    width: 44,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  hero: {
    marginBottom: 20,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 6,
  },
  heroPrice: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -1.2,
    marginBottom: 22,
    lineHeight: 36,
  },
  routeCard: {
    marginBottom: 14,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  routeJourneyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeEndpoint: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  routeEndpointEnd: {
    alignItems: 'flex-end',
  },
  routeEndpointLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  routeEndpointCity: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.35,
    lineHeight: 24,
  },
  routeEndpointCityEnd: {
    textAlign: 'right',
  },
  routeHub: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexShrink: 0,
  },
  heroMeta: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 8,
    marginBottom: 12,
    alignItems: 'stretch',
  },
  statBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  statCaption: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 4,
  },
  surfaceCard: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 12,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginBottom: 14,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  driverAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverText: {
    flex: 1,
  },
  driverName: {
    fontSize: 17,
    marginBottom: 4,
  },
  driverCar: {
    fontSize: 14,
    lineHeight: 20,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '600',
  },
  primaryCta: {
    marginTop: 8,
    borderRadius: 10,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryCtaText: {
    color: ON_TINT,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  textLinkWrap: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 8,
  },
  textLink: {
    fontSize: 15,
    fontWeight: '600',
  },
});
