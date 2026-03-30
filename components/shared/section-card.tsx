import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Encadré de section : fond, bordure fine, ombre légère et marges intérieures uniformes.
 * Réutilisable sur les écrans formulaire (publish, profil-edit, etc.) pour regrouper visuellement des champs.
 */
export function SectionCard({
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
    <View style={[styles.root, { backgroundColor: surface, borderColor }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  root: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
});
