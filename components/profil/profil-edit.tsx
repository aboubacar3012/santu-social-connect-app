import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import {
  DateOfBirthFields,
  Field,
} from '@/components/profil/profil-edit-fields';
import { resolveProfileImageUri } from '@/libs/profile';
import { SectionCard } from '@/components/shared/section-card';
import { SectionKicker } from '@/components/shared/section-kicker';
import UploadFile from '@/components/shared/upload-file';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  buildBirthDateIsoFromFormParts,
  formatApiErrorMessage,
  resolveProfileAssetValueForApi,
  splitBirthDateIsoToFormParts,
} from '@/services/profil-edit.service';
import type { MeApiUser } from '@/types/profile';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

/**
 * Champs alignés sur le modèle Prisma `User` (Santu-api/prisma/schema.prisma).
 * - firstName, lastName, dateOfBirth (jour / mois / année → API), profilePicture
 * - email (éditable) — le téléphone est défini à l’inscription / auth, non affiché ici
 * - identityVerificationDocumentFront | Back | Selfie
 */

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';


type ProfilEditProps = {
  onCancel: () => void;
  onSave: () => void;
};

/** Édition du profil — champs calqués sur `User` (Prisma). */
export default function ProfilEdit({ onCancel, onSave }: ProfilEditProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';

  const { token, user: authUser, isReady } = useAuth();

  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /* Identité */
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  /* Contact */
  const [email, setEmail] = useState('');

  /* Pièces d’identité */
  const [identityVerificationDocumentFront, setIdentityVerificationDocumentFront] = useState<string | null>(null);
  const [identityVerificationDocumentBack, setIdentityVerificationDocumentBack] = useState<string | null>(null);
  const [identityVerificationDocumentSelfie, setIdentityVerificationDocumentSelfie] = useState<string | null>(null);

  const applyMeToForm = useCallback((u: MeApiUser) => {
    setFirstName(u.firstName?.trim() ?? '');
    setLastName(u.lastName?.trim() ?? '');
    const parts = splitBirthDateIsoToFormParts(u.dateOfBirth ?? null);
    setBirthDay(parts.d);
    setBirthMonth(parts.m);
    setBirthYear(parts.y);
    setProfilePicture(resolveProfileImageUri(u.profilePicture ?? null));
    setEmail(u.email?.trim() ?? authUser?.email?.trim() ?? '');
    setIdentityVerificationDocumentFront(
      resolveProfileImageUri(u.identityVerificationDocumentFront ?? null),
    );
    setIdentityVerificationDocumentBack(
      resolveProfileImageUri(u.identityVerificationDocumentBack ?? null),
    );
    setIdentityVerificationDocumentSelfie(
      resolveProfileImageUri(u.identityVerificationDocumentSelfie ?? null),
    );
  }, [authUser?.email]);

  const fetchMe = useCallback(async () => {
    if (!isReady) return;
    if (!token) {
      setLoadError('Session expirée. Reconnectez-vous.');
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      const text = await res.text();
      let body: unknown = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
      if (!res.ok) {
        throw new Error(formatApiErrorMessage(body, text || `Erreur ${res.status}`));
      }
      const u =
        typeof body === 'object' && body !== null && 'user' in body
          ? (body as { user: MeApiUser }).user
          : null;
      if (!u || typeof u !== 'object' || !('id' in u)) {
        throw new Error('Réponse profil invalide.');
      }
      applyMeToForm(u);
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [applyMeToForm, isReady, token]);

  useEffect(() => {
    if (!isReady) return;
    void fetchMe();
  }, [fetchMe, isReady]);

  const isBusy = !isReady || loading;

  const handleSave = useCallback(async () => {
    if (!token || saving) return;
    const iso = buildBirthDateIsoFromFormParts(birthDay, birthMonth, birthYear);
    if (birthDay || birthMonth || birthYear) {
      if (!iso) {
        Alert.alert(
          'Date de naissance',
          'Indiquez un jour, mois et année valides, ou videz les trois champs.',
        );
        return;
      }
    }

    setSaving(true);
    try {
      const [
        profilePicturePayload,
        idFrontPayload,
        idBackPayload,
        idSelfiePayload,
      ] = await Promise.all([
        resolveProfileAssetValueForApi(profilePicture, token),
        resolveProfileAssetValueForApi(identityVerificationDocumentFront, token),
        resolveProfileAssetValueForApi(identityVerificationDocumentBack, token),
        resolveProfileAssetValueForApi(identityVerificationDocumentSelfie, token),
      ]);

      const emailTrim = email.trim();
      const payload: Record<string, unknown> = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: iso,
        email: emailTrim.length ? emailTrim : null,
        profilePicture: profilePicturePayload,
        identityVerificationDocumentFront: idFrontPayload,
        identityVerificationDocumentBack: idBackPayload,
        identityVerificationDocumentSelfie: idSelfiePayload,
      };

      const res = await fetch(`${API_BASE}/users/me`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let body: unknown = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch {
        body = {};
      }
      if (!res.ok) {
        const msg = formatApiErrorMessage(body, text || `Erreur ${res.status}`);
        throw new Error(msg);
      }
      const u =
        typeof body === 'object' && body !== null && 'user' in body
          ? (body as { user: MeApiUser }).user
          : null;
      if (u) {
        applyMeToForm(u);
      }
      onSave();
    } catch (e: unknown) {
      Alert.alert('Enregistrement', e instanceof Error ? e.message : 'Erreur inconnue.');
    } finally {
      setSaving(false);
    }
  }, [
    applyMeToForm,
    birthDay,
    birthMonth,
    birthYear,
    email,
    firstName,
    identityVerificationDocumentBack,
    identityVerificationDocumentFront,
    identityVerificationDocumentSelfie,
    lastName,
    onSave,
    profilePicture,
    saving,
    token,
  ]);

  return (
    <>
      {loadError ? (
        <SectionCard surface={surface} borderColor={borderSubtle}>
          <View style={styles.bannerRow}>
            <MaterialIcons name="error-outline" size={18} color={isDark ? '#FF8A65' : '#D84315'} />
            <ThemedText style={[styles.bannerText, { color: theme.text }]}>{loadError}</ThemedText>
          </View>
          <Pressable
            onPress={() => void fetchMe()}
            style={({ pressed }) => [
              styles.retryBtn,
              { borderColor: borderSubtle, opacity: pressed ? 0.85 : 1 },
            ]}
          >
            <ThemedText style={[styles.retryBtnText, { color: theme.tint }]}>Réessayer</ThemedText>
          </Pressable>
        </SectionCard>
      ) : null}

      {isBusy ? (
        <SectionCard surface={surface} borderColor={borderSubtle}>
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.tint} />
            <ThemedText style={[styles.loadingHint, { color: muted }]}>Chargement du profil…</ThemedText>
          </View>
        </SectionCard>
      ) : (
        <>
          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>IDENTITÉ</SectionKicker>
            </View>
            <View style={styles.twoCols}>
              <View style={styles.col}>
                <Field
                  label="Prénom"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="Prénom"
                  icon="person-outline"
                  themeText={theme.text}
                  themeMuted={muted}
                  fieldBg={fieldBg}
                  borderColor={borderSubtle}
                  autoCapitalize="words"
                />
              </View>
              <View style={styles.col}>
                <Field
                  label="Nom"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Nom"
                  icon="badge"
                  themeText={theme.text}
                  themeMuted={muted}
                  fieldBg={fieldBg}
                  borderColor={borderSubtle}
                  autoCapitalize="words"
                />
              </View>
            </View>
            <View style={styles.fieldSpacer} />
            <DateOfBirthFields
              day={birthDay}
              month={birthMonth}
              year={birthYear}
              onDayChange={setBirthDay}
              onMonthChange={setBirthMonth}
              onYearChange={setBirthYear}
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
            />
            <View style={styles.fieldSpacer} />
            <UploadFile
              label="Photo de profil"
              value={profilePicture}
              onChange={setProfilePicture}
              variant="avatar"
              compact
              hint=""
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              tint={theme.tint}
            />
          </SectionCard>

          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>CONTACT</SectionKicker>
            </View>
            <Field
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              icon="mail-outline"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {/* {emailVerified ? (
          <ThemedText style={[styles.emailVerifiedNote, { color: muted }]}>
            E-mail vérifié — un nouveau mail imposera une confirmation.
          </ThemedText>
        ) : null} */}
          </SectionCard>

          <SectionCard surface={surface} borderColor={borderSubtle}>
            <View style={styles.kickerBlock}>
              <SectionKicker color={muted}>PIÈCE D’IDENTITÉ</SectionKicker>
            </View>
            <ThemedText style={[styles.identityIntro, { color: muted }]}>
              Justificatif : recto, verso, selfie.
            </ThemedText>
            <UploadFile
              label="Recto"
              value={identityVerificationDocumentFront}
              onChange={setIdentityVerificationDocumentFront}
              variant="document"
              compact
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              tint={theme.tint}
            />
            <View style={styles.fieldSpacer} />
            <UploadFile
              label="Verso"
              value={identityVerificationDocumentBack}
              onChange={setIdentityVerificationDocumentBack}
              variant="document"
              compact
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              tint={theme.tint}
            />
            <View style={styles.fieldSpacer} />
            <UploadFile
              label="Selfie"
              value={identityVerificationDocumentSelfie}
              onChange={setIdentityVerificationDocumentSelfie}
              variant="document"
              compact
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              tint={theme.tint}
            />
          </SectionCard>

          <View style={styles.actionsRow}>
            <Pressable
              onPress={onCancel}
              disabled={saving}
              style={({ pressed }) => [
                styles.secondaryBtn,
                {
                  borderColor: borderSubtle,
                  backgroundColor: fieldBg,
                  opacity: saving ? 0.55 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.secondaryBtnText, { color: theme.text }]}>Annuler</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => void handleSave()}
              disabled={saving}
              style={({ pressed }) => [
                styles.primaryBtn,
                {
                  backgroundColor: theme.tint,
                  opacity: saving ? 0.75 : pressed ? 0.92 : 1,
                },
              ]}
            >
              {saving ? (
                <ActivityIndicator color={ON_TINT} size="small" />
              ) : (
                <MaterialIcons name="check" size={17} color={ON_TINT} />
              )}
              <ThemedText style={styles.primaryBtnText}>
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </ThemedText>
            </Pressable>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  retryBtn: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  retryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  loadingHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionCard: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  kickerBlock: {
    marginBottom: 5,
  },
  sectionKicker: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  emailVerifiedNote: {
    fontSize: 9,
    lineHeight: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  identityIntro: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldSpacer: {
    height: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  primaryBtnText: {
    color: ON_TINT,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});
