import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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

import { IconTextField } from '@/components/publish/icon-text-field';
import { ThemedText } from '@/components/shared/themed-text';
import UploadFile from '@/components/shared/upload-file';
import type { AuthUser } from '@/hooks/use-auth';
import { useAuth } from '@/hooks/use-auth';
import { resolveProfileImageUri } from '@/libs/profile';
import { updateProfileWithAvatarApi } from '@/services/profile.service';

const ACCENT = '#0077B6';

const PALETTE = {
  canvas: '#F2F4F7',
  card: '#FFFFFF',
  text: '#11181C',
  muted: '#687076',
  faint: '#9BA1A6',
  divider: 'rgba(0,0,0,0.06)',
  chip: 'rgba(0,119,182,0.08)',
  btnDisabled: '#D8DCE3',
  btnDisabledText: '#9BA1A6',
  error: '#E82127',
} as const;

const FR_COUNTRY_CODE = '+33';
const FR_NATIONAL_LENGTH = 9;
const DEFAULT_CITY = 'Marseille';

const AUTH_STEPS = ['phone', 'otp', 'profile'] as const;
type AuthStep = (typeof AUTH_STEPS)[number];

const STEP_META: Record<AuthStep, { title: string; subtitle: string }> = {
  phone: {
    title: 'Bienvenue',
    subtitle: 'Entrez votre numéro pour recevoir un code de connexion par SMS.',
  },
  otp: {
    title: 'Vérifiez votre numéro',
    subtitle: 'Saisissez le code à 6 chiffres envoyé sur votre téléphone.',
  },
  profile: {
    title: 'Votre profil',
    subtitle:
      'Ajoutez une photo et quelques informations pour rejoindre le réseau entrepreneurial marseillais.',
  },
};

type PendingAuth = {
  accessToken: string;
  user: AuthUser;
};

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

function needsProfileSetup(user: AuthUser): boolean {
  if ((user.onboardingStep ?? 0) >= 1) return false;
  if (user.firstName?.trim() && user.lastName?.trim() && user.jobTitle?.trim()) {
    return false;
  }
  return true;
}

export default function AuthScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isReady, isAuthenticated, signIn } = useAuth();

  const [step, setStep] = useState<AuthStep>('phone');
  const [phoneE164, setPhoneE164] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [city, setCity] = useState(DEFAULT_CITY);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(null);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const t = PALETTE;
  const fieldBg = t.canvas;
  const statusH = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : insets.top;
  const stepIndex = AUTH_STEPS.indexOf(step);

  const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiBaseUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not set');
  }

  const phoneOk = useMemo(() => isValidFrenchPhone(phoneE164), [phoneE164]);
  const otpOk = useMemo(() => /^\d{6,8}$/.test(otpCode), [otpCode]);

  const canContinuePhone = phoneOk && !isRequestingOtp;
  const canSubmitOtp = otpOk && !isVerifyingOtp;
  const canSubmitProfile =
    Boolean(avatarUri?.trim()) &&
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    jobTitle.trim().length > 0 &&
    city.trim().length > 0 &&
    !isSavingProfile;

  const phoneDisplay = useMemo(() => formatFrenchPhoneDisplay(phoneE164), [phoneE164]);
  const phoneNationalInput = useMemo(() => formatFrenchNationalInput(phoneE164), [phoneE164]);
  const meta = STEP_META[step];

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

      if (needsProfileSetup(data.user)) {
        setPendingAuth({ accessToken: data.accessToken, user: data.user });
        setFirstName(data.user.firstName?.trim() ?? '');
        setLastName(data.user.lastName?.trim() ?? '');
        setJobTitle(data.user.jobTitle?.trim() ?? '');
        setCompany(data.user.company?.trim() ?? '');
        setCity(data.user.city?.trim() || DEFAULT_CITY);
        setAvatarUri(resolveProfileImageUri(data.user.profilePicture));
        setAuthError(null);
        setStep('profile');
        return;
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
    setPendingAuth(null);
    setAuthError(null);
  }, []);

  const goBackToOtp = useCallback(() => {
    setStep('otp');
    setPendingAuth(null);
    setAuthError(null);
  }, []);

  const onSubmitProfile = useCallback(async () => {
    if (!canSubmitProfile || !pendingAuth) return;
    setAuthError(null);
    setIsSavingProfile(true);
    try {
      await updateProfileWithAvatarApi(
        pendingAuth.accessToken,
        {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          jobTitle: jobTitle.trim(),
          company: company.trim() || null,
          city: city.trim() || DEFAULT_CITY,
          onboardingStep: 1,
        },
        avatarUri,
      );
      await signIn(pendingAuth.accessToken, pendingAuth.user);
      setPendingAuth(null);
      router.replace('/(tabs)');
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Impossible d’enregistrer votre profil.');
    } finally {
      setIsSavingProfile(false);
    }
  }, [
    avatarUri,
    canSubmitProfile,
    city,
    company,
    firstName,
    jobTitle,
    lastName,
    pendingAuth,
    router,
    signIn,
  ]);

  if (!isReady) {
    return null;
  }
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.root, { backgroundColor: t.canvas }]}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="dark-content"
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingTop: Math.max(statusH + 16, 24),
              paddingBottom: Math.max(insets.bottom + 16, 24),
            },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <ThemedText style={[styles.kicker, { color: ACCENT }]}>SANTU CONNECT</ThemedText>
            <ThemedText style={[styles.title, { color: t.text }]}>{meta.title}</ThemedText>
            <ThemedText style={[styles.subtitle, { color: t.muted }]}>{meta.subtitle}</ThemedText>

            <View style={styles.stepRow}>
              {AUTH_STEPS.map((id, index) => (
                <View
                  key={id}
                  style={[
                    styles.stepDot,
                    {
                      backgroundColor:
                        index <= stepIndex ? ACCENT : 'rgba(0,0,0,0.08)',
                      flex: index <= stepIndex ? 1.4 : 1,
                    },
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: t.card, borderColor: t.divider }]}>
            {step === 'phone' && (
              <>
                <View style={styles.fieldGroup}>
                  <ThemedText style={[styles.fieldLabel, { color: t.muted }]}>
                    Numéro de mobile
                  </ThemedText>
                  <View style={[styles.inputShell, { backgroundColor: t.canvas, borderColor: t.divider }]}>
                    <View style={[styles.prefixBadge, { backgroundColor: t.chip }]}>
                      <MaterialIcons name="phone-iphone" size={16} color={ACCENT} />
                      <ThemedText style={[styles.prefixText, { color: t.text }]}>
                        {FR_COUNTRY_CODE}
                      </ThemedText>
                    </View>
                    <TextInput
                      value={phoneNationalInput}
                      onChangeText={(txt) => {
                        setPhoneE164(normalizeFrenchPhone(txt));
                        setAuthError(null);
                      }}
                      placeholder="6 12 34 56 78"
                      placeholderTextColor={t.faint}
                      keyboardType="phone-pad"
                      style={[styles.input, { color: t.text }]}
                      autoComplete="tel"
                      textContentType="telephoneNumber"
                      maxLength={14}
                    />
                  </View>
                  <ThemedText style={[styles.hint, { color: t.faint }]}>
                    Numéro français à 9 chiffres, sans le 0 initial.
                  </ThemedText>
                </View>

                {authError ? (
                  <View style={[styles.errorBanner, { backgroundColor: `${t.error}14` }]}>
                    <MaterialIcons name="error-outline" size={16} color={t.error} />
                    <ThemedText style={[styles.errorText, { color: t.error }]}>{authError}</ThemedText>
                  </View>
                ) : null}

                <Pressable
                  onPress={onContinuePhone}
                  disabled={!canContinuePhone}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: canContinuePhone ? ACCENT : t.btnDisabled,
                      opacity: pressed && canContinuePhone ? 0.9 : 1,
                    },
                  ]}
                >
                  {isRequestingOtp ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <ThemedText style={[styles.primaryBtnText, { color: '#FFFFFF' }]}>
                        Recevoir mon code
                      </ThemedText>
                      <MaterialIcons name="arrow-forward" size={18} color="#FFFFFF" />
                    </>
                  )}
                </Pressable>
              </>
            )}

            {step === 'otp' && (
              <>
                <Pressable onPress={goBackToPhone} hitSlop={12} style={styles.backRow}>
                  <MaterialIcons name="arrow-back" size={18} color={t.muted} />
                  <ThemedText style={[styles.backText, { color: t.muted }]}>
                    Changer de numéro
                  </ThemedText>
                </Pressable>

                <View style={[styles.phoneChip, { backgroundColor: t.chip, borderColor: `${ACCENT}33` }]}>
                  <MaterialIcons name="sms" size={16} color={ACCENT} />
                  <ThemedText style={[styles.phoneChipText, { color: t.text }]}>
                    Code envoyé au {phoneDisplay || '—'}
                  </ThemedText>
                </View>

                <View style={styles.fieldGroup}>
                  <ThemedText style={[styles.fieldLabel, { color: t.muted }]}>Code de vérification</ThemedText>
                  <View style={[styles.otpShell, { backgroundColor: t.canvas, borderColor: t.divider }]}>
                    <TextInput
                      value={otpCode}
                      onChangeText={(txt) => {
                        setOtpCode(txt.replace(/\D/g, '').slice(0, 8));
                        setAuthError(null);
                      }}
                      placeholder="• • • • • •"
                      placeholderTextColor={t.faint}
                      keyboardType="number-pad"
                      style={[styles.otpInput, { color: t.text }]}
                      autoComplete="one-time-code"
                      textContentType="oneTimeCode"
                      maxLength={8}
                    />
                  </View>
                </View>

                {authError ? (
                  <View style={[styles.errorBanner, { backgroundColor: `${t.error}14` }]}>
                    <MaterialIcons name="error-outline" size={16} color={t.error} />
                    <ThemedText style={[styles.errorText, { color: t.error }]}>{authError}</ThemedText>
                  </View>
                ) : null}

                <Pressable
                  onPress={onSubmitOtp}
                  disabled={!canSubmitOtp}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: canSubmitOtp ? ACCENT : t.btnDisabled,
                      opacity: pressed && canSubmitOtp ? 0.9 : 1,
                    },
                  ]}
                >
                  {isVerifyingOtp ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <ThemedText
                        style={[
                          styles.primaryBtnText,
                          { color: canSubmitOtp ? '#FFFFFF' : t.btnDisabledText },
                        ]}
                      >
                        Se connecter
                      </ThemedText>
                      <MaterialIcons
                        name="login"
                        size={18}
                        color={canSubmitOtp ? '#FFFFFF' : t.btnDisabledText}
                      />
                    </>
                  )}
                </Pressable>

                <Pressable
                  onPress={onContinuePhone}
                  disabled={isRequestingOtp}
                  style={styles.resendBtn}
                >
                  <ThemedText style={[styles.resendText, { color: isRequestingOtp ? t.faint : ACCENT }]}>
                    {isRequestingOtp ? 'Renvoi en cours…' : 'Renvoyer le code'}
                  </ThemedText>
                </Pressable>
              </>
            )}

            {step === 'profile' && (
              <>
                <Pressable onPress={goBackToOtp} hitSlop={12} style={styles.backRow}>
                  <MaterialIcons name="arrow-back" size={18} color={t.muted} />
                  <ThemedText style={[styles.backText, { color: t.muted }]}>
                    Retour au code
                  </ThemedText>
                </Pressable>

                <UploadFile
                  label="Photo de profil"
                  value={avatarUri}
                  onChange={(uri) => {
                    setAvatarUri(uri);
                    setAuthError(null);
                  }}
                  variant="avatar"
                  hint="Ajoutez une photo pour apparaître dans l’annuaire"
                  themeMuted={t.muted}
                  fieldBg={fieldBg}
                  borderColor={t.divider}
                  tint={ACCENT}
                  compact
                />

                <IconTextField
                  label="Prénom"
                  value={firstName}
                  onChangeText={(txt) => {
                    setFirstName(txt);
                    setAuthError(null);
                  }}
                  placeholder="Votre prénom"
                  icon="person"
                  themeText={t.text}
                  themeMuted={t.muted}
                  fieldBg={fieldBg}
                  borderColor={t.divider}
                  autoCapitalize="words"
                />
                <IconTextField
                  label="Nom"
                  value={lastName}
                  onChangeText={(txt) => {
                    setLastName(txt);
                    setAuthError(null);
                  }}
                  placeholder="Votre nom"
                  icon="badge"
                  themeText={t.text}
                  themeMuted={t.muted}
                  fieldBg={fieldBg}
                  borderColor={t.divider}
                  autoCapitalize="words"
                />
                <IconTextField
                  label="Poste"
                  value={jobTitle}
                  onChangeText={(txt) => {
                    setJobTitle(txt);
                    setAuthError(null);
                  }}
                  placeholder="Ex. Fondateur, CEO…"
                  icon="work"
                  themeText={t.text}
                  themeMuted={t.muted}
                  fieldBg={fieldBg}
                  borderColor={t.divider}
                  autoCapitalize="words"
                />
                <IconTextField
                  label="Entreprise ou société"
                  value={company}
                  onChangeText={(txt) => {
                    setCompany(txt);
                    setAuthError(null);
                  }}
                  placeholder="Nom de votre structure"
                  icon="business"
                  themeText={t.text}
                  themeMuted={t.muted}
                  fieldBg={fieldBg}
                  borderColor={t.divider}
                  autoCapitalize="words"
                />
                <IconTextField
                  label="Ville"
                  value={city}
                  onChangeText={(txt) => {
                    setCity(txt);
                    setAuthError(null);
                  }}
                  placeholder={DEFAULT_CITY}
                  icon="location-city"
                  themeText={t.text}
                  themeMuted={t.muted}
                  fieldBg={fieldBg}
                  borderColor={t.divider}
                  autoCapitalize="words"
                />

                {authError ? (
                  <View style={[styles.errorBanner, { backgroundColor: `${t.error}14` }]}>
                    <MaterialIcons name="error-outline" size={16} color={t.error} />
                    <ThemedText style={[styles.errorText, { color: t.error }]}>{authError}</ThemedText>
                  </View>
                ) : null}

                <Pressable
                  onPress={() => void onSubmitProfile()}
                  disabled={!canSubmitProfile}
                  style={({ pressed }) => [
                    styles.primaryBtn,
                    {
                      backgroundColor: canSubmitProfile ? ACCENT : t.btnDisabled,
                      opacity: pressed && canSubmitProfile ? 0.9 : 1,
                    },
                  ]}
                >
                  {isSavingProfile ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <>
                      <ThemedText
                        style={[
                          styles.primaryBtnText,
                          { color: canSubmitProfile ? '#FFFFFF' : t.btnDisabledText },
                        ]}
                      >
                        Rejoindre le réseau
                      </ThemedText>
                      <MaterialIcons
                        name="arrow-forward"
                        size={18}
                        color={canSubmitProfile ? '#FFFFFF' : t.btnDisabledText}
                      />
                    </>
                  )}
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.footer}>
            <MaterialIcons name="lock-outline" size={14} color={t.faint} />
            <ThemedText style={[styles.footerText, { color: t.faint }]}>
              Connexion sécurisée
            </ThemedText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 20,
  },
  hero: {
    alignItems: 'flex-start',
    gap: 8,
  },
  kicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 340,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 6,
    width: '100%',
    marginTop: 8,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 16,
  },
  fieldGroup: { gap: 8 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    minHeight: 54,
    gap: 10,
  },
  prefixBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  prefixText: {
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600',
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  otpShell: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 58,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  otpInput: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 10,
    textAlign: 'center',
    paddingVertical: 10,
  },
  primaryBtn: {
    minHeight: 52,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 13,
    fontWeight: '600',
  },
  phoneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  phoneChipText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  resendBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  resendText: {
    fontSize: 13,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  footerText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
