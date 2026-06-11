import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { MemberCard } from '@/components/annuaire/member-card';
import { IconTextField } from '@/components/publish/icon-text-field';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { resolveProfileImageUri } from '@/libs/profile';
import { listMembersApi } from '@/services/member-list.service';
import type { Member } from '@/types/member';

const PAGE_BG = '#F2F4F7';
const ACCENT = '#0077B6';
const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80';

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function splitColumns(members: Member[]): { left: Member[]; right: Member[] } {
  const left: Member[] = [];
  const right: Member[] = [];

  members.forEach((member, index) => {
    if (index % 2 === 0) left.push(member);
    else right.push(member);
  });

  return { left, right };
}

function memberAvatarUri(avatar: string): string {
  return resolveProfileImageUri(avatar) ?? DEFAULT_AVATAR;
}

export default function AnnuaireScreen() {
  const theme = Colors.light;
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const pageBg = PAGE_BG;
  const cardBg = '#FFFFFF';
  const fieldBg = 'rgba(0,0,0,0.04)';
  const divider = 'rgba(0,0,0,0.06)';
  const searchBorder = searchFocused ? ACCENT : divider;
  const [allMembers, setAllMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { members } = await listMembersApi();
      setAllMembers(members);
    } catch (err: unknown) {
      setAllMembers([]);
      setError(err instanceof Error ? err.message : 'Impossible de charger l’annuaire.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchMembers();
    }, [fetchMembers]),
  );

  const members = useMemo(() => {
    const q = normalize(query);
    return allMembers.filter((m) => {
      if (!q) return true;
      const haystack = normalize(
        `${m.firstName} ${m.lastName} ${m.company ?? ''} ${m.jobTitle} ${m.quartier} ${m.city}`,
      );
      return haystack.includes(q);
    });
  }, [allMembers, query]);

  const { left, right } = useMemo(() => splitColumns(members), [members]);

  const openMember = (id: string) => {
    router.push(`/member/${id}`);
  };

  return (
    <SafeScrollView screenBackgroundColor={pageBg} keyboardAvoiding>
      <View style={styles.header}>
        <ThemedText style={[styles.kicker, { color: theme.icon }]}>RÉSEAU LOCAL</ThemedText>
        <ThemedText style={[styles.title, { color: theme.text }]}>Annuaire</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Trouvez votre futur collaborateur ou partenaire.
        </ThemedText>
      </View>

      <View style={styles.searchWrap}>
        <IconTextField
          value={query}
          onChangeText={setQuery}
          placeholder="Retrouver un profil…"
          icon="search"
          themeText={theme.text}
          themeMuted={theme.icon}
          fieldBg={fieldBg}
          borderColor={searchBorder}
          clearable
          autoCapitalize="none"
          returnKeyType="search"
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </View>

      {error ? (
        <View style={[styles.banner, { backgroundColor: cardBg, borderColor: divider }]}>
          <MaterialIcons name="error-outline" size={18} color="#E82127" />
          <ThemedText style={[styles.bannerText, { color: theme.text }]}>{error}</ThemedText>
          <Pressable onPress={() => void fetchMembers()}>
            <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
          </Pressable>
        </View>
      ) : null}

      <ThemedText style={[styles.resultCount, { color: theme.icon }]}>
        {loading
          ? 'Chargement…'
          : `${members.length} entrepreneur${members.length > 1 ? 's' : ''}`}
      </ThemedText>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : members.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: cardBg, borderColor: divider }]}>
          <MaterialIcons name="person-search" size={32} color={theme.icon} />
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            {allMembers.length === 0 && !query
              ? 'Aucun membre visible dans l’annuaire pour le moment.'
              : 'Aucun profil trouvé.'}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.masonry}>
          <View style={styles.column}>
            {left.map((member) => (
              <MemberCard
                key={member.id}
                firstName={member.firstName}
                lastName={member.lastName}
                avatar={memberAvatarUri(member.avatar)}
                jobTitle={member.jobTitle}
                company={member.company}
                quartier={member.quartier || member.city}
                onPress={() => openMember(member.id)}
              />
            ))}
          </View>
          <View style={styles.column}>
            {right.map((member) => (
              <MemberCard
                key={member.id}
                firstName={member.firstName}
                lastName={member.lastName}
                avatar={memberAvatarUri(member.avatar)}
                jobTitle={member.jobTitle}
                company={member.company}
                quartier={member.quartier || member.city}
                onPress={() => openMember(member.id)}
              />
            ))}
          </View>
        </View>
      )}

      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 18, gap: 4 },
  kicker: { fontSize: 11, fontWeight: '700', letterSpacing: 2.2 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1.2, lineHeight: 38 },
  subtitle: { fontSize: 14, lineHeight: 20, marginTop: 4, maxWidth: 320 },
  searchWrap: {
    marginBottom: 14,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18 },
  retryText: { fontSize: 13, fontWeight: '700' },
  loadingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  resultCount: { fontSize: 12, fontWeight: '600', marginBottom: 12, letterSpacing: 0.2 },
  masonry: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  column: { flex: 1, gap: 12 },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  emptyText: { fontSize: 14, fontWeight: '500', textAlign: 'center', maxWidth: 280 },
  tabBarSpacer: { height: 96 },
});
