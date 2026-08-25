import type { ButtonConfig, LinkTextConfig } from '../types';

export const vehicleDetailsContent = {
  step: 1,
  totalSteps: 5,
  stepLabel: 'Your car',
  heading: 'Which car are we valuing?',
  registrationLabel: 'Registration number',
  consentLabel:
    'I allow JSW to fetch my vehicle details from VAHAN using this registration number. The record is stored against my consent reference and can be withdrawn from Account at any time.',
  /** No handler today — kept explicit rather than silently dead. */
  manualEntryLink: { label: 'Enter details manually instead' } as LinkTextConfig,
  cta: {
    label: 'Find my car',
    action: { kind: 'navigate', screen: 'InstantValuation' },
  } as ButtonConfig,

  /**
   * Shown when a local draft inspection exists for the typed registration
   * number (see `state/captureDrafts.ts`) — lets someone resume a pending
   * inspection instead of starting over. Both buttons are prop-driven
   * (they need to call `setRegistration`/navigate/delete-draft together),
   * not `ConfigAction`s.
   */
  resumeDraftTitle: 'Continue your inspection?',
  /** Composed as `"${taken} of ${total} ${resumeDraftSuffix}"`. */
  resumeDraftSuffix: 'photos captured so far',
  resumeCta: { label: 'Resume inspection' } as ButtonConfig,
  discardDraftLabel: 'Start over instead',
};
