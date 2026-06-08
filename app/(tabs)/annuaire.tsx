import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';
const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

type Sector = 'Tech' | 'Commerce' | 'Services' | 'Immobilier' | 'Santé' | 'Culture';

type Member = {
  id: string;
  firstName: string;
  lastName: string;
  avatar: string;
  jobTitle: string;
  company?: string;
  quartier: string;
};

const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    firstName: 'Léa',
    lastName: 'Martin',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80',
    jobTitle: 'Fondatrice',
    company: 'Marseille Labs',
    quartier: 'Joliette',
  },
  {
    id: '2',
    firstName: 'Karim',
    lastName: 'Benali',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80',
    jobTitle: 'CEO',
    company: 'Azur Retail',
    quartier: 'Prado',
  },
  {
    id: '3',
    firstName: 'Sophie',
    lastName: 'Durand',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80',
    jobTitle: 'Consultante indépendante',
    quartier: 'Euroméditerranée',
  },
  {
    id: '4',
    firstName: 'Thomas',
    lastName: 'Roux',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80',
    jobTitle: 'Agent immobilier',
    company: 'Phocéa Home',
    quartier: 'Vieux-Port',
  },
  {
    id: '5',
    firstName: 'Nadia',
    lastName: 'El Amrani',
    avatar: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=200&q=80',
    jobTitle: 'Kinésithérapeute',
    company: 'Cabinet Santé Sud',
    quartier: 'Cours Julien',
  },
  {
    id: '6',
    firstName: 'Julien',
    lastName: 'Moreau',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80',
    jobTitle: 'Producteur',
    company: 'Méditerranée Créative',
    quartier: 'Panier',
  },
  {
    id: '7',
    firstName: 'Amina',
    lastName: 'Diallo',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
    jobTitle: 'CTO',
    company: 'Harbor Tech',
    quartier: 'Joliette',
  },
  {
    id: '8',
    firstName: 'Marc',
    lastName: 'Lefèvre',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&q=80',
    jobTitle: 'Gérant',
    company: 'Provence BTP',
    quartier: 'Saint-Barnabé',
  },
];

const SECTOR_FILTERS: (Sector | 'Tous')[] = ['Tous', 'Tech', 'Commerce', 'Services', 'Immobilier', 'Santé', 'Culture'];

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

type MemberCardProps = {
  member: Member;
  cardBg: string;
  chipBg: string;
  divider: string;
  textColor: string;
  mutedColor: string;
};

function MemberCard({ member, cardBg, chipBg, divider, textColor, mutedColor }: MemberCardProps) {
  return (
    <Pressable style={[styles.card, { backgroundColor: cardBg, borderColor: divider }]}>
      <View style={[styles.avatarWrap, { borderColor: divider }]}>
        <Image source={{ uri: member.avatar }} style={styles.avatar} contentFit="cover" />
      </View>

      <View style={styles.nameBlock}>
        <ThemedText style={[styles.firstName, { color: textColor }]} numberOfLines={1}>
          {member.firstName}
        </ThemedText>
        <ThemedText style={[styles.lastName, { color: textColor }]} numberOfLines={1}>
          {member.lastName}
        </ThemedText>
      </View>

      <ThemedText style={[styles.jobTitle, { color: ACCENT }]} numberOfLines={2}>
        {member.jobTitle}
      </ThemedText>

      {member.company ? (
        <View style={styles.companyRow}>
          <MaterialIcons name="business" size={12} color={mutedColor} />
          <ThemedText style={[styles.company, { color: mutedColor }]} numberOfLines={1}>
            {member.company}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.companyPlaceholder} />
      )}

      <View style={styles.locationRow}>
        <MaterialIcons name="place" size={12} color={ACCENT} />
        <ThemedText style={[styles.locationText, { color: mutedColor }]} numberOfLines={1}>
          {member.quartier}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export default function AnnuaireScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : '#FFFFFF';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [query, setQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState<Sector | 'Tous'>('Tous');

  const members = useMemo(() => {
    const q = normalize(query);
    return MOCK_MEMBERS.filter((m) => {
      if (!q) return true;
      const haystack = normalize(
        `${m.firstName} ${m.lastName} ${m.company ?? ''} ${m.jobTitle} ${m.quartier}`
      );
      return haystack.includes(q);
    });
  }, [query]);

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectorScroll}
      >
        {SECTOR_FILTERS.map((s) => {
          const active = sectorFilter === s;
          return (
            <Pressable
              key={s}
              onPress={() => setSectorFilter(s)}
              style={[styles.sectorChip, { backgroundColor: active ? ACCENT : chipBg }]}
            >
              <ThemedText style={[styles.sectorChipText, { color: active ? '#FFF' : theme.text }]}>
                {s}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <ThemedText style={[styles.resultCount, { color: theme.icon }]}>
        {members.length} entrepreneur{members.length > 1 ? 's' : ''}
      </ThemedText>

      <View style={styles.list}>
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            cardBg={cardBg}
            chipBg={chipBg}
            divider={divider}
            textColor={theme.text}
            mutedColor={theme.icon}
          />
        ))}
      </View>

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
  sectorScroll: { gap: 8, paddingBottom: 4, marginBottom: 12 },
  sectorChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  sectorChipText: { fontSize: 13, fontWeight: '600' },
  resultCount: { fontSize: 12, fontWeight: '600', marginBottom: 10, letterSpacing: 0.2 },
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    width: '48%',
    flexGrow: 0,
    flexShrink: 0,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 6,
    alignItems: 'center',
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  nameBlock: { alignItems: 'center', width: '100%' },
  firstName: { fontSize: 12, fontWeight: '500', lineHeight: 15 },
  lastName: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3, lineHeight: 18, textAlign: 'center' },
  jobTitle: { fontSize: 12, fontWeight: '700', textAlign: 'center', minHeight: 32 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '100%' },
  company: { flex: 1, fontSize: 11, fontWeight: '500' },
  companyPlaceholder: { height: 16 },
  memberSectorChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: '100%',
  },
  memberSectorChipText: { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '100%' },
  locationText: { flex: 1, fontSize: 11, fontWeight: '500' },
  tabBarSpacer: { height: 96 },
});
