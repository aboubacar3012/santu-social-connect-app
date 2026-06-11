import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import type { Member } from '@/constants/mock-members';
import { Colors } from '@/constants/theme';

const ACCENT = '#0077B6';
const AVATAR_SIZE = 116;

type MemberDetailProps = {
  member: Member;
};

function MetaPill({
  icon,
  label,
  muted,
  bg,
  border,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  muted: string;
  bg: string;
  border: string;
}) {
  return (
    <View style={[styles.metaPill, { backgroundColor: bg, borderColor: border }]}>
      <MaterialIcons name={icon} size={14} color={ACCENT} />
      <ThemedText style={[styles.metaPillText, { color: muted }]} numberOfLines={1}>
        {label}
      </ThemedText>
    </View>
  );
}

function ContactAction({
  icon,
  label,
  value,
  onPress,
  cardBg,
  divider,
  themeText,
  muted,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  onPress: () => void;
  cardBg: string;
  divider: string;
  themeText: string;
  muted: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.contactAction,
        { backgroundColor: cardBg, borderColor: divider, opacity: pressed ? 0.88 : 1 },
      ]}
    >
      <View style={[styles.contactActionIcon, { backgroundColor: `${ACCENT}14` }]}>
        <MaterialIcons name={icon} size={20} color={ACCENT} />
      </View>
      <View style={styles.contactActionBody}>
        <ThemedText style={[styles.contactActionLabel, { color: muted }]}>{label}</ThemedText>
        <ThemedText style={[styles.contactActionValue, { color: themeText }]} numberOfLines={1}>
          {value}
        </ThemedText>
      </View>
      <MaterialIcons name="north-east" size={18} color={ACCENT} />
    </Pressable>
  );
}

export function MemberDetail({ member }: MemberDetailProps) {
  const theme = Colors.light;

  const pageBg = '#F2F4F7';
  const bannerBg = '#E2E6EB';
  const cardBg = '#FFFFFF';
  const divider = 'rgba(0,0,0,0.06)';
  const chipBg = 'rgba(0,119,182,0.06)';
  const location = `${member.quartier} · ${member.city}`;
  const hasContact = Boolean(member.email || member.phone);

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      <View style={[styles.heroBlock, { backgroundColor: bannerBg }]} />

      <View style={styles.avatarRow}>
        <View style={[styles.avatarRing, { borderColor: cardBg, backgroundColor: cardBg }]}>
          <Image
            source={{ uri: member.avatar }}
            style={styles.avatarImage}
            contentFit="cover"
            contentPosition="top"
            transition={250}
            accessibilityLabel={`Photo de ${member.firstName} ${member.lastName}`}
          />
        </View>
      </View>

      <View style={styles.content}>
        <View style={[styles.identityCard, { backgroundColor: cardBg, borderColor: divider }]}>
          <ThemedText style={[styles.firstName, { color: theme.icon }]}>{member.firstName}</ThemedText>
          <ThemedText style={[styles.lastName, { color: theme.text }]}>{member.lastName}</ThemedText>
          <ThemedText style={[styles.jobTitle, { color: ACCENT }]}>{member.jobTitle}</ThemedText>

          <View style={styles.metaRow}>
            {member.company ? (
              <MetaPill icon="business" label={member.company} muted={theme.text} bg={chipBg} border={divider} />
            ) : null}
            <MetaPill icon="place" label={location} muted={theme.icon} bg={chipBg} border={divider} />
          </View>
        </View>

        {!member.isVerified ? (
          <View style={[styles.verifyBanner, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}>
            <MaterialIcons name="shield" size={18} color={ACCENT} />
            <ThemedText style={[styles.verifyBannerText, { color: theme.text }]}>
              Profil non vérifié — certaines informations peuvent être incomplètes.
            </ThemedText>
          </View>
        ) : null}

        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: divider }]}>
          <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>À PROPOS</ThemedText>
          <ThemedText style={[styles.bio, { color: theme.text }]}>{member.bio}</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>COORDONNÉES</ThemedText>

          {hasContact ? (
            <View style={styles.contactList}>
              {member.email ? (
                <ContactAction
                  icon="email"
                  label="Envoyer un e-mail"
                  value={member.email}
                  onPress={() => Linking.openURL(`mailto:${member.email}`)}
                  cardBg={cardBg}
                  divider={divider}
                  themeText={theme.text}
                  muted={theme.icon}
                />
              ) : null}
              {member.phone ? (
                <ContactAction
                  icon="phone"
                  label="Appeler"
                  value={member.phone}
                  onPress={() => {
                    const phone = member.phone ?? '';
                    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
                  }}
                  cardBg={cardBg}
                  divider={divider}
                  themeText={theme.text}
                  muted={theme.icon}
                />
              ) : null}
            </View>
          ) : (
            <View style={[styles.privateNotice, { backgroundColor: cardBg, borderColor: divider }]}>
              <View style={[styles.privateIcon, { backgroundColor: `${ACCENT}10` }]}>
                <MaterialIcons name="visibility-off" size={20} color={theme.icon} />
              </View>
              <View style={styles.privateBody}>
                <ThemedText style={[styles.privateTitle, { color: theme.text }]}>Coordonnées privées</ThemedText>
                <ThemedText style={[styles.privateHint, { color: theme.icon }]}>
                  Ce membre n’a pas rendu son e-mail ou son téléphone visible dans l’annuaire.
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { paddingBottom: 8 },
  heroBlock: {
    height: 140,
  },
  avatarRow: {
    alignItems: 'center',
    marginTop: -(AVATAR_SIZE / 2),
    zIndex: 2,
  },
  avatarRing: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 14,
  },
  identityCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    paddingTop: 14,
    gap: 4,
    alignItems: 'center',
  },
  firstName: { fontSize: 13, fontWeight: '500', letterSpacing: 0.3 },
  lastName: { fontSize: 28, fontWeight: '800', letterSpacing: -0.8, lineHeight: 32, textAlign: 'center' },
  jobTitle: { fontSize: 16, fontWeight: '700', lineHeight: 22, marginTop: 4, textAlign: 'center' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, justifyContent: 'center' },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    maxWidth: '100%',
  },
  metaPillText: { fontSize: 13, fontWeight: '600', flexShrink: 1 },
  verifyBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  verifyBannerText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },
  sectionCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  section: { gap: 10 },
  sectionKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6, paddingHorizontal: 2 },
  bio: { fontSize: 15, lineHeight: 23, fontWeight: '400' },
  contactList: { gap: 10 },
  contactAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  contactActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactActionBody: { flex: 1, gap: 2 },
  contactActionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.4, textTransform: 'uppercase' },
  contactActionValue: { fontSize: 15, fontWeight: '600' },
  privateNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  privateIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  privateBody: { flex: 1, gap: 4 },
  privateTitle: { fontSize: 15, fontWeight: '700' },
  privateHint: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
});
