import React from 'react';
import { StyleSheet, View } from 'react-native';

/**
 * Carte visuelle regroupant un bloc du formulaire (itinéraire, planning, etc.).
 * Applique fond, bordure, ombre légère et coins arrondis : sert de « conteneur de section »
 * pour séparer visuellement les groupes de champs sur l’écran publish (onglet publication).
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
