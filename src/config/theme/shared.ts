import { TextStyle } from 'react-native';

/**
 * Theme-agnostic tokens: spacing, radii and typography never vary between
 * light/dark/future themes (they're layout and type-scale decisions, not
 * colour decisions) — so unlike `themes/light.ts` / `themes/dark.ts`, this
 * file is imported once and merged into every theme by `ThemeProvider`.
 * Values are unchanged from the former `src/theme/spacing.ts` +
 * `src/theme/typography.ts`.
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  xs: 6,
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  huge: 24,
  massive: 32,
  pill: 999,
} as const;

/**
 * Font families. The exact string values must match the PostScript names
 * baked into the bundled font files under `assets/fonts/` (linked into both
 * native projects via `react-native.config.js` + `npx react-native-asset` —
 * see the README). Bare RN has no runtime font-loading step (unlike Expo's
 * `useFonts()`): these are just native font resources from first paint.
 */
export const fontFamily = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
  monoRegular: 'IBMPlexMono-Regular',
  monoMedium: 'IBMPlexMono-Medium',
  monoSemiBold: 'IBMPlexMono-SemiBold',
} as const;

/**
 * In the HTML prototype, Inter carries almost all UI copy while IBM Plex Mono
 * is reserved for "data-like" values: VIN/registration numbers, reference
 * IDs, OTP digits, odometer readings and step counters ("1 of 15").
 */
export const type: Record<string, TextStyle> = {
  displayLg: { fontFamily: fontFamily.bold, fontSize: 30, lineHeight: 37 },
  h1: { fontFamily: fontFamily.bold, fontSize: 26, lineHeight: 32 },
  h2: { fontFamily: fontFamily.bold, fontSize: 21, lineHeight: 27 },
  h3: { fontFamily: fontFamily.semiBold, fontSize: 17, lineHeight: 23 },
  body: { fontFamily: fontFamily.regular, fontSize: 15, lineHeight: 21 },
  bodyStrong: { fontFamily: fontFamily.semiBold, fontSize: 15, lineHeight: 21 },
  bodySm: { fontFamily: fontFamily.regular, fontSize: 13, lineHeight: 18 },
  bodySmStrong: { fontFamily: fontFamily.semiBold, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fontFamily.regular, fontSize: 12, lineHeight: 16 },
  eyebrow: {
    fontFamily: fontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.1, // ~.09em at 12px
    textTransform: 'uppercase',
  },
  eyebrowSm: {
    fontFamily: fontFamily.semiBold,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.05,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fontFamily.bold, fontSize: 16, lineHeight: 20 },
  mono: { fontFamily: fontFamily.monoMedium, fontSize: 13, lineHeight: 18 },
  monoLg: { fontFamily: fontFamily.monoSemiBold, fontSize: 17, lineHeight: 22 },
  monoSm: { fontFamily: fontFamily.monoRegular, fontSize: 11, lineHeight: 15 },
};

export type Spacing = typeof spacing;
export type Radii = typeof radii;
