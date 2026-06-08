import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';
const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

const MOCK_PROFILE = {
  name: 'Aboubacar',
  jobTitle: 'Fondateur',
  company: 'Santu Connect',
  city: 'Marseille',
  bio: 'Je connecte les entrepreneurs marseillais pour créer des opportunités et faire grandir l’écosystème local.',
  email: 'aboubacar@connect.santu.io',
  phone: '+33 6 12 34 56 78',
  verified: true,
};

const MENU_ITEMS = [
  { icon: 'edit' as const, label: 'Modifier mon profil' },
];

function formatPhoneE164(e164: string): string {
  const d = e164.replace(/\D/g, '');
  if (!d.startsWith('33') || d.length < 11) return e164;
  const national = d.slice(2);
  const pairs = national.slice(1).match(/.{1,2}/g) ?? [];
  return `+33 ${national[0]}${pairs.length ? ` ${pairs.join(' ')}` : ''}`.trim();
}

type ContactFieldProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  isPublic: boolean;
  onTogglePublic: (next: boolean) => void;
  themeText: string;
  muted: string;
  chipBg: string;
  divider: string;
  isDark: boolean;
};

function ContactField({
  icon,
  label,
  value,
  isPublic,
  onTogglePublic,
  themeText,
  muted,
  chipBg,
  divider,
  isDark,
}: ContactFieldProps) {
  return (
    <View style={[styles.contactField, { backgroundColor: chipBg, borderColor: divider }]}>
      <View style={styles.contactTop}>
        <View style={styles.contactLabelRow}>
          <MaterialIcons name={icon} size={17} color={ACCENT} />
          <ThemedText style={[styles.contactLabel, { color: muted }]}>{label}</ThemedText>
        </View>
        <View
          style={[
            styles.visibilityPill,
            { backgroundColor: isPublic ? `${ACCENT}18` : 'transparent', borderColor: isPublic ? ACCENT : divider },
          ]}
        >
          <MaterialIcons
            name={isPublic ? 'visibility' : 'visibility-off'}
            size={12}
            color={isPublic ? ACCENT : muted}
          />
          <ThemedText style={[styles.visibilityPillText, { color: isPublic ? ACCENT : muted }]}>
            {isPublic ? 'Public' : 'Privé'}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.contactValue, { color: themeText }]} numberOfLines={1}>
        {value}
      </ThemedText>

      <View style={[styles.contactToggleRow, { borderTopColor: divider }]}>
        <ThemedText style={[styles.contactToggleLabel, { color: themeText }]}>
          Visible dans l&apos;annuaire
        </ThemedText>
        <Switch
          value={isPublic}
          onValueChange={onTogglePublic}
          trackColor={{ false: isDark ? '#3A3A3C' : '#D1D1D6', true: `${ACCENT}88` }}
          thumbColor={isPublic ? ACCENT : isDark ? '#F4F4F4' : '#FFFFFF'}
        />
      </View>
    </View>
  );
}

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { signOut, user } = useAuth();

  const [showPhonePublic, setShowPhonePublic] = useState(false);
  const [showEmailPublic, setShowEmailPublic] = useState(true);

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const email = user?.email?.trim() || MOCK_PROFILE.email;
  const phone = user?.phoneE164 ? formatPhoneE164(user.phoneE164) : MOCK_PROFILE.phone;
  const isVerified = MOCK_PROFILE.verified;

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth');
  };

  return (
    <SafeScrollView screenBackgroundColor={pageBg}>
      <View style={styles.header}>
        <ThemedText style={[styles.kicker, { color: theme.icon }]}>MON COMPTE</ThemedText>
        <ThemedText style={[styles.title, { color: theme.text }]}>Mon profil</ThemedText>
      </View>

      <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: divider }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: `${ACCENT}22` }]}>
            <ThemedText style={[styles.avatarText, { color: ACCENT }]}>A</ThemedText>
          </View>

          <View style={styles.profileHeaderBody}>
            <View style={styles.nameRow}>
              <ThemedText style={[styles.name, { color: theme.text }]}>{MOCK_PROFILE.name}</ThemedText>
              {isVerified ? (
                <MaterialIcons name="verified" size={20} color={ACCENT} />
              ) : null}
            </View>

            <ThemedText style={[styles.jobLine, { color: theme.text }]}>
              {MOCK_PROFILE.jobTitle}
              <ThemedText style={{ color: theme.icon }}> · {MOCK_PROFILE.company}</ThemedText>
            </ThemedText>

            <View style={styles.metaChip}>
              <MaterialIcons name="place" size={13} color={ACCENT} />
              <ThemedText style={[styles.metaChipText, { color: theme.icon }]}>{MOCK_PROFILE.city}</ThemedText>
            </View>
          </View>
        </View>

        {!isVerified ? (
          <View style={[styles.verifyBanner, { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}33` }]}>
            <MaterialIcons name="shield" size={18} color={ACCENT} />
            <View style={styles.verifyBannerText}>
              <ThemedText style={[styles.verifyBannerTitle, { color: theme.text }]}>Profil non vérifié</ThemedText>
              <ThemedText style={[styles.verifyBannerHint, { color: theme.icon }]}>
                Complétez votre profil pour gagner la confiance du réseau.
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={theme.icon} />
          </View>
        ) : (
          <View style={[styles.verifyBanner, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}28` }]}>
            <MaterialIcons name="verified-user" size={18} color={ACCENT} />
            <ThemedText style={[styles.verifyBannerTitle, { color: ACCENT, flex: 1 }]}>
              Profil vérifié
            </ThemedText>
          </View>
        )}

        <ThemedText style={[styles.bio, { color: theme.icon }]}>{MOCK_PROFILE.bio}</ThemedText>
      </View>

      <View style={styles.sectionBlock}>
        <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>COORDONNÉES</ThemedText>
        <ThemedText style={[styles.sectionHint, { color: theme.icon }]}>
          Gérez ce que les autres entrepreneurs peuvent voir.
        </ThemedText>

        <View style={styles.contactList}>
          <ContactField
            icon="email"
            label="E-mail"
            value={email}
            isPublic={showEmailPublic}
            onTogglePublic={setShowEmailPublic}
            themeText={theme.text}
            muted={theme.icon}
            chipBg={cardBg}
            divider={divider}
            isDark={isDark}
          />
          <ContactField
            icon="phone"
            label="Téléphone"
            value={phone}
            isPublic={showPhonePublic}
            onTogglePublic={setShowPhonePublic}
            themeText={theme.text}
            muted={theme.icon}
            chipBg={cardBg}
            divider={divider}
            isDark={isDark}
          />
        </View>
      </View>

      <View style={[styles.menu, { backgroundColor: cardBg, borderColor: divider }]}>
        {MENU_ITEMS.map((item, index) => (
          <Pressable
            key={item.label}
            style={[
              styles.menuRow,
              index < MENU_ITEMS.length - 1 && { borderBottomColor: divider, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <View style={[styles.menuIcon, { backgroundColor: chipBg }]}>
              <MaterialIcons name={item.icon} size={18} color={ACCENT} />
            </View>
            <ThemedText style={[styles.menuLabel, { color: theme.text }]}>{item.label}</ThemedText>
            <MaterialIcons name="chevron-right" size={20} color={theme.icon} />
          </Pressable>
        ))}
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
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18, gap: 4 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2.2 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38 },
  profileCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  profileHeader: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  profileHeaderBody: { flex: 1, gap: 5, paddingTop: 2 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 26, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  jobLine: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 0, paddingVertical: 4, borderRadius: 8 },
  metaChipText: { fontSize: 12, fontWeight: '600' },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  verifyBannerText: { flex: 1, gap: 2 },
  verifyBannerTitle: { fontSize: 13, fontWeight: '700' },
  verifyBannerHint: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  bio: { fontSize: 14, lineHeight: 21, fontWeight: '400' },
  sectionBlock: { marginBottom: 16, gap: 6 },
  sectionKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  sectionHint: { fontSize: 13, lineHeight: 18, marginBottom: 6 },
  contactList: { gap: 10 },
  contactField: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  contactTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  contactLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  visibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  visibilityPillText: { fontSize: 11, fontWeight: '700' },
  contactValue: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  contactToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  contactToggleLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
  menu: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    marginBottom: 14,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
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
