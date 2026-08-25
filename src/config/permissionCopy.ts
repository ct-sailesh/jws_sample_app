/**
 * Camera-permission rationale copy, used by the in-app permission-denied
 * screen (`config/content/screens/capture.cameraScreen.ts`). This is also
 * the exact string baked into the native permission prompts: iOS reads it
 * from `NSCameraUsageDescription` in `ios/mobile_app_native/Info.plist`,
 * Android's system dialog doesn't take custom copy but the *rationale we
 * show before asking* should still match. Those native `.plist`/manifest
 * strings are plain XML/plist, not TS, so they can't import this constant —
 * keep them in sync by hand if this string ever changes.
 */
export const CAMERA_PERMISSION_RATIONALE =
  'JSW Used Cars uses your camera to guide you through the AI self-inspection photo walk-around.';
