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

import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';

const STEPS = [
  {
    label: 'Marseille',
    title: 'Le réseau\ndes entrepreneurs.',
    body: 'Rejoignez une communauté d\'entrepreneurs marseillais. Échangez, inspirez-vous et grandissez ensemble.',
  },
  {
    label: 'Connexions',
    title: 'Trouvez\nvos alliés.',
    body: 'Découvrez des profils complémentaires au vôtre : fondateurs, investisseurs, mentors et talents locaux.',
  },
  {
    label: 'Opportunités',
    title: 'Faites avancer\nvos projets.',
    body: 'Afterworks, événements et rencontres sur la cité phocéenne. Votre prochaine collaboration est à portée de main.',
  },
] as const;

export default function WelcomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const { isReady, isAuthenticated } = useAuth();
  const dark = scheme === 'dark';
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);

  const labelOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY       = useRef(new Animated.Value(28)).current;
  const bodyOpacity  = useRef(new Animated.Value(0)).current;
  const barWidth     = useRef(new Animated.Value(0)).current;
  const btnOpacity   = useRef(new Animated.Value(0)).current;

  const cur    = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const bg     = dark ? '#0A0A0A' : '#F7F7F7';
  const txt    = dark ? '#FFFFFF'  : '#0A0A0A';
  const muted  = dark ? 'rgba(255,255,255,0.38)' : 'rgba(10,10,10,0.36)';
  const statusH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  const runEnter = () => {
    labelOpacity.setValue(0);
    titleOpacity.setValue(0);
    titleY.setValue(28);
    bodyOpacity.setValue(0);
    btnOpacity.setValue(0);

    Animated.stagger(100, [
      Animated.timing(labelOpacity, { toValue: 1, duration: 300, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.timing(titleY,       { toValue: 0, duration: 380, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      ]),
      Animated.timing(bodyOpacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(btnOpacity,  { toValue: 1, duration: 280, useNativeDriver: true }),
    ]).start();
  };

  const runBar = (target: number) => {
    Animated.timing(barWidth, {
      toValue: target,
      duration: 480,
      useNativeDriver: false,
      easing: Easing.out(Easing.cubic),
    }).start();
  };

  useEffect(() => {
    if (!isReady) return;
    barWidth.setValue(0);
    runBar((step + 1) / STEPS.length);
    runEnter();
  }, [isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (next: number) => {
    if (busy || next === step) return;
    setBusy(true);

    Animated.parallel([
      Animated.timing(labelOpacity, { toValue: 0, duration: 100, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 0, duration: 110, useNativeDriver: true }),
      Animated.timing(titleY,       { toValue: -20, duration: 110, useNativeDriver: true }),
      Animated.timing(bodyOpacity,  { toValue: 0, duration: 90,  useNativeDriver: true }),
      Animated.timing(btnOpacity,   { toValue: 0, duration: 80,  useNativeDriver: true }),
    ]).start(() => {
      setStep(next);
      runBar((next + 1) / STEPS.length);
      titleY.setValue(28);
      runEnter();
      setBusy(false);
    });
  };

  const skip = () => router.replace('/auth');
  const next = () => (isLast ? skip() : goTo(step + 1));

  const barW = barWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  if (!isReady) {
    return null;
  }
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[s.root, { backgroundColor: bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={dark ? 'light-content' : 'dark-content'} />

      {/* Progress bar — pleine largeur tout en haut */}
      <View style={[s.progressTrack, { top: statusH }]}>
        <Animated.View style={[s.progressFill, { width: barW }]} />
      </View>

      {/* Bouton Passer — coin haut droit */}
      {!isLast && (
        <Pressable
          onPress={skip}
          hitSlop={16}
          style={[s.skipBtn, { top: statusH + 14 }]}
        >
          <Animated.Text style={[s.skipText, { color: muted }]}>Passer</Animated.Text>
        </Pressable>
      )}

      {/* Contenu principal — aligné à gauche */}
      <View style={[s.content, { paddingTop: statusH + 80 }]}>

        {/* Label étape */}
        <Animated.Text style={[s.label, { color: ACCENT, opacity: labelOpacity }]}>
          {cur.label}
        </Animated.Text>

        {/* Titre */}
        <Animated.Text
          style={[s.title, { color: txt, opacity: titleOpacity, transform: [{ translateY: titleY }] }]}
        >
          {cur.title}
        </Animated.Text>

        {/* Description */}
        <Animated.Text style={[s.body, { color: muted, opacity: bodyOpacity }]}>
          {cur.body}
        </Animated.Text>
        
        <View style={s.spacer} />

        {/* Zone basse */}
        <Animated.View style={[s.bottom, { opacity: btnOpacity, paddingBottom: Math.max(insets.bottom + 16, 36) }]}>

          {/* Indicateurs segmentés */}
          <View style={s.segments}>
            {STEPS.map((_, i) => (
              <Pressable key={i} onPress={() => goTo(i)} hitSlop={10} style={s.segWrap}>
                <View
                  style={[
                    s.seg,
                    {
                      backgroundColor: i <= step
                        ? ACCENT
                        : dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)',
                    },
                  ]}
                />
              </Pressable>
            ))}
          </View>

          {/* Bouton principal */}
          {isLast ? (
            <Pressable style={[s.btn, { backgroundColor: ACCENT }]} onPress={next}>
              <Animated.Text style={s.btnText}>Rejoindre le réseau</Animated.Text>
            </Pressable>
          ) : (
            <Pressable style={[s.btn, { backgroundColor: ACCENT }]} onPress={next}>
              <Animated.Text style={s.btnText}>Suivant</Animated.Text>
            </Pressable>
          )}
        </Animated.View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },

  progressTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  progressFill: {
    height: 2,
    backgroundColor: ACCENT,
  },

  skipBtn: {
    position: 'absolute',
    right: 28,
    zIndex: 20,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },

  content: {
    flex: 1,
    paddingHorizontal: 32,
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 20,
  },

  title: {
    fontSize: 52,
    lineHeight: 58,
    fontWeight: '800',
    letterSpacing: -2,
    marginBottom: 24,
  },

  body: {
    fontSize: 15,
    lineHeight: 24,
    maxWidth: 320,
    letterSpacing: 0.1,
  },

  spacer: { flex: 1 },

  bottom: {},

  segments: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
  },
  segWrap: { flex: 1 },
  seg: {
    height: 3,
    borderRadius: 1.5,
  },

  btn: {
    height: 56,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0A0A0A',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});
