import type { ButtonConfig } from '../types';

export const aiAnalysisContent = {
  /**
   * Tuning constant, centralized here as a plain literal (not zod'd, not
   * reactive). MUST stay read once into a module-level constant at the call
   * site, never recomputed per render — the progress animation's effect
   * intentionally excludes it from its dependency array.
   */
  durationMs: 4200,
  heading: 'Analysing your car',
  body: 'Usually takes 20 to 30 seconds.',
  checklistSectionLabel: "WHAT WE'RE CHECKING",
  secondaryCta: {
    label: "Notify me when it's ready",
    variant: 'secondary',
    action: { kind: 'navigate', screen: 'MainTabs', params: { screen: 'Home' } },
  } as ButtonConfig,

  /**
   * Error-state copy. `retryLabel`/`continueLabel` buttons call
   * InspectionResultContext methods directly as plain onPress — not
   * through useConfigAction/ConfigAction — matching this codebase's own
   * precedent (capture.cameraScreen.ts's `allowAccessCta` comment) for
   * anything that needs to call a context/native method rather than
   * navigate/open a URL/etc.
   */
  errorGenericTitle: "Couldn't finish the AI analysis",
  errorGenericBody: 'Something went wrong reaching the inspection service. You can try again, or continue with an estimate for now.',
  errorRateLimitedTitle: 'Busy right now',
  errorRateLimitedBody: 'The inspection service is handling a lot of requests. Wait a moment and try again.',
  errorSafetyBlockedTitle: "Couldn't process those photos",
  errorSafetyBlockedBody: "The inspection service flagged one or more photos and couldn't complete the analysis. You can try again or continue with an estimate.",
  retryLabel: 'Try again',
  continueWithEstimateLabel: 'Continue with estimate',
};
