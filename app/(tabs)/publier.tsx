import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SEAT_OPTIONS = [1, 2, 3, 4];
const OPTION_ITEMS = ['Climatisation', 'Musique', 'Bagages', 'Animaux'];

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  themeText,
  themeIcon,
  inputBg,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  themeText: string;
  themeIcon: string;
  inputBg: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.label, { color: themeIcon }]}>{label}</ThemedText>
      <View style={[styles.inputWrap, { backgroundColor: inputBg }]}>
        <MaterialIcons name={icon} size={18} color={themeIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeIcon}
          style={[styles.input, { color: themeText }]}
          autoCapitalize="words"
        />
      </View>
    </View>
  );
}

export default function PublierScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const inputBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const cardBg = isDark ? '#1B1B1E' : '#FFFFFF';
  const accent = '#B8860B';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [car, setCar] = useState('');
  const [comment, setComment] = useState('');
  const [seats, setSeats] = useState<number>(2);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const canPublish = useMemo(
    () =>
      from.trim().length > 0 &&
      to.trim().length > 0 &&
      date.trim().length > 0 &&
      time.trim().length > 0 &&
      price.trim().length > 0,
    [from, to, date, time, price]
  );

  const toggleOption = (item: string) => {
    setSelectedOptions((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

  return (
    <SafeScrollView keyboardAvoiding>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Publier un trajet</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Renseignez les informations essentielles pour recevoir des demandes rapidement.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <Field
          label="Départ"
          value={from}
          onChangeText={setFrom}
          placeholder="Conakry"
          icon="trip-origin"
          themeText={theme.text}
          themeIcon={theme.icon}
          inputBg={inputBg}
        />
        <Field
          label="Arrivée"
          value={to}
          onChangeText={setTo}
          placeholder="Kindia"
          icon="place"
          themeText={theme.text}
          themeIcon={theme.icon}
          inputBg={inputBg}
        />

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Field
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="ven. 28 mars"
              icon="calendar-month"
              themeText={theme.text}
              themeIcon={theme.icon}
              inputBg={inputBg}
            />
          </View>
          <View style={styles.col}>
            <Field
              label="Heure"
              value={time}
              onChangeText={setTime}
              placeholder="08:30"
              icon="schedule"
              themeText={theme.text}
              themeIcon={theme.icon}
              inputBg={inputBg}
            />
          </View>
        </View>

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Field
              label="Prix / place"
              value={price}
              onChangeText={setPrice}
              placeholder="45000"
              icon="payments"
              themeText={theme.text}
              themeIcon={theme.icon}
              inputBg={inputBg}
            />
          </View>
          <View style={styles.col}>
            <Field
              label="Véhicule"
              value={car}
              onChangeText={setCar}
              placeholder="Toyota Yaris"
              icon="directions-car"
              themeText={theme.text}
              themeIcon={theme.icon}
              inputBg={inputBg}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Places disponibles
          </ThemedText>
          <View style={styles.chips}>
            {SEAT_OPTIONS.map((n) => {
              const active = seats === n;
              return (
                <Pressable
                  key={n}
                  onPress={() => setSeats(n)}
                  style={[
                    styles.chip,
                    { backgroundColor: active ? accent : inputBg },
                  ]}>
                  <ThemedText style={[styles.chipText, { color: active ? '#1a1a1a' : theme.text }]}>
                    {n}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            Options du trajet
          </ThemedText>
          <View style={styles.optionGrid}>
            {OPTION_ITEMS.map((item) => {
              const selected = selectedOptions.includes(item);
              return (
                <Pressable
                  key={item}
                  onPress={() => toggleOption(item)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: selected ? accent : inputBg,
                      borderColor: selected ? accent : 'transparent',
                    },
                  ]}>
                  <ThemedText
                    style={[
                      styles.optionText,
                      { color: selected ? '#1a1a1a' : theme.text },
                    ]}>
                    {item}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <ThemedText style={[styles.label, { color: theme.icon }]}>Commentaire (optionnel)</ThemedText>
          <View style={[styles.textAreaWrap, { backgroundColor: inputBg }]}>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Ex: départ exact au rond-point Cosa, merci d'arriver 10 min avant."
              placeholderTextColor={theme.icon}
              style={[styles.textArea, { color: theme.text }]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        <Pressable
          disabled={!canPublish}
          style={[
            styles.publishBtn,
            { backgroundColor: canPublish ? accent : inputBg },
          ]}>
          <MaterialIcons
            name="publish"
            size={20}
            color={canPublish ? '#1a1a1a' : theme.icon}
          />
          <ThemedText
            style={[styles.publishBtnText, { color: canPublish ? '#1a1a1a' : theme.icon }]}>
            Publier le trajet
          </ThemedText>
        </Pressable>
      </View>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    gap: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  fieldGroup: {
    gap: 7,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    paddingVertical: 14,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
  },
  section: {
    gap: 10,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
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
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  textAreaWrap: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  textArea: {
    minHeight: 92,
    fontSize: 15,
    lineHeight: 22,
  },
  publishBtn: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  publishBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
