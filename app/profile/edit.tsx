import { useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ProfileFormData, UpdateProfil } from '@/components/profile/update-profil';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { meToProfileFormData, profileFormToUpdatePayload } from '@/libs/profile-form';
import { getMeApi, updateProfileWithAvatarApi } from '@/services/profile.service';
import type { MeApiUser } from '@/types/profile';

const ACCENT = '#0077B6';
const PAGE_BG = '#F2F4F7';

const EMPTY_PROFILE: ProfileFormData = {
  name: '',
  jobTitle: '',
  company: '',
  city: '',
  quartier: '',
  bio: '',
  email: '',
  avatarUri: null,
  directoryVisible: false,
  showEmailInDirectory: false,
  showPhoneInDirectory: false,
};

function formatPhoneE164(e164: string): string {
  const d = e164.replace(/\D/g, '');
  if (!d.startsWith('33') || d.length < 11) return e164;
  const national = d.slice(2);
  const pairs = national.slice(1).match(/.{1,2}/g) ?? [];
  return `+33 ${national[0]}${pairs.length ? ` ${pairs.join(' ')}` : ''}`.trim();
}

function HeaderSaveButton({
  canSave,
  saving,
  onPress,
}: {
  canSave: boolean;
  saving: boolean;
  onPress: () => void;
}) {
  const theme = Colors.light;

  return (
    <Pressable
      onPress={onPress}
      disabled={!canSave || saving}
      hitSlop={8}
      style={styles.headerSaveBtn}
    >
      {saving ? (
        <ActivityIndicator size="small" color={ACCENT} />
      ) : (
        <ThemedText
          style={[styles.headerSaveText, { color: canSave ? ACCENT : theme.icon }]}
        >
          Enregistrer
        </ThemedText>
      )}
    </Pressable>
  );
}

export default function EditProfileScreen() {
  const theme = Colors.light;
  const router = useRouter();
  const navigation = useNavigation();
  const { token, isReady } = useAuth();

  const [me, setMe] = useState<MeApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canSave, setCanSave] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveRef = useRef<(() => Promise<void>) | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isReady) return;

    if (!token) {
      setMe(null);
      setLoading(false);
      setError('Session expirée. Reconnectez-vous.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { user: profile } = await getMeApi(token);
      setMe(profile);
    } catch (err: unknown) {
      setMe(null);
      setError(err instanceof Error ? err.message : 'Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  }, [isReady, token]);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const initial = useMemo(
    () => (me ? meToProfileFormData(me) : EMPTY_PROFILE),
    [me],
  );

  const phone = me?.phoneE164 ? formatPhoneE164(me.phoneE164) : undefined;

  const handleSaveProfile = useCallback(async (data: ProfileFormData) => {
    if (!token) {
      Alert.alert('Session expirée', 'Reconnectez-vous pour modifier votre profil.');
      return;
    }

    try {
      const payload = profileFormToUpdatePayload(data);
      await updateProfileWithAvatarApi(token, payload, data.avatarUri);
      router.back();
    } catch (err: unknown) {
      Alert.alert(
        'Enregistrement',
        err instanceof Error ? err.message : 'Impossible de mettre à jour le profil.',
      );
      throw err;
    }
  }, [router, token]);

  const handleFormStateChange = useCallback(
    (state: { canSave: boolean; saving: boolean; save: () => Promise<void> }) => {
      saveRef.current = state.save;
      setCanSave((current) => (current === state.canSave ? current : state.canSave));
      setSaving((current) => (current === state.saving ? current : state.saving));
    },
    [],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <HeaderSaveButton
          canSave={canSave}
          saving={saving}
          onPress={() => void saveRef.current?.()}
        />
      ),
    });
  }, [canSave, navigation, saving]);

  return (
    <View style={[styles.root, { backgroundColor: PAGE_BG }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : me ? (
        <UpdateProfil
          initial={initial}
          phone={phone}
          onSave={handleSaveProfile}
          onFormStateChange={handleFormStateChange}
        />
      ) : (
        <View style={styles.centered}>
          <ThemedText style={[styles.errorText, { color: theme.icon }]}>
            {error ?? 'Profil introuvable.'}
          </ThemedText>
          {error ? (
            <Pressable onPress={() => void fetchProfile()}>
              <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 32,
  },
  errorText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  retryText: { fontSize: 14, fontWeight: '700' },
  headerSaveBtn: { paddingHorizontal: 4, minWidth: 88, alignItems: 'flex-end' },
  headerSaveText: { fontSize: 15, fontWeight: '700' },
});
