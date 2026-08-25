# Mobile App (bare React Native) — Agent Instructions

Use this file as the working style guide for coding agents in this repo
(`mobile-app-native/`). It is a living document — update it whenever a task
changes something a future agent would otherwise have to rediscover (a new
convention, a dropped/adopted dependency, a changed rule). Don't wait to be
asked to update it.

## Project Stack

- **Bare React Native CLI** — React Native 0.87.x, React 19, TypeScript
  (strict). No Expo SDK, no Expo Go, no EAS, anywhere in this project.
- No Node build step beyond RN's own Metro bundler/Babel — no extra
  frontend bundler, no monorepo tooling, no codegen pipeline added on top.
- Navigation: **React Navigation 7** (native-stack + bottom-tabs).
- State: **React Context only** (`ThemeProvider`, `VehicleSessionContext`,
  `InspectionResultContext`) — no Redux/MobX/Zustand/Riverpod etc.
- Camera: **`react-native-vision-camera` 4.x** — deliberately not the 5.x
  line (which hard-requires `react-native-nitro-image` for something this
  simple).
- Motion sensor: **`react-native-nitro-sensors`** (built on Margelo's Nitro
  Modules) — swapped in after `react-native-sensors` turned out to have a
  dead native Gradle config (`jcenter()`, missing `arm64-v8a`). See
  `README.md`'s "Stack" section for the full reasoning; don't revert to
  `react-native-sensors`.
- Haptics: `react-native-haptic-feedback`. Storage:
  `@react-native-async-storage/async-storage`. Icons/illustrations/pose
  overlays: hand-drawn `react-native-svg`, never an icon font or UI kit.
- Fonts: Inter + IBM Plex Mono bundled as **native font assets** under
  `assets/fonts/` (see README "Fonts") — no runtime font-fetching package.
- **No backend is connected.** `config/env.ts` always leaves `API_BASE_URL`
  unset by design; the app runs entirely on mock data (see "Backend
  Integration Rules" below before changing this).
- No database, no Docker, no server component in this project — a
  reference Gemini-backed inspection server exists at
  `../mobile-app/server` (the sibling Expo project) but is not part of
  this app yet.

## Architecture

- `App.tsx` / `index.js` — app root (providers, splash) and native entry
  point (`AppRegistry`).
- `src/navigation/` — `RootNavigator` (stack) wraps `MainTabs` (bottom
  tabs: Home / Garage / Account); the linear valuation journey is pushed
  on top of the tab shell, not nested inside it.
- `src/config/theme/` — spacing/radii/typography tokens (`shared.ts`,
  theme-agnostic) + light/dark palettes (`themes/light.ts`,
  `themes/dark.ts`) + the fixed camera-screen palette (`themes/camera.ts`,
  deliberately outside the switchable theme system) + `ThemeProvider`.
- `src/config/content/` — one file per screen under `screens/*.ts` holding
  that screen's copy/lists/button actions. Screens read from here; copy
  never lives hardcoded in JSX.
- `src/config/actions/` — the closed `ConfigAction` union
  (`navigate`/`goBack`/`openUrl`/`call`/`noop`/`custom`) + `useConfigAction()`
  resolver. This is the only sanctioned way content-driven rows/buttons
  trigger behavior.
- `src/components/` — shared UI primitives (`Button`, `Card`, `Chip`,
  `Input`, `ListRow`, `Screen`, `ScreenHeader`, `ProgressSteps`,
  `Illustrations`, `icons.tsx`), all theme-aware via `useTheme()`.
- `src/features/home/`, `src/features/valuation/` — the tab screens and
  the 5-step valuation journey screens.
- `src/features/capture/` — the guided-capture camera module: capture
  screens, the pose-overlay/shutter/viewfinder widgets, and the
  device-alignment + capture-session hooks.
- `src/state/` — `ThemeProvider`, `VehicleSessionContext`,
  `InspectionResultContext`, capture-draft persistence
  (`captureDrafts.ts`, AsyncStorage-backed), photo pre-check.
- `src/mocks/data.ts` — mock vehicle/valuation/dealer/finding data, clearly
  marked illustrative. No real data anywhere in this repo.
- `src/utils/` — currency (₹/lakh) formatting and valuation-derivation
  helpers shared by multiple screens.
- `README.md` — the primary living spec: stack rationale, what changed vs.
  the Expo original, backend status, fonts, permissions, known issues.
  Treat it as the source of truth alongside this file.
- `notes/diary.md`, `notes/todolist.md`, `notes/techdebt.md`,
  `notes/prompts/` — see "Living Docs" below. Grouped together under
  `notes/` so they're easy to browse as one set; `AGENTS.md` itself stays
  at the project root, where agent tooling expects to find it.

## Coding Style

- Keep the implementation small and direct — this app deliberately has no
  extra abstraction layers beyond what's listed above.
- Match existing local patterns before introducing a new one: a component
  with `StyleSheet.create` for static layout + a `dynamicStyles(theme)`
  helper for colors is the established shape (see `src/components/Card.tsx`).
- Never hardcode a color, spacing, or radius value in a screen/component —
  pull from `theme.colors`/`theme.spacing`/`theme.radii`/`theme.type` via
  `useTheme()`. The one deliberate exception is the guided-capture screen,
  which always uses the fixed `cameraColors` palette regardless of the
  active app theme (contrast against a live camera feed is a correctness
  requirement, not a style choice).
- Screen content (copy, list rows, button labels/actions) belongs in
  `config/content/screens/*.ts`, not inline in JSX. If a row/button has no
  real destination yet, use `{ kind: 'noop', reason: '...' }`, not a silent
  empty handler.
- Do not add Expo packages, a new state-management library, a new
  navigation library, or a UI kit unless the user explicitly asks. If a
  capability seems to need Expo, find (or write) a bare-RN-compatible
  alternative instead — that's the whole premise of this project.
- Before adopting any new native-module dependency, verify its native
  build config is current: no `jcenter()`, real `arm64-v8a`/`x86_64` ABI
  support, and that it actually compiles under this project's Gradle/AGP/
  Kotlin versions. This project has already hit and worked around one
  stale-native-module case (see `README.md`) — don't repeat it with a new
  dependency picked on npm download count alone.
- When bumping any dependency, "latest" means latest *supported*, not
  necessarily the newest npm dist-tag: cross-check against what
  `@react-native/eslint-config`, `@react-native/jest-preset`, and
  `@react-native/babel-preset` (all pinned to this project's exact React
  Native version) actually declare as their own supported peer range
  before jumping a tool to its newest major. See `README.md`'s "Tooling
  versions" section for the reasoning already worked out for ESLint/Jest/
  TypeScript/Prettier, and the `eslint-plugin-ft-flow` `overrides` entry
  in `package.json` for a real incompatibility this surfaced (and why it's
  fixed with `overrides`, not by downgrading ESLint).

## Data & Persistence

- No database. The only local persistence is
  `@react-native-async-storage/async-storage` (theme preference, capture
  drafts keyed by normalized registration number).
- If you add a new persisted shape, handle missing/stale fields gracefully
  — there is no migration infrastructure, and a corrupt/old stored value
  should never crash the app (see `captureDrafts.ts`'s try/catch-everything
  pattern).

## Logging

- Dev-only diagnostics: `if (__DEV__) console.warn(...)` (see
  `useConfigAction.ts`, `inspectApi.ts`). Never log secrets — API keys,
  tokens, or (once a backend exists) resolved auth headers.
- Any future backend integration must keep the rule the Expo original
  documented: a real secret belongs behind a server the app calls, never
  bundled into client code or an env var that ships in the JS bundle.

## Camera & Sensor Module Rules

- `src/features/capture/hooks/useDeviceAlignment.ts`'s pure math
  (`computeTilt`, `computeConfidence`, `nextAlignmentStatus`) must stay
  exported and pure — don't fold it back into the effect body. It exists
  in that shape specifically so it can be unit-tested without a device.
- Preserve the "manual shutter always works; auto-capture-on-aligned is
  only ever an assist, never a gate" rule.
- Preserve the `mock://` fallback path for when the camera/sensor is
  unavailable (simulator, denied permission, no device). The capture flow
  must never dead-end regardless of hardware state.

## Backend Integration Rules (for whenever this gets wired up)

- `state/inspectApi.ts`'s `resizePhoto` is an intentional stub that throws
  if called — implement it with a bare-RN image-resize package
  (e.g. `react-native-image-resizer`) when a real `API_BASE_URL` is
  introduced, rather than reaching for `expo-image-manipulator`.
- Reintroduce environment config via a real per-environment source (e.g.
  `react-native-config`) rather than hand-rolling — keep `config/env.ts`'s
  typed-object shape as the app-facing contract.
- Never change the "no backend configured → fall back to mock data, never
  crash" fallback semantics in `InspectionResultContext`/`usePhotoPrecheck`.
  That fallback is a feature, not a placeholder to delete.
- A reference server implementation (Gemini-backed `/api/inspect` +
  `/api/precheck`) already exists at `../mobile-app/server` — port/adapt
  it rather than redesigning the contract from scratch.

## Native Platform Folders

- `android/` and `ios/` are **not checked in** — regenerable build
  scaffolding, removed deliberately. See `README.md` "Getting started" for
  exact regeneration steps. If you regenerate them, you must reapply: the
  camera/motion permission strings, the app display name, and re-run
  `npx react-native-asset` to re-link the bundled fonts — all documented in
  `README.md`.
- If you build/test on Windows and hit
  `ninja: error: ... Filename longer than 260 characters`, that's the
  known Windows long-path issue documented in `README.md` — don't try to
  "fix" it by restructuring `src/`; the fix is enabling Windows long-path
  support (a system setting, out of scope for an agent to change itself).

## UI Expectations

- Compact, content-driven screens — copy/lists/actions come from
  `config/content/screens/*.ts`.
- Respect the closed `ConfigAction` union; never wire a raw arbitrary
  handler into a content-driven row or button.
- Keep the guided-capture screen's dark, high-contrast camera palette
  independent of the light/dark app theme (see "Coding Style" above).

## Prompt Logging

- Record user prompts that lead to repo changes under `notes/prompts/`.
- Filenames: `yyyy-mm-dd-small-prompt-description.txt`, e.g.
  `2026-08-25-add-agents-instructions.txt`.
- Each log includes the original prompt text and a concise summary of the
  changes made in response.
- Redact secrets/credentials if a prompt happens to contain any — never
  log them verbatim.

## Verification

Run whatever applies to what was touched:

```sh
npx tsc --noEmit
npx eslint src App.tsx index.js --ext .ts,.tsx,.js
npm test                      # only if __tests__/ exists — see notes/techdebt.md
```

If `android/`/`ios/` exist locally (see "Native Platform Folders" above):

```sh
cd android && ./gradlew assembleDebug   # Windows needs long paths enabled first
```

## Editing Discipline

- Do not revert unrelated user changes.
- Keep edits scoped to the requested behavior.
- Preserve existing file layout unless there's a clear reason to move code.
- Update `README.md` when a stack/architecture decision changes; update
  `notes/diary.md`, `notes/todolist.md`, and/or `notes/techdebt.md` (see
  below) whenever a task changes behavior, scope, or known limitations in
  a way a future agent needs to know — this is expected as part of the
  task, not a separate favor to ask for.
- Never reintroduce Expo or Flutter into this project. This project exists
  specifically because those were ruled out; if a task seems to need one
  of them, flag it and ask rather than adding it back quietly.

## Living Docs — keep these current

All grouped under `notes/` (everything except `AGENTS.md` itself, which
stays at the project root):

- **`notes/diary.md`** — dated, append-only log of notable changes and the
  reasoning behind them. Add an entry for anything a future agent would
  want the "why," not just the "what" (the git history already has that).
- **`notes/todolist.md`** — open follow-ups. Check items off (or delete
  them) as they're resolved; add new ones as they're discovered, even if
  out of scope for the current task.
- **`notes/techdebt.md`** — known shortcuts, stubs, and limitations, plus
  what actually closing each one would take. Update it the moment you
  introduce a shortcut, not retroactively.
- **`notes/prompts/`** — one file per prompt that led to a change (see
  "Prompt Logging" above).

Agents should update these as a normal part of doing the task — not only
when the user explicitly asks "update the docs."
