import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

/**
 * Champ texte libre avec étiquette + cadre arrondi et icône Material à gauche.
 * Sert à saisir du texte (départ, arrivée, prix, véhicule, etc.) : la valeur est contrôlée
 * par le parent via `value` / `onChangeText`.
 */
export function IconTextField({
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
        <MaterialIcons name={icon} size={16} color={themeMuted} style={styles.inputIcon} />
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
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 10,
    letterSpacing: -0.2,
  },
});
