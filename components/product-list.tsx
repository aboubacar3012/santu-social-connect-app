import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ProductCard } from '@/components/product-card';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name: 'Écouteurs Bluetooth sans fil',
    price: '29,99 €',
    thumbnail:
      'https://images.pexels.com/photos/3394664/pexels-photo-3394664.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '2',
    name: 'Chargeur rapide USB‑C 20W',
    price: '17,99 €',
    thumbnail:
      'https://images.pexels.com/photos/910862/pexels-photo-910862.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '3',
    name: 'Câble USB‑C tressé 2m',
    price: '9,99 €',
    thumbnail:
      'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
  {
    id: '4',
    name: 'Support téléphone bureau',
    price: '12,49 €',
    thumbnail:
      'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=800',
  },
];

export function ProductList() {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Produits populaires</Text>
      <View style={styles.grid}>
        {MOCK_PRODUCTS.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
            thumbnail={product.thumbnail}
          />
        ))}
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 16,
    columnGap: 12,
    justifyContent: 'space-between',
  },
});

