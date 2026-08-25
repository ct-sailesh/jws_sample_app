import { lightTheme } from './light';
import { darkTheme } from './dark';

export const themeRegistry = {
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeName = keyof typeof themeRegistry;

export { lightTheme, darkTheme };
export { cameraColors, type CameraColors } from './camera';
