import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
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
          <MaterialIcons name={icon} size={20} color={muted} />
        </View>
        <View style={styles.verifyText}>
          <ThemedText style={[styles.verifyTitle, { color: themeText }]}>{title}</ThemedText>
          <ThemedText style={[styles.verifySubtitle, { color: muted }]}>{subtitle}</ThemedText>
        </View>
        <MaterialIcons
          name={done ? 'check-circle' : 'radio-button-unchecked'}
          size={22}
          color={done ? tint : muted}
        />
      </View>
      {showDivider ? <View style={[styles.rowDivider, { backgroundColor: borderColor }]} /> : null}
    </>
  );
}

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconWrapBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const tintSoft = isDark ? 'rgba(230,168,0,0.14)' : 'rgba(230,168,0,0.18)';
  const avatarRing = isDark ? 'rgba(230,168,0,0.4)' : 'rgba(230,168,0,0.5)';

  const prefs = ['Discussion modérée', 'Musique OK', 'Pause possible', 'Non-fumeur'];

  return (
    <SafeScrollView screenBackgroundColor={pageBg}>
      <View style={styles.hero}>
        <ThemedText style={[styles.heroKicker, { color: muted }]}>COMPTE</ThemedText>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>Profil</ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: muted }]}>
          Votre identité et vos préférences pour rassurer les passagers.
        </ThemedText>
      </View>

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
            <MaterialIcons name="directions-car" size={22} color={theme.tint} />
          </View>
          <View style={styles.carText}>
            <ThemedText style={[styles.carTitle, { color: theme.text }]}>Toyota RAV4 · Gris</ThemedText>
            <ThemedText style={[styles.smallMuted, { color: muted }]}>4 places · Climatisation</ThemedText>
          </View>
        </View>
      </SectionCard>

      <Pressable
        style={({ pressed }) => [
          styles.primaryCta,
          { backgroundColor: theme.tint, opacity: pressed ? 0.92 : 1 },
        ]}
      >
        <MaterialIcons name="edit" size={22} color={ON_TINT} />
        <ThemedText style={styles.primaryCtaText}>Modifier mon profil</ThemedText>
      </Pressable>

      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 4,
    gap: 8,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 340,
  },
  sectionCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  kickerBlock: {
    marginBottom: 14,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  identityRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  identityText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  smallMuted: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  verifyIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  verifyTitle: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  verifySubtitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 58,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagPill: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  carIconHub: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    flexShrink: 0,
  },
  carText: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  carTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  primaryCta: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  primaryCtaText: {
    color: ON_TINT,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  tabBarSpacer: {
    height: 88,
  },
});
