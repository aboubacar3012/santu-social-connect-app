import React, { useMemo, useState } from 'react';
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
import { CITIES } from '@/constants/fake-trips';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
                  <ThemedText style={{ color: theme.text, fontSize: 16 }}>
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
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const inputBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [places, setPlaces] = useState<number | null>(null);
  const [placesModalVisible, setPlacesModalVisible] = useState(false);

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
            <IconSymbol name="chevron.down" size={16} color={theme.icon} />
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
          onPress={() => {}}
        >
          <ThemedText style={styles.searchBtnText}>Rechercher</ThemedText>
        </Pressable>
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
    gap: 20,
    padding: 24,
    borderRadius: 20,
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
    gap: 18,
  },
  field: {
    gap: 10,
  },
  autocompleteWrap: {
    position: 'relative',
  },
  suggestionsList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 180,
    zIndex: 10,
  },
  suggestionsScroll: {
    maxHeight: 176,
  },
  suggestionItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  inputWrap: {
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  input: {
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  filterCol: {
    gap: 10,
  },
  selectWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectText: {
    fontSize: 16,
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
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
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

