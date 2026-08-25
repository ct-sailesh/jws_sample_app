# To-do

Open follow-ups. Check items off (or delete them) as they're resolved; add
new ones as they're discovered — see `../AGENTS.md`.

## Environment / build

- [ ] Regenerate `android/` and `ios/` when native testing is actually
      needed (see `../README.md` "Getting started"), then reapply the camera/
      motion permission strings + font linking documented there.
- [ ] Enable Windows long-path support (`LongPathsEnabled` registry key —
      requires Administrator + restart) on the dev machine before
      attempting `./gradlew assembleDebug` again on Windows; see
      `../README.md`'s "Known issue" section. Not something an agent should
      do unattended.
- [ ] Once long paths are enabled (or building on macOS/Linux/CI), confirm
      a full Android debug build succeeds end-to-end, then do a real-device
      smoke test of the guided-capture flow (camera + accelerometer both
      need a physical device — simulators/emulators can't exercise either).
- [ ] Get an iOS build working from a Mac (Info.plist permission strings
      are already in the README's regeneration steps; nothing else is
      known to be iOS-specific yet, but it hasn't actually been built).

## Testing

- [ ] Re-add `__tests__/` (and the `__mocks__/react-native-nitro-sensors.js`
      manual mock) — removed temporarily, see `techdebt.md`. At minimum:
      currency/valuation formulas and the device-alignment pure math
      (`computeTilt`/`computeConfidence`/`nextAlignmentStatus`).
- [ ] Consider a smoke test for navigation (tab shell renders, journey
      screens push/pop) once native-module Jest mocking for
      vision-camera/haptic-feedback/gesture-handler is worth the setup
      cost — skipped so far as out of proportion for this app's size.

## Backend

- [ ] Decide when to wire up the real inspection backend (see
      `../README.md` "Backend" + `../AGENTS.md` "Backend Integration Rules").
      Reference server implementation already exists at
      `../../mobile-app/server`.
- [ ] Implement `resizePhoto()` in `src/state/inspectApi.ts` with a
      bare-RN image-resize package once that happens.
- [ ] Reintroduce per-environment config (e.g. `react-native-config`) at
      that point — `src/config/env.ts` is intentionally minimal right now
      because there's no environment-specific value to inject yet.

## Housekeeping

- [ ] Revisit `react-native-nitro-sensors` periodically — it's a young
      (0.1.x), single-maintainer package. Healthy so far, but worth
      re-checking maintenance status before leaning on it further (e.g.
      before wiring up other sensor types it exposes).
- [ ] `npm audit` currently reports several high-severity advisories, all
      in Metro's own dev-time image-parsing dependency chain (not shipped
      in the app, not fixable without downgrading React Native itself) —
      re-check after the next RN upgrade in case upstream has moved.
- [ ] Re-check ESLint version whenever `@react-native/eslint-config` gets
      bumped past `0.87.0`: move to ESLint 10 once that package's own
      `peerDependencies` acknowledges it, and drop the
      `eslint-plugin-ft-flow` `overrides` entry in `package.json` once
      that package's own transitive dependency catches up past `3.0.11`
      (see `techdebt.md`).
- [ ] Re-check TypeScript 7 (the new native/Go compiler) once
      `@react-native/typescript-config`'s own template default moves off
      `^6.0.3` — see `../README.md` "Tooling versions".
