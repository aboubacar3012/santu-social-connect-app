import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';
const HERO_HEIGHT = 148;

export type MemberCardProps = {
  firstName: string;
  lastName: string;
  avatar: string;
  jobTitle: string;
  company?: string;
  quartier: string;
  onPress?: () => void;
};

export function MemberCard({
  firstName,
  lastName,
  avatar,
  jobTitle,
  company,
  quartier,
  onPress,
}: MemberCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const chipBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const shadow = isDark ? styles.cardShadowDark : styles.cardShadowLight;

  return (
    <Pressable onPress={onPress} style={[styles.card, shadow, { backgroundColor: cardBg, borderColor: divider }]}>
      <View style={[styles.heroWrap, { height: HERO_HEIGHT }]}>
        <Image source={{ uri: avatar }} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroGradient} />
        <View style={styles.heroLocation}>
          <MaterialIcons name="place" size={11} color="#FFF" />
          <ThemedText style={styles.heroLocationText} numberOfLines={1}>
            {quartier}
          </ThemedText>
        </View>
      </View>

      <View style={styles.cardBody}>
        <ThemedText style={[styles.firstName, { color: theme.icon }]}>{firstName}</ThemedText>
        <ThemedText style={[styles.lastName, { color: theme.text }]} numberOfLines={1}>
          {lastName}
        </ThemedText>
        <ThemedText style={[styles.jobTitle, { color: ACCENT }]} numberOfLines={2}>
          {jobTitle}
        </ThemedText>
        {company ? (
          <View style={[styles.companyRow, { backgroundColor: chipBg }]}>
            <MaterialIcons name="business" size={13} color={theme.icon} />
            <ThemedText style={[styles.companyText, { color: theme.text }]} numberOfLines={1}>
              {company}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  cardShadowLight: {
    shadowColor: '#0A1628',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardShadowDark: {
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  heroWrap: { position: 'relative' },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.28)',
  },
  heroLocation: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  heroLocationText: { flex: 1, color: '#FFF', fontSize: 11, fontWeight: '600' },
  cardBody: { gap: 3, padding: 12 },
  firstName: { fontSize: 11, fontWeight: '500', letterSpacing: 0.2 },
  lastName: { fontSize: 17, fontWeight: '800', letterSpacing: -0.4, lineHeight: 20 },
  jobTitle: { fontSize: 13, fontWeight: '700', lineHeight: 18, marginTop: 2 },
  companyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  companyText: { flex: 1, fontSize: 12, fontWeight: '600' },
});
