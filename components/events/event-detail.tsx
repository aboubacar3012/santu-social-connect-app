import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import {
  EVENT_ACCENT,
  EventImagePlaceholder,
  hasEventImage,
} from '@/components/events/event-image-placeholder';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = EVENT_ACCENT;

export type EventDetailProps = {
  title: string;
  typeLabel: string;
  image: string;
  description: string;
  dateLabel: string;
  time: string;
  address: string;
  links: { label: string; url: string }[];
  isFavorite: boolean;
  isPast: boolean;
  onToggleFavorite: () => void;
};

function LinkAction({
  label,
  url,
  cardBg,
  divider,
}: {
  label: string;
  url: string;
  cardBg: string;
  divider: string;
}) {
  return (
    <Pressable
      onPress={() => Linking.openURL(url)}
      style={({ pressed }) => [
        styles.linkAction,
        { backgroundColor: cardBg, borderColor: divider, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <View style={[styles.linkActionIcon, { backgroundColor: `${ACCENT}14` }]}>
        <MaterialIcons name="link" size={20} color={ACCENT} />
      </View>
      <View style={styles.linkActionBody}>
        <ThemedText style={[styles.linkActionLabel, { color: ACCENT }]}>{label}</ThemedText>
        <ThemedText style={[styles.linkActionHint, { color: ACCENT }]} numberOfLines={1}>
          Ouvrir le lien
        </ThemedText>
      </View>
      <MaterialIcons name="north-east" size={18} color={ACCENT} />
    </Pressable>
  );
}

export function EventDetail({
  title,
  typeLabel,
  image,
  description,
  dateLabel,
  time,
  address,
  links,
  isFavorite,
  isPast,
  onToggleFavorite,
}: EventDetailProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const pageBg = isDark ? '#0A0A0C' : '#F2F4F7';
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const chipBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,119,182,0.06)';
  const showImage = hasEventImage(image);

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <View style={styles.heroWrap}>
        {showImage ? (
          <Image
            source={{ uri: image }}
            style={styles.heroImage}
            contentFit="cover"
            contentPosition="center"
            transition={250}
          />
        ) : (
          <EventImagePlaceholder isDark={isDark} style={styles.heroImage} />
        )}
        <View style={styles.heroOverlay} />
        <View style={styles.heroTopRow}>
          <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.94)' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: ACCENT }]}>{typeLabel}</ThemedText>
          </View>
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={12}
            style={[styles.favBtn, { backgroundColor: 'rgba(255,255,255,0.94)' }]}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={22}
              color={isFavorite ? ACCENT : theme.icon}
            />
          </Pressable>
        </View>
        {isPast ? (
          <View style={styles.pastBanner}>
            <ThemedText style={styles.pastBannerText}>Événement passé</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.content}>
        <View style={[styles.titleCard, { backgroundColor: cardBg, borderColor: divider }]}>
          <ThemedText style={[styles.title, { color: theme.text }]}>{title}</ThemedText>

          <View style={[styles.dateBlock, { backgroundColor: chipBg, borderColor: divider }]}>
            <View style={[styles.dateIcon, { backgroundColor: `${ACCENT}18` }]}>
              <MaterialIcons name="calendar-today" size={20} color={ACCENT} />
            </View>
            <View style={styles.dateBody}>
              <ThemedText style={[styles.dateLabel, { color: theme.icon }]}>Date & horaires</ThemedText>
              <ThemedText style={[styles.dateValue, { color: theme.text }]}>
                {dateLabel} · {time}
              </ThemedText>
            </View>
          </View>

          <View style={styles.addressRow}>
            <MaterialIcons name="place" size={18} color={ACCENT} />
            <ThemedText style={[styles.address, { color: theme.text }]}>{address}</ThemedText>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: divider }]}>
          <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>DESCRIPTION</ThemedText>
          <ThemedText style={[styles.description, { color: theme.text }]}>{description}</ThemedText>
        </View>

        {links.length > 0 ? (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>LIENS UTILES</ThemedText>
            <View style={styles.linksList}>
              {links.map((link) => (
                <LinkAction key={link.url} label={link.label} url={link.url} cardBg={cardBg} divider={divider} />
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: 8 },
  heroWrap: { position: 'relative', height: 220 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  heroTopRow: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  typeBadgeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  favBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  pastBannerText: { color: '#FFF', fontSize: 12, fontWeight: '700', letterSpacing: 0.4 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    gap: 14,
  },
  titleCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.6, lineHeight: 30 },
  dateBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateBody: { flex: 1, gap: 2 },
  dateLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  dateValue: { fontSize: 15, fontWeight: '600' },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  address: { flex: 1, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  sectionCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  section: { gap: 10 },
  sectionKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, paddingHorizontal: 2 },
  description: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  linksList: { gap: 10 },
  linkAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  linkActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkActionBody: { flex: 1, gap: 2 },
  linkActionLabel: { fontSize: 15, fontWeight: '700' },
  linkActionHint: { fontSize: 12, fontWeight: '500', opacity: 0.85 },
});
