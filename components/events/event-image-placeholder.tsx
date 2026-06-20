import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

export const EVENT_ACCENT = '#0077B6';

const PLACEHOLDER_BG = '#E4E7EC';
const PLACEHOLDER_TEXT = '#5C6570';

export function hasEventImage(image: string): boolean {
  return image.trim().length > 0;
}

type EventImagePlaceholderProps = {
  dateLabel: string;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function EventImagePlaceholder({
  dateLabel,
  style,
  compact = false,
}: EventImagePlaceholderProps) {
  const isRange = dateLabel.includes('–');

  return (
    <View style={[styles.root, style]}>
      <ThemedText
        style={[
          styles.dateText,
          compact && styles.dateTextCompact,
          isRange && (compact ? styles.dateTextRangeCompact : styles.dateTextRange),
        ]}
        numberOfLines={compact ? 3 : 4}
      >
        {dateLabel}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PLACEHOLDER_BG,
    overflow: 'hidden',
    paddingHorizontal: 20,
  },
  dateText: {
    color: PLACEHOLDER_TEXT,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 32,
    textAlign: 'center',
  },
  dateTextCompact: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 20,
    paddingHorizontal: 4,
  },
  dateTextRange: {
    fontSize: 20,
    lineHeight: 26,
  },
  dateTextRangeCompact: {
    fontSize: 13,
    lineHeight: 18,
  },
});
