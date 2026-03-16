import React from 'react';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

type ProductCardProps = {
  name: string;
  price: string;
  subtitle?: string;
  thumbnail?: string;
};

export function ProductCard({ name, price, subtitle = 'En ligne', thumbnail }: ProductCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrapper}>
        {thumbnail ? (
          <Image source={{ uri: thumbnail }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <View style={styles.info}>
        <Text numberOfLines={2} style={styles.name}>
          {name}
        </Text>
        <Text numberOfLines={1} style={styles.subtitle}>
          {subtitle}
        </Text>
        <Text style={styles.price}>{price}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
  },
  info: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },
  price: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});

