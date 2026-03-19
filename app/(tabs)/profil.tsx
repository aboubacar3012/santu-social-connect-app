import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import SafeScrollView from '@/components/scroll-view';
import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

function VerifyRow({
  icon,
  title,
  subtitle,
  done,
  textColor,
  iconColor,
}: {
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  done: boolean;
  textColor: string;
  iconColor: string;
}) {
  return (
    <View style={styles.verifyRow}>
      <View style={[styles.verifyIconWrap, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
        <MaterialIcons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.verifyText}>
        <ThemedText style={[styles.verifyTitle, { color: textColor }]}>{title}</ThemedText>
        <ThemedText style={styles.verifySubtitle}>{subtitle}</ThemedText>
      </View>
      <MaterialIcons
        name={done ? 'check-circle' : 'radio-button-unchecked'}
        size={20}
        color={done ? '#2E7D32' : iconColor}
      />
    </View>
  );
}

export default function ProfilScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];
  const cardBg = isDark ? '#1B1B1E' : '#FFFFFF';
  const accent = '#00A0DC';

  return (
    <SafeScrollView keyboardAvoiding>
      <View style={styles.header}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Profil</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.icon }]}>
          Votre fiche conducteur, comme sur BlaBlaCar.
        </ThemedText>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <View style={styles.topRow}>
          <View style={[styles.avatar, { backgroundColor: isDark ? '#2A2A2D' : '#EAF6FB' }]}>
            <ThemedText style={[styles.avatarText, { color: accent }]}>AB</ThemedText>
          </View>
          <View style={styles.topText}>
            <ThemedText style={[styles.name, { color: theme.text }]}>Aboubacar Bah</ThemedText>
            <ThemedText style={[styles.smallMuted, { color: theme.icon }]}>
              Membre depuis mars 2024
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Vérifications</ThemedText>

        <VerifyRow
          icon="mail"
          title="Adresse e-mail vérifiée"
          subtitle="aboubacar@example.com"
          done
          textColor={theme.text}
          iconColor={theme.icon}
        />
        <VerifyRow
          icon="phone"
          title="Numéro de téléphone vérifié"
          subtitle="+224 621 00 00 00"
          done
          textColor={theme.text}
          iconColor={theme.icon}
        />
        <VerifyRow
          icon="badge"
          title="Pièce d'identité"
          subtitle="Ajoutez votre pièce pour rassurer les passagers"
          done={false}
          textColor={theme.text}
          iconColor={theme.icon}
        />
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Préférences</ThemedText>
        <View style={styles.tagsWrap}>
          <View style={[styles.tag, { backgroundColor: isDark ? '#2A2A2D' : '#F3F4F6' }]}>
            <ThemedText style={[styles.tagText, { color: theme.text }]}>Discussion modérée</ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: isDark ? '#2A2A2D' : '#F3F4F6' }]}>
            <ThemedText style={[styles.tagText, { color: theme.text }]}>Musique OK</ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: isDark ? '#2A2A2D' : '#F3F4F6' }]}>
            <ThemedText style={[styles.tagText, { color: theme.text }]}>Pause possible</ThemedText>
          </View>
          <View style={[styles.tag, { backgroundColor: isDark ? '#2A2A2D' : '#F3F4F6' }]}>
            <ThemedText style={[styles.tagText, { color: theme.text }]}>Non-fumeur</ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Véhicule principal</ThemedText>
        <View style={styles.carRow}>
          <View style={[styles.carIcon, { backgroundColor: isDark ? '#2A2A2D' : '#EEF2FF' }]}>
            <MaterialIcons name="directions-car" size={20} color={accent} />
          </View>
          <View style={styles.carText}>
            <ThemedText style={[styles.carTitle, { color: theme.text }]}>Toyota RAV4 · Gris</ThemedText>
            <ThemedText style={[styles.smallMuted, { color: theme.icon }]}>
              4 places · Climatisation
            </ThemedText>
          </View>
        </View>
      </View>

      <Pressable style={[styles.primaryBtn, { backgroundColor: accent }]}>
        <MaterialIcons name="edit" size={18} color="#FFFFFF" />
        <ThemedText style={styles.primaryBtnText}>Modifier mon profil</ThemedText>
      </Pressable>
    </SafeScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 14,
    gap: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 14,
    elevation: 6,
  },
  topRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
    fontWeight: '800',
  },
  topText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
  },
  smallMuted: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  verifyIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    flex: 1,
    gap: 1,
  },
  verifyTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  verifySubtitle: {
    fontSize: 12,
    opacity: 0.75,
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },
  carRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  carIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carText: {
    flex: 1,
    gap: 2,
  },
  carTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
