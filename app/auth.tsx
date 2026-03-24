import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ON_TINT = '#111111';

function formatPhoneDisplay(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 12);
  if (d.length === 0) return '';
  const head = d.slice(0, Math.min(3, d.length));
  const rest = d.slice(3);
  const pairs = rest.match(/.{1,2}/g) ?? [];
  return [head, ...pairs].join(' ');
}

export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [phoneDigits, setPhoneDigits] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const bg = theme.background;
  const pageTint = theme.tint;
  const cardBg = isDark ? 'rgba(20,22,26,0.86)' : 'rgba(255,255,255,0.92)';
  const cardBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';
  const subtleText = isDark ? 'rgba(236,237,238,0.50)' : 'rgba(17,24,28,0.45)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const fieldBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
  const statusH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  const phoneOk = useMemo(() => {
    const n = phoneDigits.replace(/\D/g, '');
    return n.length >= 9;
  }, [phoneDigits]);

  const passwordOk = useMemo(() => /^\d{8,}$/.test(password), [password]);

  const canSubmit = phoneOk && passwordOk;

  const phoneDisplay = useMemo(() => formatPhoneDisplay(phoneDigits), [phoneDigits]);

  const onSubmit = useCallback(() => {
    if (!canSubmit) return;
    router.push('/(tabs)');
  }, [canSubmit, router]);

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View pointerEvents="none" style={styles.decor}>
        <View
          style={[
            styles.decorLine1,
            { backgroundColor: pageTint, opacity: isDark ? 0.2 : 0.16, top: statusH + 6 },
          ]}
        />
        <View
          style={[
            styles.decorLine2,
            {
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              top: statusH + 34,
            },
          ]}
        />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: statusH + 28, paddingBottom: Math.max(insets.bottom + 16, 28) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleBlock}>
            <ThemedText
              style={[
                styles.tag,
                { color: isDark ? 'rgba(255,205,0,0.6)' : 'rgba(212,175,55,0.7)' },
              ]}
            >
              Santu
            </ThemedText>

            <ThemedText style={[styles.title, { color: theme.text }]}>Connexion</ThemedText>
          </View>

          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <ThemedText style={[styles.fieldLabel, { color: subtleText }]}>NUMÉRO DE TÉLÉPHONE</ThemedText>
            <View style={[styles.inputShell, { backgroundColor: fieldBg, borderColor: fieldBorder }]}>
              <MaterialIcons name="phone-iphone" size={22} color={subtleText} style={styles.inputIcon} />
              <TextInput
                value={phoneDisplay}
                onChangeText={(t) => setPhoneDigits(t.replace(/\D/g, '').slice(0, 12))}
                placeholder="+224 621 00 00 00"
                placeholderTextColor={subtleText}
                keyboardType="phone-pad"
                style={[styles.input, { color: theme.text }]}
                autoComplete="tel"
                textContentType="telephoneNumber"
              />
            </View>

            <ThemedText style={[styles.fieldLabel, { color: subtleText }]}>MOT DE PASSE</ThemedText>
            <View style={[styles.inputShell, { backgroundColor: fieldBg, borderColor: fieldBorder }]}>
              <MaterialIcons name="dialpad" size={22} color={subtleText} style={styles.inputIcon} />
              <TextInput
                value={password}
                onChangeText={(t) => setPassword(t.replace(/\D/g, '').slice(0, 8))}
                placeholder="6 chiffres minimum"
                placeholderTextColor={subtleText}
                keyboardType="number-pad"
                style={[styles.input, { color: theme.text }]}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
              <Pressable
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={12}
                accessibilityLabel={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={22}
                  color={subtleText}
                />
              </Pressable>
            </View>

            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: canSubmit ? pageTint : fieldBg,
                  opacity: pressed && canSubmit ? 0.92 : 1,
                },
              ]}
            >
              <MaterialIcons name="arrow-forward" size={22} color={canSubmit ? ON_TINT : subtleText} />
              <ThemedText style={[styles.primaryBtnText, { color: canSubmit ? ON_TINT : subtleText }]}>
                Continuer
              </ThemedText>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flex: {
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  titleBlock: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 430,
    marginBottom: 8,
  },
  tag: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 16,
    lineHeight: 16,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.1,
    paddingHorizontal: 8,
  },
  card: {
    width: '100%',
    maxWidth: 430,
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 26,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
    marginTop: 22,
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.8,
    marginBottom: -4,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth * 2,
    paddingHorizontal: 14,
    minHeight: 54,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.85,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 12,
    letterSpacing: -0.2,
  },
  primaryBtn: {
    minHeight: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 4,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
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
    maxWidth: 400,
    paddingHorizontal: 8,
  },
});
