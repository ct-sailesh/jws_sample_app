import type { CaptureCategory } from '../config/content/screens/capture.angles';

/**
 * Shared between mock data (`src/mocks/data.ts`) and real AI-derived
 * results (`src/state/InspectionResultContext.tsx`) — both conform to this
 * shape so downstream screens don't need to know which one they're
 * rendering.
 */

export type Severity = 'Minor' | 'Moderate' | 'Severe';

/** Normalized position of a finding within its source photo — 0-1 on each axis, (0,0) = top-left. Used to mark the damage directly on the photo in the gallery. */
export interface FindingLocation {
  x: number;
  y: number;
}

export interface Finding {
  /** Unique per finding, for list keys — not provided by the server (which only returns `shotId`), synthesized client-side when a real result arrives. */
  id: string;
  /** Which captured photo this finding came from. Undefined for mock findings, which don't correspond to any real photo. */
  shotId?: string;
  panel: string;
  issue: string;
  severity: Severity;
  confidence: number; // 0-1
  deduction: number;
  /** Optional — mock findings may omit it; real ones from the server always include it. */
  location?: FindingLocation;
}

/**
 * Trimmed shot info threaded from `CaptureFlowScreen` to `AIAnalysisScreen`
 * (as a navigation param) and held in `InspectionResultContext` — not the
 * full `CaptureAngle`, just what's needed to upload a photo and later show
 * its thumbnail next to a finding.
 */
export interface CapturedShotSummary {
  id: string;
  title: string;
  category: CaptureCategory;
  uri: string;
}
