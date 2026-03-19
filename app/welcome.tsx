import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

/* ─── Constantes couleur ─────────────────────────────────── */
const YELLOW = '#FFCD00';
const YELLOW_DARK = '#1A1A1A'; // texte sur fond jaune
const HERO_BG_LIGHT = '#FFCD00';
const HERO_BG_DARK = '#2A2200';

/* ─── Étapes ─────────────────────────────────────────────── */
const STEPS = [
  {
    icon: 'explore' as const,
    tag: 'Déplacements',
    title: 'Partez\nquand vous voulez',
    body: 'Trouvez des trajets entre les villes de Guinée, selon vos horaires et votre budget.',
  },
  {
    icon: 'groups' as const,
    tag: 'Sécurité',
    title: 'Voyagez\nen confiance',
    body: 'Des conducteurs vérifiés, des profils transparents et une communauté bienveillante.',
  },
  {
    icon: 'bolt' as const,
    tag: 'Connexion',
    title: 'Prêt en\nquelques secondes',
    body: 'Connectez-vous avec votre compte social préféré et commencez immédiatement.',
  },
] as const;

/* ─── Composant principal ────────────────────────────────── */
export default function WelcomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { height } = useWindowDimensions();

  const [step, setStep] = useState(0);
  const fade = useRef(new Animated.Value(1)).current;
  const heroSlide = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(0)).current;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  const heroBg = isDark ? HERO_BG_DARK : HERO_BG_LIGHT;
  const cardBg = isDark ? '#141416' : '#FFFFFF';
  const textColor = isDark ? '#ECEDEE' : '#11181C';
  const muted = isDark ? 'rgba(236,237,238,0.58)' : 'rgba(17,24,28,0.52)';
  const dotInactive = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(17,24,28,0.18)';
  const backBtnBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(17,24,28,0.06)';

  const animate = (nextStep: number) => {
    const dir = nextStep > step ? 1 : -1;
    Animated.parallel([
      Animated.timing(fade, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.timing(heroSlide, { toValue: -24 * dir, duration: 140, useNativeDriver: true }),
      Animated.timing(cardSlide, { toValue: 16 * dir, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setStep(nextStep);
      heroSlide.setValue(24 * dir);
      cardSlide.setValue(-16 * dir);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.spring(heroSlide, { toValue: 0, useNativeDriver: true, tension: 140, friction: 14 }),
        Animated.spring(cardSlide, { toValue: 0, useNativeDriver: true, tension: 140, friction: 14 }),
      ]).start();
    });
  };

  const iconColor = isDark ? YELLOW : YELLOW_DARK;

  return (
    <View style={[styles.root, { backgroundColor: heroBg }]}>
      <StatusBar barStyle="dark-content" />

      {/* ══ ZONE HÉRO ══ */}
      <Animated.View
        style={[
          styles.hero,
          { height: height * 0.50, opacity: fade, transform: [{ translateY: heroSlide }] },
        ]}
      >
        {/* Barre haut : nom app + passer */}
        <SafeAreaView>
          <View style={[styles.topBar, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) + 8 : 8 }]}>
            <ThemedText style={[styles.appName, { color: isDark ? YELLOW : YELLOW_DARK }]}>
              Santu
            </ThemedText>
            {!isLast && (
              <Pressable onPress={() => router.push('/auth')} style={[styles.skipTouch, { backgroundColor: isDark ? 'rgba(255,205,0,0.14)' : 'rgba(0,0,0,0.09)' }]}>
                <ThemedText style={[styles.skipLabel, { color: isDark ? YELLOW : YELLOW_DARK }]}>
                  Passer
                </ThemedText>
              </Pressable>
            )}
          </View>
        </SafeAreaView>

        {/* Illustration centrale */}
        <View style={styles.heroCenter}>
          {/* Bulle de fond décorative */}
          <View style={[styles.bubbleBg, {
            backgroundColor: isDark ? 'rgba(255,205,0,0.10)' : 'rgba(0,0,0,0.06)',
          }]} />

          {/* Anneaux concentriques */}
          <View style={[styles.ring, styles.ring3, { borderColor: isDark ? 'rgba(255,205,0,0.08)' : 'rgba(0,0,0,0.05)' }]} />
          <View style={[styles.ring, styles.ring2, { borderColor: isDark ? 'rgba(255,205,0,0.13)' : 'rgba(0,0,0,0.08)' }]} />
          <View style={[styles.ring, styles.ring1, { borderColor: isDark ? 'rgba(255,205,0,0.20)' : 'rgba(0,0,0,0.10)' }]} />

          {/* Icône */}
          <View style={[styles.iconWrap, {
            backgroundColor: isDark ? 'rgba(255,205,0,0.16)' : 'rgba(0,0,0,0.08)',
            shadowColor: isDark ? YELLOW : '#000',
          }]}>
            <MaterialIcons name={current.icon} size={56} color={iconColor} />
          </View>
        </View>
      </Animated.View>

      {/* ══ CARTE BAS ══ */}
      <Animated.View
        style={[
          styles.card,
          { backgroundColor: cardBg, opacity: fade, transform: [{ translateY: cardSlide }] },
        ]}
      >
        {/* Tag + indicateur d'étape */}
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: isDark ? 'rgba(255,205,0,0.14)' : 'rgba(255,205,0,0.22)' }]}>
            <ThemedText style={[styles.tagText, { color: isDark ? YELLOW : '#7A5F00' }]}>
              {current.tag}
            </ThemedText>
          </View>
          <ThemedText style={[styles.stepCount, { color: muted }]}>
            {step + 1} / {STEPS.length}
          </ThemedText>
        </View>

        {/* Texte */}
        <ThemedText style={[styles.title, { color: textColor }]}>
          {current.title}
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          {current.body}
        </ThemedText>

        {/* Bas de carte : dots + boutons */}
        <View style={styles.footer}>
          {/* Dots */}
          <View style={styles.dots}>
            {STEPS.map((_, i) => (
              <Pressable key={i} onPress={() => i !== step && animate(i)} hitSlop={8}>
                <View style={[
                  styles.dot,
                  i === step
                    ? { backgroundColor: YELLOW, width: 24 }
                    : { backgroundColor: dotInactive, width: 8 },
                ]} />
              </Pressable>
            ))}
          </View>

          {/* Boutons */}
          <View style={styles.actions}>
            {step > 0 && (
              <Pressable
                onPress={() => animate(step - 1)}
                style={[styles.backBtn, { backgroundColor: backBtnBg }]}
              >
                <MaterialIcons name="arrow-back" size={20} color={textColor} />
              </Pressable>
            )}
            <Pressable
              onPress={isLast ? () => router.push('/auth') : () => animate(step + 1)}
              style={[styles.nextBtn, { backgroundColor: YELLOW }]}
            >
              <ThemedText style={styles.nextText}>
                {isLast ? 'Commencer' : 'Suivant'}
              </ThemedText>
              <MaterialIcons
                name={isLast ? 'login' : 'arrow-forward'}
                size={18}
                color={YELLOW_DARK}
              />
            </Pressable>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  /* ── Hero ── */
  hero: {
    width: '100%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  appName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  skipTouch: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  skipLabel: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  heroCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleBg: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  ring: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
  },
  ring3: { width: 240, height: 240 },
  ring2: { width: 180, height: 180 },
  ring1: { width: 130, height: 130 },
  iconWrap: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },

  /* ── Card ── */
  card: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 26,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  tag: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    lineHeight: 16,
  },
  stepCount: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
    marginBottom: 12,
  },
  body: {
    fontSize: 15,
    lineHeight: 23,
    flex: 1,
  },
  footer: {
    marginTop: 20,
    gap: 16,
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    height: 8,
    borderRadius: 999,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'stretch',
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextText: {
    fontSize: 15,
    fontWeight: '700',
    color: YELLOW_DARK,
    lineHeight: 20,
  },
});
