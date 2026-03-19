import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { FAKE_TRIPS } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Jaune La Poste française */
const LBC_ORANGE = '#FFCD00';
const PAGE_BG_LIGHT = '#E8EAED';
const PAGE_BG_DARK = '#121212';
const CARD_LIGHT = '#FFFFFF';
const CARD_DARK = '#1E1E1E';
const ROW_BORDER_LIGHT = '#E4E6EB';
const ROW_BORDER_DARK = '#333';

/** Numéro fictif pour la démo (Guinée +224) */
const DEMO_PHONE = '+224621000000';

function DetailRow({
  label,
  value,
  borderColor,
  themeText,
  themeMuted,
}: {
  label: string;
  value: string;
  borderColor: string;
  themeText: string;
  themeMuted: string;
}) {
  return (
    <View style={[styles.detailRow, { borderBottomColor: borderColor }]}>
      <ThemedText style={[styles.detailLabel, { color: themeMuted }]}>{label}</ThemedText>
      <ThemedText style={[styles.detailValue, { color: themeText }]} numberOfLines={2}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function TripViewModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const pageBg = isDark ? PAGE_BG_DARK : PAGE_BG_LIGHT;
  const cardBg = isDark ? CARD_DARK : CARD_LIGHT;
  const rowBorder = isDark ? ROW_BORDER_DARK : ROW_BORDER_LIGHT;

  const trip = useMemo(() => {
    return FAKE_TRIPS.find((t) => t.id === id) ?? FAKE_TRIPS[0];
  }, [id]);

  const handleCall = () => {
    void Linking.openURL(`tel:${DEMO_PHONE}`);
  };

  return (
    <SafeScrollView screenBackgroundColor={pageBg}>
      <View style={[styles.sheet, { backgroundColor: cardBg }]}>
        <ThemedText style={styles.priceLbc}>
          {trip.priceGNF.toLocaleString('fr-FR')} GNF
        </ThemedText>

        <ThemedText style={[styles.titleLbc, { color: theme.text }]}>
          {trip.from} → {trip.to}
        </ThemedText>

        <ThemedText style={[styles.metaLbc, { color: theme.icon }]}>
          Publié · {trip.whenLabel} · Départ {trip.departTime}
        </ThemedText>

        <View style={[styles.sectionRule, { backgroundColor: rowBorder }]} />

        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Critères</ThemedText>

        <DetailRow
          label="Trajet"
          value={`${trip.from} → ${trip.to}`}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />
        <DetailRow
          label="Date & heure"
          value={`${trip.whenLabel}, ${trip.departTime}`}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />
        <DetailRow
          label="Durée estimée"
          value={trip.durationLabel}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />
        <DetailRow
          label="Distance"
          value={trip.distanceLabel}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />
        <DetailRow
          label="Places restantes"
          value={`${trip.seatsLeft} place${trip.seatsLeft > 1 ? 's' : ''}`}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />

        <View style={[styles.sectionRule, { backgroundColor: rowBorder, marginTop: 4 }]} />

        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Conducteur & véhicule</ThemedText>

        <DetailRow
          label="Conducteur"
          value={trip.driverName}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />
        <DetailRow
          label="Véhicule"
          value={trip.carLabel}
          borderColor={rowBorder}
          themeText={theme.text}
          themeMuted={theme.icon}
        />

        {trip.tags.length > 0 && (
          <>
            <View style={[styles.sectionRule, { backgroundColor: rowBorder, marginTop: 4 }]} />
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Plus</ThemedText>
            <View style={styles.tagsWrap}>
              {trip.tags.map((tag) => (
                <View
                  key={tag}
                  style={[styles.tagLbc, { backgroundColor: isDark ? '#2C2C2C' : '#F0F2F5' }]}
                >
                  <ThemedText style={[styles.tagLbcText, { color: theme.text }]}>{tag}</ThemedText>
                </View>
              ))}
            </View>
          </>
        )}
      </View>

      <Pressable style={styles.callButton} onPress={handleCall}>
        <MaterialIcons name="phone" size={20} color="#1a1a1a" />
        <ThemedText style={styles.callButtonText}>Appeler</ThemedText>
      </Pressable>

      <Pressable style={styles.secondaryBtn} onPress={() => router.back()}>
        <ThemedText style={[styles.secondaryBtnText, { color: theme.icon }]}>Fermer l’annonce</ThemedText>
      </Pressable>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  sheet: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 12,
  },
  priceLbc: {
    fontSize: 24,
    fontWeight: '800',
    color: LBC_ORANGE,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  titleLbc: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 3,
  },
  metaLbc: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionRule: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  detailLabel: {
    fontSize: 13,
    flex: 0.4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    flex: 0.6,
    fontWeight: '600',
    textAlign: 'right',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagLbc: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 4,
  },
  tagLbcText: {
    fontSize: 12,
    fontWeight: '500',
  },
  callButton: {
    marginTop: 10,
    backgroundColor: LBC_ORANGE,
    borderRadius: 6,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callButtonText: {
    color: '#1a1a1a',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryBtn: {
    marginTop: 6,
    marginBottom: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
