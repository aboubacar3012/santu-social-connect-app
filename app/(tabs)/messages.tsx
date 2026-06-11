import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import SafeScrollView from '@/components/shared/scroll-view';
import { FAKE_THREAD_LIST, type ThreadListItem } from '@/constants/fake-threads';
import { Colors } from '@/constants/theme';

function initials(name: string): string {
  const p = name.replace(/&/g, ' ').split(/\s+/).filter(Boolean);
  if (!p.length) return '?';
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0] ?? ''}${p[p.length - 1][0] ?? ''}`.toUpperCase();
}

function previewLine(item: ThreadListItem): string {
  return item.lastFromSelf ? `Vous : ${item.lastMessage}` : item.lastMessage;
}

export default function MessagesScreen() {
  const router = useRouter();
  const t = Colors.light;
  const line = 'rgba(0,0,0,0.07)';
  const avatarBg = '#E5E5EA';

  return (
    <SafeScrollView screenBackgroundColor={t.background} keyboardAvoiding>
      <Text style={[styles.title, { color: t.text }]}>Conversations</Text>

      <View style={styles.listBleed}>
        {FAKE_THREAD_LIST.map((item, i) => {
          const u = item.unread > 0;
          const isLast = i === FAKE_THREAD_LIST.length - 1;
          return (
            <Pressable
              key={item.id}
              onPress={() => router.push(`/conversation/${item.id}`)}
              style={({ pressed }) => [
                styles.row,
                !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: line },
                pressed && { opacity: 0.75 },
              ]}
            >
              {item.kind === 'official' ? (
                <View style={[styles.avatar, styles.avatarBroadcast, { backgroundColor: t.tint }]}>
                  <Text style={styles.avatarOfficial}>S</Text>
                </View>
              ) : item.kind === 'announcement' ? (
                <View
                  style={[
                    styles.avatar,
                    styles.avatarBroadcast,
                    {
                      backgroundColor: '#E8F4FC',
                      borderWidth: StyleSheet.hairlineWidth,
                      borderColor: t.tint,
                    },
                  ]}
                >
                  <MaterialIcons name="notifications-active" size={22} color={t.tint} />
                </View>
              ) : (
                <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                  <Text style={[styles.avatarTxt, { color: t.icon }]}>{initials(item.name)}</Text>
                </View>
              )}
              <View style={styles.mid}>
                <View style={styles.top}>
                  <View style={styles.nameBlock}>
                    <Text style={[styles.name, { color: t.text }, u && styles.nameNew]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.subtitle ? (
                      <Text style={[styles.subtitle, { color: t.icon }]} numberOfLines={1}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                  <Text style={[styles.time, { color: t.icon }]}>{item.time}</Text>
                </View>
                <View style={styles.bottom}>
                  <Text
                    style={[styles.preview, { color: t.icon }, u && styles.previewNew]}
                    numberOfLines={1}
                  >
                    {previewLine(item)}
                  </Text>
                  {u && (
                    <View style={[styles.badge, { backgroundColor: t.tint }]}>
                      <Text style={styles.badgeTxt}>{item.unread > 9 ? '9+' : item.unread}</Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 76 }} />
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  listBleed: {
    marginHorizontal: -20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTxt: {
    fontSize: 15,
    fontWeight: '600',
  },
  avatarBroadcast: {
    justifyContent: 'center',
  },
  avatarOfficial: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
  },
  mid: { flex: 1, minWidth: 0, gap: 3 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  nameBlock: { flex: 1, minWidth: 0, gap: 2 },
  name: { fontSize: 16, fontWeight: '500' },
  subtitle: { fontSize: 12, fontWeight: '500' },
  nameNew: { fontWeight: '700' },
  time: { fontSize: 12, fontWeight: '500' },
  bottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  preview: { flex: 1, fontSize: 14 },
  previewNew: { fontWeight: '500' },
  badge: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: '#1a1a1a' },
});
