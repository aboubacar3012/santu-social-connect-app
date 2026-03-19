import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function SocialButton({
  label,
  icon,
  backgroundColor,
  textColor,
  borderColor,
}: {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
}) {
  return (
    <Pressable style={[styles.socialBtn, { backgroundColor, borderColor }]}>
      <View style={styles.socialIconWrap}>
        <FontAwesome name={icon} size={20} color={textColor} />
      </View>
      <ThemedText style={[styles.socialBtnText, { color: textColor }]}>{label}</ThemedText>
    </Pressable>
  );
}

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const pageBg = isDark ? '#0D0F12' : '#F3F6FA';
  const cardBg = isDark ? '#171A1F' : '#FFFFFF';
  const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const subtleText = isDark ? 'rgba(236,237,238,0.72)' : 'rgba(17,24,28,0.66)';
  const heroBubble = isDark ? 'rgba(184,134,11,0.22)' : 'rgba(184,134,11,0.12)';

  return (
    <SafeScrollView centerContent screenBackgroundColor={pageBg}>
      <View style={styles.wrap}>
        <View style={[styles.heroBubble, { backgroundColor: heroBubble }]} />
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <ThemedText style={[styles.title, { color: theme.text }]}>Authentification</ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtleText }]}>
            Choisissez votre méthode de connexion.
          </ThemedText>

          <View style={styles.buttonsCol}>
            <SocialButton
              label="Continuer avec Facebook"
              icon="facebook"
              backgroundColor="#1877F2"
              textColor="#FFFFFF"
            />
            <SocialButton
              label="Continuer avec Google"
              icon="google"
              backgroundColor={isDark ? '#23262B' : '#FFFFFF'}
              textColor={isDark ? '#FFFFFF' : '#1F2937'}
              borderColor={isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)'}
            />
            <SocialButton
              label="Continuer avec Apple"
              icon="apple"
              backgroundColor={isDark ? '#FFFFFF' : '#111111'}
              textColor={isDark ? '#111111' : '#FFFFFF'}
            />
          </View>

          <ThemedText style={[styles.legal, { color: subtleText }]}>
            En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de
            confidentialité.
          </ThemedText>
        </View>
      </View>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 430,
    alignSelf: 'center',
    gap: 16,
    position: 'relative',
  },
  heroBubble: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -70,
    right: -50,
  },
  card: {
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
    gap: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  buttonsCol: {
    gap: 10,
    marginVertical: 4,
  },
  socialBtn: {
    minHeight: 58,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
  },
  socialIconWrap: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
  },
  socialBtnText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700',
  },
  legal: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
});
