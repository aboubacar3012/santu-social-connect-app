import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function HomeHeader() {
  const colorScheme = useColorScheme();
  const tint = Colors[colorScheme ?? 'light'].tint;

  return (
    <View style={styles.header}>
      <View style={styles.iconButton}>
        <IconSymbol
          name="person.crop.circle"
          size={26}
          color={colorScheme === 'dark' ? '#A0A0A0' : '#808080'}
        />
      </View>

      <View style={styles.searchContainer}>
        <IconSymbol
          name="magnifyingglass"
          size={20}
          color={colorScheme === 'dark' ? '#A0A0A0' : '#808080'}
        />
        <TextInput
          placeholder="Rechercher"
          placeholderTextColor={colorScheme === 'dark' ? '#A0A0A0' : '#808080'}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.iconButton}>
        <View style={styles.cartWrapper}>
          <IconSymbol
            name="cart"
            size={28}
            color={colorScheme === 'dark' ? '#A0A0A0' : '#808080'}
          />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>3</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  cartWrapper: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 3,
    backgroundColor: '#FF4B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 17,
  },
});

