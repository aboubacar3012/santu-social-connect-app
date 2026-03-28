import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

function SectionCard({
  children,
  surface,
  borderColor,
  style,
}: {
  children: React.ReactNode;
  surface: string;
  borderColor: string;
  style?: object;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: surface, borderColor }, style]}>{children}</View>
  );
}

function SectionKicker({ children, color }: { children: string; color: string }) {
  return <ThemedText style={[styles.sectionKicker, { color }]}>{children}</ThemedText>;
}

function VerifyRow({
  icon,
  title,
  subtitle,
  done,
  themeText,
  muted,
  iconWrapBg,
  tint,
  showDivider,
  borderColor,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  done: boolean;
  themeText: string;
  muted: string;
  iconWrapBg: string;
  tint: string;
  showDivider?: boolean;
  borderColor: string;
}) {
  return (
    <>
      <View style={styles.verifyRow}>
        <View style={[styles.verifyIconWrap, { backgroundColor: iconWrapBg }]}>
          <MaterialIcons name={icon} size={16} color={muted} />
        </View>
        <View style={styles.verifyText}>
          <ThemedText style={[styles.verifyTitle, { color: themeText }]}>{title}</ThemedText>
          <ThemedText style={[styles.verifySubtitle, { color: muted }]}>{subtitle}</ThemedText>
        </View>
        <MaterialIcons
          name={done ? 'check-circle' : 'radio-button-unchecked'}
          size={18}
          color={done ? tint : muted}
        />
      </View>
      {showDivider ? <View style={[styles.rowDivider, { backgroundColor: borderColor }]} /> : null}
    </>
  );
}

type ProfilViewProps = {
  onEdit: () => void;
  onLogout: () => void;
};

/** Affichage lecture seule du profil (identité, vérifs, préférences, véhicule). */
export default function ProfilView({ onEdit, onLogout }: ProfilViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconWrapBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tintSoft = isDark ? 'rgba(230,168,0,0.14)' : 'rgba(230,168,0,0.18)';
  const avatarRing = isDark ? 'rgba(230,168,0,0.4)' : 'rgba(230,168,0,0.5)';
  const prefs = ['Discussion modérée', 'Musique OK', 'Pause possible', 'Non-fumeur'];

  return (
    <>
      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>IDENTITÉ</SectionKicker>
        </View>
        <View style={styles.identityRow}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: isDark ? '#1C1C1F' : '#F0F1F4',
                borderColor: avatarRing,
              },
            ]}
          >
            <ThemedText style={[styles.avatarText, { color: theme.tint }]}>AB</ThemedText>
          </View>
          <View style={styles.identityText}>
            <ThemedText style={[styles.name, { color: theme.text }]}>Aboubacar Bah</ThemedText>
            <ThemedText style={[styles.smallMuted, { color: muted }]}>Membre depuis mars 2024</ThemedText>
          </View>
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>VÉRIFICATIONS</SectionKicker>
        </View>
        <VerifyRow
          icon="mail"
          title="Adresse e-mail vérifiée"
          subtitle="aboubacar@example.com"
          done
          themeText={theme.text}
          muted={muted}
          iconWrapBg={iconWrapBg}
          tint={theme.tint}
          showDivider
          borderColor={borderSubtle}
        />
        <VerifyRow
          icon="phone"
          title="Numéro de téléphone vérifié"
          subtitle="+224 621 00 00 00"
          done
          themeText={theme.text}
          muted={muted}
          iconWrapBg={iconWrapBg}
          tint={theme.tint}
          showDivider
          borderColor={borderSubtle}
        />
        <VerifyRow
          icon="badge"
          title="Pièce d'identité"
          subtitle="Ajoutez votre pièce pour rassurer les passagers"
          done={false}
          themeText={theme.text}
          muted={muted}
          iconWrapBg={iconWrapBg}
          tint={theme.tint}
          borderColor={borderSubtle}
        />
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PRÉFÉRENCES</SectionKicker>
        </View>
        <View style={styles.tagsWrap}>
          {prefs.map((label) => (
            <View
              key={label}
              style={[
                styles.tagPill,
                {
                  borderColor: borderSubtle,
                  backgroundColor: tintSoft,
                },
              ]}
            >
              <ThemedText style={[styles.tagText, { color: theme.text }]}>{label}</ThemedText>
            </View>
          ))}
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>VÉHICULE PRINCIPAL</SectionKicker>
        </View>
        <View style={styles.carRow}>
          <View
            style={[
              styles.carIconHub,
              {
                backgroundColor: isDark ? '#1C1C1F' : '#F0F1F4',
                borderColor: isDark ? 'rgba(230,168,0,0.35)' : 'rgba(230,168,0,0.45)',
              },
            ]}
          >
            <MaterialIcons name="directions-car" size={18} color={theme.tint} />
          </View>
          <View style={styles.carText}>
            <ThemedText style={[styles.carTitle, { color: theme.text }]}>Toyota RAV4 · Gris</ThemedText>
            <ThemedText style={[styles.smallMuted, { color: muted }]}>4 places · Climatisation</ThemedText>
          </View>
        </View>
      </SectionCard>

      <Pressable
        onPress={onEdit}
        style={({ pressed }) => [
          styles.primaryCta,
          { backgroundColor: theme.tint, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <MaterialIcons name="edit" size={18} color={ON_TINT} />
        <ThemedText style={styles.primaryCtaText}>Modifier mon profil</ThemedText>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Se déconnecter"
        onPress={onLogout}
        style={({ pressed }) => [
          styles.logoutBtn,
          {
            borderColor: isDark ? 'rgba(255,107,107,0.45)' : 'rgba(198,40,40,0.35)',
            backgroundColor: isDark ? 'rgba(255,107,107,0.08)' : 'rgba(198,40,40,0.06)',
            opacity: pressed ? 0.9 : 1,
          },
        ]}
      >
        <MaterialIcons name="logout" size={18} color={isDark ? '#FF8A80' : '#C62828'} />
        <ThemedText style={[styles.logoutBtnText, { color: isDark ? '#FF8A80' : '#C62828' }]}>
          Déconnexion
        </ThemedText>
      </Pressable>
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  kickerBlock: {
    marginBottom: 8,
  },
  sectionKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  identityRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  identityText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  smallMuted: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  verifyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  verifyTitle: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  verifySubtitle: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 42,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagPill: {
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carIconHub: {
    width: 42,
    height: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexShrink: 0,
  },
  carText: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  carTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primaryCta: {
    marginTop: 5,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  primaryCtaText: {
    color: ON_TINT,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  logoutBtn: {
    marginTop: 8,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
