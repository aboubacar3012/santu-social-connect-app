import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInUp,
  LinearTransition,
  SharedValue,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import {
  openEventLink,
  triggerFavoriteHaptic,
  triggerLightHaptic,
} from '@/components/events/event-card-utils';
import {
  EVENT_ACCENT,
  EventImagePlaceholder,
  hasEventImage,
} from '@/components/events/event-image-placeholder';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';

const DESCRIPTION_LINES = 2;
const TITLE_LINES = 2;
const ACCENT = EVENT_ACCENT;
const HERO_HEIGHT = 168;

const SPRING_FAV = { damping: 10, stiffness: 420, mass: 0.55 };
const SPRING_ACCORDION = { damping: 22, stiffness: 220, mass: 0.8 };
const ACCORDION_LAYOUT = LinearTransition.springify().damping(22).stiffness(220);

type AccordionToggleProps = {
  expanded: boolean;
  progress: SharedValue<number>;
  onPress: () => void;
};

function AccordionToggle({ expanded, progress, onPress }: AccordionToggleProps) {
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${interpolate(progress.value, [0, 1], [0, 180])}deg` }],
  }));

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.accordionTrigger, pressed && styles.accordionTriggerPressed]}
    >
      <ThemedText style={[styles.accordionLabel, { color: ACCENT }]}>
        {expanded ? 'Voir moins' : 'Voir plus'}
      </ThemedText>
      <Animated.View style={chevronStyle}>
        <MaterialIcons name="expand-more" size={18} color={ACCENT} />
      </Animated.View>
    </Pressable>
  );
}

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
  isTitleExpanded: boolean;
  onToggleTitleExpand: () => void;
  isDescriptionExpanded: boolean;
  onToggleDescriptionExpand: () => void;
  onToggleFavorite: () => void;
  index?: number;
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
  isTitleExpanded,
  onToggleTitleExpand,
  isDescriptionExpanded,
  onToggleDescriptionExpand,
  onToggleFavorite,
  index = 0,
}: EventCardProps) {
  const theme = Colors.light;
  const showImage = hasEventImage(image);
  const trimmedDescription = description.trim();
  const hasDescription = trimmedDescription.length > 0;
  const [titleLineCount, setTitleLineCount] = useState(0);
  const [descriptionTruncated, setDescriptionTruncated] = useState(false);

  const favScale = useSharedValue(1);
  const titleExpandProgress = useSharedValue(isTitleExpanded ? 1 : 0);
  const descriptionExpandProgress = useSharedValue(isDescriptionExpanded ? 1 : 0);

  useEffect(() => {
    titleExpandProgress.value = withSpring(isTitleExpanded ? 1 : 0, SPRING_ACCORDION);
  }, [isTitleExpanded, titleExpandProgress]);

  useEffect(() => {
    descriptionExpandProgress.value = withSpring(isDescriptionExpanded ? 1 : 0, SPRING_ACCORDION);
  }, [descriptionExpandProgress, isDescriptionExpanded]);

  const favAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favScale.value }],
  }));

  const titleNeedsExpand = titleLineCount > TITLE_LINES;
  const canExpandTitle = titleNeedsExpand;
  const canExpandDescription = descriptionTruncated || isDescriptionExpanded;

  const handleToggleTitleExpand = useCallback(() => {
    triggerLightHaptic();
    onToggleTitleExpand();
  }, [onToggleTitleExpand]);

  const handleToggleDescriptionExpand = useCallback(() => {
    triggerLightHaptic();
    onToggleDescriptionExpand();
  }, [onToggleDescriptionExpand]);

  const handleToggleFavorite = useCallback(() => {
    triggerFavoriteHaptic();
    favScale.value = withSequence(
      withSpring(1.35, SPRING_FAV),
      withSpring(1, SPRING_FAV),
    );
    onToggleFavorite();
  }, [favScale, onToggleFavorite]);

  const handleOpenLink = useCallback((url: string) => {
    openEventLink(url);
  }, []);

  return (
    <Animated.View
      entering={FadeInUp.withInitialValues({ opacity: 0, transform: [{ translateY: 36 }] })
        .delay(index * 55)
        .duration(420)
        .springify()
        .damping(19)
        .stiffness(165)}
      layout={ACCORDION_LAYOUT}
      style={styles.card}
    >
      <View style={[styles.hero, { height: HERO_HEIGHT }]}>
        {showImage ? (
          <Image source={{ uri: image }} style={styles.heroImage} contentFit="cover" />
        ) : (
          <EventImagePlaceholder style={styles.heroImage} compact />
        )}

        <View style={styles.heroTop}>
          <BlurView intensity={64} tint="light" style={styles.typeBadge}>
            <ThemedText style={[styles.typeBadgeText, { color: ACCENT }]}>{typeLabel}</ThemedText>
          </BlurView>
          <Pressable onPress={handleToggleFavorite} hitSlop={12}>
            <Animated.View style={favAnimatedStyle}>
              <BlurView intensity={64} tint="light" style={styles.favBadge}>
                <MaterialIcons
                  name={isFavorite ? 'favorite' : 'favorite-border'}
                  size={19}
                  color={isFavorite ? ACCENT : theme.icon}
                />
              </BlurView>
            </Animated.View>
          </Pressable>
        </View>

        {isPast ? (
          <View style={styles.pastWrap}>
            <BlurView intensity={72} tint="light" style={styles.pastBadge}>
              <ThemedText style={styles.pastText}>Passé</ThemedText>
            </BlurView>
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <View style={styles.titleSection}>
          <View style={styles.measureHidden} pointerEvents="none">
            <ThemedText
              style={[styles.title, { color: theme.text }]}
              onTextLayout={(e) => setTitleLineCount(e.nativeEvent.lines.length)}
            >
              {title}
            </ThemedText>
          </View>
          <Animated.View layout={ACCORDION_LAYOUT}>
            <ThemedText
              style={[styles.title, { color: theme.text }]}
              numberOfLines={isTitleExpanded ? undefined : TITLE_LINES}
            >
              {title}
            </ThemedText>
          </Animated.View>
          {canExpandTitle ? (
            <AccordionToggle
              expanded={isTitleExpanded}
              progress={titleExpandProgress}
              onPress={handleToggleTitleExpand}
            />
          ) : null}
        </View>

        <Animated.View layout={ACCORDION_LAYOUT} style={styles.infoPanel}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${ACCENT}14` }]}>
              <MaterialIcons name="calendar-today" size={14} color={ACCENT} />
            </View>
            <ThemedText style={[styles.infoText, { color: theme.text }]}>
              {dateLabel} · {time}
            </ThemedText>
          </View>
          <View style={styles.infoDivider} />
          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: `${ACCENT}14` }]}>
              <MaterialIcons name="place" size={14} color={ACCENT} />
            </View>
            <ThemedText
              style={[styles.infoText, { color: theme.text }]}
              numberOfLines={isDescriptionExpanded ? undefined : 1}
            >
              {address}
            </ThemedText>
          </View>
          {links.length > 0 ? (
            <>
              <View style={styles.infoDivider} />
              <View style={styles.linksInPanel}>
                {links.map((link) => (
                  <Pressable
                    key={link.url}
                    onPress={() => handleOpenLink(link.url)}
                    hitSlop={4}
                    style={({ pressed }) => [styles.linkItem, pressed && styles.linkItemPressed]}
                  >
                    <MaterialIcons name="open-in-new" size={14} color={ACCENT} />
                    <ThemedText style={[styles.linkLabel, { color: ACCENT }]} numberOfLines={1}>
                      {link.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </Animated.View>

        {hasDescription ? (
          <View style={styles.descriptionSection}>
            <Animated.View layout={ACCORDION_LAYOUT}>
              <ThemedText
                style={[styles.description, { color: theme.icon }]}
                numberOfLines={isDescriptionExpanded ? undefined : DESCRIPTION_LINES}
                onTextLayout={(e) => {
                  if (!isDescriptionExpanded) {
                    setDescriptionTruncated(e.nativeEvent.lines.length >= DESCRIPTION_LINES);
                  }
                }}
              >
                {trimmedDescription}
              </ThemedText>
            </Animated.View>
            {canExpandDescription ? (
              <AccordionToggle
                expanded={isDescriptionExpanded}
                progress={descriptionExpandProgress}
                onPress={handleToggleDescriptionExpand}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#102A43',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 5,
  },
  hero: {
    overflow: 'hidden',
    backgroundColor: '#E4E9EF',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroTop: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    overflow: 'hidden',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.25,
  },
  favBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  pastWrap: {
    position: 'absolute',
    bottom: 10,
    left: 10,
  },
  pastBadge: {
    overflow: 'hidden',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  pastText: {
    color: '#D32F2F',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.35,
  },
  body: {
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 12,
    gap: 10,
  },
  titleSection: {
    gap: 2,
  },
  measureHidden: {
    position: 'absolute',
    opacity: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.35,
    lineHeight: 22,
  },
  descriptionSection: {
    gap: 2,
  },
  infoPanel: {
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 7,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginLeft: 34,
  },
  linksInPanel: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    paddingLeft: 34,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: `${ACCENT}0D`,
    maxWidth: '100%',
  },
  linkItemPressed: {
    opacity: 0.75,
  },
  linkLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    flexShrink: 1,
  },
  description: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '400',
  },
  accordionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 2,
    paddingVertical: 2,
    paddingRight: 4,
  },
  accordionTriggerPressed: {
    opacity: 0.75,
  },
  accordionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
