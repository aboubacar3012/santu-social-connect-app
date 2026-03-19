import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CITIES, FAKE_TRIPS, type Trip } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const RECENT_SEARCHES_KEY = 'santu_recent_searches';
const MAX_RECENT = 8;

type RecentSearch = {
  from: string;
  to: string;
  places: number | null;
  at: number;
};

function pickRandomTrips(count: number): Trip[] {
  const copy = [...FAKE_TRIPS];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

const PLACES_OPTIONS = [1, 2, 3];

function filterCities(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES;
  return CITIES.filter((city) =>
    city.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').includes(
      q.normalize('NFD').replace(/\p{Diacritic}/gu, '')
    )
  );
}

type AutocompleteFieldProps = {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  inputBg: string;
  theme: (typeof Colors)['light'];
};

function AutocompleteField({
  label,
  value,
  onChangeText,
  placeholder,
  inputBg,
  theme,
}: AutocompleteFieldProps) {
  const [focused, setFocused] = useState(false);
  const suggestions = useMemo(() => filterCities(value), [value]);
  const showSuggestions = focused && suggestions.length > 0;

  const selectCity = (city: string) => {
    onChangeText(city);
    setFocused(false);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.field}>
      <ThemedText style={[styles.label, { color: theme.icon }]}>{label}</ThemedText>
      <View style={styles.autocompleteWrap}>
        <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            placeholder={placeholder}
            placeholderTextColor={theme.icon}
            style={[styles.input, { color: theme.text }]}
            autoCapitalize="words"
          />
        </View>
        {showSuggestions && (
          <View
            style={[
              styles.suggestionsList,
              { backgroundColor: theme.background, borderColor: inputBg },
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              style={styles.suggestionsScroll}
            >
              {suggestions.map((city) => (
                <Pressable
                  key={city}
                  style={styles.suggestionItem}
                  onPress={() => selectCity(city)}
                >
                  <ThemedText style={{ color: theme.text, fontSize: 15 }}>
                    {city}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );
}

export default function RechercherScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [places, setPlaces] = useState<number | null>(null);
  const [placesModalVisible, setPlacesModalVisible] = useState(false);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [randomTrips] = useState(() => pickRandomTrips(3));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
        if (cancelled || !raw) return;
        const parsed = JSON.parse(raw) as RecentSearch[];
        if (Array.isArray(parsed)) setRecentSearches(parsed);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const addRecentSearch = useCallback((entry: Omit<RecentSearch, 'at'>) => {
    setRecentSearches((prev) => {
      const key = `${entry.from.trim().toLowerCase()}|${entry.to.trim().toLowerCase()}`;
      const at = Date.now();
      const filtered = prev.filter(
        (r) =>
          `${r.from.trim().toLowerCase()}|${r.to.trim().toLowerCase()}` !== key
      );
      const next: RecentSearch[] = [{ ...entry, at }, ...filtered].slice(0, MAX_RECENT);
      void AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const applyRecent = useCallback((r: RecentSearch) => {
    setFrom(r.from);
    setTo(r.to);
    setPlaces(r.places);
  }, []);

  const handleSearch = useCallback(() => {
    const f = from.trim();
    const t = to.trim();
    if (f && t) {
      addRecentSearch({ from: f, to: t, places });
    }
  }, [from, to, places, addRecentSearch]);

  const showRecent = recentSearches.length > 0;

  return (
    <SafeScrollView centerContent>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          Bonjour, Aboubacar
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Trouvez un départ, une arrivée et voyagez sereinement avec Santu.
        </ThemedText>
      </View>

      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: theme.background,
            ...(isDark && {
              shadowOpacity: 0.2,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.06)',
            }),
          },
        ]}
      >
        <View style={styles.fieldsCol}>
          <AutocompleteField
            label="Départ"
            value={from}
            onChangeText={setFrom}
            placeholder="Paris"
            inputBg={inputBg}
            theme={theme}
          />
          <AutocompleteField
            label="Arrivée"
            value={to}
            onChangeText={setTo}
            placeholder="Lyon"
            inputBg={inputBg}
            theme={theme}
          />
        </View>

        <View style={styles.filterCol}>
          <ThemedText style={[styles.label, { color: theme.icon }]}>Places min.</ThemedText>
          <Pressable
            style={[styles.selectWrap, { backgroundColor: inputBg }]}
            onPress={() => setPlacesModalVisible(true)}
          >
            <ThemedText
              style={[styles.selectText, { color: places ? theme.text : theme.icon }]}
            >
              {places ?? 'Sélectionner'}
            </ThemedText>
            <IconSymbol name="chevron.down" size={14} color={theme.icon} />
          </Pressable>
        </View>

        <Modal
          visible={placesModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPlacesModalVisible(false)}
        >
          <Pressable
            style={styles.modalOverlay}
            onPress={() => setPlacesModalVisible(false)}
          >
            <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
              {PLACES_OPTIONS.map((n) => (
                <Pressable
                  key={n}
                  style={styles.modalOption}
                  onPress={() => {
                    setPlaces(n);
                    setPlacesModalVisible(false);
                  }}
                >
                  <ThemedText style={[styles.modalOptionText, { color: theme.text }]}>
                    {n}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        <Pressable
          style={[styles.searchBtn, { backgroundColor: theme.tint }]}
          onPress={handleSearch}
        >
          <ThemedText style={styles.searchBtnText}>Rechercher</ThemedText>
        </Pressable>
      </View>

      <View style={styles.secondarySection}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
          {showRecent ? 'Recherches récentes' : 'Suggestions pour vous'}
        </ThemedText>
        <ThemedText style={[styles.sectionHint, { color: theme.icon }]}>
          {showRecent
            ? 'Touchez une recherche pour la réutiliser.'
            : 'Trois trajets au hasard — explorez Santu.'}
        </ThemedText>

        {showRecent ? (
          <View style={styles.secondaryList}>
            {recentSearches.map((r) => (
              <Pressable
                key={`${r.from}-${r.to}-${r.at}`}
                style={[styles.recentRow, { backgroundColor: inputBg }]}
                onPress={() => applyRecent(r)}
              >
                <IconSymbol name="magnifyingglass" size={18} color={theme.icon} />
                <View style={styles.recentRowText}>
                  <ThemedText style={[styles.recentRoute, { color: theme.text }]}>
                    {r.from} → {r.to}
                  </ThemedText>
                  {r.places != null && (
                    <ThemedText style={[styles.recentMeta, { color: theme.icon }]}>
                      {r.places} place{r.places > 1 ? 's' : ''} min.
                    </ThemedText>
                  )}
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.secondaryList}>
            {randomTrips.map((trip) => (
              <Pressable
                key={trip.id}
                style={[styles.suggestRow, { backgroundColor: inputBg }]}
                onPress={() => router.push(`/trip-view?id=${trip.id}`)}
              >
                <View style={styles.suggestRowMain}>
                  <ThemedText style={[styles.suggestRoute, { color: theme.text }]}>
                    {trip.from} → {trip.to}
                  </ThemedText>
                  <ThemedText style={[styles.suggestMeta, { color: theme.icon }]}>
                    {trip.whenLabel} · {trip.departTime} · {trip.seatsLeft} place
                    {trip.seatsLeft > 1 ? 's' : ''}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.suggestPrice, { color: theme.tint }]}>
                  {trip.priceEUR}€
                </ThemedText>
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </SafeScrollView>
  );
}


const styles = StyleSheet.create({
  header: {
    marginBottom: 28,
    alignItems: 'flex-start',
    gap: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 17,
    opacity: 0.75,
    fontWeight: '400',
    letterSpacing: 0.5,
  },
  searchCard: {
    gap: 14,
    padding: 16,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  fieldsCol: {
    gap: 12,
  },
  field: {
    gap: 6,
  },
  autocompleteWrap: {
    position: 'relative',
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 3,
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 180,
    zIndex: 10,
  },
  suggestionsScroll: {
    maxHeight: 176,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  inputWrap: {
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: {
    paddingVertical: 11,
    fontSize: 15,
    fontWeight: '500',
  },
  filterCol: {
    gap: 6,
  },
  selectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  selectText: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 280,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  modalOptionText: {
    fontSize: 17,
    fontWeight: '400',
  },
  searchBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  secondarySection: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    marginTop: 28,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: 14,
    marginBottom: 4,
  },
  secondaryList: {
    gap: 10,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  recentRowText: {
    flex: 1,
    gap: 2,
  },
  recentRoute: {
    fontSize: 16,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 13,
  },
  suggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  suggestRowMain: {
    flex: 1,
    gap: 4,
  },
  suggestRoute: {
    fontSize: 16,
    fontWeight: '600',
  },
  suggestMeta: {
    fontSize: 13,
  },
  suggestPrice: {
    fontSize: 17,
    fontWeight: '700',
  },
  resultsHeader: {
    marginTop: 10,
  },
  resultsTitle: {
    fontSize: 18,
  },
  list: {
    gap: 12,
    marginTop: 12,
  },
  tripCard: {
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
  },
  tripTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  tripRoute: {
    flex: 1,
    gap: 4,
  },
  tripRouteText: {
    fontSize: 16,
  },
  tripMeta: {
    fontSize: 13,
    opacity: 0.78,
  },
  tripPrice: {
    fontSize: 16,
  },
  tripBottom: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  emptyState: {
    marginTop: 12,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  emptySubtitle: {
    opacity: 0.75,
  },
  detailsCard: {
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    gap: 8,
  },
  detailsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailsTitle: {
    fontSize: 17,
  },
  price: {
    fontSize: 18,
  },
  detailsLine: {
    fontSize: 13,
    opacity: 0.82,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tagText: {
    fontSize: 13,
    opacity: 0.9,
    fontWeight: '500',
  },
  reserveBtn: {
    marginTop: 6,
    borderRadius: 999,
    paddingVertical: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  reserveBtnText: {
    fontWeight: '700',
    fontSize: 16,
  },
});

