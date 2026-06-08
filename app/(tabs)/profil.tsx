import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProfileCard } from '@/components/profile/profile-card';
import { ProfileContactCard } from '@/components/profile/profile-contact-card';
import { ProfileFormData, UpdateProfil } from '@/components/profile/update-profil';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { isUserAdmin } from '@/libs/auth';

const ACCENT = '#0077B6';
const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

const DEFAULT_PROFILE: ProfileFormData & { verified: boolean } = {
  name: 'Aboubacar',
  jobTitle: 'Fondateur',
  company: 'Santu Connect',
  city: 'Marseille',
  bio: 'Je connecte les entrepreneurs marseillais pour créer des opportunités et faire grandir l’écosystème local.',
  email: 'aboubacar@connect.santu.io',
  avatarUri: null,
  verified: true,
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
  const { signOut, user } = useAuth();

  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [showPhonePublic, setShowPhonePublic] = useState(false);
  const [showEmailPublic, setShowEmailPublic] = useState(true);

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const email = user?.email?.trim() || profile.email;
  const phone = user?.phoneE164 ? formatPhoneE164(user.phoneE164) : '+33 6 12 34 56 78';
  const isAdmin = isUserAdmin(user);

  const editInitial = useMemo<ProfileFormData>(
    () => ({
      name: profile.name,
      jobTitle: profile.jobTitle,
      company: profile.company,
      city: profile.city,
      bio: profile.bio,
      email,
      avatarUri: profile.avatarUri,
    }),
    [profile, email],
  );

  const handleSaveProfile = async (data: ProfileFormData) => {
    setProfile((prev) => ({ ...prev, ...data }));
    setIsEditing(false);
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

        <View style={styles.profileCardWrap}>
          <ProfileCard
            name={profile.name}
            avatarInitial={profile.name.charAt(0).toUpperCase()}
            avatarUri={profile.avatarUri}
            jobTitle={profile.jobTitle}
            company={profile.company}
            city={profile.city}
            bio={profile.bio}
            isVerified={profile.verified}
          />
        </View>

        <View style={styles.sectionBlock}>
          <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>COORDONNÉES</ThemedText>
          <ThemedText style={[styles.sectionHint, { color: theme.icon }]}>
            Gérez ce que les autres entrepreneurs peuvent voir.
          </ThemedText>

          <View style={styles.contactList}>
            <ProfileContactCard
              icon="email"
              label="E-mail"
              value={email}
              isPublic={showEmailPublic}
              onTogglePublic={setShowEmailPublic}
            />
            <ProfileContactCard
              icon="phone"
              label="Téléphone"
              value={phone}
              isPublic={showPhonePublic}
              onTogglePublic={setShowPhonePublic}
            />
          </View>
        </View>

        <View style={[styles.actionRow, { backgroundColor: cardBg, borderColor: divider }]}>
          <Pressable onPress={() => setIsEditing(true)} style={styles.actionBtn}>
            <View style={[styles.actionIcon, { backgroundColor: chipBg }]}>
              <MaterialIcons name="edit" size={18} color={ACCENT} />
            </View>
            <ThemedText style={[styles.actionLabel, { color: theme.text }]} numberOfLines={2}>
              Modifier mon profil
            </ThemedText>
          </Pressable>

          {isAdmin ? (
            <>
              <View style={[styles.actionDivider, { backgroundColor: divider }]} />
              <Pressable onPress={() => router.push('/(tabs)/publish')} style={styles.actionBtn}>
                <View style={[styles.actionIcon, { backgroundColor: chipBg }]}>
                  <MaterialIcons name="event-available" size={18} color={ACCENT} />
                </View>
                <ThemedText style={[styles.actionLabel, { color: theme.text }]} numberOfLines={2}>
                  Créer un événement
                </ThemedText>
              </Pressable>
            </>
          ) : null}
        </View>

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
