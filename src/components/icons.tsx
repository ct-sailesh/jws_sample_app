import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme, cameraColors } from '../config/theme';

/**
 * Small, single-weight line icons in the spirit of the prototype's flat
 * geometric visual language. Kept dependency-free (react-native-svg only —
 * already required for the pose-overlay skeletons) rather than pulling in a
 * large icon font/kit.
 *
 * Different pattern from the styles/dynamicStyles split used elsewhere:
 * these have no StyleSheet at all, just an SVG `stroke`/`fill` prop. Each
 * icon calls `useTheme()` unconditionally and falls back to a theme colour
 * only when `color` isn't explicitly passed — a default *parameter*
 * expression can't call a hook, so the fallback happens in the body instead.
 */

export function ChevronRightIcon({ color, size = 16 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.ink400;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 5l7 7-7 7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronLeftIcon({ color, size = 20 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.ink900;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M15 5l-7 7 7 7" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function HomeIcon({
  color,
  size = 22,
  active = false,
}: {
  color?: string;
  size?: number;
  active?: boolean;
}) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.ink500;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 11.5L12 4l8 7.5" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M6 10v8.5A1.5 1.5 0 0 0 7.5 20h9a1.5 1.5 0 0 0 1.5-1.5V10"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={active ? c : 'none'}
        fillOpacity={active ? 0.12 : 0}
      />
    </Svg>
  );
}

export function GarageIcon({ color, size = 22 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.ink500;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={9.5} width={16} height={9} rx={1.5} stroke={c} strokeWidth={2} />
      <Path d="M4 9.5L12 4l8 5.5" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 18.5v-4h6v4" stroke={c} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

export function AccountIcon({ color, size = 22 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.ink500;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.5} r={3.5} stroke={c} strokeWidth={2} />
      <Path d="M4.5 20c1-3.5 4-5.5 7.5-5.5s6.5 2 7.5 5.5" stroke={c} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

export function RupeeIcon({ color, size = 18 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 5h12M6 9h12M8 5c5.5 0 5.5 8 0 8H8l7 6"
        stroke={c}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SparkleIcon({ color, size = 18 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" fill={c} />
    </Svg>
  );
}

export function CheckIcon({ color, size = 18 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M5 13l4.5 4.5L19 7" stroke={c} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ExchangeIcon({ color, size = 18 }: { color?: string; size?: number }) {
  const { theme } = useTheme();
  const c = color ?? theme.colors.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h13l-3-3M20 16H7l3 3" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * FlashIcon / CameraFlipIcon / BackArrowIcon are used only inside the
 * guided-capture module, which sits on the fixed `cameraColors` palette
 * (never the switchable app theme — see `config/theme/themes/camera.ts`).
 * Their default falls back to that fixed palette, not `useTheme()`, so a
 * caller that omits `color` (e.g. `<BackArrowIcon />` in `CaptureHeader`)
 * stays legible against the camera background regardless of app theme.
 */
export function FlashIcon({ color, size = 20, on = false }: { color?: string; size?: number; on?: boolean }) {
  const c = color ?? cameraColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M13 3L6 14h5l-1 7 8-11h-5l1-7z" fill={on ? c : 'none'} stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
    </Svg>
  );
}

export function CameraFlipIcon({ color, size = 20 }: { color?: string; size?: number }) {
  const c = color ?? cameraColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 8h3l1.5-2h7L17 8h3v11H4z" stroke={c} strokeWidth={1.8} strokeLinejoin="round" />
      <Circle cx={12} cy={13.5} r={3.2} stroke={c} strokeWidth={1.8} />
    </Svg>
  );
}

export function BackArrowIcon({ color, size = 22 }: { color?: string; size?: number }) {
  const c = color ?? cameraColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H6M11 6l-6 6 6 6" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
