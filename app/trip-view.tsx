import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { FAKE_TRIPS } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TripViewModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const router = useRouter();

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const bgSoft = colorScheme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

  const trip = useMemo(() => {
    return FAKE_TRIPS.find((t) => t.id === id) ?? FAKE_TRIPS[0];
  }, [id]);
  

  return (
    <SafeScrollView>
      <View style={styles.content}>
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: bgSoft }]}>
          <View style={styles.top}>
            <ThemedText type="defaultSemiBold" style={styles.title}>
              {trip.from} → {trip.to}
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.price}>
              {trip.priceEUR}€
            </ThemedText>
          </View>

          <ThemedText style={styles.line}>
            {trip.whenLabel} à {trip.departTime} • {trip.durationLabel}
          </ThemedText>
          <ThemedText style={styles.line}>Conducteur : {trip.driverName}</ThemedText>
          <ThemedText style={styles.line}>Véhicule : {trip.carLabel}</ThemedText>
          <ThemedText style={styles.line}>Distance : {trip.distanceLabel}</ThemedText>

          <View style={styles.tagsRow}>
            {trip.tags.map((t) => (
              <View key={t} style={[styles.tag, { backgroundColor: bgSoft }]}>
                <ThemedText style={styles.tagText}>{t}</ThemedText>
              </View>
            ))}
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={[styles.outlineButton, { borderColor: bgSoft }]} onPress={() => router.back()}>
              <ThemedText style={[styles.outlineButtonText, { color: theme.text }]}>Retour</ThemedText>
            </Pressable>

            <Pressable style={[styles.primaryButton, { backgroundColor: theme.tint }]} onPress={() => {}}>
              <ThemedText style={styles.primaryButtonText}>Réserver</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 8,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 18,
  },
  price: {
    fontSize: 20,
  },
  line: {
    fontSize: 13,
    opacity: 0.85,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 13,
    opacity: 0.92,
    fontWeight: '500',
  },
  actionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
});

