import type { ButtonConfig, ChipConfig, LinkTextConfig } from '../types';
import type { ChipTone } from '../../../components/Chip';

/** `tone` resolves to an actual colour at render time via the active theme — content never carries raw hex. */
export interface BandConfig {
  label: string;
  range: string;
  tone: ChipTone;
}

export const instantValuationContent = {
  step: 2,
  totalSteps: 5,
  stepLabel: 'Estimate',
  /** No handler today — kept explicit rather than silently dead. */
  editLink: { label: 'Edit' } as LinkTextConfig,
  indicativeChip: { label: 'Indicative', tone: 'neutral' } as ChipConfig,
  bandsSectionLabel: 'WHAT YOUR CAR COULD FETCH',
  bands: [
    { label: 'Excellent', range: '₹9.10 – 9.80L', tone: 'success' },
    { label: 'Average', range: '₹8.20 – 8.90L', tone: 'warning' },
    { label: 'Poor', range: '₹7.10 – 7.80L', tone: 'danger' },
  ] as BandConfig[],
  validityFootnote: 'Valid for 7 days or 2,000 km, whichever is earlier.',
  whyRangeTitle: 'Why a range?',
  whyRangeBody:
    'Two cars of the same age and model sell for different amounts depending on condition. Until someone looks at your car, the honest answer is a band.',
  cta: {
    label: 'Get Accurate Valuation',
    action: { kind: 'navigate', screen: 'InspectionIntro' },
  } as ButtonConfig,
  /** No handler today — kept explicit rather than silently dead. */
  downloadLink: { label: 'Download Indicative Valuation' } as LinkTextConfig,
};
