import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuthProvider } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  anchor: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="auth/index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen
          name="trip-view"
          options={{
            presentation: 'modal',
            title: '',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="search-results"
          options={{
            title: 'Résultats',
            headerBackTitle: 'Retour',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#0D0D0F' : '#EDEFF2',
            },
            headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
          }}
        />
        <Stack.Screen
          name="my-trips"
          options={{
            title: 'Mes trajets',
            headerBackTitle: 'Retour',
            headerShadowVisible: false,
            headerStyle: {
              backgroundColor: colorScheme === 'dark' ? '#0D0D0F' : '#EDEFF2',
            },
            headerTintColor: colorScheme === 'dark' ? '#ECEDEE' : '#11181C',
            headerTitleStyle: { fontWeight: '700', fontSize: 17 },
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
      <StatusBar style="auto" />
      </AuthProvider>
    </ThemeProvider>
  );
}
