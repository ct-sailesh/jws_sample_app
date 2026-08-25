import { Platform } from 'react-native';
import type { ThemeDefinition } from '../types';

/**
 * Default theme. Colour values are unchanged from the former
 * `src/theme/colors.ts` — reverse engineered from the JSW Used Cars HTML
 * prototype's inlined styles, not eyeballed from screenshots.
 */
const colors = {
  ink900: '#11141C',
  ink700: '#333A48',
  ink600: '#4A5162',
  ink500: '#6B7383',
  ink400: '#98A1B0',
  ink300: '#C3C9D4',

  border: '#DDE1E8',
  borderStrong: '#C3C9D4',

  surface: '#FFFFFF',
  surfaceAlt: '#F7F8FA',
  background: '#EEF0F4',

  primary: '#1F4FD8',
  primaryDark: '#17399F',
  primarySoft: '#E8EEFF',
  primarySofter: '#F7F9FF',
  primaryHalo: '#C7D6FF',

  success: '#0E8A4F',
  successSoft: '#E6F5ED',
  successDark: '#1F3A2E',

  warning: '#B8730B',
  warningSoft: '#FDF3E2',
  warningSofter: '#F0DFBE',
  warningDark: '#8A5B0C',
  warningText: '#6B5326',

  danger: '#C42B20',
  dangerSoft: '#FBE9E7',
  dangerStrong: '#9E2A22',
};

const shadowColor = colors.ink900;

function elevation(opacity: number, radius: number, y: number, android: number) {
  return Platform.select({
    android: { elevation: android },
    default: {
      shadowColor,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: y },
    },
  });
}

const shadows = {
  card: elevation(0.08, 10, 2, 2),
  raised: elevation(0.12, 18, 4, 4),
  sheet: elevation(0.22, 30, -10, 10),
  // Was a literal '#1F4FD8' hex duplicate of `colors.primary` — now sourced
  // from the same value so the two can never drift apart.
  focusRing: {
    shadowColor: colors.primary,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
  },
};

export const lightTheme: ThemeDefinition = { colors, shadows };
