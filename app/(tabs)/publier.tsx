import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const SEAT_OPTIONS = [1, 2, 3, 4];
const OPTION_ITEMS = ['Climatisation', 'Musique', 'Bagages', 'Animaux'];

const PAGE_BG = { light: '#EBECEF', dark: '#0A0A0C' } as const;
const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

function SectionCard({
  children,
  surface,
  borderColor,
  style,
}: {
  children: React.ReactNode;
  surface: string;
  borderColor: string;
  style?: object;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: surface, borderColor }, style]}>{children}</View>
  );
}

function SectionKicker({ children, color }: { children: string; color: string }) {
  return <ThemedText style={[styles.sectionKicker, { color }]}>{children}</ThemedText>;
}

function TeslaField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>{label}</ThemedText>
      <View style={[styles.inputShell, { backgroundColor: fieldBg, borderColor }]}>
        <MaterialIcons name={icon} size={20} color={themeMuted} style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeMuted}
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
  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const fieldBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

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

  const tintSoft = isDark ? 'rgba(230,168,0,0.14)' : 'rgba(230,168,0,0.18)';

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
        <TeslaField
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
        <TeslaField
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
            <TeslaField
              label="Date"
              value={date}
              onChangeText={setDate}
              placeholder="ven. 28 mars"
              icon="calendar-month"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
            />
          </View>
          <View style={styles.col}>
            <TeslaField
              label="Heure"
              value={time}
              onChangeText={setTime}
              placeholder="08:30"
              icon="schedule"
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
          <SectionKicker color={muted}>TARIF & VÉHICULE</SectionKicker>
        </View>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <TeslaField
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
            <TeslaField
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
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>OPTIONS</SectionKicker>
        </View>
        <View style={styles.optionWrap}>
          {OPTION_ITEMS.map((item) => {
            const selected = selectedOptions.includes(item);
            return (
              <Pressable
                key={item}
                onPress={() => toggleOption(item)}
                style={({ pressed }) => [
                  styles.optionPill,
                  {
                    borderColor: selected ? theme.tint : borderSubtle,
                    backgroundColor: selected ? tintSoft : 'transparent',
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.optionPillText, { color: selected ? theme.text : muted }]}
                >
                  {item}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
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
          size={22}
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
    marginBottom: 4,
    gap: 8,
  },
  heroKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2.4,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 38,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
    maxWidth: 340,
  },
  sectionCard: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  kickerBlock: {
    marginBottom: 14,
  },
  sectionKicker: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 12,
  },
  commentKickerWrap: {
    flex: 1,
    minWidth: 0,
  },
  optionalBadge: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 10,
    opacity: 0.85,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    letterSpacing: -0.2,
  },
  inCardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  seatRow: {
    flexDirection: 'row',
    gap: 10,
  },
  seatPill: {
    flex: 1,
    minWidth: 0,
    height: 48,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatPillText: {
    fontSize: 17,
    fontWeight: '700',
  },
  seatHint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 12,
    fontWeight: '500',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  optionPillText: {
    fontSize: 14,
    fontWeight: '600',
  },
  textAreaShell: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
  },
  textArea: {
    minHeight: 100,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
  },
  primaryCta: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryCtaText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  footerNote: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 18,
    fontWeight: '500',
    paddingHorizontal: 12,
  },
  tabBarSpacer: {
    height: 88,
  },
});
