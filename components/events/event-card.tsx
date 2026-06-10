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

export type EventCardProps = {
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
  onPress?: () => void;
};

export function EventCard({
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
  onPress,
}: EventCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const showImage = hasEventImage(image);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: cardBg, borderColor: divider }]}
    >
      <View style={styles.cardImageWrap}>
        {showImage ? (
          <Image source={{ uri: image }} style={styles.cardImage} contentFit="cover" />
        ) : (
          <EventImagePlaceholder isDark={isDark} style={styles.cardImage} compact />
        )}
        <View style={styles.cardImageOverlay}>
          <View style={[styles.typeBadge, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: ACCENT }]}>{typeLabel}</ThemedText>
          </View>
          <Pressable
            onPress={onToggleFavorite}
            hitSlop={12}
            style={[styles.favOnImage, { backgroundColor: 'rgba(255,255,255,0.92)' }]}
          >
            <MaterialIcons
              name={isFavorite ? 'favorite' : 'favorite-border'}
              size={20}
              color={isFavorite ? ACCENT : theme.icon}
            />
          </Pressable>
        </View>
        {isPast ? (
          <View style={[styles.pastBanner, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
            <ThemedText style={styles.pastBannerText}>Passé</ThemedText>
          </View>
        ) : null}
      </View>

      <View style={styles.cardBody}>
        <ThemedText style={[styles.cardTitle, { color: theme.text }]}>{title}</ThemedText>

        <View style={styles.metaItem}>
          <MaterialIcons name="calendar-today" size={15} color={ACCENT} />
          <ThemedText style={[styles.metaText, { color: theme.icon }]}>
            {dateLabel} · {time}
          </ThemedText>
        </View>

        <ThemedText style={[styles.description, { color: theme.icon }]} numberOfLines={3}>
          {description}
        </ThemedText>

        <View style={styles.metaItem}>
          <MaterialIcons name="place" size={15} color={ACCENT} />
          <ThemedText style={[styles.address, { color: theme.text }]}>{address}</ThemedText>
        </View>

        {links.length > 0 ? (
          <View style={styles.linksRow}>
            {links.map((link) => (
              <Pressable
                key={link.url}
                onPress={() => Linking.openURL(link.url)}
                style={[styles.linkChip, { backgroundColor: chipBg, borderColor: divider }]}
              >
                <MaterialIcons name="link" size={13} color={ACCENT} />
                <ThemedText style={[styles.linkChipText, { color: ACCENT }]}>{link.label}</ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardImageWrap: { position: 'relative', height: 168 },
  cardImage: { width: '100%', height: '100%' },
  cardImageOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  favOnImage: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pastBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 5,
    alignItems: 'center',
  },
  pastBannerText: { color: '#FFF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  typeBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  cardBody: { padding: 14, gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, lineHeight: 22 },
  metaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  metaText: { flex: 1, fontSize: 13, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 20, fontWeight: '400' },
  address: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  linkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  linkChipText: { fontSize: 12, fontWeight: '600' },
});
