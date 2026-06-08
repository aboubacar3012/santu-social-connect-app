import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/auth-context';
import { EventFavoritesProvider } from '@/contexts/event-favorites-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Largeur max type tablette (iPad) — l’app reste centrée sur desktop / grands écrans. */
const TABLET_MAX_WIDTH = 768;

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];
  const shellBg = colorScheme === 'dark' ? '#050506' : '#D8DCE3';

  return (
    <View style={[styles.shell, { backgroundColor: shellBg }]}>
      <View style={[styles.frame, { backgroundColor: theme.background }]}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AuthProvider>
            <EventFavoritesProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth/index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen
                  name="member/[id]"
                  options={{
                    presentation: 'modal',
                    title: '',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="event/[id]"
                  options={{
                    presentation: 'modal',
                    title: '',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="conversation/[id]"
                  options={{
                    title: 'Discussion',
                    headerBackTitle: 'Retour',
                    headerShadowVisible: false,
                    headerStyle: {
                      backgroundColor: colorScheme === 'dark' ? '#0D0D0F' : '#EDEFF2',
                    },
                    headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
                    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                  }}
                />
              </Stack>
            </EventFavoritesProvider>
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  frame: {
    flex: 1,
    width: '100%',
    maxWidth: TABLET_MAX_WIDTH,
    overflow: 'hidden',
  },
});
