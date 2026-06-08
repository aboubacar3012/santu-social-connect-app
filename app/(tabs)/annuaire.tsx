import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { MemberCard } from '@/components/annuaire/member-card';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { MOCK_MEMBERS, type Member } from '@/constants/mock-members';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

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

export default function AnnuaireScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [query, setQuery] = useState('');

  const members = useMemo(() => {
    const q = normalize(query);
    return MOCK_MEMBERS.filter((m) => {
      if (!q) return true;
      const haystack = normalize(
        `${m.firstName} ${m.lastName} ${m.company ?? ''} ${m.jobTitle} ${m.quartier} ${m.city}`
      );
      return haystack.includes(q);
    });
  }, [query]);

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
          Trouvez des entrepreneurs et partenaires à Marseille.
        </ThemedText>
      </View>

      <View style={[styles.searchShell, { backgroundColor: inputBg, borderColor: divider }]}>
        <MaterialIcons name="search" size={20} color={theme.icon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Nom, entreprise, quartier…"
          placeholderTextColor={theme.icon}
          style={[styles.searchInput, { color: theme.text }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => setQuery('')} hitSlop={10}>
            <MaterialIcons name="close" size={18} color={theme.icon} />
          </Pressable>
        ) : null}
      </View>

      <ThemedText style={[styles.resultCount, { color: theme.icon }]}>
        {members.length} entrepreneur{members.length > 1 ? 's' : ''}
      </ThemedText>

      {members.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: cardBg, borderColor: divider }]}>
          <MaterialIcons name="person-search" size={32} color={theme.icon} />
          <ThemedText style={[styles.emptyText, { color: theme.icon }]}>
            Aucun profil trouvé.
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
                avatar={member.avatar}
                jobTitle={member.jobTitle}
                company={member.company}
                quartier={member.quartier}
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
                avatar={member.avatar}
                jobTitle={member.jobTitle}
                company={member.company}
                quartier={member.quartier}
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
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    minHeight: 48,
    marginBottom: 14,
  },
  searchInput: { flex: 1, fontSize: 15, fontWeight: '500', paddingVertical: 10 },
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
  emptyText: { fontSize: 14, fontWeight: '500' },
  tabBarSpacer: { height: 96 },
});
