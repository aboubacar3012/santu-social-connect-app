import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';

export type ProfileContactCardProps = {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  label: string;
  value: string;
  isPublic: boolean;
  onTogglePublic: (next: boolean) => void;
};

export function ProfileContactCard({
  icon,
  label,
  value,
  isPublic,
  onTogglePublic,
}: ProfileContactCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: divider }]}>
      <View style={styles.top}>
        <View style={styles.labelRow}>
          <MaterialIcons name={icon} size={17} color={ACCENT} />
          <ThemedText style={[styles.label, { color: theme.icon }]}>{label}</ThemedText>
        </View>
        <View
          style={[
            styles.visibilityPill,
            { backgroundColor: isPublic ? `${ACCENT}18` : 'transparent', borderColor: isPublic ? ACCENT : divider },
          ]}
        >
          <MaterialIcons
            name={isPublic ? 'visibility' : 'visibility-off'}
            size={12}
            color={isPublic ? ACCENT : theme.icon}
          />
          <ThemedText style={[styles.visibilityPillText, { color: isPublic ? ACCENT : theme.icon }]}>
            {isPublic ? 'Public' : 'Privé'}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.value, { color: theme.text }]} numberOfLines={1}>
        {value}
      </ThemedText>

      <View style={[styles.toggleRow, { borderTopColor: divider }]}>
        <ThemedText style={[styles.toggleLabel, { color: theme.text }]}>Visible dans l&apos;annuaire</ThemedText>
        <Switch
          value={isPublic}
          onValueChange={onTogglePublic}
          trackColor={{ false: isDark ? '#3A3A3C' : '#D1D1D6', true: `${ACCENT}88` }}
          thumbColor={isPublic ? ACCENT : isDark ? '#F4F4F4' : '#FFFFFF'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 8,
  },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3, textTransform: 'uppercase' },
  visibilityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  visibilityPillText: { fontSize: 11, fontWeight: '700' },
  value: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: { flex: 1, fontSize: 13, fontWeight: '500' },
});
