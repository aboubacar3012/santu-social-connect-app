import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PRODUCTS } from '@/components/data';
import { ProductCard } from '@/components/product-card';

export function ProductList() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Produits populaires</Text>
      <View style={styles.columns}>
        <View style={styles.column}>
          {PRODUCTS.filter((_, index) => index % 2 === 0).map((product, index) => (
            <View key={product.id} style={styles.cardWrapper}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                thumbnail={product.thumbnail}
                tall={index % 2 === 1}
              />
            </View>
          ))}
        </View>
        <View style={styles.column}>
          {PRODUCTS.filter((_, index) => index % 2 === 1).map((product, index) => (
            <View key={product.id} style={styles.cardWrapper}>
              <ProductCard
                id={product.id}
                name={product.name}
                price={product.price}
                thumbnail={product.thumbnail}
                tall={index % 2 === 0}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 16,
  },
  cardWrapper: {
    width: '100%',
  },
});

