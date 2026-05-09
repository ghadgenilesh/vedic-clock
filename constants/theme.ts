/**
 * Vedic App Theme — traditional palette with dark mode support.
 */

import { Platform } from 'react-native';

export const VedicPalette = {
  gold: '#D4AF37',
  saffron: '#FF9933',
  deepRed: '#8B0000',
  maroon: '#800000',
  lotus: '#FF6B9D',
  sandalwood: '#C8A96E',
  ivory: '#FFFFF0',
  darkBg: '#0D0A1A',
  darkSurface: '#1A1530',
  darkCard: '#241E3D',
  lightBg: '#FFF8F0',
  lightSurface: '#FEF3DC',
  lightCard: '#FFF',
  auspicious: '#2E7D32',
  inauspicious: '#C62828',
  neutral: '#F57F17',
};

export const Colors = {
  light: {
    text: '#1A0A00',
    subText: '#5C4033',
    background: VedicPalette.lightBg,
    surface: VedicPalette.lightSurface,
    card: VedicPalette.lightCard,
    tint: VedicPalette.saffron,
    gold: VedicPalette.gold,
    accent: VedicPalette.deepRed,
    icon: '#8B5E3C',
    tabIconDefault: '#8B5E3C',
    tabIconSelected: VedicPalette.saffron,
    border: '#E8D5B0',
    auspicious: VedicPalette.auspicious,
    inauspicious: VedicPalette.inauspicious,
    neutral: VedicPalette.neutral,
  },
  dark: {
    text: '#FFF8F0',
    subText: '#C8A96E',
    background: VedicPalette.darkBg,
    surface: VedicPalette.darkSurface,
    card: VedicPalette.darkCard,
    tint: VedicPalette.gold,
    gold: VedicPalette.gold,
    accent: VedicPalette.saffron,
    icon: VedicPalette.sandalwood,
    tabIconDefault: '#7B6A8A',
    tabIconSelected: VedicPalette.gold,
    border: '#2E2650',
    auspicious: '#66BB6A',
    inauspicious: '#EF5350',
    neutral: '#FFB300',
  },
};

/**
 * Custom Indian-traditional fonts loaded via expo-font.
 * RozhaOne — bold Indian-heritage serif for display/titles.
 * Hind — Indian-heritage sans supporting Latin + Devanagari for body text.
 */
export const Fonts = {
  display: 'RozhaOne_400Regular',
  sans: 'Hind_400Regular',
  sansMedium: 'Hind_500Medium',
  sansSemiBold: 'Hind_600SemiBold',
  sansBold: 'Hind_700Bold',
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) as string,
};
