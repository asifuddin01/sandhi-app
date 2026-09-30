import { useColorScheme } from 'react-native';

/** The website's palettes (styles/tokens.css in the sandhi repo), unchanged. */
const lapisNight = {
  ink: '#141a2e',
  raised: '#1b2340',
  line: '#2c3657',
  text: '#d9dee8',
  muted: '#8c95ab',
  accent: '#c9a55c',
  link: '#9c8fb8',
  ok: '#7fa88f',
  warn: '#c98a6b',
};

const parchment: typeof lapisNight = {
  ink: '#eee8dc',
  raised: '#f7f1e6',
  line: '#d2c8b8',
  text: '#1a2138',
  muted: '#56607a',
  accent: '#836323',
  link: '#5e5282',
  ok: '#40634e',
  warn: '#8b4c2d',
};

export type Colors = typeof lapisNight;

/** Lapis Night unless the phone asks for light, as the website does. */
export function useColors(): Colors {
  return useColorScheme() === 'light' ? parchment : lapisNight;
}

export const Font = {
  display: 'Spectral_300Light',
  displayItalic: 'Spectral_300Light_Italic',
  body: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  semibold: 'HankenGrotesk_600SemiBold',
} as const;

export const Space = { xs: 4, s: 8, m: 16, l: 24, xl: 40 } as const;
