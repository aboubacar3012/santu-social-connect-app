import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRODUCTS } from '@/components/data';
import SafeScrollView from '@/components/scroll-view';

export default function CartScreen() {
  const items = PRODUCTS.slice(0, 3).map((p, index) => ({
    ...p,
    quantity: index + 1,
  }));

  const subtotal = items.reduce((sum, item) => sum + 20 * item.quantity, 0);

  return (
    <SafeScrollView>
      <Text style={styles.title}>Votre panier</Text>
      <Text style={styles.subtitle}>
        Vérifiez les articles avant de passer au paiement.
      </Text>

      <View style={styles.list}>
        {items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.thumbnail} />
            <View style={styles.rowContent}>
              <Text numberOfLines={2} style={styles.itemName}>
                {item.name}
              </Text>
              <Text style={styles.itemMeta}>Quantité: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>€{(20 * item.quantity).toFixed(2)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Sous-total</Text>
          <Text style={styles.summaryValue}>€{subtotal.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Frais de livraison</Text>
          <Text style={styles.summaryValue}>Offert</Text>
        </View>
        <View style={styles.summaryRowTotal}>
          <Text style={styles.summaryTotalLabel}>Total</Text>
          <Text style={styles.summaryTotalValue}>€{subtotal.toFixed(2)}</Text>
        </View>
      </View>

      <Pressable style={styles.checkoutButton}>
        <Text style={styles.checkoutText}>Passer au paiement</Text>
      </Pressable>
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
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  rowContent: {
    flex: 1,
    gap: 2,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  summary: {
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'white',
    gap: 8,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: 'rgba(0,0,0,0.6)',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryTotalLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryTotalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutButton: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#11181C',
    alignItems: 'center',
  },
  checkoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
