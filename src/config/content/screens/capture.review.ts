import type { ButtonConfig } from '../types';

export const captureReviewContent = {
  title: 'Review your photos',
  allCapturedLabel: 'All photos captured',
  remainingSuffix: 'photo(s) remaining',
  /** Shown in the summary chip while `usePhotoPrecheck`'s `runPrecheck` is in flight. */
  checkingLabel: 'Checking your photos…',
  /** Paired with a flagged-shot count, e.g. "2 photo(s) need a closer look". */
  needsAttentionSuffix: 'photo(s) need a closer look',
  /** Shown instead of `allCapturedLabel` when the AI photo check never ran at all (no backend configured, or every shot was a mock:// fallback) — must never be silently presented as "all good". */
  notVerifiedLabel: 'Photos not AI-checked — continuing without verification',
  /** Shown instead of `allCapturedLabel`/`notVerifiedLabel` when the check DID run but the request itself failed (e.g. the AI service returned an error) — distinct wording since this is a real failure, not just "wasn't attempted". */
  checkFailedLabel: "Couldn't check your photos right now — continuing without verification",
  /** Per-tile caption for a shot with no check result because the check never ran at all, distinct from a shot that was checked and passed. */
  notVerifiedTileLabel: 'Not checked',
  /** `onPress` is wired directly by CaptureFlowScreen (it depends on live session state), not a ConfigAction. */
  continueCta: { label: 'Continue' } as ButtonConfig,
  /** Shown instead of `continueCta` when this screen is reached mid-flow (back-pressed into the gallery before all shots are taken) — resumes shooting rather than proceeding to analysis. */
  resumeCta: { label: 'Continue shooting' } as ButtonConfig,
  /**
   * Shown under the Continue button when it's disabled because one or more
   * photos have a CONFIRMED precheck failure — deliberately does NOT block
   * on "couldn't verify" (no backend, network error, etc.), only on an
   * actual pass:false result, so a transient AI-service hiccup can never
   * permanently trap someone in the capture flow.
   */
  blockedByFlaggedLabel: 'Retake the flagged photos above to continue',
};
