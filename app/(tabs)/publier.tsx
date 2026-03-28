import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import MyTripsPanel from '@/components/my-trips-panel';
import PublishTripForm from '@/components/publish-trip-form';
import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

type PublierMainTab = 'publier' | 'trajets';

function PublierTabSwitch({
  active,
  onChange,
  muted,
  trackBg,
  activeBg,
  borderSubtle,
}: {
  active: PublierMainTab;
  onChange: (t: PublierMainTab) => void;
  muted: string;
  trackBg: string;
  activeBg: string;
  borderSubtle: string;
}) {
  return (
    <View style={[styles.tabSwitchTrack, { backgroundColor: trackBg, borderColor: borderSubtle }]}>
      <Pressable
        onPress={() => onChange('publier')}
        style={[
          styles.tabSwitchBtn,
          active === 'publier' && [styles.tabSwitchBtnActive, { backgroundColor: activeBg }],
        ]}
      >
        <MaterialIcons
          name="add-circle-outline"
          size={16}
          color={active === 'publier' ? ON_TINT : muted}
        />
        <ThemedText
          style={[
            styles.tabSwitchLabel,
            { color: active === 'publier' ? ON_TINT : muted },
            active === 'publier' && styles.tabSwitchLabelActive,
          ]}
        >
          Publier
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={() => onChange('trajets')}
        style={[
          styles.tabSwitchBtn,
          active === 'trajets' && [styles.tabSwitchBtnActive, { backgroundColor: activeBg }],
        ]}
      >
        <MaterialIcons
          name="route"
          size={16}
          color={active === 'trajets' ? ON_TINT : muted}
        />
        <ThemedText
          style={[
            styles.tabSwitchLabel,
            { color: active === 'trajets' ? ON_TINT : muted },
            active === 'trajets' && styles.tabSwitchLabelActive,
          ]}
        >
          Trajets
        </ThemedText>
      </Pressable>
    </View>
  );
}

export default function PublierScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const tabTrackBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';

  const [mainTab, setMainTab] = useState<PublierMainTab>('publier');

  return (
    <SafeScrollView keyboardAvoiding screenBackgroundColor={pageBg}>
      <View style={styles.hero}>
        <ThemedText style={[styles.heroKicker, { color: muted }]}>PUBLIER</ThemedText>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>
          {mainTab === 'publier' ? 'Nouveau trajet' : 'Mes trajets'}
        </ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: muted }]}>
          {mainTab === 'publier'
            ? 'Renseignez l’essentiel. Les passagers vous contacteront directement.'
            : 'Annonces publiées, réservations à venir et trajets effectués.'}
        </ThemedText>
      </View>

      <PublierTabSwitch
        active={mainTab}
        onChange={setMainTab}
        muted={muted}
        trackBg={tabTrackBg}
        activeBg={theme.tint}
        borderSubtle={borderSubtle}
      />

      {mainTab === 'trajets' ? (
        <MyTripsPanel />
      ) : null}

      {mainTab === 'publier' ? <PublishTripForm /> : null}

      {/* Espace pour la tab bar flottante */}
      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 3,
    gap: 5,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    maxWidth: 320,
  },
  tabSwitchTrack: {
    flexDirection: 'row',
    borderRadius: 11,
    padding: 2,
    gap: 2,
    marginBottom: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tabSwitchBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 9,
  },
  tabSwitchBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  tabSwitchLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  tabSwitchLabelActive: {
    fontWeight: '700',
  },
  tabBarSpacer: {
    height: 76,
  },
});
