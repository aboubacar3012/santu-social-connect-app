import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';

const MOCK_ORDERS = [
  { id: 'A12345', date: '12 mars 2026', status: 'Livrée', total: '59,90 €' },
  { id: 'B67890', date: '3 mars 2026', status: 'En cours de livraison', total: '24,90 €' },
  { id: 'C24680', date: '21 février 2026', status: 'Annulée', total: '39,90 €' },
];

export default function OrdersScreen() {
  return (
    <SafeScrollView>
      <Text style={styles.title}>Vos commandes</Text>
      <Text style={styles.subtitle}>
        Suivez l’historique de vos commandes et leurs statuts.
      </Text>

      <View style={styles.list}>
        {MOCK_ORDERS.map((order) => (
          <View key={order.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Text style={styles.orderId}>Commande {order.id}</Text>
              <Text style={styles.orderTotal}>{order.total}</Text>
            </View>
            <Text style={styles.orderDate}>{order.date}</Text>
            <Text style={styles.orderStatus}>{order.status}</Text>
          </View>
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
    padding: 12,
    borderRadius: 16,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '600',
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 13,
    color: 'rgba(0,0,0,0.6)',
    marginBottom: 4,
  },
  orderStatus: {
    fontSize: 13,
    fontWeight: '500',
  },
});
