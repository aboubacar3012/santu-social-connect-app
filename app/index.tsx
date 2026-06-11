import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/shared/themed-text';
import { useAuth } from '@/hooks/use-auth';

const ACCENT = '#0077B6';

const STEPS = [
  {
    label: 'Réseau',
    title: 'Le réseau des entrepreneurs marseillais',
    body: 'Échangez, inspirez-vous et grandissez avec une communauté locale engagée.',
    icon: 'hub' as const,
  },
  {
    label: 'Connexions',
    title: 'Trouvez vos alliés',
    body: 'Fondateurs, investisseurs, mentors et talents — des profils complémentaires au vôtre.',
    icon: 'groups' as const,
  },
  {
    label: 'Événements',
    title: 'Faites avancer vos projets',
    body: 'Afterworks, conférences et rencontres : votre prochaine collaboration est proche.',
    icon: 'event-available' as const,
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const { isReady, isAuthenticated } = useAuth();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const contentX = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const barWidth = useRef(new Animated.Value(1 / STEPS.length)).current;

  const cur = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const t = {
    canvas: '#EEF2F6',
    sheet: '#FFFFFF',
    text: '#0D1B2A',
    muted: '#5C6B7A',
    faint: '#8A97A6',
    divider: 'rgba(0,0,0,0.06)',
    blobA: 'rgba(0,119,182,0.14)',
    blobB: 'rgba(0,168,232,0.1)',
    ring: 'rgba(0,119,182,0.28)',
    ringOuter: 'rgba(0,119,182,0.1)',
    chip: 'rgba(0,119,182,0.1)',
    progressTrack: 'rgba(0,0,0,0.07)',
    btnShadow: 'rgba(0,119,182,0.28)',
  };

  const statusH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;
  const barW = barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  const runBar = (target: number) => {
    Animated.timing(barWidth, {
      toValue: target,
      duration: 400,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  const pulseIcon = () => {
    iconScale.setValue(0.92);
    Animated.spring(iconScale, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  const goTo = (next: number) => {
    if (busy || next === step) return;
    setBusy(true);

    Animated.parallel([
      Animated.timing(contentOpacity, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(contentX, { toValue: -18, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      runBar((next + 1) / STEPS.length);
      contentX.setValue(22);
      pulseIcon();
      Animated.parallel([
        Animated.timing(contentOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(contentX, {
          toValue: 0,
          duration: 280,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
      ]).start(() => setBusy(false));
    });
  };

  useEffect(() => {
    if (!isReady) return;
    runBar((step + 1) / STEPS.length);
    pulseIcon();
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const goAuth = () => router.replace('/auth');
  const next = () => (isLast ? goAuth() : goTo(step + 1));

  if (!isReady) return null;
  if (isAuthenticated) return <Redirect href="/(tabs)" />;

  return (
    <View style={[styles.root, { backgroundColor: t.canvas }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <View style={[styles.blob, styles.blobTop, { backgroundColor: t.blobA }]} />
      <View style={[styles.blob, styles.blobBottom, { backgroundColor: t.blobB }]} />

      <View style={[styles.header, { paddingTop: statusH + 14 }]}>
        <View style={styles.brandBlock}>
          <ThemedText style={[styles.brandKicker, { color: ACCENT }]}>
            SANTU CONNECT
          </ThemedText>
          <ThemedText style={[styles.brandSub, { color: '#8A97A6' }]}>
            Marseille
          </ThemedText>
        </View>
        {!isLast ? (
          <Pressable onPress={goAuth} hitSlop={12} style={[styles.skipPill, { borderColor: t.divider }]}>
            <ThemedText style={[styles.skipText, { color: '#687076' }]}>
              Passer
            </ThemedText>
          </Pressable>
        ) : (
          <View style={styles.skipPlaceholder} />
        )}
      </View>

      <View style={styles.hero}>
        <Animated.View style={[styles.iconRingOuter, { borderColor: t.ringOuter, transform: [{ scale: iconScale }] }]}>
          <View style={[styles.iconRingInner, { borderColor: t.ring }]}>
            <View style={[styles.iconCore, { backgroundColor: t.chip }]}>
              <MaterialIcons name={cur.icon} size={36} color={ACCENT} />
            </View>
          </View>
        </Animated.View>

        <Animated.View
          style={[
            styles.slideContent,
            { opacity: contentOpacity, transform: [{ translateX: contentX }] },
          ]}
        >
          <View style={[styles.stepPill, { backgroundColor: t.chip }]}>
            <ThemedText style={[styles.stepPillText, { color: ACCENT }]}>
              {cur.label}
            </ThemedText>
          </View>
          <ThemedText style={[styles.title, { color: '#0D1B2A' }]}>
            {cur.title}
          </ThemedText>
          <ThemedText style={[styles.body, { color: '#5C6B7A' }]}>
            {cur.body}
          </ThemedText>
        </Animated.View>
      </View>

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: t.sheet,
            borderColor: t.divider,
            paddingBottom: Math.max(insets.bottom + 16, 24),
          },
        ]}
      >
        <View style={styles.progressRow}>
          <View style={[styles.progressTrack, { backgroundColor: t.progressTrack }]}>
            <Animated.View style={[styles.progressFill, { width: barW }]} />
          </View>
          <ThemedText style={[styles.stepCounter, { color: '#8A97A6' }]}>
            {step + 1}/{STEPS.length}
          </ThemedText>
        </View>

        <View style={styles.stepTabs}>
          {STEPS.map((item, i) => {
            const active = i === step;
            return (
              <Pressable
                key={item.label}
                onPress={() => goTo(i)}
                style={[
                  styles.stepTab,
                  {
                    backgroundColor: active ? t.chip : 'transparent',
                    borderColor: active ? `${ACCENT}44` : 'transparent',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.stepTabText,
                    active && styles.stepTabTextActive,
                    { color: active ? ACCENT : '#8A97A6' },
                  ]}
                >
                  {item.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: ACCENT,
              opacity: pressed ? 0.92 : 1,
              shadowColor: t.btnShadow,
            },
          ]}
        >
          <ThemedText style={[styles.primaryBtnText, { color: '#FFFFFF' }]}>
            {isLast ? 'Rejoindre le réseau' : 'Continuer'}
          </ThemedText>
          <MaterialIcons name={isLast ? 'arrow-forward' : 'east'} size={20} color="#FFFFFF" />
        </Pressable>

        <Pressable onPress={goAuth} style={styles.secondaryBtn}>
          <ThemedText style={[styles.secondaryBtnText, { color: '#687076' }]}>
            J&apos;ai déjà un compte
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  blob: {
    position: 'absolute',
    borderRadius: 999,
  },
  blobTop: {
    width: 280,
    height: 280,
    top: -80,
    right: -90,
  },
  blobBottom: {
    width: 220,
    height: 220,
    bottom: 180,
    left: -100,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 2,
  },
  brandBlock: { gap: 2 },
  brandKicker: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.8,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  skipPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  skipText: { fontSize: 13, fontWeight: '600' },
  skipPlaceholder: { width: 72 },

  hero: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    gap: 28,
    zIndex: 1,
  },
  iconRingOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconRingInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCore: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideContent: {
    alignItems: 'center',
    gap: 14,
    maxWidth: 360,
  },
  stepPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  stepPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '800',
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    textAlign: 'center',
  },

  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 24,
    paddingTop: 18,
    gap: 14,
    zIndex: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 },
      },
      android: { elevation: 12 },
      default: {},
    }),
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 5,
    borderRadius: 3,
    backgroundColor: ACCENT,
  },
  stepCounter: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    minWidth: 28,
    textAlign: 'right',
  },
  stepTabs: {
    flexDirection: 'row',
    gap: 8,
  },
  stepTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepTabTextActive: {
    fontWeight: '700',
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  secondaryBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  secondaryBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
