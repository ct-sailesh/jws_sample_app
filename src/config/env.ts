/**
 * App-wide runtime configuration.
 *
 * The Expo original sourced this from `EXPO_PUBLIC_*` env vars (validated
 * with zod) because Metro/Expo can statically inline `process.env.EXPO_PUBLIC_X`
 * literals into the client bundle, and because it had a real per-environment
 * backend URL to switch between (dev/preview/production).
 *
 * This bare-RN port has no build-flavor pipeline (no EAS-style profiles) and
 * — per the project's own documented "no backend configured" fallback rule —
 * the AI-inspection backend is intentionally not wired up at all yet (see
 * `state/InspectionResultContext.tsx` / `state/usePhotoPrecheck.ts`, which
 * both already have a real, exercised code path for this). So there's no
 * environment-specific *value* left to inject at build time — just a
 * dev-vs-release switch, which RN already gives you for free via the global
 * `__DEV__` flag. Kept as a small typed object (rather than scattering
 * `__DEV__` checks around) so the rest of the app doesn't need to care how
 * "are we in development" is actually determined.
 *
 * If/when a real backend is added, this is the file to reintroduce
 * environment-specific config in (e.g. via `react-native-config`, reading
 * per-scheme `.env` files) — `API_BASE_URL`/`INSPECT_APP_KEY` are kept here,
 * always `undefined`, as that exact seam.
 */

export type AppEnv = 'development' | 'production';
export type ThemeName = 'light' | 'dark';

export interface Env {
  APP_ENV: AppEnv;
  /** Always unset in this build — see file comment. Never interpolate this into a URL without checking it first. */
  API_BASE_URL: string | undefined;
  DEFAULT_THEME: ThemeName;
  /** Shared secret header for the (not-yet-connected) inspect server. Unused while API_BASE_URL is unset. */
  INSPECT_APP_KEY: string | undefined;
}

export const env: Env = {
  APP_ENV: __DEV__ ? 'development' : 'production',
  API_BASE_URL: undefined,
  DEFAULT_THEME: 'light',
  INSPECT_APP_KEY: undefined,
};
