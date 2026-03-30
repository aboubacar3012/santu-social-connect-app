import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/shared/themed-text';

/** Aperçu avec [Expo Image](https://docs.expo.dev/versions/latest/sdk/image/) — cache, transitions, `contentFit`. */

export type UploadFileProps = {
  label: string;
  /** URI locale (`file://…`) ou URL distante pour `profilePicture` / documents. */
  value: string | null;
  onChange: (uri: string | null) => void;
  /** `avatar` : vignette ronde + recadrage 1:1. `document` : bandeau type pièce d’identité. */
  variant?: 'avatar' | 'document';
  hint?: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
  tint: string;
  /** Réduit marges, tailles d’aperçu et boutons (formulaires denses). */
  compact?: boolean;
};

export default function UploadFile({
  label,
  value,
  onChange,
  variant = 'document',
  hint,
  themeMuted,
  fieldBg,
  borderColor,
  tint,
  compact = false,
}: UploadFileProps) {
  const pickFromLibrary = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'L’accès à la galerie est nécessaire pour choisir une photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: variant === 'avatar',
      aspect: variant === 'avatar' ? [1, 1] : undefined,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }, [onChange, variant]);

  const pickFromCamera = useCallback(async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission', 'L’accès à la caméra est nécessaire pour prendre une photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: variant === 'avatar',
      aspect: variant === 'avatar' ? [1, 1] : undefined,
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  }, [onChange, variant]);

  const openChooser = useCallback(() => {
    Alert.alert('Photo', 'Comment souhaitez-vous ajouter l’image ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Galerie', onPress: () => void pickFromLibrary() },
      { text: 'Appareil photo', onPress: () => void pickFromCamera() },
    ]);
  }, [pickFromCamera, pickFromLibrary]);

  const clear = useCallback(() => onChange(null), [onChange]);

  const isAvatar = variant === 'avatar';
  const c = compact;

  return (
    <View style={[styles.fieldGroup, c && styles.fieldGroupCompact]}>
      <ThemedText style={[styles.fieldLabel, c && styles.fieldLabelCompact, { color: themeMuted }]}>
        {label}
      </ThemedText>

      <View style={[styles.shell, c && styles.shellCompact, { backgroundColor: fieldBg, borderColor }]}>
        {value ? (
          <View style={isAvatar ? styles.avatarPreviewWrap : styles.docPreviewWrap}>
            <Image
              source={{ uri: value }}
              style={[
                isAvatar ? [styles.avatarImage, c && styles.avatarImageCompact] : [styles.docImage, c && styles.docImageCompact],
                { borderColor },
              ]}
              contentFit="cover"
              transition={200}
              cachePolicy="memory-disk"
            />
          </View>
        ) : (
          <View
            style={[
              styles.placeholder,
              isAvatar ? [styles.placeholderAvatar, c && styles.placeholderAvatarCompact] : [styles.placeholderDoc, c && styles.placeholderDocCompact],
              { borderColor },
            ]}
          >
            <MaterialIcons name="add-a-photo" size={isAvatar ? (c ? 22 : 28) : c ? 20 : 24} color={themeMuted} />
            {!isAvatar ? (
              <ThemedText style={[styles.placeholderText, { color: themeMuted }]}>
                Aucune image
              </ThemedText>
            ) : null}
          </View>
        )}

        <View style={[styles.actions, c && styles.actionsCompact]}>
          <Pressable
            onPress={openChooser}
            style={({ pressed }) => [
              styles.actionBtn,
              c && styles.actionBtnCompact,
              { backgroundColor: tint, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <MaterialIcons name="photo-library" size={c ? 14 : 16} color={ON_TINT} />
            <ThemedText style={[styles.actionBtnTextDark, c && styles.actionBtnTextCompact]}>
              {value ? 'Remplacer' : 'Choisir'}
            </ThemedText>
          </Pressable>
          {value ? (
            <Pressable
              onPress={clear}
              style={({ pressed }) => [
                styles.actionBtnGhost,
                c && styles.actionBtnGhostCompact,
                { borderColor, opacity: pressed ? 0.85 : 1 },
              ]}
            >
              <MaterialIcons name="delete-outline" size={c ? 14 : 16} color={themeMuted} />
              <ThemedText style={[styles.actionBtnTextGhost, c && styles.actionBtnTextCompact, { color: themeMuted }]}>
                Retirer
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </View>

      {hint ? (
        <ThemedText style={[styles.hint, c && styles.hintCompact, { color: themeMuted }]}>{hint}</ThemedText>
      ) : null}
    </View>
  );
}

const ON_TINT = '#111111';

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
  fieldGroupCompact: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  fieldLabelCompact: {
    fontSize: 10,
  },
  shell: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
  },
  shellCompact: {
    padding: 8,
    gap: 8,
    borderRadius: 10,
  },
  avatarPreviewWrap: {
    alignSelf: 'center',
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: StyleSheet.hairlineWidth * 2,
    backgroundColor: '#1a1a1a',
  },
  avatarImageCompact: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  docPreviewWrap: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  docImage: {
    width: '100%',
    height: 140,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#1a1a1a',
  },
  docImageCompact: {
    height: 96,
    borderRadius: 8,
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderStyle: 'dashed',
  },
  placeholderAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignSelf: 'center',
  },
  placeholderAvatarCompact: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  placeholderDoc: {
    minHeight: 100,
    borderRadius: 10,
    gap: 6,
  },
  placeholderDocCompact: {
    minHeight: 72,
    borderRadius: 8,
    gap: 4,
  },
  placeholderText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionsCompact: {
    gap: 6,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
  },
  actionBtnCompact: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnTextDark: {
    color: ON_TINT,
    fontSize: 13,
    fontWeight: '700',
  },
  actionBtnTextCompact: {
    fontSize: 12,
  },
  actionBtnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  actionBtnGhostCompact: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  actionBtnTextGhost: {
    fontSize: 13,
    fontWeight: '600',
  },
  hint: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
    fontWeight: '500',
  },
  hintCompact: {
    fontSize: 10,
    lineHeight: 13,
    marginTop: 2,
  },
});
