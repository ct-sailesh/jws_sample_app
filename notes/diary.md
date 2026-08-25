# Diary

Dated, append-only log of notable changes and the reasoning behind them.
See `../AGENTS.md` for how/when to add entries. This is the "why," not the
"what" — git history already has the diff.

## 2026-08-25

- Created this project as a **bare React Native CLI port** of
  `../../mobile-app` (an Expo/React Native prototype), at the user's explicit
  request to drop Expo entirely. An earlier same-session attempt ported
  the app to Flutter instead; that was abandoned mid-way at the user's
  request and fully deleted before this port started — there is no
  Flutter anywhere in this project's history worth resurrecting.
- Copied `src/` from the Expo app essentially unchanged (it was already
  Expo-agnostic React/RN code) and swapped only the handful of files that
  touched Expo APIs. Full rationale for each swap is in `../README.md`.
- Chose `react-native-vision-camera` **4.7.3**, not the 5.x line, because
  5.x hard-requires `react-native-nitro-image` for plain photo capture —
  more new native surface than this feature needs.
- Chose `react-native-sensors` first for the device-motion feed, then
  **dropped it** after the Android build failed: its `android/build.gradle`
  calls `jcenter()` (removed in Gradle 9) and hardcodes
  `abiFilters "armeabi-v7a", "x86"` (no `arm64-v8a` — most real Android
  phones). Replaced with `react-native-nitro-sensors` (Margelo Nitro
  Modules), which ships a modern Gradle config and the exact
  `accelerationIncludingGravity` field the ported pitch/roll math needs.
- Verified `npx tsc --noEmit`, `npx eslint`, and (at the time) a full Jest
  suite covering currency/valuation formulas and the device-alignment
  pitch/roll/confidence/status-transition math — all clean.
- Ran a real Android debug build (`./gradlew assembleDebug`). Every native
  dependency compiled (vision-camera, nitro-sensors/modules, svg, screens,
  safe-area-context); the build only failed on
  `react-native-gesture-handler`'s Fabric codegen hitting Windows' 260-
  character path limit (generated path was 366 chars). This needs Windows
  long-path support enabled (a system setting) — out of scope for an agent
  to change. Documented in `../README.md` and left unresolved at the user's
  direction (see `techdebt.md`).
- At the user's request: deleted `android/`/`ios/` (regenerable build
  scaffolding — steps to recreate are in `../README.md`) and deleted
  `__tests__/`/`__mocks__/` (temporarily — Jest tooling itself is still
  configured, just no test files right now).
- Added `../AGENTS.md` + this living-docs set (`diary.md`, `todolist.md`,
  `techdebt.md`, `prompts/`) as the working style guide for future agents
  in this repo, modeled after an AgentsMaker-project reference the user
  provided, adapted to this project's actual stack. Later grouped
  everything except `AGENTS.md` itself under `notes/`.
- Full dependency audit: cross-checked every package in `package.json`
  against its real npm `latest` tag, but treated "latest" as "latest
  *actually supported by the official React Native 0.87.0 tooling*," not
  the newest tag regardless of fit (see `../README.md`'s "Tooling
  versions" section for the full reasoning per package). Net effect:
  - Bumped `react`/`react-test-renderer` companion versions, `@types/react`,
    `@types/jest`, `react-native-safe-area-context`, `@babel/*` to their
    true latest within RN 0.87.0's declared peer ranges.
  - Migrated ESLint 8 → **9** (the newest version
    `@react-native/eslint-config@0.87.0` actually claims support for; 10
    isn't acknowledged by it yet) — required moving off the legacy
    `.eslintrc.js` to flat config (`eslint.config.js`, just re-exporting
    the official `@react-native/eslint-config/flat`). That surfaced a real
    bug: `eslint-plugin-ft-flow@2.0.3` calls an ESLint API flat config
    removed, crashing on every plain `.js` file — fixed with an
    `overrides` entry pinning it to `^3.0.11`.
  - Kept `typescript` on `^6.0.3` (not the newly-released TypeScript 7,
    a from-scratch native/Go compiler) and `jest` on `^29.7.0` (not 30) —
    in both cases because RN 0.87.0's own official tooling
    (`@react-native/typescript-config`'s template default,
    `@react-native/jest-preset`'s own internal `babel-jest`/
    `jest-environment-node` deps) hasn't moved there either.
  - Confirmed `react-native-vision-camera` staying on 4.7.3 (not 5.x) was
    still the right call when explicitly asked to reconsider it under a
    "latest everywhere" mandate — the user chose to keep 4.7.3.
  - Removed `react-test-renderer` + `@types/react-test-renderer`
    (genuinely unused now that `__tests__/App.test.tsx` — their only
    consumer — was already deleted).
  - Confirmed `react-native-screens` and `react-native-nitro-modules`
    are NOT unused despite zero direct imports in `src/` — both are
    required native-linking peers (of `@react-navigation/*` and
    `react-native-nitro-sensors` respectively) and must stay as explicit
    top-level dependencies for RN's autolinking to find them.
  - `npx tsc --noEmit` and `npm run lint` both clean after every change,
    with no new `npm audit` findings introduced.
