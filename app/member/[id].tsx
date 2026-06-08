import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemberDetail } from '@/components/annuaire/member-detail';
import { ThemedText } from '@/components/shared/themed-text';
import { findMemberById } from '@/constants/mock-members';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

export default function MemberModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const member = id ? findMemberById(id) : undefined;

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {member ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <MemberDetail member={member} />
        </ScrollView>
      ) : (
        <View style={styles.notFound}>
          <MaterialIcons name="person-off" size={36} color={theme.icon} />
          <ThemedText style={[styles.notFoundText, { color: theme.icon }]}>Membre introuvable.</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundText: { fontSize: 15, fontWeight: '500' },
});
