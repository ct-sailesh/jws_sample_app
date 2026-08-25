import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { env } from '../env';
import { radii, spacing, type } from './shared';
import { themeRegistry, ThemeName } from './themes';
import type { ThemeDefinition } from './types';

const STORAGE_KEY = '@jsw/theme';

/** Everything a component needs from the theme system in one object. */
export interface Theme extends ThemeDefinition {
  spacing: typeof spacing;
  radii: typeof radii;
  type: typeof type;
}

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => void;
  availableThemes: ThemeName[];
}

function buildTheme(name: ThemeName): Theme {
  const def = themeRegistry[name];
  return { ...def, spacing, radii, type };
}

const initialThemeName: ThemeName =
  env.DEFAULT_THEME in themeRegistry ? (env.DEFAULT_THEME as ThemeName) : 'light';

const ThemeContext = createContext<ThemeContextValue>({
  theme: buildTheme(initialThemeName),
  themeName: initialThemeName,
  setThemeName: () => {},
  availableThemes: Object.keys(themeRegistry) as ThemeName[],
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeNameState] = useState<ThemeName>(initialThemeName);

  // Best-effort restore of a persisted user override. Non-blocking — the
  // app renders with the env-derived default immediately, then swaps if a
  // stored preference shows up. Failure (no storage, corrupt value) just
  // keeps the default; a theme preference is never worth crashing over.
  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (mounted && stored && stored in themeRegistry) {
          setThemeNameState(stored as ThemeName);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeName = useCallback((name: ThemeName) => {
    setThemeNameState(name);
    AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {});
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: buildTheme(themeName),
      themeName,
      setThemeName,
      availableThemes: Object.keys(themeRegistry) as ThemeName[],
    }),
    [themeName, setThemeName]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
