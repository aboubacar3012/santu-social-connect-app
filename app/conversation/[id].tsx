import { useHeaderHeight } from '@react-navigation/elements';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { ChatMessage, ThreadKind } from '@/constants/fake-threads';
import { getMessagesForThread, getThreadById } from '@/constants/fake-threads';
import { Colors } from '@/constants/theme';

function normalizeId(raw: string | string[] | undefined): string {
  if (raw == null) return '';
  return Array.isArray(raw) ? (raw[0] ?? '') : raw;
}

function shortTimeNow(): string {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

/** Fils lecture seule : officiel Santu (voiture) ou rappels / annonces (cloche). */
function ReadOnlyFeedCard({
  message: m,
  variant,
  surface,
  heroBg,
  textColor,
  muted,
  tint,
}: {
  message: ChatMessage;
  variant: Extract<ThreadKind, 'official' | 'announcement'>;
  surface: string;
  heroBg: string;
  textColor: string;
  muted: string;
  tint: string;
}) {
  const icon = variant === 'official' ? 'directions-car' : 'notifications-active';
  return (
    <View style={[announceStyles.card, { backgroundColor: surface }]}>
      <View style={[announceStyles.hero, { backgroundColor: heroBg }]}>
        <MaterialIcons name={icon} size={42} color={tint} />
      </View>
      {m.title ? (
        <Text style={[announceStyles.cardTitle, { color: textColor }]}>{m.title}</Text>
      ) : null}
      <Text style={[announceStyles.cardBody, { color: textColor }]}>{m.text}</Text>
      {m.time ? (
        <Text style={[announceStyles.cardTime, { color: muted }]}>{m.time}</Text>
      ) : null}
    </View>
  );
}

const headerTitleStyles = StyleSheet.create({
  stack: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 220,
  },
  stackTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  stackSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
});

const announceStyles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  hero: {
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 22,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  cardBody: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  cardTime: {
    fontSize: 11,
    fontWeight: '500',
    paddingHorizontal: 14,
    paddingBottom: 12,
    alignSelf: 'flex-end',
  },
});

export default function ConversationScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = normalizeId(rawId);
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const t = Colors.light;

  const thread = getThreadById(id);
  const readOnlyKind: Extract<ThreadKind, 'official' | 'announcement'> | null =
    thread?.kind === 'official' || thread?.kind === 'announcement' ? thread.kind : null;
  const isReadOnlyFeed = readOnlyKind != null;
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(() => getMessagesForThread(id));
  const scrollRef = useRef<ScrollView>(null);

  useLayoutEffect(() => {
    const base = {
      headerBackTitle: 'Retour',
      headerShadowVisible: false,
      headerStyle: { backgroundColor: '#EDEFF2' },
      headerTintColor: '#11181C',
      headerTitleAlign: 'center' as const,
    };
    if (thread?.subtitle) {
      navigation.setOptions({
        ...base,
        title: '',
        headerTitle: () => (
          <View style={headerTitleStyles.stack}>
            <Text
              style={[headerTitleStyles.stackTitle, { color: '#11181C' }]}
              numberOfLines={1}
            >
              {thread.name}
            </Text>
            <Text
              style={[headerTitleStyles.stackSub, { color: '#687076' }]}
              numberOfLines={1}
            >
              {thread.subtitle}
            </Text>
          </View>
        ),
      });
    } else {
      navigation.setOptions({
        ...base,
        title: thread?.name ?? 'Discussion',
        headerTitle: undefined,
      });
    }
  }, [navigation, thread?.name, thread?.subtitle]);

  useEffect(() => {
    setMessages(getMessagesForThread(id));
  }, [id]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  const send = useCallback(() => {
    if (isReadOnlyFeed) return;
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    setMessages((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, fromMe: true, text, time: shortTimeNow() },
    ]);
  }, [draft, isReadOnlyFeed]);

  const canvas = '#ECEFF2';
  const bubbleThem = '#FFFFFF';
  const bubbleMe = '#F5E9C8';
  const borderInput = 'rgba(0,0,0,0.08)';
  const officialHeroBg = 'rgba(230,168,0,0.18)';
  const announcementHeroBg = 'rgba(59,130,246,0.12)';
  const readOnlyFooterBg = '#F0F0F0';

  if (!thread) {
    return (
      <View style={[styles.missing, { backgroundColor: canvas }]}>
        <Text style={[styles.missingText, { color: t.text }]}>Conversation introuvable.</Text>
        <Pressable onPress={() => router.back()} style={[styles.missingBtn, { backgroundColor: t.tint }]}>
          <Text style={styles.missingBtnTxt}>Retour</Text>
        </Pressable>
      </View>
    );
  }

  const scrollBody = (
    <>
      <ScrollView
        ref={scrollRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          isReadOnlyFeed && { paddingBottom: Math.max(insets.bottom, 8) },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        {isReadOnlyFeed && readOnlyKind
          ? messages.map((m) => (
              <View key={m.id} style={styles.announceRow}>
                <ReadOnlyFeedCard
                  message={m}
                  variant={readOnlyKind}
                  surface={bubbleThem}
                  heroBg={readOnlyKind === 'official' ? officialHeroBg : announcementHeroBg}
                  textColor={t.text}
                  muted={t.icon}
                  tint={t.tint}
                />
              </View>
            ))
          : messages.map((m) => (
              <View
                key={m.id}
                style={[styles.bubbleRow, m.fromMe ? styles.bubbleRowMe : styles.bubbleRowThem]}
              >
                <View
                  style={[
                    styles.bubble,
                    { backgroundColor: m.fromMe ? bubbleMe : bubbleThem },
                    m.fromMe ? styles.bubbleMe : styles.bubbleThem,
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: t.text }]}>{m.text}</Text>
                  {m.time ? (
                    <Text style={[styles.bubbleTime, { color: t.icon }]}>{m.time}</Text>
                  ) : null}
                </View>
              </View>
            ))}
      </ScrollView>

      {isReadOnlyFeed && readOnlyKind ? (
        <View
          style={[
            styles.readOnlyBar,
            {
              borderTopWidth: 0,
              backgroundColor: readOnlyFooterBg,
              paddingBottom: Math.max(insets.bottom, 14),
              paddingTop: 14,
            },
          ]}
        >
          <Text style={[styles.readOnlyWa, { color: t.icon }]}>
            {readOnlyKind === 'official'
              ? 'Seul Santu peut envoyer des messages'
              : 'Lecture seule — les rappels remplacent les notifications'}
          </Text>
        </View>
      ) : (
        <View
          style={[
            styles.inputBar,
            {
              borderTopColor: borderInput,
              backgroundColor: t.background,
              paddingBottom: Math.max(insets.bottom, 10),
            },
          ]}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor={t.icon}
            style={[styles.input, { color: t.text, borderColor: borderInput }]}
            multiline
            maxLength={2000}
            onSubmitEditing={send}
            blurOnSubmit={false}
          />
          <Pressable
            onPress={send}
            disabled={!draft.trim()}
            style={({ pressed }) => [
              styles.sendBtn,
              { backgroundColor: draft.trim() ? t.tint : '#ddd' },
              pressed && draft.trim() && { opacity: 0.85 },
            ]}
          >
            <MaterialIcons name="send" size={20} color={draft.trim() ? '#1a1a1a' : t.icon} />
          </Pressable>
        </View>
      )}
    </>
  );

  if (isReadOnlyFeed) {
    return (
      <View style={[styles.flex, { backgroundColor: canvas }]}>{scrollBody}</View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: canvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? headerHeight : 0}
    >
      {scrollBody}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  missingText: { fontSize: 16, fontWeight: '600' },
  missingBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 },
  missingBtnTxt: { fontSize: 16, fontWeight: '700', color: '#1a1a1a' },
  readOnlyBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  readOnlyWa: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  announceRow: {
    width: '100%',
    alignItems: 'stretch',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 16,
    flexGrow: 1,
  },
  bubbleRow: {
    marginBottom: 8,
    maxWidth: '100%',
  },
  bubbleRowMe: { alignItems: 'flex-end' },
  bubbleRowThem: { alignItems: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  bubbleMe: {
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleText: {
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '400',
  },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 0,
  },
});
