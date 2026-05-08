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

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
