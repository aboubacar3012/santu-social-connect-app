import * as Haptics from 'expo-haptics';
import { Linking, Platform } from 'react-native';

export function triggerLightHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }
}

export function triggerFavoriteHaptic() {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);
  }
}

export function openEventLink(url: string) {
  triggerLightHaptic();
  Linking.openURL(url);
}
