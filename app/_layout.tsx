import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen
          name="product-view"
          options={{
            presentation: 'modal',
            title: '',
            headerShown: false,
          }}
        />      
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
        </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
