import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

export const EVENT_ACCENT = '#0077B6';

export function hasEventImage(image: string): boolean {
  return image.trim().length > 0;
}

type EventImagePlaceholderProps = {
  isDark: boolean;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

export function EventImagePlaceholder({
  isDark,
  style,
  compact = false,
}: EventImagePlaceholderProps) {
  return (
    <View
      style={[
        styles.root,
        compact && styles.rootCompact,
        { backgroundColor: isDark ? '#0A2E45' : EVENT_ACCENT },
        style,
      ]}
    >
      <View
        style={[
          styles.orb,
          compact ? styles.orbLeftCompact : styles.orbLeft,
        ]}
      />
      <View
        style={[
          styles.orb,
          compact ? styles.orbRightCompact : styles.orbRight,
          styles.orbFaint,
        ]}
      />
      <MaterialIcons
        name="event"
        size={compact ? 48 : 72}
        color="rgba(255,255,255,0.3)"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rootCompact: {},
  orb: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orbFaint: {
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  orbLeft: {
    width: 180,
    height: 180,
    top: -48,
    left: -40,
  },
  orbLeftCompact: {
    width: 120,
    height: 120,
    top: -36,
    left: -28,
  },
  orbRight: {
    width: 140,
    height: 140,
    bottom: -36,
    right: -24,
  },
  orbRightCompact: {
    width: 96,
    height: 96,
    bottom: -28,
    right: -16,
  },
});
