import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

/**
 * Petit titre en majuscules au-dessus d’un groupe de champs (ex. ITINÉRAIRE, PLANNING).
 * Ne capture pas de donnée : c’est uniquement un libellé d’organisation pour lire le formulaire plus vite.
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
