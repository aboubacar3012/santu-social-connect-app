import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import UploadFile from '@/components/upload-file';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Champs alignés sur le modèle Prisma `User` (santu-go-api/prisma/schema.prisma).
 * - firstName, lastName, profilePicture
 * - email, phoneE164 (lecture seule côté app — vérification OTP)
 * - vehicleBrand, vehicleModel, vehiclePlateNumber, vehicleTags
 * - tags
 * - identityVerificationDocumentFront | Back | Selfie
 */

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

/** Suggestions pour `User.tags` (préférences trajet / covoiturage). */
const PROFILE_TAG_OPTIONS = [
  'Discussion modérée',
  'Musique OK',
  'Pause possible',
  'Non-fumeur',
] as const;

/** Suggestions pour `User.vehicleTags`. */
const VEHICLE_TAG_OPTIONS = [
  'Climatisation',
  'GPS',
  'Bagages',
  'Sièges enfant',
  'Animaux',
  'Non-fumeur à bord',
] as const;

function SectionCard({
  children,
  surface,
  borderColor,
  style,
}: {
  children: React.ReactNode;
  surface: string;
  borderColor: string;
  style?: object;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: surface, borderColor }, style]}>{children}</View>
  );
}

function SectionKicker({ children, color }: { children: string; color: string }) {
  return <ThemedText style={[styles.sectionKicker, { color }]}>{children}</ThemedText>;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
  multiline,
  editable = true,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
  multiline?: boolean;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>{label}</ThemedText>
      <View
        style={[
          styles.inputShell,
          { backgroundColor: fieldBg, borderColor },
          !editable && styles.inputShellDisabled,
        ]}
      >
        <MaterialIcons name={icon} size={16} color={themeMuted} style={styles.inputIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={themeMuted}
          style={[styles.input, multiline && styles.inputMultiline, { color: themeText }]}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          editable={editable}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
        />
        {!editable ? (
          <MaterialIcons name="lock-outline" size={16} color={themeMuted} style={styles.lockIcon} />
        ) : null}
      </View>
    </View>
  );
}

function ContactReadOnlyRow({
  label,
  value,
  verified,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
  icon,
}: {
  label: string;
  value: string;
  verified: boolean;
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>{label}</ThemedText>
      <View style={[styles.inputShell, styles.inputShellDisabled, { backgroundColor: fieldBg, borderColor }]}>
        <MaterialIcons name={icon} size={16} color={themeMuted} style={styles.inputIcon} />
        <ThemedText style={[styles.readonlyValue, { color: themeText }]} numberOfLines={2}>
          {value || '—'}
        </ThemedText>
        <MaterialIcons name="lock-outline" size={16} color={themeMuted} style={styles.lockIcon} />
        {verified ? (
          <View style={styles.verifiedBadge}>
            <MaterialIcons name="verified" size={14} color="#2E7D32" />
            <ThemedText style={styles.verifiedBadgeText}>Vérifié</ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

type ProfilEditProps = {
  onCancel: () => void;
  onSave: () => void;
};

/** Édition du profil — champs calqués sur `User` (Prisma). */
export default function ProfilEdit({ onCancel, onSave }: ProfilEditProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const surface = isDark ? SURFACE.dark : SURFACE.light;
  const muted = isDark ? MUTED.dark : MUTED.light;
  const borderSubtle = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const fieldBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
  const tintSoft = isDark ? 'rgba(230,168,0,0.14)' : 'rgba(230,168,0,0.18)';

  /* Identité */
  const [firstName, setFirstName] = useState('Aboubacar');
  const [lastName, setLastName] = useState('Bah');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  /* Contact (affichage — modification via flux auth / support) */
  const email = 'aboubacar@example.com';
  const phoneE164 = '+224621000000';
  const emailVerified = true;
  const phoneVerified = true;

  /* Véhicule */
  const [vehicleBrand, setVehicleBrand] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('RAV4');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [vehicleTags, setVehicleTags] = useState<string[]>(['Climatisation', 'GPS']);

  /* Tags profil (User.tags) */
  const [tags, setTags] = useState<string[]>([...PROFILE_TAG_OPTIONS]);

  /* Pièces d’identité (URLs / chemins stockage) */
  const [identityVerificationDocumentFront, setIdentityVerificationDocumentFront] = useState<string | null>(null);
  const [identityVerificationDocumentBack, setIdentityVerificationDocumentBack] = useState<string | null>(null);
  const [identityVerificationDocumentSelfie, setIdentityVerificationDocumentSelfie] = useState<string | null>(null);

  const toggleInList = (setList: React.Dispatch<React.SetStateAction<string[]>>, label: string) => {
    setList((prev) =>
      prev.includes(label) ? prev.filter((p) => p !== label) : [...prev, label]
    );
  };

  return (
    <>
      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>IDENTITÉ</SectionKicker>
        </View>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Field
              label="Prénom"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Prénom"
              icon="person-outline"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.col}>
            <Field
              label="Nom"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Nom"
              icon="badge"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              autoCapitalize="words"
            />
          </View>
        </View>
        <View style={styles.fieldSpacer} />
        <UploadFile
          label="Photo de profil"
          value={profilePicture}
          onChange={setProfilePicture}
          variant="avatar"
          hint="Stockée côté API dans `profilePicture` (URL ou clé après upload)."
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          tint={theme.tint}
        />
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>CONTACT</SectionKicker>
        </View>
        <ContactReadOnlyRow
          label="E-mail"
          value={email}
          verified={emailVerified}
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          icon="mail-outline"
        />
        <View style={[styles.inCardDivider, { backgroundColor: borderSubtle }]} />
        <ContactReadOnlyRow
          label="Téléphone (E.164)"
          value={phoneE164}
          verified={phoneVerified}
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          icon="phone"
        />
        <ThemedText style={[styles.hint, { color: muted }]}>
          `email` et `phoneE164` sont uniques en base. La modification passe par la vérification (OTP / lien).
        </ThemedText>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>VÉHICULE</SectionKicker>
        </View>
        <View style={styles.twoCols}>
          <View style={styles.col}>
            <Field
              label="Marque"
              value={vehicleBrand}
              onChangeText={setVehicleBrand}
              placeholder="Ex. Toyota"
              icon="precision-manufacturing"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              autoCapitalize="words"
            />
          </View>
          <View style={styles.col}>
            <Field
              label="Modèle"
              value={vehicleModel}
              onChangeText={setVehicleModel}
              placeholder="Ex. RAV4"
              icon="directions-car"
              themeText={theme.text}
              themeMuted={muted}
              fieldBg={fieldBg}
              borderColor={borderSubtle}
              autoCapitalize="words"
            />
          </View>
        </View>
        <View style={styles.fieldSpacer} />
        <Field
          label="Immatriculation"
          value={vehiclePlateNumber}
          onChangeText={setVehiclePlateNumber}
          placeholder="Ex. RC 1234 AB"
          icon="pin"
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          autoCapitalize="characters"
        />
        <View style={styles.fieldSpacer} />
        <ThemedText style={[styles.subLabel, { color: muted }]}>Équipements (`vehicleTags`)</ThemedText>
        <View style={styles.optionWrap}>
          {VEHICLE_TAG_OPTIONS.map((label) => {
            const selected = vehicleTags.includes(label);
            return (
              <Pressable
                key={label}
                onPress={() => toggleInList(setVehicleTags, label)}
                style={({ pressed }) => [
                  styles.optionPill,
                  {
                    borderColor: selected ? theme.tint : borderSubtle,
                    backgroundColor: selected ? tintSoft : 'transparent',
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.optionPillText, { color: selected ? theme.text : muted }]}
                >
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PRÉFÉRENCES TRAJET</SectionKicker>
        </View>
        <ThemedText style={[styles.subLabel, { color: muted }]}>Tags (`tags`)</ThemedText>
        <View style={styles.optionWrap}>
          {PROFILE_TAG_OPTIONS.map((label) => {
            const selected = tags.includes(label);
            return (
              <Pressable
                key={label}
                onPress={() => toggleInList(setTags, label)}
                style={({ pressed }) => [
                  styles.optionPill,
                  {
                    borderColor: selected ? theme.tint : borderSubtle,
                    backgroundColor: selected ? tintSoft : 'transparent',
                    opacity: pressed ? 0.9 : 1,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.optionPillText, { color: selected ? theme.text : muted }]}
                >
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PIÈCE D’IDENTITÉ</SectionKicker>
        </View>
        <ThemedText style={[styles.identityIntro, { color: muted }]}>
          Champs Prisma : `identityVerificationDocumentFront`, `identityVerificationDocumentBack`,
          `identityVerificationDocumentSelfie`.
        </ThemedText>
        <UploadFile
          label="Recto"
          value={identityVerificationDocumentFront}
          onChange={setIdentityVerificationDocumentFront}
          variant="document"
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          tint={theme.tint}
        />
        <View style={styles.fieldSpacer} />
        <UploadFile
          label="Verso"
          value={identityVerificationDocumentBack}
          onChange={setIdentityVerificationDocumentBack}
          variant="document"
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          tint={theme.tint}
        />
        <View style={styles.fieldSpacer} />
        <UploadFile
          label="Selfie / portrait"
          value={identityVerificationDocumentSelfie}
          onChange={setIdentityVerificationDocumentSelfie}
          variant="document"
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          tint={theme.tint}
        />
      </SectionCard>

      <View style={styles.actionsRow}>
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.secondaryBtn,
            {
              borderColor: borderSubtle,
              backgroundColor: fieldBg,
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <ThemedText style={[styles.secondaryBtnText, { color: theme.text }]}>Annuler</ThemedText>
        </Pressable>
        <Pressable
          onPress={onSave}
          style={({ pressed }) => [
            styles.primaryBtn,
            { backgroundColor: theme.tint, opacity: pressed ? 0.92 : 1 },
          ]}
        >
          <MaterialIcons name="check" size={18} color={ON_TINT} />
          <ThemedText style={styles.primaryBtnText}>Enregistrer</ThemedText>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 14,
    elevation: 2,
  },
  kickerBlock: {
    marginBottom: 8,
  },
  sectionKicker: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.25,
  },
  subLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 46,
  },
  inputShellDisabled: {
    opacity: 0.92,
  },
  inputIcon: {
    marginRight: 8,
    opacity: 0.85,
  },
  lockIcon: {
    marginLeft: 6,
    opacity: 0.75,
  },
  readonlyValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 4,
  },
  verifiedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 0,
    letterSpacing: -0.2,
    minHeight: 22,
  },
  inputMultiline: {
    minHeight: 56,
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 19,
  },
  hint: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 10,
    fontWeight: '500',
  },
  identityIntro: {
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  inCardDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  optionPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  fieldSpacer: {
    height: 10,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 9,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  primaryBtnText: {
    color: ON_TINT,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
