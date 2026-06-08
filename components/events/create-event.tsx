import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { DateField } from '@/components/publish/date-field';
import { IconTextField } from '@/components/publish/icon-text-field';
import UploadFile from '@/components/shared/upload-file';
import { ThemedText } from '@/components/shared/themed-text';
import { EVENT_TYPE_LABELS, type EventType } from '@/constants/mock-events';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';
const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];

export type EventFormData = {
  title: string;
  type: EventType;
  imageUri: string | null;
  description: string;
  eventDate: Date;
  eventTime: Date;
  address: string;
  linkLabel: string;
  linkUrl: string;
};

export type CreateEventProps = {
  onSubmit: (data: EventFormData) => void | Promise<void>;
};

function formatEventDate(d: Date): string {
  return d.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatEventTime(d: Date): string {
  return d.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function defaultTime(): Date {
  const d = new Date();
  d.setHours(19, 0, 0, 0);
  return d;
}

export function CreateEvent({ onSubmit }: CreateEventProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [title, setTitle] = useState('');
  const [type, setType] = useState<EventType>('Networking');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [eventDate, setEventDate] = useState<Date | null>(null);
  const [eventTime, setEventTime] = useState<Date | null>(null);
  const [address, setAddress] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [androidDateOpen, setAndroidDateOpen] = useState(false);
  const [iosDateOpen, setIosDateOpen] = useState(false);
  const [androidTimeOpen, setAndroidTimeOpen] = useState(false);
  const [iosTimeOpen, setIosTimeOpen] = useState(false);

  const canSubmit = useMemo(
    () => title.trim().length > 0 && eventDate !== null && eventTime !== null && address.trim().length > 0 && !submitting,
    [title, eventDate, eventTime, address, submitting],
  );

  const openDatePicker = () => {
    if (Platform.OS === 'android') setAndroidDateOpen(true);
    else setIosDateOpen(true);
  };

  const openTimePicker = () => {
    if (Platform.OS === 'android') setAndroidTimeOpen(true);
    else setIosTimeOpen(true);
  };

  const onAndroidDateChange = (event: DateTimePickerEvent, selected?: Date) => {
    setAndroidDateOpen(false);
    if (event.type === 'set' && selected) setEventDate(selected);
  };

  const onAndroidTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    setAndroidTimeOpen(false);
    if (event.type === 'set' && selected) setEventTime(selected);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !eventDate || !eventTime) return;
    if(!linkUrl.trim().toLowerCase().startsWith('http')) {
      Alert.alert('Lien invalide', 'Le lien doit commencer par http:// ou https://');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        imageUri,
        description: description.trim(),
        eventDate,
        eventTime,
        address: address.trim(),
        linkLabel: linkLabel.trim(),
        linkUrl: linkUrl.trim().toLowerCase(),
      });
      setTitle('');
      setType('Networking');
      setImageUri(null);
      setDescription('');
      setEventDate(null);
      setEventTime(null);
      setAddress('');
      setLinkLabel('');
      setLinkUrl('');
    } finally {
      setSubmitting(false);
    }
  };

  const datePickerValue = eventDate ?? new Date();
  const timePickerValue = eventTime ?? defaultTime();

  return (
    <View style={styles.root}>
      <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
        <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>INFORMATIONS</ThemedText>
        <IconTextField
          label="Titre"
          value={title}
          onChangeText={setTitle}
          placeholder="Ex. Afterwork fondateurs"
          icon="event"
          themeText={theme.text}
          themeMuted={theme.icon}
          fieldBg={fieldBg}
          borderColor={divider}
        />
        <View style={styles.fieldGroup}>
          <ThemedText style={[styles.fieldLabel, { color: theme.icon }]}>Type</ThemedText>
          <View style={styles.typeRow}>
            {EVENT_TYPES.map((eventType) => {
              const active = type === eventType;
              return (
                <Pressable
                  key={eventType}
                  onPress={() => setType(eventType)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: active ? `${ACCENT}18` : fieldBg,
                      borderColor: active ? ACCENT : divider,
                    },
                  ]}
                >
                  <ThemedText style={[styles.typeChipText, { color: active ? ACCENT : theme.text }]}>
                    {EVENT_TYPE_LABELS[eventType]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>
        <UploadFile
          label="Image de couverture"
          value={imageUri}
          onChange={setImageUri}
          variant="document"
          hint="Optionnel — affichée sur la carte événement"
          themeMuted={theme.icon}
          fieldBg={fieldBg}
          borderColor={divider}
          tint={ACCENT}
          compact
        />
      </View>

      <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
        <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>DATE & LIEU</ThemedText>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <DateField
              label="Date"
              displayValue={eventDate ? formatEventDate(eventDate) : null}
              placeholder="Choisir une date"
              onPress={openDatePicker}
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
            {androidDateOpen ? (
              <DateTimePicker
                value={datePickerValue}
                mode="date"
                display="default"
                onChange={onAndroidDateChange}
                minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
              />
            ) : null}
          </View>
          <View style={styles.col}>
            <DateField
              label="Heure"
              displayValue={eventTime ? formatEventTime(eventTime) : null}
              placeholder="Choisir une heure"
              onPress={openTimePicker}
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
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
          </View>
        </View>
        <IconTextField
          label="Adresse"
          value={address}
          onChangeText={setAddress}
          placeholder="Ex. 12 Quai du Port, Marseille"
          icon="place"
          themeText={theme.text}
          themeMuted={theme.icon}
          fieldBg={fieldBg}
          borderColor={divider}
        />
      </View>

      <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
        <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>DESCRIPTION</ThemedText>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Décrivez l’événement, le programme, le public cible…"
          placeholderTextColor={theme.icon}
          style={[styles.bioInput, { color: theme.text, backgroundColor: fieldBg, borderColor: divider }]}
          multiline
          textAlignVertical="top"
          maxLength={500}
        />
      </View>

      <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
        <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>LIEN UTILE</ThemedText>
        <ThemedText style={[styles.sectionHint, { color: theme.icon }]}>Optionnel — billetterie, site, inscription…</ThemedText>
        <IconTextField
          label="Libellé"
          value={linkLabel}
          onChangeText={setLinkLabel}
          placeholder="Ex. S'inscrire"
          icon="label"
          themeText={theme.text}
          themeMuted={theme.icon}
          fieldBg={fieldBg}
          borderColor={divider}
        />
        <IconTextField
          label="URL"
          value={linkUrl}
          onChangeText={setLinkUrl}
          placeholder="https://…"
          icon="link"
          themeText={theme.text}
          themeMuted={theme.icon}
          fieldBg={fieldBg}
          borderColor={divider}
        />
      </View>

      <Pressable
        disabled={!canSubmit}
        onPress={() => void handleSubmit()}
        style={({ pressed }) => [
          styles.submitBtn,
          {
            backgroundColor: canSubmit ? ACCENT : fieldBg,
            opacity: pressed && canSubmit ? 0.92 : 1,
          },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color="#FFF" />
        ) : (
          <>
            <MaterialIcons name="event-available" size={20} color={canSubmit ? '#FFF' : theme.icon} />
            <ThemedText style={[styles.submitBtnText, { color: canSubmit ? '#FFF' : theme.icon }]}>
              Publier l&apos;événement
            </ThemedText>
          </>
        )}
      </Pressable>

      {Platform.OS !== 'android' ? (
        <>
          <Modal visible={iosDateOpen} animationType="slide" transparent onRequestClose={() => setIosDateOpen(false)}>
            <View style={styles.pickerModalRoot}>
              <Pressable style={styles.pickerBackdrop} onPress={() => setIosDateOpen(false)} />
              <View style={[styles.pickerSheet, { backgroundColor: cardBg, borderColor: divider }]}>
                <View style={styles.pickerToolbar}>
                  <Pressable onPress={() => setIosDateOpen(false)} hitSlop={12}>
                    <ThemedText style={{ color: theme.icon, fontWeight: '600' }}>Annuler</ThemedText>
                  </Pressable>
                  <ThemedText style={[styles.pickerTitle, { color: theme.text }]}>Date</ThemedText>
                  <Pressable
                    onPress={() => {
                      setEventDate((prev) => prev ?? new Date());
                      setIosDateOpen(false);
                    }}
                    hitSlop={12}
                  >
                    <ThemedText style={{ color: ACCENT, fontWeight: '700' }}>OK</ThemedText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={datePickerValue}
                  mode="date"
                  display="spinner"
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(_, selected) => {
                    if (selected) setEventDate(selected);
                  }}
                  minimumDate={new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </View>
            </View>
          </Modal>
          <Modal visible={iosTimeOpen} animationType="slide" transparent onRequestClose={() => setIosTimeOpen(false)}>
            <View style={styles.pickerModalRoot}>
              <Pressable style={styles.pickerBackdrop} onPress={() => setIosTimeOpen(false)} />
              <View style={[styles.pickerSheet, { backgroundColor: cardBg, borderColor: divider }]}>
                <View style={styles.pickerToolbar}>
                  <Pressable onPress={() => setIosTimeOpen(false)} hitSlop={12}>
                    <ThemedText style={{ color: theme.icon, fontWeight: '600' }}>Annuler</ThemedText>
                  </Pressable>
                  <ThemedText style={[styles.pickerTitle, { color: theme.text }]}>Heure</ThemedText>
                  <Pressable
                    onPress={() => {
                      setEventTime((prev) => prev ?? defaultTime());
                      setIosTimeOpen(false);
                    }}
                    hitSlop={12}
                  >
                    <ThemedText style={{ color: ACCENT, fontWeight: '700' }}>OK</ThemedText>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={timePickerValue}
                  mode="time"
                  display="spinner"
                  is24Hour
                  themeVariant={isDark ? 'dark' : 'light'}
                  onChange={(_, selected) => {
                    if (selected) setEventTime(selected);
                  }}
                />
              </View>
            </View>
          </Modal>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 14 },
  section: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 14,
  },
  sectionKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  sectionHint: { fontSize: 12, lineHeight: 17, marginTop: -6 },
  fieldGroup: { gap: 8 },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.25 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  typeChipText: { fontSize: 12, fontWeight: '600' },
  twoCols: { flexDirection: 'row', gap: 10 },
  col: { flex: 1, minWidth: 0 },
  bioInput: {
    minHeight: 110,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700' },
  pickerModalRoot: { flex: 1, justifyContent: 'flex-end' },
  pickerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  pickerSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingBottom: 24,
  },
  pickerToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerTitle: { fontSize: 16, fontWeight: '700' },
});
