import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { CITIES } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PLACES_OPTIONS = [1, 2, 3, 4];

function normalize(s: string): string {
  return s.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function filterCities(query: string, exclude: string): string[] {
  const q = normalize(query);
  const ex = normalize(exclude);
  const all = q ? CITIES.filter((c) => normalize(c).includes(q)) : CITIES;
  return all.filter((c) => normalize(c) !== ex).slice(0, 5);
}

export default function RechercherScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const dividerColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const inputBg = isDark ? 'rgba(255,255,255,0.05)' : '#f5f5f7';
  const cardBg = isDark ? '#1c1c1e' : '#ffffff';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [places, setPlaces] = useState<number | null>(null);
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);

  const fromRef = useRef<TextInput>(null);
  const toRef = useRef<TextInput>(null);

  const fromSuggestions = useMemo(
    () => (activeField === 'from' ? filterCities(from, to) : []),
    [from, to, activeField]
  );
  const toSuggestions = useMemo(
    () => (activeField === 'to' ? filterCities(to, from) : []),
    [from, to, activeField]
  );

  const selectFrom = useCallback((city: string) => {
    setFrom(city);
    setActiveField('to');
    setTimeout(() => toRef.current?.focus(), 80);
  }, []);

  const selectTo = useCallback((city: string) => {
    setTo(city);
    setActiveField(null);
    Keyboard.dismiss();
  }, []);

  const handleSwap = useCallback(() => {
    setFrom(to);
    setTo(from);
  }, [from, to]);

  const canSearch = from.trim().length > 0 && to.trim().length > 0;

  const handleSearch = useCallback(() => {
    const f = from.trim();
    const t = to.trim();
    if (!f || !t) return;
    Keyboard.dismiss();
    router.push({
      pathname: '/search-results',
      params: { from: f, to: t, ...(places != null ? { places: String(places) } : {}) },
    });
  }, [from, to, places, router]);

  const activeSuggestions = activeField === 'from' ? fromSuggestions : toSuggestions;
  const onSelectSuggestion = activeField === 'from' ? selectFrom : selectTo;

  return (
    <SafeScrollView centerContent keyboardAvoiding>
      {/* ─── EN-TÊTE ─── */}
      <View style={styles.header}>
        <ThemedText style={[styles.hello, { color: theme.icon }]}>Bonjour,</ThemedText>
        <ThemedText style={[styles.name, { color: theme.text }]}>Aboubacar.</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Où souhaitez-vous aller ?
        </ThemedText>
      </View>

      {/* ─── CARTE DE RECHERCHE ─── */}
      <View style={[styles.card, { backgroundColor: cardBg, shadowColor: isDark ? '#000' : '#555' }]}>
        {/* Champs départ + arrivée */}
        <View style={styles.routeBlock}>
          {/* Colonne icônes + ligne de connexion */}
          <View style={styles.iconsCol}>
            <View style={[styles.dot, { backgroundColor: theme.tint }]} />
            <View style={[styles.connector, { backgroundColor: dividerColor }]} />
            <View style={[styles.dotRing, { borderColor: theme.text }]} />
          </View>

          {/* Colonne inputs */}
          <View style={styles.inputsCol}>
            <TextInput
              ref={fromRef}
              value={from}
              onChangeText={setFrom}
              onFocus={() => setActiveField('from')}
              onBlur={() => setTimeout(() => setActiveField((a) => (a === 'from' ? null : a)), 200)}
              placeholder="Ville de départ"
              placeholderTextColor={theme.icon}
              style={[
                styles.routeInput,
                { color: theme.text, backgroundColor: activeField === 'from' ? inputBg : 'transparent' },
              ]}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => toRef.current?.focus()}
              clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
            />
            {from.length > 0 && Platform.OS !== 'ios' && activeField === 'from' && (
              <Pressable
                onPress={() => { setFrom(''); fromRef.current?.focus(); }}
                hitSlop={10}
                style={styles.clearInline}
              >
                <MaterialIcons name="close" size={16} color={theme.icon} />
              </Pressable>
            )}

            <View style={[styles.inputDivider, { backgroundColor: dividerColor }]} />

            <TextInput
              ref={toRef}
              value={to}
              onChangeText={setTo}
              onFocus={() => setActiveField('to')}
              onBlur={() => setTimeout(() => setActiveField((a) => (a === 'to' ? null : a)), 200)}
              placeholder="Ville d'arrivée"
              placeholderTextColor={theme.icon}
              style={[
                styles.routeInput,
                { color: theme.text, backgroundColor: activeField === 'to' ? inputBg : 'transparent' },
              ]}
              autoCapitalize="words"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
            />
            {to.length > 0 && Platform.OS !== 'ios' && activeField === 'to' && (
              <Pressable
                onPress={() => { setTo(''); toRef.current?.focus(); }}
                hitSlop={10}
                style={styles.clearInline}
              >
                <MaterialIcons name="close" size={16} color={theme.icon} />
              </Pressable>
            )}
          </View>

          {/* Bouton swap */}
          {(from.length > 0 || to.length > 0) && (
            <Pressable
              onPress={handleSwap}
              style={[styles.swapBtn, { backgroundColor: inputBg, borderColor: dividerColor }]}
              hitSlop={6}
            >
              <MaterialIcons name="swap-vert" size={18} color={theme.icon} />
            </Pressable>
          )}
        </View>

        {/* ─── SUGGESTIONS (chips) ─── */}
        {activeSuggestions.length > 0 && (
          <View style={[styles.suggestionsWrap, { borderTopColor: dividerColor }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.suggestionsScroll}
            >
              {activeSuggestions.map((city) => (
                <Pressable
                  key={city}
                  onPress={() => onSelectSuggestion(city)}
                  style={[styles.suggestionChip, { backgroundColor: inputBg }]}
                >
                  <MaterialIcons name="place" size={13} color={theme.tint} />
                  <ThemedText style={[styles.suggestionChipText, { color: theme.text }]}>
                    {city}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ─── PLACES ─── */}
        <View style={[styles.placesRow, { borderTopColor: dividerColor }]}>
          <ThemedText style={[styles.placesLabel, { color: theme.icon }]}>Places min.</ThemedText>
          <View style={styles.chips}>
            {PLACES_OPTIONS.map((n) => {
              const active = places === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setPlaces(active ? null : n)}
                  style={[
                    styles.chip,
                    active
                      ? { backgroundColor: theme.tint }
                      : { backgroundColor: inputBg },
                  ]}
                >
                  <ThemedText style={[styles.chipText, { color: active ? '#1a1a1a' : theme.text }]}>
                    {n}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ─── BOUTON RECHERCHER ─── */}
        <Pressable
          style={[
            styles.searchBtn,
            {
              backgroundColor: canSearch
                ? theme.tint
                : isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.07)',
            },
          ]}
          onPress={handleSearch}
          disabled={!canSearch}
        >
          <MaterialIcons name="search" size={20} color={canSearch ? '#1a1a1a' : theme.icon} />
          <ThemedText
            style={[styles.searchBtnText, { color: canSearch ? '#1a1a1a' : theme.icon }]}
          >
            Rechercher
          </ThemedText>
        </Pressable>
      </View>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 32,
    gap: 2,
  },
  hello: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.1,
  },
  name: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 46,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    letterSpacing: 0.1,
    marginTop: 10,
  },
  card: {
    borderRadius: 22,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  /* Route block */
  routeBlock: {
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 18,
    paddingVertical: 8,
    gap: 12,
  },
  iconsCol: {
    width: 18,
    alignItems: 'center',
    paddingVertical: 20,
    gap: 0,
  },
  dot: {
    width: 11,
    height: 11,
    borderRadius: 6,
  },
  connector: {
    flex: 1,
    width: 2,
    borderRadius: 1,
    marginVertical: 4,
  },
  dotRing: {
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 2,
  },
  inputsCol: {
    flex: 1,
  },
  routeInput: {
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  inputDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 10,
  },
  clearInline: {
    position: 'absolute',
    right: 10,
    top: 15,
    padding: 2,
  },
  swapBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  /* Suggestions chips */
  suggestionsWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  suggestionsScroll: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 20,
  },
  suggestionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  /* Places */
  placesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  placesLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
  },
  /* Bouton */
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 14,
    marginTop: 6,
    paddingVertical: 16,
    borderRadius: 16,
  },
  searchBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
