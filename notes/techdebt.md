# Tech Debt

Known shortcuts, stubs, and limitations, plus what closing each one would
actually take. Update this the moment a shortcut is introduced, not
retroactively — see `../AGENTS.md`.

## No automated tests right now

`__tests__/` and `__mocks__/` were deleted at the user's request
("for now" — not a statement that this app doesn't need tests). Jest is
still fully configured (`jest.config.js`, the `test` script, all dev
deps) — re-adding coverage is just adding files back, not reconfiguring
anything. Priority list is in `todolist.md`.

## Backend is a stub

`config/env.ts` always leaves `API_BASE_URL` unset. `InspectionResultContext`
and `usePhotoPrecheck` always take their documented "no backend configured"
fallback path, and `state/inspectApi.ts`'s `resizePhoto()` throws if ever
called (it shouldn't be reachable). Closing this: implement a bare-RN
image-resize step, reintroduce per-environment config, and point
`API_BASE_URL` at a deployed version of the reference server in
`../../mobile-app/server`. Full detail in `../README.md` "Backend".

## No native platform folders checked in

`android/`/`ios/` were deleted at the user's request (regenerable
scaffolding). Regenerating them means re-running the RN CLI init, then
manually reapplying: the `CAMERA` permission + `android.hardware.camera`
feature in the Android manifest, `NSCameraUsageDescription` +
`NSMotionUsageDescription` in the iOS Info.plist, the app display name,
and `npx react-native-asset` to re-link the bundled fonts. Steps are
spelled out in `../README.md` "Getting started" — this file exists to flag
that skipping any one of those steps will silently regress a real feature
(camera permission rationale, motion permission, or missing fonts), not
just cause a build error.

## Android build unverified on Windows (long-path limit)

The one time a full `assembleDebug` was attempted on this Windows dev
machine, every native dependency compiled and the build only failed on
`react-native-gesture-handler`'s codegen hitting Windows' 260-character
path limit (actual path: 366 characters). The fix is enabling Windows
long-path support — a system setting, deliberately left unchanged (out of
scope for an agent to modify unattended; see `../README.md`'s "Known issue"
section for the exact command). This means the Android build has **not**
been verified end-to-end on this machine since platform folders were
deleted — treat a first real build after regenerating `android/` as
unverified until it's actually run.

## `react-native-nitro-sensors` is a young, single-maintainer dependency

Chosen over `react-native-sensors` because the latter's native Android
build config is genuinely broken under modern Gradle (see `diary.md`), not
because it's a risk-free choice in absolute terms: `react-native-nitro-sensors`
is at 0.1.x, maintained by one person, published a few months ago as of
this writing. Its core dependency (`react-native-nitro-modules`, Margelo's
Nitro Modules) is healthy and widely adopted, which lowers the risk, but
this specific sensors package itself hasn't had time to prove long-term
maintenance. Revisit if it goes quiet for an extended period — see
`todolist.md`.

## `eslint-plugin-ft-flow` version override

`package.json` has an `overrides` entry pinning `eslint-plugin-ft-flow` to
`^3.0.11`. Without it, the transitive version `@react-native/eslint-config@0.87.0`
actually depends on (`2.0.3`) crashes on every plain `.js` file under
ESLint 9's flat config (`context.getAllComments is not a function` — an
ESLint API that version of the plugin still calls, which flat config no
longer provides). `3.0.11` is the first release of that plugin whose own
`peerDependencies` claims ESLint 9 support. This override is a stopgap for
`@react-native/eslint-config` not yet having bumped its own dependency —
safe to remove once a future `@react-native/eslint-config` release does
that itself (check by removing the override and re-running `npm run lint`
after any React Native version bump).

## `npm audit` high-severity advisories

All current advisories trace to Metro's own dev-time dependency on
`image-size` (used for parsing images during bundling; a DoS-via-infinite-
loop issue on malformed ICNS/JXL/HEIF input). This is a build-tool-only
dependency, not shipped in the app, and not fixable without downgrading
React Native itself (`npm audit fix --force` would do that). Left as-is;
re-check after the next RN upgrade.
