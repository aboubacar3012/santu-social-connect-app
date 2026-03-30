import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

/**
 * Libellé de groupe en petites capitales (ex. IDENTITÉ, PLANNING) au-dessus d’un bloc de champs.
 * Purement décoratif : ne porte aucune donnée ni interaction.
 */
export function SectionKicker({ children, color }: { children: string; color: string }) {
  return <ThemedText style={[styles.root, { color }]}>{children}</ThemedText>;
}

const styles = StyleSheet.create({
  root: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
});
