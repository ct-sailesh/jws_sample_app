import { Platform } from 'react-native';
import type { ThemeDefinition } from '../types';

/**
 * Dark theme. Not a 1:1 invert of `light.ts` — the ink scale flips (darkest
 * "ink" now means brightest text), surfaces move to layered near-blacks, and
 * the brand/semantic accents are brightened a step so they keep enough
 * contrast against dark surfaces (the light theme's saturated-but-darkish
 * hues would read as muddy here). Distinct from `themes/camera.ts`, which
 * stays fixed regardless of this theme.
 */
const colors = {
  ink900: '#F5F6F8',
  ink700: '#D7DAE1',
  ink600: '#B7BCC6',
  ink500: '#8B909C',
  ink400: '#5B6270',
  ink300: '#3A4150',

  border: '#2B303A',
  borderStrong: '#3A4150',

  surface: '#1A1D24',
  surfaceAlt: '#20242C',
  background: '#0F1115',

  primary: '#5B84FF',
  primaryDark: '#1F4FD8',
  primarySoft: '#1B2A54',
  primarySofter: '#141F3F',
  primaryHalo: '#2A3F7A',

  success: '#34C77F',
  successSoft: '#123825',
  successDark: '#0B2318',

  warning: '#E3A034',
  warningSoft: '#3A2C12',
  warningSofter: '#4A3A1C',
  warningDark: '#8A5B0C',
  warningText: '#F0DFBE',

  danger: '#FF6B5E',
  dangerSoft: '#3A1613',
  dangerStrong: '#9E2A22',
};

function elevation(opacity: number, radius: number, y: number, android: number) {
  return Platform.select({
    android: { elevation: android },
    default: {
      shadowColor: '#000000',
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    },
  });
}

const shadows = {
  card: elevation(0.4, 10, 2, 2),
  raised: elevation(0.5, 18, 4, 4),
  sheet: elevation(0.6, 30, -10, 10),
  focusRing: {
    shadowColor: colors.primary,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
};

export const darkTheme: ThemeDefinition = { colors, shadows };
