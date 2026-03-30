import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { SectionCard } from '@/components/shared/section-card';
import { SectionKicker } from '@/components/shared/section-kicker';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { resolveProfileImageUri } from '@/libs/profile';
import {
  formatProfileBirthLine,
  formatProfileMemberLine,
  formatProfilePlate,
  formatProfileVehicleTitle,
  getIdentityVerificationPresentation,
  getProfileDisplayName,
  getProfileInitials,
} from '@/services/profil-view.service';
import type { MeApiUser } from '@/types/profile';

const API_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000').replace(
  /\/+$/,
  '',
);

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

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

function IdentityVerificationCard({
  me,
  themeText,
  muted,
  isDark,
  borderSubtle,
}: {
  me: MeApiUser | null;
  themeText: string;
  muted: string;
  isDark: boolean;
  borderSubtle: string;
}) {
  const p = getIdentityVerificationPresentation(me);

  const scheme = {
    approved: {
      icon: 'verified' as const,
      accent: isDark ? '#4ADE80' : '#15803D',
      soft: isDark ? 'rgba(74,222,128,0.1)' : 'rgba(21,128,61,0.07)',
      ring: isDark ? 'rgba(74,222,128,0.45)' : 'rgba(21,128,61,0.35)',
    },
    pending_review: {
      icon: 'hourglass-top' as const,
      accent: isDark ? '#FBBF24' : '#B45309',
      soft: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(180,83,9,0.07)',
      ring: isDark ? 'rgba(251,191,36,0.45)' : 'rgba(180,83,9,0.3)',
    },
    pending_missing: {
      icon: 'add-a-photo' as const,
      accent: muted,
      soft: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
      ring: borderSubtle,
    },
    rejected: {
      icon: 'gpp-bad' as const,
      accent: isDark ? '#F87171' : '#B91C1C',
      soft: isDark ? 'rgba(248,113,113,0.1)' : 'rgba(185,28,28,0.07)',
      ring: isDark ? 'rgba(248,113,113,0.45)' : 'rgba(185,28,28,0.35)',
    },
  }[p.kind];

  const badgeBg =
    p.kind === 'approved'
      ? isDark
        ? 'rgba(74,222,128,0.18)'
        : 'rgba(21,128,61,0.12)'
      : p.kind === 'pending_review'
        ? isDark
          ? 'rgba(251,191,36,0.2)'
          : 'rgba(180,83,9,0.12)'
        : p.kind === 'rejected'
          ? isDark
            ? 'rgba(248,113,113,0.2)'
            : 'rgba(185,28,28,0.12)'
          : isDark
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(0,0,0,0.06)';

  return (
    <View
      style={[
        styles.idCard,
        {
          backgroundColor: scheme.soft,
          borderColor: scheme.ring,
        },
      ]}
    >
      <View style={styles.idCardRow}>
        <View
          style={[
            styles.idIconRing,
            {
              borderColor: scheme.ring,
              backgroundColor: isDark ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
            },
          ]}
        >
          <MaterialIcons name={scheme.icon} size={22} color={scheme.accent} />
        </View>
        <View style={styles.idCardMain}>
          <View style={styles.idTitleRow}>
            <ThemedText style={[styles.idHeadline, { color: themeText }]} numberOfLines={2}>
              {p.headline}
            </ThemedText>
            <View style={[styles.idBadge, { backgroundColor: badgeBg }]}>
              <ThemedText style={[styles.idBadgeText, { color: scheme.accent }]}>{p.badge}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.idDetail, { color: muted }]}>{p.detail}</ThemedText>
        </View>
      </View>
    </View>
  );
}

type ProfilViewProps = {
  onEdit: () => void;
  onLogout: () => void;
  /** Accès à l’écran « Mes trajets » (sous la section véhicule). */
  onMyTrips: () => void;
};

/** Affichage lecture seule : identité (aligné sur profil-edit), vérifications, véhicule. */
export default function ProfilView({ onEdit, onLogout, onMyTrips }: ProfilViewProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const { token, user: authUser, isReady } = useAuth();
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const iconWrapBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)';
  const avatarRing = isDark ? 'rgba(230,168,0,0.4)' : 'rgba(230,168,0,0.5)';

  const [me, setMe] = useState<MeApiUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    if (!isReady) return;
    if (!token) {
      setMe(null);
      setError('Session expirée ou indisponible. Reconnectez-vous.');
      return;
    }
    setLoading(true);
    setError(null);
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
        const msg =
          typeof body === 'object' && body !== null && 'message' in body
            ? String((body as { message: unknown }).message)
            : text || `Erreur ${res.status}`;
        throw new Error(msg);
      }
      const u =
        typeof body === 'object' && body !== null && 'user' in body
          ? (body as { user: MeApiUser }).user
          : null;
      if (!u || typeof u !== 'object' || !('id' in u)) {
        setMe(null);
        setError('Profil indisponible (réponse incomplète).');
        return;
      }
      setMe(u);
    } catch (e: unknown) {
      setMe(null);
      setError(e instanceof Error ? e.message : 'Impossible de charger le profil.');
    } finally {
      setLoading(false);
    }
  }, [isReady, token]);

  useEffect(() => {
    if (!isReady) return;
    void fetchMe();
  }, [fetchMe, isReady]);

  const isLoading = !isReady || loading;

  const displayUser = useMemo((): MeApiUser => {
    if (me) return me;
    return {
      id: authUser?.id ?? '',
      phoneE164: authUser?.phoneE164 ?? null,
      email: authUser?.email ?? null,
    };
  }, [me, authUser]);

  const displayName = useMemo(() => getProfileDisplayName(displayUser), [displayUser]);
  const initials = useMemo(() => getProfileInitials(displayUser), [displayUser]);
  const avatarUri = useMemo(
    () => resolveProfileImageUri(me?.profilePicture ?? null),
    [me?.profilePicture],
  );

  const emailSubtitle = me?.email?.trim() || authUser?.email?.trim() || 'Non renseigné';
  const emailDone = Boolean(
    me?.emailVerified && (me?.email?.trim() || authUser?.email?.trim()),
  );
  const phoneSubtitle = (me?.phoneE164 ?? authUser?.phoneE164 ?? '').trim() || 'Non renseigné';
  const phoneDone = Boolean(me?.phoneVerified);

  return (
    <>
      {error ? (
        <SectionCard surface={surface} borderColor={borderSubtle}>
          <View style={styles.bannerRow}>
            <MaterialIcons name="error-outline" size={18} color={isDark ? '#FF8A65' : '#D84315'} />
            <ThemedText style={[styles.bannerText, { color: theme.text }]}>{error}</ThemedText>
          </View>
          <Pressable
            onPress={() => void fetchMe()}
            style={({ pressed }) => [
              styles.retryBtn,
              {
                borderColor: borderSubtle,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <ThemedText style={[styles.retryBtnText, { color: theme.tint }]}>Réessayer</ThemedText>
          </Pressable>
        </SectionCard>
      ) : null}

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>IDENTITÉ</SectionKicker>
        </View>
        {isLoading ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator color={theme.tint} />
            <ThemedText style={[styles.smallMuted, { color: muted }]}>Chargement du profil…</ThemedText>
          </View>
        ) : (
          <View style={styles.identityRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: isDark ? '#1C1C1F' : '#F0F1F4',
                  borderColor: avatarRing,
                  overflow: 'hidden',
                },
              ]}
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <ThemedText style={[styles.avatarText, { color: theme.tint }]}>{initials}</ThemedText>
              )}
            </View>
            <View style={styles.identityText}>
              <ThemedText style={[styles.name, { color: theme.text }]}>{displayName}</ThemedText>
              <ThemedText style={[styles.smallMuted, { color: muted }]}>
                {me ? formatProfileBirthLine(me.dateOfBirth) : 'Informations non disponibles'}
              </ThemedText>
              <ThemedText style={[styles.smallMuted, { color: muted }]}>
                {me?.createdAt ? formatProfileMemberLine(me.createdAt) : '—'}
              </ThemedText>
            </View>
          </View>
        )}
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>VÉRIFICATIONS</SectionKicker>
        </View>
        {isLoading ? (
          <View style={styles.loadingRowCompact}>
            <ActivityIndicator size="small" color={theme.tint} />
          </View>
        ) : (
          <>
            <VerifyRow
              icon="mail"
              title="Adresse e-mail vérifiée"
              subtitle={emailSubtitle}
              done={emailDone}
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
              subtitle={phoneSubtitle}
              done={phoneDone}
              themeText={theme.text}
              muted={muted}
              iconWrapBg={iconWrapBg}
              tint={theme.tint}
              showDivider
              borderColor={borderSubtle}
            />
            <IdentityVerificationCard
              me={me}
              themeText={theme.text}
              muted={muted}
              isDark={isDark}
              borderSubtle={borderSubtle}
            />
          </>
        )}
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>VÉHICULE</SectionKicker>
        </View>
        {isLoading ? (
          <View style={styles.loadingRowCompact}>
            <ActivityIndicator size="small" color={theme.tint} />
          </View>
        ) : (
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
              <ThemedText style={[styles.carTitle, { color: theme.text }]}>
                {me ? formatProfileVehicleTitle(me) : '—'}
              </ThemedText>
              <ThemedText style={[styles.smallMuted, { color: muted }]}>
                {me ? formatProfilePlate(me) : '—'}
              </ThemedText>
            </View>
          </View>
        )}
      </SectionCard>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ouvrir mes trajets"
        onPress={onMyTrips}
        style={({ pressed }) => [
          styles.tripsLink,
          {
            backgroundColor: isDark ? '#141416' : '#FFFFFF',
            borderColor: borderSubtle,
            opacity: pressed ? 0.88 : 1,
          },
        ]}
      >
        <View style={[styles.tripsLinkIcon, { backgroundColor: iconWrapBg }]}>
          <MaterialIcons name="route" size={20} color={theme.tint} />
        </View>
        <View style={styles.tripsLinkText}>
          <ThemedText style={[styles.tripsLinkTitle, { color: theme.text }]}>Mes trajets</ThemedText>
          <ThemedText style={[styles.tripsLinkSubtitle, { color: muted }]}>
            Publiés, réservés et effectués
          </ThemedText>
        </View>
        <MaterialIcons name="chevron-right" size={22} color={muted} />
      </Pressable>

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
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  loadingRowCompact: {
    paddingVertical: 12,
    alignItems: 'flex-start',
  },
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
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
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
  idCard: {
    marginTop: 6,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  idCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  idIconRing: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  idCardMain: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  idTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  idHeadline: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 18,
  },
  idBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    flexShrink: 0,
  },
  idBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  idDetail: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 16,
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
  tripsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  tripsLinkIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripsLinkText: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  tripsLinkTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  tripsLinkSubtitle: {
    fontSize: 12,
    fontWeight: '500',
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
