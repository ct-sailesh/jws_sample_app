import type { ButtonConfig } from '../types';

/**
 * The former `SIDES`/`panelFindings`/`noPhotoPanel` placeholder-grid data
 * lived here — it was explicitly dead code (its own comment called the
 * artwork "placeholder", and only one of the four side-tabs was ever
 * populated). Now that findings carry a real `shotId`, the screen renders
 * a findings list with each one's actual source-photo thumbnail instead;
 * there's nothing left for a panel-grid to represent.
 */

export const healthReportContent = {
  overallLabel: 'OVERALL CONDITION',
  unconfirmedCaption: 'Unconfirmed — to be verified by the dealer',
  /** Shown when an inspection genuinely turns up no findings — a real possibility with AI-derived results, unlike the old mock data which always had exactly 4. */
  noFindingsCaption: 'No damage findings from this inspection.',
  /** Small label inside a finding's thumbnail slot when no source photo is available (mock/fallback findings). */
  photoPlaceholderLabel: 'photo',
  /** Shown under a single photo's tile in the per-photo gallery when that specific shot has no findings — distinct from `noFindingsCaption`, which speaks about the whole inspection rather than one photo. */
  photoCleanLabel: 'No issues found',
  cta: { label: 'See my valuation', action: { kind: 'navigate', screen: 'FinalValuation' } } as ButtonConfig,
};
