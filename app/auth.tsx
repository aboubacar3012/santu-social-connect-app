import FontAwesome from '@expo/vector-icons/FontAwesome';
import React from 'react';
import { Platform, Pressable, StatusBar, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';

function SocialButton({
  label,
  icon,
  backgroundColor,
  textColor,
  borderColor,
  iconBg,
  iconBorder,
  onPress,
}: {
  label: string;
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  iconBg: string;
  iconBorder: string;
  onPress?: () => void;
}) {

  return (
    <Pressable
      style={({ pressed }) => [
        styles.socialBtn,
        { backgroundColor, borderColor: borderColor ?? 'transparent' },
        pressed ? { transform: [{ scale: 0.99 }], opacity: 0.96 } : null,
      ]}
      onPress={onPress}
    >
      <View style={[styles.socialIconWrap, { backgroundColor: iconBg, borderColor: iconBorder }]}>
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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const onPress = () => {
    router.push('/(tabs)');
  };
  const bg = theme.background;
  const pageTint = theme.tint;
  const cardBg = isDark ? 'rgba(20,22,26,0.86)' : 'rgba(255,255,255,0.92)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const subtleText = isDark ? 'rgba(236,237,238,0.50)' : 'rgba(17,24,28,0.45)';
  const iconBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const iconBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const statusH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Décor linéaire (sans cercles) */}
      <View pointerEvents="none" style={styles.decor}>
        <View style={[styles.decorLine1, { backgroundColor: pageTint, opacity: isDark ? 0.20 : 0.16, top: statusH + 6 }]} />
        <View style={[styles.decorLine2, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)', top: statusH + 34 }]} />
      </View>

      {/* Contenu */}
      <View style={[styles.content, { paddingTop: statusH + 34 }]}>
        <View style={styles.titleBlock}>
          <ThemedText style={[styles.tag, { color: isDark ? 'rgba(255,205,0,0.60)' : 'rgba(212,175,55,0.70)' }]}>
            Santu
          </ThemedText>
          <ThemedText style={[styles.title, { color: theme.text }]}>Authentification</ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtleText }]}>
            Connectez-vous pour commencer à voyager en Guinée.
          </ThemedText>
        </View>

        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <SocialButton
            label="Continuer avec Facebook"
            icon="facebook"
            backgroundColor="#1877F2"
            textColor="#FFFFFF"
            iconBg={iconBg}
            iconBorder={iconBorder}
            onPress={onPress}
          />
          <SocialButton
            label="Continuer avec Google"
            icon="google"
            backgroundColor={isDark ? '#1C1C1F' : '#FFFFFF'}
            textColor={isDark ? '#FFFFFF' : '#1F2937'}
            borderColor={isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)'}
            iconBg={iconBg}
            iconBorder={iconBorder}
            onPress={onPress}
          />
          <SocialButton
            label="Continuer avec Apple"
            icon="apple"
            backgroundColor={isDark ? '#FFFFFF' : '#0A0A0A'}
            textColor={isDark ? '#0A0A0A' : '#FFFFFF'}
            iconBg={iconBg}
            iconBorder={iconBorder}
            onPress={onPress}
          />
        </View>

        {/* Séparateur accent */}
        <View style={[styles.accentLine, { backgroundColor: pageTint, opacity: isDark ? 0.30 : 0.35 }]} />

        {/* Légal */}
        <ThemedText style={[styles.legal, { color: subtleText, paddingBottom: Math.max(insets.bottom + 8, 28) }]}>
          En continuant, vous acceptez nos conditions d&apos;utilisation et notre politique de confidentialité.
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },

  decor: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
    height: '100%',
  },
  decorLine1: {
    position: 'absolute',
    left: -40,
    width: 120,
    height: 10,
    borderRadius: 999,
    transform: [{ rotate: '-14deg' }],
  },
  decorLine2: {
    position: 'absolute',
    right: -40,
    width: 160,
    height: 1,
    transform: [{ rotate: '-14deg' }],
  },

  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  titleBlock: { alignItems: 'center' },
  tag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 12,
    lineHeight: 16,
  },

  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -0.9,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  /* Carte */
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    marginVertical: 18,
  },
  socialBtn: {
    minHeight: 58,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    paddingHorizontal: 14,
  },
  socialIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  socialBtnText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    letterSpacing: 0.1,
  },

  accentLine: {
    width: 40,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },

  legal: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
