import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';

export type ProfileCardProps = {
  name: string;
  avatarInitial: string;
  avatarUri?: string | null;
  subscriptionLabel?: string;
  jobTitle: string;
  company: string;
  city: string;
  bio: string;
  isVerified: boolean;
  onVerifyPress?: () => void;
};

export function ProfileCard({
  name,
  avatarInitial,
  avatarUri,
  subscriptionLabel,
  jobTitle,
  company,
  city,
  bio,
  isVerified,
  onVerifyPress,
}: ProfileCardProps) {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = colorScheme === 'dark' ? '#1A1A1E' : '#FFFFFF';
  const divider = colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: divider }]}>
      {subscriptionLabel ? (
        <View style={[styles.subscriptionBadge, { backgroundColor: `${ACCENT}14` }]}>
          <MaterialIcons name="workspace-premium" size={13} color={ACCENT} />
          <ThemedText style={[styles.subscriptionText, { color: ACCENT }]}>
            {subscriptionLabel}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: `${ACCENT}22` }]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} contentFit="cover" />
          ) : (
            <ThemedText style={[styles.avatarText, { color: ACCENT }]}>{avatarInitial}</ThemedText>
          )}
        </View>

        <View style={styles.headerBody}>
          <View style={styles.nameRow}>
            <ThemedText style={[styles.name, { color: theme.text }]}>{name}</ThemedText>
            {isVerified ? <MaterialIcons name="verified" size={20} color={ACCENT} /> : null}
          </View>

          <ThemedText style={[styles.jobLine, { color: theme.text }]}>
            {jobTitle}
            <ThemedText style={{ color: theme.icon }}> · {company}</ThemedText>
          </ThemedText>

          <View style={styles.metaChip}>
            <MaterialIcons name="place" size={13} color={ACCENT} />
            <ThemedText style={[styles.metaChipText, { color: theme.icon }]}>{city}</ThemedText>
          </View>
        </View>
      </View>

      {!isVerified ? (
        <Pressable
          onPress={onVerifyPress}
          style={[styles.verifyBanner, { backgroundColor: `${ACCENT}12`, borderColor: `${ACCENT}33` }]}
        >
          <MaterialIcons name="shield" size={18} color={ACCENT} />
          <View style={styles.verifyBannerText}>
            <ThemedText style={[styles.verifyBannerTitle, { color: theme.text }]}>Profil non vérifié</ThemedText>
            <ThemedText style={[styles.verifyBannerHint, { color: theme.icon }]}>
              Complétez votre profil pour gagner la confiance du réseau.
            </ThemedText>
          </View>
          <MaterialIcons name="chevron-right" size={20} color={theme.icon} />
        </Pressable>
      ) : (
        <View style={[styles.verifyBanner, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}28` }]}>
          <MaterialIcons name="verified-user" size={18} color={ACCENT} />
          <ThemedText style={[styles.verifyBannerTitle, { color: ACCENT, flex: 1 }]}>Profil vérifié</ThemedText>
        </View>
      )}

      <ThemedText style={[styles.bio, { color: theme.icon }]}>{bio}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  subscriptionBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  subscriptionText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  header: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  headerBody: { flex: 1, gap: 5, paddingTop: 2 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: { width: 64, height: 64 },
  avatarText: { fontSize: 26, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4 },
  jobLine: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
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
});
