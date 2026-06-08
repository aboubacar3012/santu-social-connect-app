import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useRouter } from 'expo-router';
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

import { ThemedText } from '@/components/shared/themed-text';
import type { AuthUser } from '@/hooks/use-auth';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Palette inspirée de l’UI Tesla : neutres, contraste net, peu d’ornements. */
const TESLA = {
  light: {
    canvas: '#F2F2F2',
    surface: '#FFFFFF',
    ink: '#171A20',
    inkMuted: '#5C5E62',
    inkFaint: '#8E8E8E',
    divider: 'rgba(0,0,0,0.08)',
    btnOn: '#FFFFFF',
    btnDisabled: '#D0D1D2',
    btnDisabledText: '#8E8E8E',
    error: '#E82127',
  },
  dark: {
    canvas: '#000000',
    surface: '#1A1A1A',
    ink: '#F4F4F4',
    inkMuted: '#A2A3A5',
    inkFaint: '#737373',
    divider: 'rgba(255,255,255,0.12)',
    btnOn: '#171A20',
    btnDisabled: '#2A2A2A',
    btnDisabledText: '#737373',
    error: '#FF4D4D',
  },
} as const;

const FR_COUNTRY_CODE = '+33';
const FR_NATIONAL_LENGTH = 9;

function normalizeFrenchPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('33')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  digits = digits.slice(0, FR_NATIONAL_LENGTH);
  return digits ? `${FR_COUNTRY_CODE}${digits}` : '';
}

function formatFrenchPhoneDisplay(e164: string): string {
  const national = e164.replace(/^\+33/, '');
  if (!national) return '';
  const pairs = national.slice(1).match(/.{1,2}/g) ?? [];
  return `${FR_COUNTRY_CODE} ${national[0]}${pairs.length ? ` ${pairs.join(' ')}` : ''}`.trim();
}

function formatFrenchNationalInput(e164: string): string {
  const national = e164.replace(/^\+33/, '');
  if (!national) return '';
  const pairs = national.slice(1).match(/.{1,2}/g) ?? [];
  return [national[0], ...pairs].join(' ');
}

function isValidFrenchPhone(e164: string): boolean {
  return /^\+33[1-9]\d{8}$/.test(e164);
}
export default function AuthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isReady, isAuthenticated, signIn } = useAuth();

  type AuthStep = 'phone' | 'otp';

  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneE164, setPhoneE164] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const t = isDark ? TESLA.dark : TESLA.light;
  const bg = t.canvas;
  const cardBg = t.surface;
  const cardBorder = t.divider;
  const subtleText = t.inkFaint;
  const mutedText = t.inkMuted;
  const fieldBg = t.surface;
  const fieldBorder = t.divider;
  const primaryBtnBg = t.ink;
  const primaryBtnFg = isDark ? t.surface : t.btnOn;
  const statusH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL
  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not set');
  }

  const phoneOk = useMemo(() => isValidFrenchPhone(phoneE164), [phoneE164]);

  const otpOk = useMemo(() => /^\d{6,8}$/.test(otpCode), [otpCode]);

  const canContinuePhone = phoneOk && !isRequestingOtp;
  const canSubmitOtp = otpOk && !isVerifyingOtp;

  const phoneDisplay = useMemo(() => formatFrenchPhoneDisplay(phoneE164), [phoneE164]);
  const phoneNationalInput = useMemo(() => formatFrenchNationalInput(phoneE164), [phoneE164]);

  // Ici on demande un OTP au backend pour la validation du numéro de téléphone
  const onContinuePhone = useCallback(async () => {
    if (!phoneOk || isRequestingOtp) return;
    setAuthError(null);
    setIsRequestingOtp(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/phone/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneE164 }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Erreur (${res.status})`);
      }
      setOtpCode('');
      setStep('otp');
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Erreur lors de l’envoi du code.');
    } finally {
      setIsRequestingOtp(false);
    }
  }, [apiBaseUrl, phoneE164, phoneOk, isRequestingOtp]);

  // Ici on vérifie le OTP et on récupère le JWT
  const onSubmitOtp = useCallback(async () => {
    if (!otpOk || isVerifyingOtp) return;
    setAuthError(null);
    setIsVerifyingOtp(true);
    try {
      const res = await fetch(`${apiBaseUrl}/auth/phone/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneE164, code: otpCode }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `Erreur (${res.status})`);
      }
      const data = (await res.json().catch(() => ({}))) as {
        accessToken?: string;
        user?: AuthUser;
      };
      if (!data?.accessToken || !data?.user) {
        throw new Error('Réponse invalide (token ou utilisateur manquant).');
      }
      await signIn(data.accessToken, data.user);
      setAuthError(null);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Code invalide.');
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [apiBaseUrl, otpCode, otpOk, phoneE164, isVerifyingOtp, router, signIn]);

  const goBackToPhone = useCallback(() => {
    setStep('phone');
    setOtpCode('');
    setAuthError(null);
  }, []);

  if (!isReady) {
    return null;
  }
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: bg }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle={isDark ? 'light-content' : 'dark-content'} />

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
            <ThemedText style={[styles.tag, { color: mutedText }]}>Santu</ThemedText>

            <ThemedText style={[styles.title, { color: t.ink }]}>
              {step === 'phone' ? 'Connexion' : 'Code de vérification'}
            </ThemedText>
            <View style={[styles.titleUnderline, { backgroundColor: cardBorder }]} />
          </View>

          <View
            style={[
              styles.card,
              { backgroundColor: cardBg, borderColor: cardBorder },
              !isDark && styles.cardShadowLight,
            ]}
          >
            {step === 'phone' && (
              <>
                <ThemedText style={[styles.fieldLabel, { color: subtleText }]}>NUMÉRO FRANÇAIS</ThemedText>
                <View style={[styles.inputShell, { backgroundColor: fieldBg, borderColor: fieldBorder }]}>
                  <MaterialIcons name="phone-iphone" size={22} color={subtleText} style={styles.inputIcon} />
                  <ThemedText style={[styles.countryPrefix, { color: t.ink }]}>{FR_COUNTRY_CODE}</ThemedText>
                  <View style={[styles.prefixDivider, { backgroundColor: fieldBorder }]} />
                  <TextInput
                    value={phoneNationalInput}
                    onChangeText={(txt) => {
                      setPhoneE164(normalizeFrenchPhone(txt));
                      setAuthError(null);
                    }}
                    placeholder="6 12 34 56 78"
                    placeholderTextColor={subtleText}
                    keyboardType="phone-pad"
                    style={[styles.input, { color: t.ink }]}
                    autoComplete="tel"
                    textContentType="telephoneNumber"
                    maxLength={14}
                  />
                </View>
                <Pressable
                  onPress={onContinuePhone}
                  disabled={!canContinuePhone}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: canContinuePhone ? primaryBtnBg : t.btnDisabled,
                      opacity: pressed && canContinuePhone ? 0.88 : 1,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={isRequestingOtp ? 'hourglass-top' : 'arrow-forward'}
                    size={20}
                    color={canContinuePhone ? primaryBtnFg : t.btnDisabledText}
                  />
                  <ThemedText
                    style={[
                      styles.primaryBtnText,
                      { color: canContinuePhone ? primaryBtnFg : t.btnDisabledText },
                    ]}
                  >
                    {isRequestingOtp ? 'Envoi…' : 'Recevoir un code'}
                  </ThemedText>
                </Pressable>
                {authError ? (
                  <ThemedText style={[styles.errorText, { color: t.error }]}>{authError}</ThemedText>
                ) : null}
              </>
            )}

            {step === 'otp' && (
              <>
                <Pressable onPress={goBackToPhone} hitSlop={12} style={styles.backRow}>
                  <MaterialIcons name="arrow-back-ios-new" size={18} color={mutedText} />
                  <ThemedText style={[styles.backText, { color: mutedText }]}>Modifier le numéro</ThemedText>
                </Pressable>
                <ThemedText style={[styles.phoneSummary, { color: t.ink }]}>{phoneDisplay || '—'}</ThemedText>

                <ThemedText style={[styles.fieldLabel, { color: subtleText }]}>CODE (SMS)</ThemedText>
                <View style={[styles.inputShell, { backgroundColor: fieldBg, borderColor: fieldBorder }]}>
                  <MaterialIcons name="dialpad" size={20} color={subtleText} style={styles.inputIcon} />
                  <TextInput
                    value={otpCode}
                    onChangeText={(txt) => {
                      setOtpCode(txt.replace(/\D/g, '').slice(0, 10));
                      setAuthError(null);
                    }}
                    placeholder="Entrez le code reçu"
                    placeholderTextColor={subtleText}
                    keyboardType="number-pad"
                    style={[styles.input, { color: t.ink }]}
                    secureTextEntry={false}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="one-time-code"
                    textContentType="oneTimeCode"
                  />
                </View>

                {authError ? (
                  <ThemedText style={[styles.errorText, { color: t.error }]}>{authError}</ThemedText>
                ) : null}

                <Pressable
                  onPress={onSubmitOtp}
                  disabled={!canSubmitOtp}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: canSubmitOtp ? primaryBtnBg : t.btnDisabled,
                      opacity: pressed && canSubmitOtp ? 0.88 : 1,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={isVerifyingOtp ? 'hourglass-top' : 'login'}
                    size={20}
                    color={canSubmitOtp ? primaryBtnFg : t.btnDisabledText}
                  />
                  <ThemedText
                    style={[styles.primaryBtnText, { color: canSubmitOtp ? primaryBtnFg : t.btnDisabledText }]}
                  >
                    {isVerifyingOtp ? 'Vérification…' : 'Valider'}
                  </ThemedText>
                </Pressable>
              </>
            )}
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'stretch',
    zIndex: 5,
  },
  titleBlock: {
    alignItems: 'flex-start',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    marginBottom: 4,
  },
  tag: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    lineHeight: 14,
  },
  title: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '300',
    letterSpacing: -1.2,
    textAlign: 'left',
    marginBottom: 12,
  },
  titleUnderline: {
    width: 36,
    height: 2,
    borderRadius: 1,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    letterSpacing: 0.1,
    paddingHorizontal: 8,
  },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 430,
    borderRadius: 8,
    padding: 20,
    paddingTop: 22,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  cardShadowLight: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 2.2,
    marginBottom: -2,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.85,
  },
  countryPrefix: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginRight: 10,
  },
  prefixDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 12,
    marginRight: 12,
  },
  hintText: {
    fontSize: 12,
    lineHeight: 17,
    letterSpacing: 0.1,
    marginTop: -8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
    letterSpacing: 0.2,
  },
  primaryBtn: {
    minHeight: 50,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: -2,
    alignSelf: 'flex-start',
    paddingVertical: 2,
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  phoneSummary: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '600',
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

