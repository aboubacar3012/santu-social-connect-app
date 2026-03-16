import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRODUCTS } from '@/components/data';
import SafeScrollView from '@/components/scroll-view';

export default function ProductViewModal() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const product = PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0];
  const router = useRouter();

  return (
    <SafeScrollView>
      <View style={styles.content}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: product.thumbnail }} style={styles.image} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.price}>{product.price}</Text>

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            Ce produit est parfait pour votre quotidien : compact, pratique et conçu pour durer.
            Idéal pour le bureau, la maison ou en déplacement.
          </Text>

          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          <View style={styles.properties}>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Tailles</Text>
              <Text style={styles.propertyValue}>S, M, L</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Poids</Text>
              <Text style={styles.propertyValue}>450 g</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Couleurs</Text>
              <Text style={styles.propertyValue}>Noir, Blanc, Bleu</Text>
            </View>
            <View style={styles.propertyRow}>
              <Text style={styles.propertyLabel}>Matière</Text>
              <Text style={styles.propertyValue}>Aluminium & plastique recyclé</Text>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={styles.outlineButton} onPress={() => router.back()}>
              <Text style={styles.outlineButtonText}>Retour</Text>
            </Pressable>
            <Pressable style={styles.addToCartButton}>
              <Text style={styles.addToCartText}>Ajouter au panier</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: 16,
  },
  imageWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  image: {
    width: '100%',
    height: 260,
  },
  info: {
    gap: 12,
    paddingBottom: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.7)',
  },
  properties: {
    marginTop: 4,
    gap: 6,
  },
  propertyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  propertyLabel: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  propertyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  actionsRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#11181C',
    alignItems: 'center',
  },
  outlineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#11181C',
  },
  addToCartButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#11181C',
    alignItems: 'center',
  },
  addToCartText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
