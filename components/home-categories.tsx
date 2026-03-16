import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Category = {
  id: string;
  label: string;
};

const CATEGORIES: Category[] = [
  { id: 'all', label: 'Tout' },
  { id: 'best', label: 'Meilleures ventes' },
  { id: 'new', label: 'Nouveautés' },
  { id: 'promo', label: 'Promotions' },
  { id: 'beauty', label: 'Beauté' },
  { id: 'food', label: 'Épicerie' },
  { id: 'care', label: 'Soins & bien-être' },
];

export function HomeCategories() {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((category) => (
          <TouchableOpacity key={category.id} activeOpacity={0.8} style={styles.chip}>
            <Text style={styles.chipLabel}>{category.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  scrollContent: {
    paddingHorizontal: 2,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  chipLabel: {
    fontSize: 14,
  },
});

