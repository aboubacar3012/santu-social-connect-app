import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRODUCTS } from '@/components/data';
import SafeScrollView from '@/components/scroll-view';

export default function FavoritesScreen() {
  const favorites = PRODUCTS.slice(0, 6);

  return (
    <SafeScrollView>
      <Text style={styles.title}>Vos favoris</Text>
      <Text style={styles.subtitle}>
        Retrouvez ici les produits que vous avez mis de côté pour plus tard.
      </Text>

      <View style={styles.list}>
        {favorites.map((product) => (
          <Pressable key={product.id} style={styles.card}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.cardContent}>
              <Text numberOfLines={2} style={styles.cardTitle}>
                {product.name}
              </Text>
              <Text style={styles.cardPrice}>{product.price}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 16,
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 16,
    backgroundColor: 'white',
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  imagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardPrice: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: '500',
  },
});
