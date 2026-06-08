import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconTextField } from '@/components/publish/icon-text-field';
import UploadFile from '@/components/shared/upload-file';
import { ThemedText } from '@/components/shared/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT = '#0077B6';
const PAGE_BG = { light: '#F2F4F7', dark: '#0A0A0C' } as const;

export type ProfileFormData = {
  name: string;
  jobTitle: string;
  company: string;
  city: string;
  quartier: string;
  bio: string;
  email: string;
  avatarUri: string | null;
  directoryVisible: boolean;
  showEmailInDirectory: boolean;
  showPhoneInDirectory: boolean;
};

export type UpdateProfilProps = {
  visible: boolean;
  initial: ProfileFormData;
  phone?: string;
  onCancel: () => void;
  onSave: (data: ProfileFormData) => void | Promise<void>;
};

export function UpdateProfil({ visible, initial, phone, onCancel, onSave }: UpdateProfilProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const pageBg = isDark ? PAGE_BG.dark : PAGE_BG.light;
  const cardBg = isDark ? '#1A1A1E' : '#FFFFFF';
  const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const [name, setName] = useState(initial.name);
  const [jobTitle, setJobTitle] = useState(initial.jobTitle);
  const [company, setCompany] = useState(initial.company);
  const [city, setCity] = useState(initial.city);
  const [quartier, setQuartier] = useState(initial.quartier);
  const [bio, setBio] = useState(initial.bio);
  const [email, setEmail] = useState(initial.email);
  const [avatarUri, setAvatarUri] = useState<string | null>(initial.avatarUri);
  const [directoryVisible, setDirectoryVisible] = useState(initial.directoryVisible);
  const [showEmailInDirectory, setShowEmailInDirectory] = useState(initial.showEmailInDirectory);
  const [showPhoneInDirectory, setShowPhoneInDirectory] = useState(initial.showPhoneInDirectory);
  const [saving, setSaving] = useState(false);

  React.useEffect(() => {
    if (!visible) return;
    setName(initial.name);
    setJobTitle(initial.jobTitle);
    setCompany(initial.company);
    setCity(initial.city);
    setQuartier(initial.quartier);
    setBio(initial.bio);
    setEmail(initial.email);
    setAvatarUri(initial.avatarUri);
    setDirectoryVisible(initial.directoryVisible);
    setShowEmailInDirectory(initial.showEmailInDirectory);
    setShowPhoneInDirectory(initial.showPhoneInDirectory);
  }, [visible, initial]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    setSaving(true);
    try {
      await onSave({
        name: trimmedName,
        jobTitle: jobTitle.trim(),
        company: company.trim(),
        city: city.trim(),
        quartier: quartier.trim(),
        bio: bio.trim(),
        email: email.trim(),
        avatarUri,
        directoryVisible,
        showEmailInDirectory,
        showPhoneInDirectory,
      });
    } finally {
      setSaving(false);
    }
  };

  const canSave = name.trim().length > 0 && !saving;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: pageBg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.toolbar, { paddingTop: insets.top + 8, borderBottomColor: divider }]}>
          <Pressable onPress={onCancel} hitSlop={12} style={styles.toolbarBtn}>
            <ThemedText style={[styles.toolbarBtnText, { color: theme.icon }]}>Annuler</ThemedText>
          </Pressable>
          <ThemedText style={[styles.toolbarTitle, { color: theme.text }]}>Modifier mon profil</ThemedText>
          <Pressable onPress={() => void handleSave()} disabled={!canSave} hitSlop={12} style={styles.toolbarBtn}>
            {saving ? (
              <ActivityIndicator size="small" color={ACCENT} />
            ) : (
              <ThemedText style={[styles.toolbarBtnText, { color: canSave ? ACCENT : theme.icon, fontWeight: '700' }]}>
                Enregistrer
              </ThemedText>
            )}
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
            <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>IDENTITÉ</ThemedText>
            <UploadFile
              label="Photo de profil"
              value={avatarUri}
              onChange={setAvatarUri}
              variant="avatar"
              hint="Visible dans l’annuaire"
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
              tint={ACCENT}
              compact
            />
            <IconTextField
              label="Nom affiché"
              value={name}
              onChangeText={setName}
              placeholder="Votre prénom ou nom"
              icon="person"
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
            <IconTextField
              label="Poste"
              value={jobTitle}
              onChangeText={setJobTitle}
              placeholder="Ex. Fondateur, CEO…"
              icon="work"
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
            <IconTextField
              label="Entreprise"
              value={company}
              onChangeText={setCompany}
              placeholder="Nom de l’entreprise"
              icon="business"
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
            <IconTextField
              label="Ville"
              value={city}
              onChangeText={setCity}
              placeholder="Ex. Marseille"
              icon="location-city"
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
            <IconTextField
              label="Quartier"
              value={quartier}
              onChangeText={setQuartier}
              placeholder="Ex. Joliette, Vieux-Port…"
              icon="place"
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
          </View>

          <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
            <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>ANNUAIRE</ThemedText>
            <ThemedText style={[styles.sectionHint, { color: theme.icon }]}>
              Contrôlez votre visibilité publique dans le réseau.
            </ThemedText>
            <ToggleRow
              label="Apparaître dans l'annuaire"
              hint="Votre profil sera listé dans l'annuaire des entrepreneurs."
              value={directoryVisible}
              onValueChange={setDirectoryVisible}
              themeText={theme.text}
              themeMuted={theme.icon}
              divider={divider}
              isDark={isDark}
            />
            <ToggleRow
              label="E-mail visible"
              hint="Affiche votre e-mail sur votre fiche publique."
              value={showEmailInDirectory}
              onValueChange={setShowEmailInDirectory}
              themeText={theme.text}
              themeMuted={theme.icon}
              divider={divider}
              isDark={isDark}
            />
            <ToggleRow
              label="Téléphone visible"
              hint="Affiche votre numéro sur votre fiche publique."
              value={showPhoneInDirectory}
              onValueChange={setShowPhoneInDirectory}
              themeText={theme.text}
              themeMuted={theme.icon}
              divider={divider}
              isDark={isDark}
            />
          </View>

          <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
            <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>À PROPOS</ThemedText>
            <View style={styles.fieldGroup}>
              <ThemedText style={[styles.fieldLabel, { color: theme.icon }]}>Bio</ThemedText>
              <TextInput
                value={bio}
                onChangeText={setBio}
                placeholder="Présentez-vous en quelques lignes…"
                placeholderTextColor={theme.icon}
                style={[styles.bioInput, { color: theme.text, backgroundColor: fieldBg, borderColor: divider }]}
                multiline
                textAlignVertical="top"
                maxLength={280}
              />
              <ThemedText style={[styles.charCount, { color: theme.icon }]}>{bio.length}/280</ThemedText>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: cardBg, borderColor: divider }]}>
            <ThemedText style={[styles.sectionKicker, { color: theme.icon }]}>COORDONNÉES</ThemedText>
            <IconTextField
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="vous@exemple.com"
              icon="email"
              themeText={theme.text}
              themeMuted={theme.icon}
              fieldBg={fieldBg}
              borderColor={divider}
            />
            {phone ? (
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: theme.icon }]}>Téléphone</ThemedText>
                <View style={[styles.readOnlyField, { backgroundColor: fieldBg, borderColor: divider }]}>
                  <MaterialIcons name="phone" size={16} color={theme.icon} />
                  <ThemedText style={[styles.readOnlyText, { color: theme.text }]}>{phone}</ThemedText>
                  <MaterialIcons name="lock" size={14} color={theme.icon} />
                </View>
                <ThemedText style={[styles.fieldHint, { color: theme.icon }]}>
                  Modifiable depuis les paramètres de connexion.
                </ThemedText>
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ToggleRowProps = {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  themeText: string;
  themeMuted: string;
  divider: string;
  isDark: boolean;
};

function ToggleRow({
  label,
  hint,
  value,
  onValueChange,
  themeText,
  themeMuted,
  divider,
  isDark,
}: ToggleRowProps) {
  return (
    <View style={[toggleStyles.row, { borderBottomColor: divider }]}>
      <View style={toggleStyles.text}>
        <ThemedText style={[toggleStyles.label, { color: themeText }]}>{label}</ThemedText>
        <ThemedText style={[toggleStyles.hint, { color: themeMuted }]}>{hint}</ThemedText>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: isDark ? '#3A3A3C' : '#D1D1D6', true: `${ACCENT}88` }}
        thumbColor={value ? ACCENT : isDark ? '#F4F4F4' : '#FFFFFF'}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  text: { flex: 1, gap: 3 },
  label: { fontSize: 14, fontWeight: '600' },
  hint: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
});

const styles = StyleSheet.create({
  root: { flex: 1 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toolbarBtn: { minWidth: 80 },
  toolbarBtnText: { fontSize: 15, fontWeight: '600' },
  toolbarTitle: { fontSize: 16, fontWeight: '700', letterSpacing: -0.3 },
  scrollContent: { padding: 16, gap: 14 },
  section: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 14,
  },
  sectionKicker: { fontSize: 11, fontWeight: '700', letterSpacing: 1.6 },
  sectionHint: { fontSize: 12, lineHeight: 17, fontWeight: '500' },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.25 },
  bioInput: {
    minHeight: 110,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  charCount: { fontSize: 11, fontWeight: '500', textAlign: 'right' },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  readOnlyText: { flex: 1, fontSize: 14, fontWeight: '600' },
  fieldHint: { fontSize: 11, lineHeight: 15, fontWeight: '500' },
});
