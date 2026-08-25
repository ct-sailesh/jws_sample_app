# JSW Used Cars — Mobile App (bare React Native)

A **bare React Native CLI** (no Expo) port of `../mobile-app`, the same
JSW Used Cars consumer prototype: the guided valuation journey UI plus a
working guided-capture camera module (15-photo inspection walk-around with
a live device-motion pose-alignment overlay).

Almost all of `src/` is unchanged from the Expo original — it's plain
React/React Native, no Expo-specific code — so this port is really "swap
the handful of Expo modules for their bare-RN equivalents," not a rewrite.
See "What actually changed" below for the exact list.

## Stack

- React Native **0.87.0**, React **19.2.3**, TypeScript (strict) — bare
  `@react-native-community/cli` project, no Expo SDK, no Expo Go, no EAS.
- React Navigation **7** (native stack + bottom tabs) — unchanged from the
  Expo original; nothing about React Navigation is Expo-specific, and the
  original README's own reasoning for staying on stable v7 rather than the
  (still-alpha, at time of writing) v8 still applies.
- `react-native-vision-camera` **4.7.3** for the live guided-capture preview
  (replaces `expo-camera`). Deliberately the 4.x line, not the newer 5.x:
  v5 rebuilt the library on Margelo's Nitro Modules and now hard-requires
  `react-native-nitro-modules` **and** `react-native-nitro-image` as peer
  dependencies — a very new, still-settling native stack for something as
  basic as "take a photo." v4 needs nothing extra for plain photo capture
  (no frame processors are used here), is what the vast majority of
  production apps on this library are still running, and is the safer
  long-term-support choice.
- `react-native-nitro-sensors` (built on Margelo's actively-maintained Nitro
  Modules — the same native-module framework `react-native-vision-camera`
  v5 now uses, just without that library's extra `react-native-nitro-image`
  requirement) for the `DeviceMotion` feed behind the pose-overlay alignment
  signal, replacing `expo-sensors`' `DeviceMotion`. Its
  `accelerationIncludingGravity` field is the same name and physical
  quantity Expo's `DeviceMotion.accelerationIncludingGravity` exposed, so
  the pitch/roll trigonometry in `useDeviceAlignment.ts` is untouched.
  `react-native-sensors` (the more established-looking npm package) was
  tried first and dropped: its Android `build.gradle` calls the long-dead
  `jcenter()` repository (removed outright in Gradle 9) and hardcodes
  `abiFilters "armeabi-v7a", "x86"` — omitting `arm64-v8a`, i.e. most real
  Android phones today. A stale, years-unmaintained native build config
  isn't a good long-term-support bet regardless of the npm download count.
- `react-native-haptic-feedback` for the capture-shutter tap (replaces
  `expo-haptics`).
- `@react-native-async-storage/async-storage` (same package the Expo app
  already used — it isn't Expo-specific) for theme + capture-draft
  persistence.
- `react-native-svg`, `react-native-screens`, `react-native-safe-area-context`,
  `react-native-gesture-handler` — unchanged; none of these were ever
  Expo-only, they just needed bare-RN autolinking instead of an Expo
  prebuild step.
- Inter + IBM Plex Mono, bundled as native font assets under `assets/fonts/`
  (see "Fonts" below) instead of `@expo-google-fonts/*`.

No other third-party UI kit was added — same as the original, buttons,
cards, chips, list rows, inputs and icons are hand-built against the shared
design tokens.

## Getting started

```bash
npm install
npx react-native run-android   # or run-ios, from a Mac with Xcode
```

A physical device is required to exercise the camera/motion-sensor guided
capture (same limitation the Expo original had — simulators/emulators have
no camera and the capture screen's `catch` fallback (`mock://` shot ids)
exists specifically for that case, so the rest of the app is still fully
navigable without one).

## What actually changed vs. the Expo original

Everything under `src/` that isn't listed below is an unmodified copy.

- **`src/features/capture/hooks/useDeviceAlignment.ts`** — `expo-sensors`
  `DeviceMotion` → `react-native-sensors`' `accelerometer` observable. Same
  60ms sample interval, same 0.18 EMA smoothing factor, same 35°/30° pitch/
  roll tolerance bands, same 0.72 confidence threshold + 600ms stability
  window for `aligned`. The pure pitch/roll/confidence/status-transition
  math is now factored out as exported, independently unit-tested functions
  (`computeTilt`, `computeConfidence`, `nextAlignmentStatus`) — a genuine
  improvement over the original's inline-only version, not just a port.
- **`src/features/capture/CameraCaptureScreen.tsx`** — `expo-camera`'s
  `CameraView`/`useCameraPermissions` → `react-native-vision-camera`'s
  `Camera`/`useCameraPermission`/`useCameraDevice`; `expo-haptics` →
  `react-native-haptic-feedback`. Same auto-capture-on-aligned logic, same
  manual-shutter-always-works rule, same simulator/no-camera fallback.
  VisionCamera returns a bare filesystem `path`, not a `file://` URI, so
  that normalization now happens once, right where the photo is captured.
- **`src/state/inspectApi.ts`** — dropped `expo-image-manipulator`. The
  resize-before-upload step was already unreachable in this build (both
  callers short-circuit on `!env.API_BASE_URL` before ever reaching it —
  see "Backend" below) so it's now a documented stub that throws if it's
  ever actually hit, preserving the seam's shape for whenever a real
  backend + a bare-RN image-resize package (e.g.
  `react-native-image-resizer`) get wired in.
- **`src/config/env.ts`** — dropped the `zod`-validated `EXPO_PUBLIC_*`
  reading (Metro-specific static inlining; not a thing here) in favor of a
  small typed constant object driven by RN's built-in `__DEV__`. See
  "Backend" below for why there's no environment-specific *value* left to
  inject at build time in the first place.
- **`src/config/theme/shared.ts`** — font family strings changed from the
  Expo Google Fonts per-weight names (`Inter_600SemiBold`, …) to this
  project's own bundled-font PostScript names (`Inter-SemiBold`, …); see
  "Fonts" below.
- **`App.tsx` / `index.js`** — no `useFonts()`/`expo-splash-screen`: bare RN
  fonts are native resources already available at first render, so there's
  no async "fonts loaded" gate before showing UI (the animated `JSW`
  wordmark splash still plays, it just isn't blocking on anything). Entry
  point registers via `AppRegistry` instead of Expo's `registerRootComponent`.

## Backend: still a stub, on purpose

Same as the original documented it: the AI-inspection backend
(`server/`, a separate Gemini-backed serverless function) is **not**
connected in this build. `InspectionResultContext` and `usePhotoPrecheck`
both already have a real, exercised "no backend configured → fall back to
mock data, never crash" code path (this is not new behavior invented for
this port — it's the same fallback the original app takes whenever
`API_BASE_URL` is unset), and `config/env.ts` here always leaves
`API_BASE_URL` unset. Wiring up a real backend later is: reintroduce a
per-environment config source (e.g. `react-native-config`), implement
`resizePhoto()` in `state/inspectApi.ts` with a bare-RN image-resize
package, and point `API_BASE_URL` at the deployed `server/`.

## Fonts

Inter (400/500/600/700/800) and IBM Plex Mono (400/500/600), OFL-licensed,
bundled as native font assets under `assets/fonts/` rather than fetched at
runtime (`@expo-google-fonts/*` bundles too, this is the same idea via bare
RN's own font-linking instead). Inter ships only as a variable font
upstream now, so its five static weights here were produced with
`fonttools varLib.instancer --update-name-table` (see `assets/fonts/OFL-*.txt`
for licenses) — each with a distinct PostScript name (`Inter-Regular`,
`Inter-Medium`, …) so both platforms resolve them correctly: Android's font
linking keys off the filename, iOS's keys off the internal PostScript name.
Linked into both native projects via `react-native.config.js` (see its
`assets` field) using `npx react-native-asset`; re-run that command if a
font file is ever added or replaced.

## Camera & motion permissions

- **Android**: `CAMERA` permission + `android.hardware.camera` feature in
  `android/app/src/main/AndroidManifest.xml`. No runtime permission is
  needed for the accelerometer (it's a "normal", not "dangerous", sensor).
- **iOS**: `NSCameraUsageDescription` and `NSMotionUsageDescription` in
  `ios/mobile_app_native/Info.plist`. The camera string is the same wording
  as `src/config/permissionCopy.ts`'s in-app rationale (kept in sync by
  hand — plist strings can't import a TS constant).

## App structure

Unchanged from the original (see the Expo README for the fuller narrative
of the design-token/content/action-registry system) — this port only
touched the files listed above:

```
src/
  config/        theming (light/dark/camera palettes), content
                 (per-screen copy, one file per screen), the closed
                 ConfigAction union + resolver, env
  components/    shared UI: Button, Card, Chip, Input, ListRow, Screen,
                 ScreenHeader, ProgressSteps, Illustrations, icons...
  navigation/    RootNavigator (stack) + MainTabs (Home / My Garage / Account)
  features/
    home/        tab screens (Welcome hero, Garage, Account)
    valuation/   the linear 5-step journey: vehicle details → instant
                 estimate → inspection intro → (capture) → AI analysis →
                 health report → explain-my-price → final valuation →
                 dealer selection
    capture/     the guided-capture camera module
  state/         VehicleSessionContext, InspectionResultContext,
                 capture drafts (AsyncStorage), photo pre-check
  mocks/         mock vehicle/findings/dealer data — no real data anywhere
  utils/         currency (₹/lakh formatting), valuation derivation helpers
```

## Known issue: Android debug build on Windows (long paths)

`./gradlew assembleDebug` currently fails on this project when built from a
Windows dev machine — but only at the very last step. Every native
dependency (`react-native-vision-camera`, `react-native-nitro-sensors` +
`react-native-nitro-modules`, `react-native-svg`, `react-native-screens`,
`react-native-safe-area-context`) compiles cleanly; the one failure is
`react-native-gesture-handler`'s Fabric codegen, which produces a generated
object-file path combining this project's absolute path with
`node_modules/react-native-gesture-handler`'s own deeply-nested source
layout — 366 characters, well past Windows' classic 260-character `MAX_PATH`
limit (`ninja: error: ... Filename longer than 260 characters`).

This is an environment limitation, not a code or dependency problem, and
the standard fix is enabling Windows' long-path support (off by default):

```powershell
# Run as Administrator, then restart Windows.
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
  -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

(equivalently: Group Policy Editor → Computer Configuration → Administrative
Templates → System → Filesystem → "Enable Win32 long paths"). After that,
re-run `./gradlew assembleDebug` from `android/`. Building from macOS/Linux,
or in CI, isn't affected by this at all.

## Testing

```bash
npm test        # jest — currency/valuation formulas + the device-alignment
                 # pitch/roll/confidence/status-transition math
npx tsc --noEmit
npx eslint src App.tsx index.js --ext .ts,.tsx,.js
```

`react-native-sensors` ships its own Jest mock (`jest.config.js` maps to it
via `moduleNameMapper` — real accelerometer access needs a native binding
Jest's Node environment doesn't have).
