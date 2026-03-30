import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { DateField } from '@/components/publish/date-field';
import { IconTextField } from '@/components/publish/icon-text-field';
import { SectionCard } from '@/components/publish/section-card';
import { SectionKicker } from '@/components/publish/section-kicker';
import SafeScrollView from '@/components/shared/scroll-view';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const SEAT_OPTIONS = [1, 2, 3, 4];

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const ON_TINT = '#111111';

function formatTripDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTripTime(d: Date): string {
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function defaultTimeForPicker(): Date {
  const d = new Date();
  d.setHours(8, 0, 0, 0);
  return d;
}

export default function PublishScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const fieldBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [tripDate, setTripDate] = useState<Date | null>(null);
  const [androidDateOpen, setAndroidDateOpen] = useState(false);
  const [iosDateOpen, setIosDateOpen] = useState(false);
  const [tripTime, setTripTime] = useState<Date | null>(null);
  const [androidTimeOpen, setAndroidTimeOpen] = useState(false);
  const [iosTimeOpen, setIosTimeOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [car, setCar] = useState('');
  const [comment, setComment] = useState('');
  const [seats, setSeats] = useState<number>(2);

  const canPublish = useMemo(
    () =>
      from.trim().length > 0 &&
      to.trim().length > 0 &&
      tripDate !== null &&
      tripTime !== null &&
      price.trim().length > 0,
    [from, to, tripDate, tripTime, price],
  );

  const openDatePicker = () => {
    if (Platform.OS === 'android') {
      setAndroidDateOpen(true);
    } else {
      setIosDateOpen(true);
    }
  };

  const onAndroidDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setAndroidDateOpen(false);
    if (event.type === 'set' && selected) {
      setTripDate(selected);
    }
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') {
      setAndroidTimeOpen(true);
    } else {
      setIosTimeOpen(true);
    }
  };

  const onAndroidTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    setAndroidTimeOpen(false);
    if (event.type === 'set' && selected) {
      setTripTime(selected);
    }
  };

  const pickerValue = tripDate ?? new Date();
  const timePickerValue = tripTime ?? defaultTimeForPicker();

  return (
    <SafeScrollView keyboardAvoiding screenBackgroundColor={pageBg}>
      <View style={styles.hero}>
        <ThemedText style={[styles.heroKicker, { color: muted }]}>PUBLIER</ThemedText>
        <ThemedText style={[styles.heroTitle, { color: theme.text }]}>Nouveau trajet</ThemedText>
        <ThemedText style={[styles.heroSubtitle, { color: muted }]}>
          Renseignez l’essentiel. Les passagers vous contacteront directement.
        </ThemedText>
      </View>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>ITINÉRAIRE</SectionKicker>
        </View>
        <IconTextField
          label="Départ"
          value={from}
          onChangeText={setFrom}
          placeholder="Conakry"
          icon="trip-origin"
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
        />
        <View style={[styles.inCardDivider, { backgroundColor: borderSubtle }]} />
        <IconTextField
          label="Arrivée"
          value={to}
          onChangeText={setTo}
          placeholder="Kindia"
          icon="place"
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
        />
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PLANNING</SectionKicker>
        </View>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <DateField
              label="Date"
              displayValue={tripDate ? formatTripDate(tripDate) : null}
              placeholder="Choisir une date"
              onPress={openDatePicker}
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
            />
            {androidDateOpen ? (
              <DateTimePicker
                value={pickerValue}
                mode="date"
                display="default"
                onChange={onAndroidDateChange}
                minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
              />
            ) : null}
            {Platform.OS !== 'android' ? (
              <Modal visible={iosDateOpen} animationType="slide" transparent>
                <View style={styles.dateModalRoot}>
                  <Pressable style={styles.dateModalBackdrop} onPress={() => setIosDateOpen(false)} />
                  <View style={[styles.dateModalSheet, { backgroundColor: surface, borderColor: borderSubtle }]}>
                    <View style={styles.dateModalToolbar}>
                      <Pressable onPress={() => setIosDateOpen(false)} hitSlop={12}>
                        <ThemedText style={[styles.dateModalBtn, { color: muted }]}>Annuler</ThemedText>
                      </Pressable>
                      <ThemedText style={[styles.dateModalTitle, { color: theme.text }]}>Date du trajet</ThemedText>
                      <Pressable
                        onPress={() => {
                          setTripDate((prev) => prev ?? new Date());
                          setIosDateOpen(false);
                        }}
                        hitSlop={12}
                      >
                        <ThemedText style={[styles.dateModalBtn, { color: theme.tint, fontWeight: '700' }]}>
                          OK
                        </ThemedText>
                      </Pressable>
                    </View>
                    <DateTimePicker
                      value={pickerValue}
                      mode="date"
                      display="spinner"
                      themeVariant={isDark ? 'dark' : 'light'}
                      onChange={(_, selected) => {
                        if (selected) setTripDate(selected);
                      }}
                      minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
                    />
                  </View>
                </View>
              </Modal>
            ) : null}
          </View>
          <View style={styles.col}>
            <DateField
              label="Heure"
              displayValue={tripTime ? formatTripTime(tripTime) : null}
              placeholder="Choisir une heure"
              onPress={openTimePicker}
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              icon="schedule"
            />
            {androidTimeOpen ? (
              <DateTimePicker
                value={timePickerValue}
                mode="time"
                display="default"
                is24Hour
                onChange={onAndroidTimeChange}
              />
            ) : null}
            {Platform.OS !== 'android' ? (
              <Modal visible={iosTimeOpen} animationType="slide" transparent>
                <View style={styles.dateModalRoot}>
                  <Pressable style={styles.dateModalBackdrop} onPress={() => setIosTimeOpen(false)} />
                  <View style={[styles.dateModalSheet, { backgroundColor: surface, borderColor: borderSubtle }]}>
                    <View style={styles.dateModalToolbar}>
                      <Pressable onPress={() => setIosTimeOpen(false)} hitSlop={12}>
                        <ThemedText style={[styles.dateModalBtn, { color: muted }]}>Annuler</ThemedText>
                      </Pressable>
                      <ThemedText style={[styles.dateModalTitle, { color: theme.text }]}>Heure du trajet</ThemedText>
                      <Pressable
                        onPress={() => {
                          setTripTime((prev) => prev ?? defaultTimeForPicker());
                          setIosTimeOpen(false);
                        }}
                        hitSlop={12}
                      >
                        <ThemedText style={[styles.dateModalBtn, { color: theme.tint, fontWeight: '700' }]}>
                          OK
                        </ThemedText>
                      </Pressable>
                    </View>
                    <DateTimePicker
                      value={timePickerValue}
                      mode="time"
                      display="spinner"
                      is24Hour
                      themeVariant={isDark ? 'dark' : 'light'}
                      onChange={(_, selected) => {
                        if (selected) setTripTime(selected);
                      }}
                    />
                  </View>
                </View>
              </Modal>
            ) : null}
          </View>
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>TARIF & VÉHICULE</SectionKicker>
        </View>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <IconTextField
              label="Prix / place (GNF)"
              value={price}
              onChangeText={setPrice}
              placeholder="45 000"
              icon="payments"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
            />
          </View>
          <View style={styles.col}>
            <IconTextField
              label="Véhicule"
              value={car}
              onChangeText={setCar}
              placeholder="Toyota Yaris"
              icon="directions-car"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
            />
          </View>
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PLACES</SectionKicker>
        </View>
        <View style={styles.seatRow}>
          {SEAT_OPTIONS.map((n) => {
            const active = seats === n;
            return (
              <Pressable
                key={n}
                onPress={() => setSeats(n)}
                style={({ pressed }) => [
                  styles.seatPill,
                  {
                    backgroundColor: active ? theme.tint : 'transparent',
                    borderColor: active ? theme.tint : borderSubtle,
                    opacity: pressed ? 0.88 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.seatPillText,
                    { color: active ? ON_TINT : theme.text },
                  ]}
                >
                  {n}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
        <ThemedText style={[styles.seatHint, { color: muted }]}>
          Nombre de places proposées aux passagers.
        </ThemedText>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.commentHeader}>
          <View style={styles.commentKickerWrap}>
            <SectionKicker color={muted}>COMMENTAIRE</SectionKicker>
          </View>
          <ThemedText style={[styles.optionalBadge, { color: muted }]}>Optionnel</ThemedText>
        </View>
        <View style={[styles.textAreaShell, { backgroundColor: fieldBg, borderColor: borderSubtle }]}>
          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Ex. point de rendez-vous précis, retard max…"
            placeholderTextColor={muted}
            style={[styles.textArea, { color: theme.text }]}
            multiline
            textAlignVertical="top"
          />
        </View>
      </SectionCard>

      <Pressable
        disabled={!canPublish}
        onPress={() => {}}
        style={({ pressed }) => [
          styles.primaryCta,
          {
            backgroundColor: canPublish ? theme.tint : fieldBg,
            opacity: !canPublish ? 1 : pressed ? 0.92 : 1,
          },
        ]}
      >
        <MaterialIcons
          name="publish"
          size={18}
          color={canPublish ? ON_TINT : muted}
        />
        <ThemedText style={[styles.primaryCtaText, { color: canPublish ? ON_TINT : muted }]}>
          Publier le trajet
        </ThemedText>
      </Pressable>

      <ThemedText style={[styles.footerNote, { color: muted }]}>
        Vous pourrez modifier ou retirer l’annonce plus tard.
      </ThemedText>

      {/* Espace pour la tab bar flottante */}
      <View style={styles.tabBarSpacer} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 3,
    gap: 5,
  },
  heroKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.8,
  },
  heroTitle: {
    fontSize: 23,
    fontWeight: '700',
    letterSpacing: -0.7,
    lineHeight: 28,
  },
  heroSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
    maxWidth: 320,
  },
  tabBarSpacer: {
    height: 76,
  },
  kickerBlock: {
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 10,
  },
  commentKickerWrap: {
    flex: 1,
    minWidth: 0,
  },
  optionalBadge: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateModalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  dateModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dateModalSheet: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 24,
  },
  dateModalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 8,
  },
  dateModalTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  dateModalBtn: {
    fontSize: 16,
    minWidth: 64,
  },
  inCardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  seatRow: {
    flexDirection: 'row',
    gap: 8,
  },
  seatPill: {
    flex: 1,
    minWidth: 0,
    height: 42,
    borderRadius: 11,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatPillText: {
    fontSize: 15,
    fontWeight: '700',
  },
  seatHint: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 10,
    fontWeight: '500',
  },
  textAreaShell: {
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
  },
  textArea: {
    minHeight: 88,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  primaryCta: {
    marginTop: 6,
    borderRadius: 9,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  primaryCtaText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
    fontWeight: '500',
    paddingHorizontal: 10,
  },
});
