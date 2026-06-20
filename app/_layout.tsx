import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/auth-context';
import { EventFavoritesProvider } from '@/contexts/event-favorites-context';

/** Largeur max type tablette (iPad) — l’app reste centrée sur desktop / grands écrans. */
const TABLET_MAX_WIDTH = 768;

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const theme = Colors.light;

  return (
    <View style={[styles.shell, { backgroundColor: '#D8DCE3' }]}>
      <View style={[styles.frame, { backgroundColor: theme.background }]}>
        <ThemeProvider value={DefaultTheme}>
          <AuthProvider>
            <EventFavoritesProvider>
              <Stack>
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="auth/index" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen
                  name="profile/edit"
                  options={{
                    title: 'Modifier mon profil',
                    headerBackTitle: 'Retour',
                    headerShadowVisible: false,
                    headerStyle: {
                      backgroundColor: '#EDEFF2',
                    },
                    headerTintColor: '#11181C',
                    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                  }}
                />
                <Stack.Screen
                  name="member/[id]"
                  options={{
                    title: 'Profil',
                    headerBackTitle: 'Retour',
                    headerShadowVisible: false,
                    headerStyle: {
                      backgroundColor: '#EDEFF2',
                    },
                    headerTintColor: '#11181C',
                    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                  }}
                />
                <Stack.Screen
                  name="event/edit/[id]"
                  options={{
                    title: '',
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="my-events/index"
                  options={{
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
                      backgroundColor: '#EDEFF2',
                    },
                    headerTintColor: '#11181C',
                    headerTitleStyle: { fontWeight: '700', fontSize: 17 },
                  }}
                />
              </Stack>
            </EventFavoritesProvider>
            <StatusBar style="dark" />
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
