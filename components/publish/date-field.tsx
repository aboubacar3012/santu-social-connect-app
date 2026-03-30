import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

/**
 * Champ qui affiche une date ou une heure déjà choisie, mais ne contient pas de clavier :
 * tout le contenu provient de `displayValue`. Au tap, le parent ouvre le DateTimePicker (ou une feuille modale).
 * Quand `displayValue` est vide, on montre le `placeholder` (ex. « Choisir une date ») en style atténué.
 */
export function DateField({
  label,
  displayValue,
  placeholder,
  onPress,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
  icon = 'calendar-month',
}: {
  label: string;
  displayValue: string | null;
  placeholder: string;
  onPress: () => void;
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
  icon?: React.ComponentProps<typeof MaterialIcons>['name'];
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>{label}</ThemedText>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={onPress}
        style={({ pressed }) => [
          styles.inputShell,
          {
            backgroundColor: fieldBg,
            borderColor,
            opacity: pressed ? 0.92 : 1,
          },
        ]}
      >
        <MaterialIcons name={icon} size={16} color={themeMuted} style={styles.inputIcon} />
        <ThemedText
          style={[styles.dateFieldText, { color: displayValue ? themeText : themeMuted }]}
          numberOfLines={1}
        >
          {displayValue ?? placeholder}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputIcon: {
    marginRight: 8,
    opacity: 0.85,
  },
  dateFieldText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
    letterSpacing: -0.2,
  },
});
