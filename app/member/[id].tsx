import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MemberDetail } from '@/components/annuaire/member-detail';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { resolveProfileImageUri } from '@/libs/profile';
import { getMemberByIdApi } from '@/services/member-detail.service';
import type { Member } from '@/types/member';

const PAGE_BG = '#F2F4F7';
const ACCENT = '#0077B6';

export default function MemberModalScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const insets = useSafeAreaInsets();
  const theme = Colors.light;

  const [member, setMember] = useState<Member | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const pageBg = PAGE_BG;

  const fetchMember = useCallback(async () => {
    if (!id) {
      setMember(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { member: data } = await getMemberByIdApi(id);
      setMember(data);
    } catch (err: unknown) {
      setMember(null);
      setError(err instanceof Error ? err.message : 'Membre introuvable.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchMember();
  }, [fetchMember]);

  const displayMember = useMemo(() => {
    if (!member) return null;
    const avatar = resolveProfileImageUri(member.avatar);
    return avatar ? { ...member, avatar } : member;
  }, [member]);

  return (
    <View style={[styles.root, { backgroundColor: pageBg }]}>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={ACCENT} />
        </View>
      ) : displayMember ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        >
          <MemberDetail member={displayMember} />
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <MaterialIcons name="person-off" size={36} color={theme.icon} />
          <ThemedText style={[styles.notFoundText, { color: theme.icon }]}>
            {error ?? 'Membre introuvable.'}
          </ThemedText>
          {error ? (
            <Pressable onPress={() => void fetchMember()}>
              <ThemedText style={[styles.retryText, { color: ACCENT }]}>Réessayer</ThemedText>
            </Pressable>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundText: { fontSize: 15, fontWeight: '500', textAlign: 'center' },
  retryText: { fontSize: 14, fontWeight: '700' },
});
