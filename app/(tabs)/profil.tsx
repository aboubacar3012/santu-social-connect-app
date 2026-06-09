import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, View } from 'react-native';

import { ProfileAccountSection } from '@/components/profile/profile-account-section';
import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileContactCard } from '@/components/profile/profile-contact-card';
import { ProfileFormData, UpdateProfil } from '@/components/profile/update-profil';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isUserAdmin } from '@/libs/auth';
import {
  isProfileVerified,
  meToProfileFormData,
  profileFormToUpdatePayload,
} from '@/libs/profile-form';
import { USER_ROLE_LABELS, type UserRoleApi } from '@/libs/profile-status';
import { getProfileInitials } from '@/services/profil-view.service';
import {
  getMeApi,
  updateProfileApi,
  updateProfileWithAvatarApi,
} from '@/services/profile.service';
import type { MeApiUser } from '@/types/profile';

const ACCENT = '#0077B6';
const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

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

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signOut, user, token, isReady } = useAuth();

  const [me, setMe] = useState<MeApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showPhonePublic, setShowPhonePublic] = useState(false);
  const [showEmailPublic, setShowEmailPublic] = useState(false);
  const [directoryVisible, setDirectoryVisible] = useState(false);

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const applyMe = useCallback((next: MeApiUser) => {
    setMe(next);
    setShowEmailPublic(Boolean(next.showEmailInDirectory));
    setShowPhonePublic(Boolean(next.showPhoneInDirectory));
    setDirectoryVisible(Boolean(next.directoryVisible));
  }, []);

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
      applyMe(profile);
    } catch (err: unknown) {
      setMe(null);
      setError(err instanceof Error ? err.message : 'Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  }, [applyMe, isReady, token]);

  useFocusEffect(
    useCallback(() => {
      void fetchProfile();
    }, [fetchProfile]),
  );

  const profile = useMemo(
    () => (me ? meToProfileFormData(me) : EMPTY_PROFILE),
    [me],
  );

  const phone = me?.phoneE164
    ? formatPhoneE164(me.phoneE164)
    : user?.phoneE164
      ? formatPhoneE164(user.phoneE164)
      : '—';

  const email = profile.email || user?.email?.trim() || '—';
  const isAdmin = isUserAdmin(user);
  const isVerified = me ? isProfileVerified(me) : false;
  const subscriptionLabel = me
    ? (USER_ROLE_LABELS[(me.role ?? 'freemium') as UserRoleApi] ?? me.role)
    : undefined;
  const avatarInitial = me
    ? getProfileInitials(me)
    : profile.name.charAt(0).toUpperCase() || '?';

  const editInitial = useMemo<ProfileFormData>(() => profile, [profile]);

  const handleSaveProfile = async (data: ProfileFormData) => {
    if (!token) {
      Alert.alert('Session expirée', 'Reconnectez-vous pour modifier votre profil.');
      return;
    }

    try {
      const payload = profileFormToUpdatePayload(data);
      const { user: updated } = await updateProfileWithAvatarApi(
        token,
        payload,
        data.avatarUri,
      );
      applyMe(updated);
      setIsEditing(false);
    } catch (err: unknown) {
      Alert.alert(
        'Enregistrement',
        err instanceof Error ? err.message : 'Impossible de mettre à jour le profil.',
      );
      throw err;
    }
  };

  const handleToggleEmailPublic = async (next: boolean) => {
    setShowEmailPublic(next);
    if (!token) return;

    try {
      const { user: updated } = await updateProfileApi(token, {
        showEmailInDirectory: next,
      });
      applyMe(updated);
    } catch (err: unknown) {
      setShowEmailPublic(!next);
      Alert.alert(
        'Visibilité e-mail',
        err instanceof Error ? err.message : 'Mise à jour impossible.',
      );
    }
  };

  const handleTogglePhonePublic = async (next: boolean) => {
    setShowPhonePublic(next);
    if (!token) return;

    try {
      const { user: updated } = await updateProfileApi(token, {
        showPhoneInDirectory: next,
      });
      applyMe(updated);
    } catch (err: unknown) {
      setShowPhonePublic(!next);
      Alert.alert(
        'Visibilité téléphone',
        err instanceof Error ? err.message : 'Mise à jour impossible.',
      );
    }
  };

  const handleToggleDirectoryVisible = async (next: boolean) => {
    setDirectoryVisible(next);
    if (!token) return;

    try {
      const { user: updated } = await updateProfileApi(token, {
        directoryVisible: next,
      });
      applyMe(updated);
    } catch (err: unknown) {
      setDirectoryVisible(!next);
      Alert.alert(
        'Visibilité annuaire',
        err instanceof Error ? err.message : 'Mise à jour impossible.',
      );
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <>
      <SafeScrollView screenBackgroundColor={pageBg}>
        <View style={styles.header}>
          <ThemedText style={[styles.kicker, { color: theme.icon }]}>MON COMPTE</ThemedText>
          <ThemedText style={[styles.title, { color: theme.text }]}>Mon profil</ThemedText>
        </View>

        {error ? (
          <View style={[styles.banner, { backgroundColor: cardBg, borderColor: divider }]}>
            <MaterialIcons name="error-outline" size={18} color="#E82127" />
            <ThemedText style={[styles.bannerText, { color: theme.text }]}>{error}</ThemedText>
            <Pressable onPress={() => void fetchProfile()}>
              <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
            </Pressable>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={ACCENT} />
            <ThemedText style={[styles.loadingText, { color: theme.icon }]}>
              Chargement du profil…
            </ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.profileCardWrap}>
              <ProfileCard
                name={profile.name || 'Profil'}
                avatarInitial={avatarInitial}
                avatarUri={profile.avatarUri}
                subscriptionLabel={subscriptionLabel}
                jobTitle={profile.jobTitle}
                company={profile.company}
                city={profile.city}
                bio={profile.bio}
                isVerified={isVerified}
              />
            </View>

            {me ? (
              <ProfileAccountSection
                me={me}
                directoryVisible={directoryVisible}
                onToggleDirectoryVisible={handleToggleDirectoryVisible}
              />
            ) : null}

            <View style={styles.sectionBlock}>
              <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>
                COORDONNÉES
              </ThemedText>
              <ThemedText style={[styles.sectionHint, { color: theme.icon }]}>
                Gérez ce que les autres entrepreneurs peuvent voir.
              </ThemedText>

              <View style={styles.contactList}>
                <ProfileContactCard
                  icon="email"
                  label="E-mail"
                  value={email}
                  isPublic={showEmailPublic}
                  onTogglePublic={handleToggleEmailPublic}
                />
                <ProfileContactCard
                  icon="phone"
                  label="Téléphone"
                  value={phone}
                  isPublic={showPhonePublic}
                  onTogglePublic={handleTogglePhonePublic}
                />
              </View>
            </View>
          </>
        )}

        <View style={[styles.actionRow, { backgroundColor: cardBg, borderColor: divider }]}>
          <Pressable
            onPress={() => setIsEditing(true)}
            disabled={loading}
            style={styles.actionBtn}
          >
            <View style={[styles.actionIcon, { backgroundColor: chipBg }]}>
              <MaterialIcons name="edit" size={18} color={ACCENT} />
            </View>
            <ThemedText style={[styles.actionLabel, { color: theme.text }]} numberOfLines={2}>
              Modifier mon profil
            </ThemedText>
          </Pressable>
        </View>

        {isAdmin ? (
          <View style={[styles.actionRow, { backgroundColor: cardBg, borderColor: divider }]}>
            <Pressable onPress={() => router.push('/(tabs)/publish')} style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: chipBg }]}>
                <MaterialIcons name="event-available" size={18} color={ACCENT} />
              </View>
              <ThemedText style={[styles.actionLabel, { color: theme.text }]} numberOfLines={2}>
                Créer un événement
              </ThemedText>
            </Pressable>
            <View style={[styles.actionDivider, { backgroundColor: divider }]} />
            <Pressable onPress={() => router.push('/my-events')} style={styles.actionBtn}>
              <View style={[styles.actionIcon, { backgroundColor: chipBg }]}>
                <MaterialIcons name="event-note" size={18} color={ACCENT} />
              </View>
              <ThemedText style={[styles.actionLabel, { color: theme.text }]} numberOfLines={2}>
                Mes événements
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        <Pressable
          onPress={handleLogout}
          style={[styles.logoutBtn, { borderColor: divider, backgroundColor: cardBg }]}
        >
          <MaterialIcons name="logout" size={18} color="#E82127" />
          <ThemedText style={styles.logoutText}>Se déconnecter</ThemedText>
        </Pressable>

        <View style={styles.tabBarSpacer} />
      </SafeScrollView>

      <UpdateProfil
        visible={isEditing}
        initial={editInitial}
        phone={phone}
        onCancel={() => setIsEditing(false)}
        onSave={handleSaveProfile}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18, gap: 4 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2.2 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 14,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  retryText: { fontSize: 13, fontWeight: '700' },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 32,
    marginBottom: 20,
  },
  loadingText: { fontSize: 13, fontWeight: '500' },
  profileCardWrap: { marginBottom: 20 },
  sectionBlock: { marginBottom: 16, gap: 6 },
  sectionKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  sectionHint: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  contactList: { gap: 10 },
  actionRow: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 14,
  },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 16,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: { fontSize: 13, fontWeight: '600', textAlign: 'center', lineHeight: 18 },
  actionDivider: { width: StyleSheet.hairlineWidth, marginVertical: 12 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#E82127' },
  tabBarSpacer: { height: 96 },
});
