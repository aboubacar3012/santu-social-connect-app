import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import UploadFile from '@/components/upload-file';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/**
 * Champs alignés sur le modèle Prisma `User` (santu-go-api/prisma/schema.prisma).
 * - firstName, lastName, dateOfBirth (jour / mois / année → API), profilePicture
 * - email (éditable) — le téléphone est défini à l’inscription / auth, non affiché ici
 * - vehicleBrand, vehicleModel, vehiclePlateNumber
 * - identityVerificationDocumentFront | Back | Selfie
 */

const SURFACE = { light: '#FFFFFF', dark: '#141416' } as const;
const MUTED = { light: '#6B7280', dark: '#8B9098' } as const;
const ON_TINT = '#111111';

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
  maxLength,
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
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad' | 'url';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
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
        <MaterialIcons name={icon} size={14} color={themeMuted} style={styles.inputIcon} />
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
          maxLength={maxLength}
        />
        {!editable ? (
          <MaterialIcons name="lock-outline" size={14} color={themeMuted} style={styles.lockIcon} />
        ) : null}
      </View>
    </View>
  );
}

function DateOfBirthFields({
  day,
  month,
  year,
  onDayChange,
  onMonthChange,
  onYearChange,
  themeText,
  themeMuted,
  fieldBg,
  borderColor,
}: {
  day: string;
  month: string;
  year: string;
  onDayChange: (v: string) => void;
  onMonthChange: (v: string) => void;
  onYearChange: (v: string) => void;
  themeText: string;
  themeMuted: string;
  fieldBg: string;
  borderColor: string;
}) {
  return (
    <View style={styles.fieldGroup}>
      <ThemedText style={[styles.fieldLabel, { color: themeMuted }]}>Date de naissance</ThemedText>
      <View style={styles.dateRow}>
        <View style={styles.dateCol}>
          <ThemedText style={[styles.dateHint, { color: themeMuted }]}>Jour</ThemedText>
          <View style={[styles.inputShell, styles.dateInputShell, { backgroundColor: fieldBg, borderColor }]}>
            <TextInput
              value={day}
              onChangeText={(t) => onDayChange(t.replace(/\D/g, '').slice(0, 2))}
              placeholder="JJ"
              placeholderTextColor={themeMuted}
              keyboardType="number-pad"
              maxLength={2}
              style={[styles.input, styles.dateInput, { color: themeText }]}
            />
          </View>
        </View>
        <View style={styles.dateCol}>
          <ThemedText style={[styles.dateHint, { color: themeMuted }]}>Mois</ThemedText>
          <View style={[styles.inputShell, styles.dateInputShell, { backgroundColor: fieldBg, borderColor }]}>
            <TextInput
              value={month}
              onChangeText={(t) => onMonthChange(t.replace(/\D/g, '').slice(0, 2))}
              placeholder="MM"
              placeholderTextColor={themeMuted}
              keyboardType="number-pad"
              maxLength={2}
              style={[styles.input, styles.dateInput, { color: themeText }]}
            />
          </View>
        </View>
        <View style={[styles.dateCol, styles.dateColYear]}>
          <ThemedText style={[styles.dateHint, { color: themeMuted }]}>Année</ThemedText>
          <View style={[styles.inputShell, styles.dateInputShell, { backgroundColor: fieldBg, borderColor }]}>
            <TextInput
              value={year}
              onChangeText={(t) => onYearChange(t.replace(/\D/g, '').slice(0, 4))}
              placeholder="AAAA"
              placeholderTextColor={themeMuted}
              keyboardType="number-pad"
              maxLength={4}
              style={[styles.input, styles.dateInput, { color: themeText }]}
            />
          </View>
        </View>
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

  /* Identité */
  const [firstName, setFirstName] = useState('Aboubacar');
  const [lastName, setLastName] = useState('Bah');
  const [birthDay, setBirthDay] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  /* Contact */
  const [email, setEmail] = useState('aboubacar@example.com');

  /* Véhicule */
  const [vehicleBrand, setVehicleBrand] = useState('Toyota');
  const [vehicleModel, setVehicleModel] = useState('RAV4');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');

  /* Pièces d’identité (URLs / chemins stockage) */
  const [identityVerificationDocumentFront, setIdentityVerificationDocumentFront] = useState<string | null>(null);
  const [identityVerificationDocumentBack, setIdentityVerificationDocumentBack] = useState<string | null>(null);
  const [identityVerificationDocumentSelfie, setIdentityVerificationDocumentSelfie] = useState<string | null>(null);

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
        <DateOfBirthFields
          day={birthDay}
          month={birthMonth}
          year={birthYear}
          onDayChange={setBirthDay}
          onMonthChange={setBirthMonth}
          onYearChange={setBirthYear}
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
        />
        <View style={styles.fieldSpacer} />
        <UploadFile
          label="Photo de profil"
          value={profilePicture}
          onChange={setProfilePicture}
          variant="avatar"
          compact
          hint=""
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
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="vous@exemple.com"
          icon="mail-outline"
          themeText={theme.text}
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {/* {emailVerified ? (
          <ThemedText style={[styles.emailVerifiedNote, { color: muted }]}>
            E-mail vérifié — un nouveau mail imposera une confirmation.
          </ThemedText>
        ) : null} */}
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
      </SectionCard>

      <SectionCard surface={surface} borderColor={borderSubtle}>
        <View style={styles.kickerBlock}>
          <SectionKicker color={muted}>PIÈCE D’IDENTITÉ</SectionKicker>
        </View>
        <ThemedText style={[styles.identityIntro, { color: muted }]}>
          Justificatif : recto, verso, selfie.
        </ThemedText>
        <UploadFile
          label="Recto"
          value={identityVerificationDocumentFront}
          onChange={setIdentityVerificationDocumentFront}
          variant="document"
          compact
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
          compact
          themeMuted={muted}
          fieldBg={fieldBg}
          borderColor={borderSubtle}
          tint={theme.tint}
        />
        <View style={styles.fieldSpacer} />
        <UploadFile
          label="Selfie"
          value={identityVerificationDocumentSelfie}
          onChange={setIdentityVerificationDocumentSelfie}
          variant="document"
          compact
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
          <MaterialIcons name="check" size={17} color={ON_TINT} />
          <ThemedText style={styles.primaryBtnText}>Enregistrer</ThemedText>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  kickerBlock: {
    marginBottom: 5,
  },
  sectionKicker: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  col: {
    flex: 1,
    minWidth: 0,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  dateCol: {
    flex: 1,
    minWidth: 0,
  },
  dateColYear: {
    flex: 1.35,
  },
  dateHint: {
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  dateInputShell: {
    minHeight: 40,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  dateInput: {
    textAlign: 'center',
    fontSize: 14,
  },
  fieldGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputShell: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 9,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 7,
    minHeight: 40,
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
  input: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    paddingVertical: 0,
    letterSpacing: -0.2,
    minHeight: 20,
  },
  inputMultiline: {
    minHeight: 48,
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 17,
  },
  emailVerifiedNote: {
    fontSize: 9,
    lineHeight: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  identityIntro: {
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 6,
    fontWeight: '500',
  },
  fieldSpacer: {
    height: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  secondaryBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  secondaryBtnText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
  primaryBtn: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  primaryBtnText: {
    color: ON_TINT,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.15,
  },
});
