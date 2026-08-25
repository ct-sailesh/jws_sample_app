import type { ChipTone } from '../components/Chip';

/**
 * Shared valuation-derivation helpers. Extracted so `HealthReportScreen`
 * and `FinalValuationScreen` compute condition label/tone/confidence the
 * same way — previously `FinalValuationScreen` hardcoded "Average" / a 66%
 * confidence fill / a 58% band-marker position instead of deriving them
 * from `mockValuation`, inconsistent with `HealthReportScreen`'s own
 * (correct) `conditionTone()`.
 */

export interface ConditionTone {
  label: string;
  tone: ChipTone;
}

export function conditionTone(score: number): ConditionTone {
  if (score >= 85) return { label: 'Good', tone: 'success' };
  if (score >= 60) return { label: 'Average', tone: 'warning' };
  return { label: 'Needs attention', tone: 'danger' };
}

export interface ConfidenceLevel {
  /** 0-100, for the confidence-bar fill width. */
  percent: number;
  label: string;
}

/** Derived from the same score bands as `conditionTone` so the two can never disagree. */
export function confidenceFromScore(score: number): ConfidenceLevel {
  const { tone } = conditionTone(score);
  if (tone === 'success') return { percent: 90, label: 'High confidence' };
  if (tone === 'warning') return { percent: 66, label: 'Medium confidence' };
  return { percent: 40, label: 'Low confidence' };
}

/** Where `value` sits within [low, high] as a 0-100 percentage, clamped — positions the indicative-band marker. */
export function bandMarkerPercent(value: number, low: number, high: number): number {
  if (high <= low) return 50;
  const pct = ((value - low) / (high - low)) * 100;
  return Math.max(0, Math.min(100, pct));
}
