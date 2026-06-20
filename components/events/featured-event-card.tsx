import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { openEventLink } from '@/components/events/event-card-utils';
import {
  EventImagePlaceholder,
  hasEventImage,
} from '@/components/events/event-image-placeholder';
import { ThemedText } from '@/components/shared/themed-text';

const FEATURED_IMAGE_OPACITY = 0.42;
const FEATURED_TAB_BAR_OFFSET = 96;
const SCRIM_BANDS = 16;
const SCRIM_MAX_HEIGHT = 72;

function HeroScrim() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={styles.topScrim} />
      {Array.from({ length: SCRIM_BANDS }).map((_, i) => {
        const t = (i + 1) / SCRIM_BANDS;
        return (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              height: `${t * SCRIM_MAX_HEIGHT}%`,
              backgroundColor: 'rgba(11,19,32,0.09)',
            }}
          />
        );
      })}
    </View>
  );
}

export type FeaturedEventCardProps = {
  title: string;
  image: string;
  description: string;
  dateLabel: string;
  time: string;
  address: string;
  links: { label: string; url: string }[];
  isPast: boolean;
};

export function FeaturedEventCard({
  title,
  image,
  description,
  dateLabel,
  time,
  address,
  links,
  isPast,
}: FeaturedEventCardProps) {
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const showImage = hasEventImage(image);
  const trimmedDescription = description.trim();
  const hasDescription = trimmedDescription.length > 0;

  const handleOpenLink = useCallback((url: string) => {
    openEventLink(url);
  }, []);

  return (
    <View
      style={[
        styles.featuredCard,
        { width: windowWidth, height: windowHeight },
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: image }}
          style={[styles.featuredImage, { opacity: FEATURED_IMAGE_OPACITY }]}
          contentFit="cover"
        />
      ) : (
        <EventImagePlaceholder
          style={[styles.featuredImage, { opacity: FEATURED_IMAGE_OPACITY }]}
        />
      )}

      <HeroScrim />

      {isPast ? <View style={styles.pastVeil} pointerEvents="none" /> : null}

      <Animated.View
        entering={FadeInUp.duration(380).springify().damping(20)}
        style={[
          styles.featuredContent,
          { paddingBottom: FEATURED_TAB_BAR_OFFSET + insets.bottom },
        ]}
      >
        <View style={styles.featuredDatePill}>
          <MaterialIcons name="event" size={13} color="#FFFFFF" />
          <ThemedText style={styles.featuredDatePillText}>
            {isPast ? 'Passé · ' : ''}
            {dateLabel} · {time}
          </ThemedText>
        </View>

        <ThemedText style={styles.featuredTitle} numberOfLines={2}>
          {title}
        </ThemedText>

        <View style={styles.featuredMetaRow}>
          <MaterialIcons name="place" size={14} color="rgba(255,255,255,0.78)" />
          <ThemedText style={styles.featuredMetaText} numberOfLines={1}>
            {address}
          </ThemedText>
        </View>


        {links.length > 0 ? (
          <View style={styles.featuredLinks}>
            {links.map((link) => (
              <Pressable
                key={link.url}
                onPress={() => handleOpenLink(link.url)}
                hitSlop={4}
                style={({ pressed }) => [styles.featuredLinkPill, pressed && styles.linkItemPressed]}
              >
                <MaterialIcons name="open-in-new" size={14} color="#0B1320" />
                <ThemedText style={styles.featuredLinkText} numberOfLines={1}>
                  {link.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  featuredCard: {
    overflow: 'hidden',
    backgroundColor: '#0B1320',
    justifyContent: 'flex-end',
  },
  featuredImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  topScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '34%',
    backgroundColor: 'rgba(11,19,32,0.28)',
  },
  pastVeil: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,19,32,0.22)',
  },
  featuredContent: {
    paddingHorizontal: 20,
    paddingBottom: 22,
    gap: 10,
  },
  featuredDatePill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  featuredDatePillText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  featuredTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: 32,
  },
  featuredMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    flex: 1,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13.5,
    fontWeight: '500',
  },
  featuredLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  featuredLinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    maxWidth: '100%',
  },
  featuredLinkText: {
    color: '#0B1320',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  linkItemPressed: {
    opacity: 0.75,
  },
});
