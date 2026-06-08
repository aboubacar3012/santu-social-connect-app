import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  name: string;
  role: string;
  company: string;
  sector: Sector;
  quartier: string;
  initials: string;
};

const MOCK_MEMBERS: Member[] = [
  { id: '1', name: 'Léa Martin', role: 'Fondatrice', company: 'Marseille Labs', sector: 'Tech', quartier: 'Joliette', initials: 'LM' },
  { id: '2', name: 'Karim Benali', role: 'CEO', company: 'Azur Retail', sector: 'Commerce', quartier: 'Prado', initials: 'KB' },
  { id: '3', name: 'Sophie Durand', role: 'Consultante', company: 'Sud Conseil', sector: 'Services', quartier: 'Euroméditerranée', initials: 'SD' },
  { id: '4', name: 'Thomas Roux', role: 'Agent immobilier', company: 'Phocéa Home', sector: 'Immobilier', quartier: 'Vieux-Port', initials: 'TR' },
  { id: '5', name: 'Nadia El Amrani', role: 'Kinésithérapeute', company: 'Cabinet Santé Sud', sector: 'Santé', quartier: 'Cours Julien', initials: 'NE' },
  { id: '6', name: 'Julien Moreau', role: 'Producteur', company: 'Méditerranée Créative', sector: 'Culture', quartier: 'Panier', initials: 'JM' },
  { id: '7', name: 'Amina Diallo', role: 'CTO', company: 'Harbor Tech', sector: 'Tech', quartier: 'Joliette', initials: 'AD' },
  { id: '8', name: 'Marc Lefèvre', role: 'Gérant', company: 'Provence BTP', sector: 'Services', quartier: 'Saint-Barnabé', initials: 'ML' },
];

const SECTOR_FILTERS: Array<Sector | 'Tous'> = ['Tous', 'Tech', 'Commerce', 'Services', 'Immobilier', 'Santé', 'Culture'];

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
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
      if (sectorFilter !== 'Tous' && m.sector !== sectorFilter) return false;
      if (!q) return true;
      const haystack = normalize(`${m.name} ${m.company} ${m.role} ${m.quartier}`);
      return haystack.includes(q);
    });
  }, [query, sectorFilter]);

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
          <Pressable
            key={member.id}
            style={[styles.card, { backgroundColor: cardBg, borderColor: divider }]}
          >
            <View style={[styles.avatar, { backgroundColor: `${ACCENT}22` }]}>
              <ThemedText style={[styles.avatarText, { color: ACCENT }]}>{member.initials}</ThemedText>
            </View>

            <View style={styles.cardBody}>
              <ThemedText style={[styles.name, { color: theme.text }]}>{member.name}</ThemedText>
              <ThemedText style={[styles.role, { color: theme.icon }]}>
                {member.role} · {member.company}
              </ThemedText>
              <View style={styles.tags}>
                <View style={[styles.tag, { backgroundColor: chipBg }]}>
                  <ThemedText style={[styles.tagText, { color: theme.text }]}>{member.sector}</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <MaterialIcons name="place" size={13} color={ACCENT} />
                  <ThemedText style={[styles.metaText, { color: theme.icon }]}>{member.quartier}</ThemedText>
                </View>
              </View>
            </View>

            <MaterialIcons name="chevron-right" size={22} color={theme.icon} />
          </Pressable>
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
  list: { gap: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
  cardBody: { flex: 1, gap: 3 },
  name: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  role: { fontSize: 13, fontWeight: '500' },
  tags: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4, flexWrap: 'wrap' },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText: { fontSize: 11, fontWeight: '700' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaText: { fontSize: 12, fontWeight: '500' },
  tabBarSpacer: { height: 96 },
});
