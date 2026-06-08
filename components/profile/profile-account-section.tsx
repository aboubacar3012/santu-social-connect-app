import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  USER_STATUS_LABELS,
  canAppearInDirectory,
  formatMemberSince,
  getDirectoryRequirements,
  getIdentityStatusLabel,
  type UserStatusApi,
} from '@/libs/profile-status';
import type { MeApiUser } from '@/types/profile';

const ACCENT = '#0077B6';
const OK = '#2E7D32';

type InfoRowProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  ok?: boolean;
  textColor: string;
  mutedColor: string;
  divider: string;
};

function InfoRow({ icon, label, value, ok, textColor, mutedColor, divider }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: divider }]}>
      <MaterialIcons name={icon} size={18} color={mutedColor} />
      <View style={styles.infoText}>
        <ThemedText style={[styles.infoLabel, { color: mutedColor }]}>{label}</ThemedText>
        <ThemedText style={[styles.infoValue, { color: textColor }]}>{value}</ThemedText>
      </View>
      {ok !== undefined ? (
        <MaterialIcons
          name={ok ? 'check-circle' : 'radio-button-unchecked'}
          size={18}
          color={ok ? OK : mutedColor}
        />
      ) : null}
    </View>
  );
}

type SectionTitleProps = {
  title: string;
  hint?: string;
  textColor: string;
  mutedColor: string;
};

function SectionTitle({ title, hint, textColor, mutedColor }: SectionTitleProps) {
  return (
    <View style={styles.sectionTitle}>
      <ThemedText style={[styles.sectionTitleText, { color: textColor }]}>{title}</ThemedText>
      {hint ? (
        <ThemedText style={[styles.sectionTitleHint, { color: mutedColor }]}>{hint}</ThemedText>
      ) : null}
    </View>
  );
}

export type ProfileAccountSectionProps = {
  me: MeApiUser;
  directoryVisible: boolean;
  onToggleDirectoryVisible: (next: boolean) => void;
};

export function ProfileAccountSection({
  me,
  directoryVisible,
  onToggleDirectoryVisible,
}: ProfileAccountSectionProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const requirements = getDirectoryRequirements(me);
  const visibleInDirectory = canAppearInDirectory(me);


  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: divider }]}>


      <SectionTitle
        title="Visibilité annuaire"
        hint="Activez cette option pour que votre profil apparaisse dans l'annuaire public."
        textColor={theme.text}
        mutedColor={theme.icon}
      />
      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <ThemedText style={[styles.toggleTitle, { color: theme.text }]}>
            Apparaître dans l&apos;annuaire
          </ThemedText>
          <ThemedText style={[styles.toggleHint, { color: theme.icon }]}>
            {directoryVisible
              ? 'Votre profil est configuré pour être visible.'
              : 'Votre profil est masqué de l’annuaire.'}
          </ThemedText>
        </View>
        <Switch
          value={directoryVisible}
          onValueChange={onToggleDirectoryVisible}
          trackColor={{ false: isDark ? '#3A3A3C' : '#D1D1D6', true: `${ACCENT}88` }}
          thumbColor={directoryVisible ? ACCENT : isDark ? '#F4F4F4' : '#FFFFFF'}
        />
      </View>




      <View
        style={[
          styles.requirementsBlock,
          {
            backgroundColor: visibleInDirectory
              ? `${OK}12`
              : isDark
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(0,0,0,0.03)',
          },
        ]}
      >
        <ThemedText
          style={[
            styles.requirementsTitle,
            { color: visibleInDirectory ? OK : theme.text },
          ]}
        >
          {visibleInDirectory
            ? 'Votre profil est visible dans l’annuaire'
            : 'Conditions pour apparaître dans l’annuaire'}
        </ThemedText>
        {!visibleInDirectory ? (
          <ThemedText style={[styles.requirementsHint, { color: theme.icon }]}>
            Toutes les conditions ci-dessous doivent être remplies.
          </ThemedText>
        ) : null}
        {requirements.map((item) => (
          <View key={item.id} style={styles.requirementRow}>
            <MaterialIcons
              name={item.met ? 'check-circle' : 'radio-button-unchecked'}
              size={17}
              color={item.met ? OK : theme.icon}
            />
            <ThemedText style={[styles.requirementText, { color: theme.text }]}>
              {item.label}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 4,
    marginBottom: 16,
  },
  cardHeader: { gap: 4, marginBottom: 8 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  cardHint: { fontSize: 13, lineHeight: 19, fontWeight: '500' },
  sectionTitle: { gap: 3, marginTop: 10, marginBottom: 4 },
  sectionTitleText: { fontSize: 14, fontWeight: '700' },
  sectionTitleHint: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoText: { flex: 1, gap: 2 },
  infoLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  directoryBlock: {
    marginTop: 8,
    paddingTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 8,
  },
  toggleText: { flex: 1, gap: 4 },
  toggleTitle: { fontSize: 14, fontWeight: '700' },
  toggleHint: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  requirementsBlock: {
    marginTop: 12,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  requirementsTitle: { fontSize: 13, fontWeight: '700' },
  requirementsHint: { fontSize: 12, lineHeight: 17, fontWeight: '500', marginBottom: 2 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requirementText: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 19 },
});
