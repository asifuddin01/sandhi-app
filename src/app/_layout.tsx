import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
} from '@expo-google-fonts/hanken-grotesk';
import { Spectral_300Light, Spectral_300Light_Italic } from '@expo-google-fonts/spectral';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Font, useColors } from '@/constants/theme';
import { SessionProvider } from '@/lib/session';

SplashScreen.preventAutoHideAsync();

/** Declared here so a pushed screen never shows its file name while it loads. */
const titles = {
  'theme/[slug]': 'Theme',
  'area/[slug]': 'Area',
  'project/[slug]': 'Project',
  'publication/[slug]': 'Paper',
  'person/[slug]': 'Person',
  people: 'People',
  'news/index': 'News',
  'news/[slug]': 'News',
  events: 'Events',
  insights: 'Research notes',
  'insight/[slug]': 'Research note',
  search: 'Search',
  'sign-in': 'Sign in',
  me: 'Your account',
};

export default function RootLayout() {
  const [loaded, failed] = useFonts({
    Spectral_300Light,
    Spectral_300Light_Italic,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
  });
  const colors = useColors();
  const light = useColorScheme() === 'light';
  const base = light ? DefaultTheme : DarkTheme;

  useEffect(() => {
    if (loaded || failed) void SplashScreen.hideAsync();
  }, [loaded, failed]);

  // A missing font falls back to the system face rather than blocking the app.
  if (!loaded && !failed) return null;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: {
          ...base.colors,
          background: colors.ink,
          card: colors.ink,
          text: colors.text,
          border: colors.line,
          primary: colors.accent,
        },
      }}>
      <StatusBar style={light ? 'dark' : 'light'} />
      <SessionProvider>
        <Stack
          screenOptions={({ route }) => ({
            title: titles[route.name as keyof typeof titles] ?? '',
            headerStyle: { backgroundColor: colors.ink },
            headerTintColor: colors.text,
            headerTitleStyle: { fontFamily: Font.medium },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: 'minimal',
            contentStyle: { backgroundColor: colors.ink },
          })}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false, title: 'SANDHI' }} />
        </Stack>
      </SessionProvider>
    </ThemeProvider>
  );
}
