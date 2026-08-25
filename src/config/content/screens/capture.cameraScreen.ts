import type { ButtonConfig } from '../types';
import { CAMERA_PERMISSION_RATIONALE } from '../../permissionCopy';

export const cameraScreenContent = {
  /** Tuning constants, centralized as plain literals — not zod'd, not reactive. */
  autoCaptureMs: 1100,
  instructionVisibleMs: 3200,
  jpegQuality: 0.7,
  permissionDeniedTitle: 'Camera access needed',
  /**
   * FIX: previously a separately hand-typed string that hardcoded "15-photo"
   * — coupled by a literal to `CAPTURE_ANGLES.length` and prone to drifting
   * from it. Now reuses the same rationale string shown in the OS
   * permission dialog (`app.config.ts` / `permissionCopy.ts`), with no
   * count baked in at all.
   */
  permissionDeniedBody: CAMERA_PERMISSION_RATIONALE,
  /** `onPress` is wired directly to `requestPermission()` (a native API call, not navigation/url/etc.), not a ConfigAction. */
  allowAccessCta: { label: 'Allow camera access' } as ButtonConfig,
  /** Used only when the native camera throws (e.g. a simulator with no camera) — lets the prototype flow continue. */
  fallbackCaptureUri: 'mock://capture-fallback',
};
