import { Image } from 'expo-image';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ProductCardProps = {
  name: string;
  price: string;
  tall?: boolean;
  id: string;
  thumbnail?: string;
};

export function ProductCard({
  name,
  price,
  tall,
  id,
  thumbnail,
}: ProductCardProps) {
  return (
    <Link href={{ pathname: '/product-view', params: { id } }} asChild>
      <Pressable style={styles.card}>
        <View style={[styles.imageWrapper, tall && styles.imageWrapperTall]}>
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
          <Text style={styles.price}>{price}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  imageWrapperTall: {
    height: 230,
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
  price: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
});

