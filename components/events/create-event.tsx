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
  Switch,
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
import { startOfDay } from '@/libs/event-schedule';
import {
  EVENT_STATUS_HINTS,
  EVENT_STATUS_LABELS,
  EVENT_STATUSES,
  type EventStatus,
} from '@/libs/event-status';

const ACCENT = '#0077B6';
const EVENT_TYPES = Object.keys(EVENT_TYPE_LABELS) as EventType[];

export type EventFormData = {
  title: string;
  type: EventType;
  status: EventStatus;
  imageUri: string | null;
  description: string;
  startDate: Date;
  startTime: Date | null;
  endDate: Date;
  endTime: Date | null;
  isAllDay: boolean;
  isMultiDay: boolean;
  address: string;
  linkLabel: string;
  linkUrl: string;
};

export type CreateEventProps = {
  onSubmit: (data: EventFormData) => void | Promise<void>;
  initial?: EventFormData;
  submitLabel?: string;
  resetOnSubmit?: boolean;
};

type PickerTarget = 'startDate' | 'startTime' | 'endDate' | 'endTime';

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

function defaultEndTime(): Date {
  const d = new Date();
  d.setHours(21, 0, 0, 0);
  return d;
}

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
  themeText,
  themeMuted,
  divider,
  isDark,
}: {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  themeText: string;
  themeMuted: string;
  divider: string;
  isDark: boolean;
}) {
  return (
    <View style={[styles.toggleRow, { borderBottomColor: divider }]}>
      <View style={styles.toggleText}>
        <ThemedText style={[styles.toggleLabel, { color: themeText }]}>{label}</ThemedText>
        <ThemedText style={[styles.toggleHint, { color: themeMuted }]}>{hint}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? '#3A3A3C' : '#D1D1D6', true: `${ACCENT}88` }}
        thumbColor={value ? ACCENT : isDark ? '#F4F4F4' : '#FFFFFF'}
      />
    </View>
  );
}

export function CreateEvent({
  onSubmit,
  initial,
  submitLabel = "Publier l'événement",
  resetOnSubmit = true,
}: CreateEventProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [title, setTitle] = useState(initial?.title ?? '');
  const [type, setType] = useState<EventType>(initial?.type ?? 'Networking');
  const [status, setStatus] = useState<EventStatus>(initial?.status ?? 'published');
  const [imageUri, setImageUri] = useState<string | null>(initial?.imageUri ?? null);
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startDate, setStartDate] = useState<Date | null>(initial?.startDate ?? null);
  const [startTime, setStartTime] = useState<Date | null>(initial?.startTime ?? null);
  const [endDate, setEndDate] = useState<Date | null>(initial?.endDate ?? null);
  const [endTime, setEndTime] = useState<Date | null>(initial?.endTime ?? null);
  const [isAllDay, setIsAllDay] = useState(initial?.isAllDay ?? false);
  const [isMultiDay, setIsMultiDay] = useState(initial?.isMultiDay ?? false);
  const [address, setAddress] = useState(initial?.address ?? '');
  const [linkLabel, setLinkLabel] = useState(initial?.linkLabel ?? '');
  const [linkUrl, setLinkUrl] = useState(initial?.linkUrl ?? '');
  const [submitting, setSubmitting] = useState(false);

  const [androidPicker, setAndroidPicker] = useState<PickerTarget | null>(null);
  const [iosPicker, setIosPicker] = useState<PickerTarget | null>(null);

  const minDate = useMemo(() => startOfDay(new Date()), []);

  const canSubmit = useMemo(() => {
    if (submitting || title.trim().length === 0 || address.trim().length === 0) {
      return false;
    }
    if (!startDate) return false;
    if (!isAllDay && !startTime) return false;
    if (isMultiDay) {
      const end = endDate ?? startDate;
      if (startOfDay(end).getTime() < startOfDay(startDate).getTime()) return false;
    }
    return true;
  }, [submitting, title, address, startDate, startTime, isAllDay, isMultiDay, endDate]);

  const openPicker = (target: PickerTarget) => {
    if (Platform.OS === 'android') setAndroidPicker(target);
    else setIosPicker(target);
  };

  const onAndroidPickerChange = (event: DateTimePickerEvent, selected?: Date) => {
    const target = androidPicker;
    setAndroidPicker(null);
    if (event.type !== 'set' || !selected || !target) return;

    if (target === 'startDate') {
      setStartDate(selected);
      if (!isMultiDay || !endDate || startOfDay(endDate) < startOfDay(selected)) {
        setEndDate(selected);
      }
      return;
    }
    if (target === 'endDate') {
      setEndDate(selected);
      return;
    }
    if (target === 'startTime') setStartTime(selected);
    if (target === 'endTime') setEndTime(selected);
  };

  const handleAllDayChange = (next: boolean) => {
    setIsAllDay(next);
    if (next) {
      setStartTime(null);
      setEndTime(null);
    } else if (!startTime) {
      setStartTime(defaultTime());
    }
  };

  const handleMultiDayChange = (next: boolean) => {
    setIsMultiDay(next);
    if (!next && startDate) {
      setEndDate(startDate);
    } else if (next && startDate && !endDate) {
      setEndDate(startDate);
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || !startDate) return;

    const resolvedEndDate = isMultiDay ? (endDate ?? startDate) : startDate;

    const trimmedLinkUrl = linkUrl.trim();
    if (trimmedLinkUrl && !trimmedLinkUrl.toLowerCase().startsWith('http')) {
      Alert.alert('Lien invalide', 'Le lien doit commencer par http:// ou https://');
      return;
    }

    if (!isAllDay && startTime && endTime) {
      const startTs = new Date(startDate);
      startTs.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);
      const endTs = new Date(resolvedEndDate);
      endTs.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);
      if (endTs.getTime() < startTs.getTime()) {
        Alert.alert('Horaires invalides', 'L\'heure de fin doit être postérieure au début.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        type,
        status,
        imageUri,
        description: description.trim(),
        startDate,
        startTime: isAllDay ? null : startTime,
        endDate: resolvedEndDate,
        endTime: isAllDay ? null : endTime,
        isAllDay,
        isMultiDay,
        address: address.trim(),
        linkLabel: linkLabel.trim(),
        linkUrl: trimmedLinkUrl.toLowerCase(),
      });
      if (resetOnSubmit) {
        setTitle('');
        setType('Networking');
        setStatus('published');
        setImageUri(null);
        setDescription('');
        setStartDate(null);
        setStartTime(null);
        setEndDate(null);
        setEndTime(null);
        setIsAllDay(false);
        setIsMultiDay(false);
        setAddress('');
        setLinkLabel('');
        setLinkUrl('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const startDateValue = startDate ?? new Date();
  const endDateValue = endDate ?? startDate ?? new Date();
  const startTimeValue = startTime ?? defaultTime();
  const endTimeValue = endTime ?? defaultEndTime();

  const iosPickerValue = (() => {
    switch (iosPicker) {
      case 'startDate':
        return startDateValue;
      case 'endDate':
        return endDateValue;
      case 'startTime':
        return startTimeValue;
      case 'endTime':
        return endTimeValue;
      default:
        return new Date();
    }
  })();

  const iosPickerMode = iosPicker === 'startTime' || iosPicker === 'endTime' ? 'time' : 'date';
  const iosPickerTitle =
    iosPicker === 'startDate'
      ? 'Date de début'
      : iosPicker === 'endDate'
        ? 'Date de fin'
        : iosPicker === 'startTime'
          ? 'Heure de début'
          : 'Heure de fin';

  const onIosPickerChange = (_: DateTimePickerEvent, selected?: Date) => {
    if (!selected || !iosPicker) return;
    if (iosPicker === 'startDate') {
      setStartDate(selected);
      if (!isMultiDay || !endDate || startOfDay(endDate) < startOfDay(selected)) {
        setEndDate(selected);
      }
    } else if (iosPicker === 'endDate') {
      setEndDate(selected);
    } else if (iosPicker === 'startTime') {
      setStartTime(selected);
    } else if (iosPicker === 'endTime') {
      setEndTime(selected);
    }
  };

  const confirmIosPicker = () => {
    if (!iosPicker) return;
    if (iosPicker === 'startDate') setStartDate((prev) => prev ?? new Date());
    if (iosPicker === 'endDate') setEndDate((prev) => prev ?? startDate ?? new Date());
    if (iosPicker === 'startTime') setStartTime((prev) => prev ?? defaultTime());
    if (iosPicker === 'endTime') setEndTime((prev) => prev ?? defaultEndTime());
    setIosPicker(null);
  };

  const showEndTime = !isAllDay;
  const showEndDate = isMultiDay;

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
        <View style={styles.fieldGroup}>
          <ThemedText style={[styles.fieldLabel, { color: theme.icon }]}>Statut</ThemedText>
          <View style={styles.typeRow}>
            {EVENT_STATUSES.map((eventStatus) => {
              const active = status === eventStatus;
              return (
                <Pressable
                  key={eventStatus}
                  onPress={() => setStatus(eventStatus)}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: active ? `${ACCENT}18` : fieldBg,
                      borderColor: active ? ACCENT : divider,
                    },
                  ]}
                >
                  <ThemedText style={[styles.typeChipText, { color: active ? ACCENT : theme.text }]}>
                    {EVENT_STATUS_LABELS[eventStatus]}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
          <ThemedText style={[styles.statusHint, { color: theme.icon }]}>
            {EVENT_STATUS_HINTS[status]}
          </ThemedText>
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

        <ToggleRow
          label="Toute la journée"
          hint="Sans heure de début ni de fin"
          value={isAllDay}
          onValueChange={handleAllDayChange}
          themeText={theme.text}
          themeMuted={theme.icon}
          divider={divider}
          isDark={isDark}
        />
        <ToggleRow
          label="Plusieurs jours"
          hint="Événement sur plusieurs dates"
          value={isMultiDay}
          onValueChange={handleMultiDayChange}
          themeText={theme.text}
          themeMuted={theme.icon}
          divider={divider}
          isDark={isDark}
        />

        <View style={styles.twoCols}>
          <View style={styles.col}>
            <DateField
              label={showEndDate ? 'Date de début' : 'Date'}
              displayValue={startDate ? formatEventDate(startDate) : null}
              placeholder="Choisir une date"
              onPress={() => openPicker('startDate')}
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
          </View>
          {showEndTime ? (
            <View style={styles.col}>
              <DateField
                label="Heure de début"
                displayValue={startTime ? formatEventTime(startTime) : null}
                placeholder="Choisir une heure"
                onPress={() => openPicker('startTime')}
                themeText={theme.text}
                themeMuted={theme.icon}
                fieldBg={fieldBg}
                borderColor={divider}
                icon="schedule"
              />
            </View>
          ) : null}
        </View>

        {showEndDate || showEndTime ? (
          <View style={styles.twoCols}>
            {showEndDate ? (
              <View style={styles.col}>
                <DateField
                  label="Date de fin"
                  displayValue={endDate ? formatEventDate(endDate) : null}
                  placeholder="Choisir une date"
                  onPress={() => openPicker('endDate')}
                  themeText={theme.text}
                  themeMuted={theme.icon}
                  fieldBg={fieldBg}
                  borderColor={divider}
                />
              </View>
            ) : (
              <View style={styles.col} />
            )}
            {showEndTime ? (
              <View style={styles.col}>
                <DateField
                  label="Heure de fin"
                  displayValue={endTime ? formatEventTime(endTime) : null}
                  placeholder="Optionnel"
                  onPress={() => openPicker('endTime')}
                  themeText={theme.text}
                  themeMuted={theme.icon}
                  fieldBg={fieldBg}
                  borderColor={divider}
                  icon="schedule"
                />
              </View>
            ) : null}
          </View>
        ) : null}

        {androidPicker ? (
          <DateTimePicker
            value={
              androidPicker === 'startDate'
                ? startDateValue
                : androidPicker === 'endDate'
                  ? endDateValue
                  : androidPicker === 'startTime'
                    ? startTimeValue
                    : endTimeValue
            }
            mode={androidPicker === 'startTime' || androidPicker === 'endTime' ? 'time' : 'date'}
            display="default"
            is24Hour
            onChange={onAndroidPickerChange}
            minimumDate={
              androidPicker === 'endDate' && startDate ? startOfDay(startDate) : minDate
            }
          />
        ) : null}

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
          placeholder="Décrivez l'événement, le programme, le public cible…"
          placeholderTextColor={theme.icon}
          style={[styles.bioInput, { color: theme.text, backgroundColor: fieldBg, borderColor: divider }]}
          multiline
          textAlignVertical="top"
          maxLength={2000}
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
              {submitLabel}
            </ThemedText>
          </>
        )}
      </Pressable>

      {Platform.OS !== 'android' && iosPicker ? (
        <Modal visible animationType="slide" transparent onRequestClose={() => setIosPicker(null)}>
          <View style={styles.pickerModalRoot}>
            <Pressable style={styles.pickerBackdrop} onPress={() => setIosPicker(null)} />
            <View style={[styles.pickerSheet, { backgroundColor: cardBg, borderColor: divider }]}>
              <View style={styles.pickerToolbar}>
                <Pressable onPress={() => setIosPicker(null)} hitSlop={12}>
                  <ThemedText style={{ color: theme.icon, fontWeight: '600' }}>Annuler</ThemedText>
                </Pressable>
                <ThemedText style={[styles.pickerTitle, { color: theme.text }]}>{iosPickerTitle}</ThemedText>
                <Pressable onPress={confirmIosPicker} hitSlop={12}>
                  <ThemedText style={{ color: ACCENT, fontWeight: '700' }}>OK</ThemedText>
                </Pressable>
              </View>
              <DateTimePicker
                value={iosPickerValue}
                mode={iosPickerMode}
                display="spinner"
                is24Hour
                themeVariant={isDark ? 'dark' : 'light'}
                onChange={onIosPickerChange}
                minimumDate={
                  iosPicker === 'endDate' && startDate ? startOfDay(startDate) : minDate
                }
              />
            </View>
          </View>
        </Modal>
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
  statusHint: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleText: { flex: 1, gap: 3 },
  toggleLabel: { fontSize: 14, fontWeight: '600' },
  toggleHint: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
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
