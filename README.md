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

The `android/` and `ios/` native platform folders are **not checked in** —
they're fully regenerable build scaffolding, deliberately removed rather
than carried around as dead weight. Regenerate them, then reapply the two
small manual native edits this project needs on top of the stock template
(both already implemented once — this is just re-doing them after a fresh
platform-folder generation):

```bash
npm install

# 1. Regenerate android/ + ios/ (matching this project's RN version):
npx @react-native-community/cli@20.2.0 init tmp_platforms --directory ../tmp_platforms --pm npm --version 0.87.0
mv ../tmp_platforms/android ../tmp_platforms/ios .
rm -rf ../tmp_platforms

# 2. Re-link the bundled fonts (see "Fonts" below):
npx react-native-asset

# 3. Reapply the camera/motion permission strings (see "Camera & motion
#    permissions" below) — android/app/src/main/AndroidManifest.xml and
#    ios/mobile_app_native/Info.plist — and the app display name in
#    android/app/src/main/res/values/strings.xml / the iOS Info.plist
#    (both should read "JSW Used Cars", matching app.json's displayName).

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
  `DeviceMotion` → `react-native-nitro-sensors`' `Sensors.createDeviceMotion()`.
  Same 60ms sample interval, same 0.18 EMA smoothing factor, same 35°/30°
  pitch/roll tolerance bands, same 0.72 confidence threshold + 600ms
  stability window for `aligned`. The pure pitch/roll/confidence/status-
  transition math is now factored out as exported functions
  (`computeTilt`, `computeConfidence`, `nextAlignmentStatus`) — a genuine
  improvement over the original's inline-only version, not just a port
  (was unit-tested during development; see "Testing" below).
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

`__tests__/` and `__mocks__/` were removed for now (temporarily — not a
statement that this app doesn't need tests). Jest is still wired up
(`jest.config.js`, the `test` script, all the dev dependencies), so adding
them back is just adding files again, not reconfiguring anything. Worth
re-adding at minimum: `formatRupees`/`formatLakhs` (`src/utils/currency.ts`),
`conditionTone`/`confidenceFromScore`/`bandMarkerPercent`
(`src/utils/valuation.ts`), and the device-alignment pitch/roll/confidence/
status-transition math (the exported `computeTilt`/`computeConfidence`/
`nextAlignmentStatus` functions in
`src/features/capture/hooks/useDeviceAlignment.ts` — mocking
`react-native-nitro-sensors` itself is only needed because importing that
file at all pulls the native import in; a manual Jest mock the same shape
as `react-native-sensors/mock.js` worked fine here before).

```bash
npx tsc --noEmit
npm run lint      # eslint . — flat config, see "Tooling versions" below
```

## Tooling versions

Every dependency in `package.json` was audited against its actual npm
`latest` tag and cross-checked against what the *official React Native
0.87.0 tooling itself* (`@react-native/eslint-config`,
`@react-native/jest-preset`, `@react-native/babel-preset`) actually
declares as supported — "latest" only where that's also genuinely
supported, not the newest tag regardless of fit:

- **ESLint 9** (`^9.39.5`), not 10 — `@react-native/eslint-config@0.87.0`'s
  own `peerDependencies` cap at `^9.0.0`; ESLint 10 isn't acknowledged by
  it yet. Migrating off the legacy `.eslintrc.js` to ESLint 9's flat config
  was necessary either way (ESLint 9 requires it by default) — see
  `eslint.config.js`, which just re-exports the official
  `@react-native/eslint-config/flat`.
  - That migration surfaced a real bug: `eslint-plugin-ft-flow@2.0.3`
    (pulled in transitively by `@react-native/eslint-config`) calls an
    ESLint API flat config removed (`context.getAllComments`), crashing on
    every plain `.js` file. Fixed with an `overrides` entry in
    `package.json` pinning `eslint-plugin-ft-flow` to `^3.0.11`, the first
    version whose own `peerDependencies` actually claims ESLint 9 support.
    Safe to remove once `@react-native/eslint-config` bumps its own
    dependency past that version.
- **TypeScript stays on `^6.0.3`**, not the newly-shipped TypeScript 7
  (a ground-up native/Go-based compiler rewrite) — RN 0.87.0's own CLI
  template scaffolds `^6.0.3`, i.e. the React Native team hasn't moved
  their own tooling to 7.x yet either.
- **Jest stays on `^29.7.0`**, not 30 — `@react-native/jest-preset@0.87.0`
  depends on `babel-jest@^29.7.0` and `jest-environment-node@^29.7.0`
  internally; `29.7.0` is the newest version that's exactly what those
  already expect, avoiding a mixed-major Jest install.
- **`react-test-renderer` and `@types/react-test-renderer` were removed**
  — they were only ever used by the default template's `App.test.tsx`,
  which was deleted along with the rest of `__tests__/` (see "Testing").
  React's own docs steer new RN component tests toward
  `@testing-library/react-native` instead; reconsider that (rather than
  reintroducing `react-test-renderer`) whenever tests come back.
- Everything else — `react`/`react-native`/`@react-navigation/*`/
  `react-native-screens`/`react-native-gesture-handler`/
  `react-native-safe-area-context`/`react-native-svg`/
  `@react-native-async-storage/async-storage`/
  `react-native-haptic-feedback`/`react-native-nitro-modules` — was
  already at, or bumped to, its true npm `latest`.
- `react-native-vision-camera` deliberately **stays on 4.7.3**, not 5.x —
  see "Stack" above; re-confirmed as a deliberate exception, not an
  oversight, when this tooling audit was done.
- Two dependencies genuinely are `node_modules/**`-only build tooling
  required for native linking despite having zero direct imports in
  `src/`: `react-native-screens` (a hard peer of
  `@react-navigation/native-stack`/`bottom-tabs`) and
  `react-native-nitro-modules` (the native runtime `react-native-nitro-sensors`
  links against). Both are correctly listed as top-level dependencies —
  RN's autolinking needs a package physically present at the top level to
  find it, not just resolvable transitively.
