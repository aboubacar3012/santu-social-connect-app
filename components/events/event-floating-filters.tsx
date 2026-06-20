import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/shared/themed-text';
import type { EventType } from '@/constants/mock-events';
import { Colors } from '@/constants/theme';

const ACCENT = '#0077B6';
const PANEL_AUTO_CLOSE_MS = 5000;

export type EventTypeFilter = EventType | 'All';

type FilterOption<T extends string> = { value: T; label: string };

export const EVENT_TYPE_FILTER_OPTIONS: FilterOption<EventTypeFilter>[] = [
  { value: 'All', label: 'Tous' },
  { value: 'Afterwork', label: 'Afterwork' },
  { value: 'Conference', label: 'Conférence' },
  { value: 'Networking', label: 'Networking' },
  { value: 'Workshop', label: 'Atelier' },
  { value: 'Concert', label: 'Concert' },
  { value: 'Exposition', label: 'Exposition' },
  { value: 'Sortie', label: 'Sortie' },
  { value: 'Autre', label: 'Autre' },
];

export type EventFloatingFiltersProps = {
  typeFilter: EventTypeFilter;
  favoritesOnly: boolean;
  onTypeChange: (value: EventTypeFilter) => void;
  onFavoritesChange: (value: boolean) => void;
  onReset: () => void;
  darkBlur?: boolean;
  visible?: boolean;
};

export function hasActiveEventFilters(
  typeFilter: EventTypeFilter,
  favoritesOnly: boolean,
): boolean {
  return typeFilter !== 'All' || favoritesOnly;
}

type FilterChipGroupProps = {
  options: FilterOption<EventTypeFilter>[];
  value: EventTypeFilter;
  onChange: (value: EventTypeFilter) => void;
  darkBlur: boolean;
};

function FilterChipGroup({ options, value, onChange, darkBlur }: FilterChipGroupProps) {
  const mutedColor = darkBlur ? 'rgba(255,255,255,0.72)' : Colors.light.icon;

  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.chip,
              darkBlur ? styles.chipDark : styles.chipLight,
              active && (darkBlur ? styles.chipActiveDark : styles.chipActiveLight),
            ]}
          >
            <ThemedText
              style={[
                styles.chipText,
                { color: active ? ACCENT : mutedColor, fontWeight: active ? '600' : '400' },
              ]}
            >
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function EventFloatingFilters({
  typeFilter,
  favoritesOnly,
  onTypeChange,
  onFavoritesChange,
  onReset,
  darkBlur = false,
  visible = true,
}: EventFloatingFiltersProps) {
  const theme = Colors.light;
  const [panelOpen, setPanelOpen] = useState(false);
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const textColor = darkBlur ? '#FFFFFF' : theme.text;
  const iconColor = darkBlur ? 'rgba(255,255,255,0.82)' : theme.icon;
  const subtleText = darkBlur ? 'rgba(255,255,255,0.55)' : theme.icon;

  useEffect(() => {
    if (!visible) {
      setPanelOpen(false);
    }
    translateY.value = withTiming(visible ? 0 : -64, { duration: 220 });
    opacity.value = withTiming(visible ? 1 : 0, { duration: 220 });
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      setPanelOpen(false);
    }, PANEL_AUTO_CLOSE_MS);
  }, [clearInactivityTimer]);

  useEffect(() => {
    if (panelOpen) {
      resetInactivityTimer();
    } else {
      clearInactivityTimer();
    }

    return clearInactivityTimer;
  }, [panelOpen, resetInactivityTimer, clearInactivityTimer]);

  const handleTypeChange = useCallback(
    (value: EventTypeFilter) => {
      onTypeChange(value);
      resetInactivityTimer();
    },
    [onTypeChange, resetInactivityTimer],
  );

  const hasActiveFilters = typeFilter !== 'All' || favoritesOnly;

  const summary = useMemo(() => {
    const parts: string[] = [];
    if (favoritesOnly) parts.push('Favoris');
    if (typeFilter !== 'All') {
      parts.push(EVENT_TYPE_FILTER_OPTIONS.find((o) => o.value === typeFilter)?.label ?? '');
    }
    return parts.join(' · ');
  }, [typeFilter, favoritesOnly]);

  return (
    <Animated.View style={[styles.root, animatedStyle]} pointerEvents={visible ? 'auto' : 'none'}>
      <BlurView
        intensity={darkBlur ? 36 : 58}
        tint={darkBlur ? 'dark' : 'light'}
        style={[
          styles.glass,
          darkBlur ? styles.glassDark : styles.glassLight,
        ]}
      >
        <View style={styles.bar}>
          <Pressable
            onPress={() => setPanelOpen((open) => !open)}
            style={({ pressed }) => [styles.mainBtn, pressed && styles.pressed]}
          >
            <MaterialIcons name="tune" size={14} color={iconColor} />
            <ThemedText style={[styles.mainLabel, { color: textColor }]} numberOfLines={1}>
              {summary || 'Filtres'}
            </ThemedText>
            <MaterialIcons
              name={panelOpen ? 'expand-less' : 'expand-more'}
              size={15}
              color={iconColor}
            />
          </Pressable>

          {hasActiveFilters ? (
            <Pressable
              onPress={onReset}
              hitSlop={8}
              style={({ pressed }) => [styles.resetBtn, pressed && styles.pressed]}
            >
              <MaterialIcons name="close" size={14} color={iconColor} />
            </Pressable>
          ) : null}

          <View style={[styles.divider, darkBlur ? styles.dividerDark : styles.dividerLight]} />

          <Pressable
            onPress={() => onFavoritesChange(!favoritesOnly)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.favBtn,
              favoritesOnly && styles.favBtnActive,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={favoritesOnly ? 'favorite' : 'favorite-border'}
              size={17}
              color={favoritesOnly ? ACCENT : iconColor}
            />
          </Pressable>
        </View>

        {panelOpen ? (
          <View style={styles.panel}>
            <View style={[styles.panelDivider, darkBlur ? styles.dividerDark : styles.dividerLight]} />
            <ThemedText style={[styles.groupLabel, { color: subtleText }]}>Type</ThemedText>
            <FilterChipGroup
              options={EVENT_TYPE_FILTER_OPTIONS}
              value={typeFilter}
              onChange={handleTypeChange}
              darkBlur={darkBlur}
            />
          </View>
        ) : null}
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
  },
  glass: {
    borderRadius: 22,
    overflow: 'hidden',
  },
  glassDark: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  glassLight: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.07)',
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 8,
    paddingVertical: 6,
    gap: 2,
  },
  mainBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 32,
    paddingRight: 4,
  },
  mainLabel: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  resetBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    height: 18,
    marginHorizontal: 4,
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  dividerLight: {
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  favBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favBtnActive: {
    backgroundColor: `${ACCENT}18`,
  },
  pressed: {
    opacity: 0.65,
  },
  panel: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    gap: 8,
  },
  panelDivider: {
    height: StyleSheet.hairlineWidth,
    width: '100%',
  },
  groupLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  chipDark: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  chipLight: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  chipActiveDark: {
    backgroundColor: 'rgba(0,119,182,0.28)',
  },
  chipActiveLight: {
    backgroundColor: `${ACCENT}14`,
  },
  chipText: {
    fontSize: 11.5,
  },
});
