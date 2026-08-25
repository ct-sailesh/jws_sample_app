import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { env } from '../config/env';
import { mockFindings, mockValuation } from '../mocks/data';
import type { CapturedShotSummary, Finding } from '../types/inspection';
import { resizePhotosWithBudget, postPhotosToServer, type ApiErrorCode } from './inspectApi';

/**
 * Mirrors the `ThemeProvider` pattern already established in this codebase
 * (a context wrapped around the navigator in App.tsx). A route-param chain
 * through 4+ downstream screens isn't enough here: `aiAnalysisContent`'s
 * secondary CTA navigates away to `MainTabs`/`Home` mid-analysis, and
 * params live and die with the screen instance that navigated away — a
 * context above `NavigationContainer` survives that.
 */

export type InspectionStatus = 'idle' | 'loading' | 'success' | 'error';
export type InspectionErrorCode = ApiErrorCode;

interface InspectionResultState {
  status: InspectionStatus;
  findings: Finding[];
  conditionScore: number;
  odometerReadingKm: number | null;
  error?: { code: InspectionErrorCode; message: string };
  /** The photos an in-progress or completed inspection was run against — used to look up a finding's source-photo thumbnail by `shotId`. Empty in the idle/mock-fallback state. */
  shots: CapturedShotSummary[];
}

interface InspectionResultContextValue extends InspectionResultState {
  runInspection: (shots: CapturedShotSummary[]) => Promise<void>;
  reset: () => void;
}

const IDLE_STATE: InspectionResultState = {
  status: 'idle',
  findings: mockFindings,
  conditionScore: mockValuation.conditionScore,
  odometerReadingKm: null,
  shots: [],
};

const InspectionResultContext = createContext<InspectionResultContextValue>({
  ...IDLE_STATE,
  runInspection: async () => {},
  reset: () => {},
});

interface InspectApiResponse {
  findings: {
    shotId: string;
    panel: string;
    issue: string;
    severity: Finding['severity'];
    confidence: number;
    deduction: number;
    location: { x: number; y: number };
  }[];
  conditionScore: number;
  odometerReadingKm: number | null;
}

export function InspectionResultProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<InspectionResultState>(IDLE_STATE);

  const reset = useCallback(() => setState(IDLE_STATE), []);

  const runInspection = useCallback(async (shots: CapturedShotSummary[]) => {
    if (!env.API_BASE_URL) {
      // No backend configured — stay on mock data, no network attempt.
      setState(IDLE_STATE);
      return;
    }

    setState((prev) => ({ ...prev, status: 'loading' }));

    const photos = await resizePhotosWithBudget(shots);
    if (photos.length === 0) {
      // No usable (non-mock, successfully resized) photos — same
      // graceful fallback as "no backend configured".
      setState(IDLE_STATE);
      return;
    }

    const result = await postPhotosToServer<InspectApiResponse>('/api/inspect', photos);

    if (!result.ok) {
      setState((prev) => ({ ...prev, status: 'error', error: result.error }));
      return;
    }

    const findings: Finding[] = result.data.findings.map((f, i) => ({
      id: `${f.shotId}-${i}`,
      shotId: f.shotId,
      panel: f.panel,
      issue: f.issue,
      severity: f.severity,
      confidence: f.confidence,
      deduction: f.deduction,
      location: f.location,
    }));

    setState({
      status: 'success',
      findings,
      conditionScore: typeof result.data.conditionScore === 'number' ? result.data.conditionScore : mockValuation.conditionScore,
      odometerReadingKm: result.data.odometerReadingKm ?? null,
      shots,
    });
  }, []);

  const value = useMemo<InspectionResultContextValue>(
    () => ({ ...state, runInspection, reset }),
    [state, runInspection, reset]
  );

  return <InspectionResultContext.Provider value={value}>{children}</InspectionResultContext.Provider>;
}

export function useInspectionResult(): InspectionResultContextValue {
  return useContext(InspectionResultContext);
}
