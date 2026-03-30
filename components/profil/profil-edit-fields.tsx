import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
};

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
  multiline,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect,
  maxLength,
}: FieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>{label}</ThemedText>
      <View
        style={[
          styles.inputShell,
          { backgroundColor: fieldBg, borderColor },
          !editable && styles.inputShellDisabled,
        ]}
      >
        <MaterialIcons name={icon} size={14} color={themeMuted} style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeMuted}
          style={[styles.input, multiline && styles.inputMultiline, { color: themeText }]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
        />
        {!editable ? (
          <MaterialIcons name="lock-outline" size={14} color={themeMuted} style={styles.lockIcon} />
        ) : null}
      </View>
    </View>
  );
}

type DateOfBirthFieldsProps = {
  day: string;
  month: string;
  year: string;
  onDayChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
};

export function DateOfBirthFields({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
}: DateOfBirthFieldsProps) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>Date de naissance</ThemedText>
      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <ThemedText style={[styles.dateHint, { color: themeMuted }]}>Jour</ThemedText>
          <View style={[styles.inputShell, styles.dateInputShell, { backgroundColor: fieldBg, borderColor }]}>
            <TextInput
              value={day}
              onChangeText={(t) => onDayChange(t.replace(/\D/g, '').slice(0, 2))}
              placeholder="JJ"
              placeholderTextColor={themeMuted}
              keyboardType="number-pad"
              maxLength={2}
              style={[styles.input, styles.dateInput, { color: themeText }]}
            />
          </View>
        </View>
        <View style={styles.dateCol}>
          <ThemedText style={[styles.dateHint, { color: themeMuted }]}>Mois</ThemedText>
          <View style={[styles.inputShell, styles.dateInputShell, { backgroundColor: fieldBg, borderColor }]}>
            <TextInput
              value={month}
              onChangeText={(t) => onMonthChange(t.replace(/\D/g, '').slice(0, 2))}
              placeholder="MM"
              placeholderTextColor={themeMuted}
              keyboardType="number-pad"
              maxLength={2}
              style={[styles.input, styles.dateInput, { color: themeText }]}
            />
          </View>
        </View>
        <View style={[styles.dateCol, styles.dateColYear]}>
          <ThemedText style={[styles.dateHint, { color: themeMuted }]}>Année</ThemedText>
          <View style={[styles.inputShell, styles.dateInputShell, { backgroundColor: fieldBg, borderColor }]}>
            <TextInput
              value={year}
              onChangeText={(t) => onYearChange(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="AAAA"
              placeholderTextColor={themeMuted}
              keyboardType="number-pad"
              maxLength={4}
              style={[styles.input, styles.dateInput, { color: themeText }]}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  dateCol: {
    flex: 1,
    minWidth: 0,
  },
  dateColYear: {
    flex: 1.35,
  },
  dateHint: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  dateInputShell: {
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  dateInput: {
    textAlign: 'center',
    fontSize: 14,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 40,
  },
  inputShellDisabled: {
    opacity: 0.92,
  },
  inputIcon: {
    marginRight: 8,
    opacity: 0.85,
  },
  lockIcon: {
    marginLeft: 6,
    opacity: 0.75,
  },
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
    letterSpacing: -0.2,
    minHeight: 20,
  },
  inputMultiline: {
    minHeight: 48,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 17,
  },
});
