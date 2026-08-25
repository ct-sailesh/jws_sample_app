/**
 * Shape of the part of a theme that actually varies between light/dark:
 * colours, and shadows (since a shadow tint is itself a colour). Spacing,
 * radii and typography live in `shared.ts` and are the same for every
 * theme — see `ThemeProvider.tsx` for how the two are merged into the
 * `useTheme()` return value.
 *
 * `colors.camera` is intentionally NOT part of this shape — the
 * guided-capture screen is a fixed, always-dark palette for on-camera
 * contrast (see `themes/camera.ts`) and must never repaint when the app
 * theme switches.
 */
export interface ThemeColors {
  ink900: string;
  ink700: string;
  ink600: string;
  ink500: string;
  ink400: string;
  ink300: string;

  border: string;
  borderStrong: string;

  surface: string;
  surfaceAlt: string;
  background: string;

  primary: string;
  primaryDark: string;
  primarySoft: string;
  primarySofter: string;
  primaryHalo: string;

  success: string;
  successSoft: string;
  successDark: string;

  warning: string;
  warningSoft: string;
  warningSofter: string;
  warningDark: string;
  warningText: string;

  danger: string;
  dangerSoft: string;
  dangerStrong: string;
}

export interface ThemeShadowSpec {
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
  shadowOffset?: { width: number; height: number };
  elevation?: number;
}

export interface ThemeShadows {
  card: ThemeShadowSpec;
  raised: ThemeShadowSpec;
  sheet: ThemeShadowSpec;
  focusRing: ThemeShadowSpec;
}

export interface ThemeDefinition {
  colors: ThemeColors;
  shadows: ThemeShadows;
}
