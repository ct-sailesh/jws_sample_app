import type { ButtonConfig, LinkTextConfig } from '../types';
import type { ConfigAction } from '../../actions/types';

const explainAction: ConfigAction = { kind: 'navigate', screen: 'ExplainMyPrice' };

export const finalValuationContent = {
  step: 4,
  totalSteps: 5,
  stepLabel: 'Your valuation',
  aiEstimateChipLabel: 'AI estimate',
  rangeLabelPrefix: 'Likely range',
  assessedConditionLabel: 'Assessed condition',
  /** Reused for both the inline "what affects this?" text and the "Explain My Price" card press. */
  explainAction,
  confidenceExplainLinkLabel: 'what affects this?',
  bandSectionLabel: 'AGAINST THE INDICATIVE BAND',
  indicativeRangeLabel: 'Indicative range',
  explainCardTitle: 'Explain My Price',
  explainCardSubtitle: 'Exactly how age, mileage, condition and detected damage change the number',
  cta: { label: 'Find a dealer', action: { kind: 'navigate', screen: 'DealerSelection' } } as ButtonConfig,
  /** No handler today — kept explicit rather than silently dead. */
  downloadLink: { label: 'Download report' } as LinkTextConfig,
};
