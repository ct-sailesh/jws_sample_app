import { useCallback, useRef, useState } from 'react';
import { env } from '../config/env';
import type { CapturedShotSummary } from '../types/inspection';
import { resizePhotosWithBudget, postPhotosToServer, type ApiErrorCode } from './inspectApi';

export type PrecheckStatus = 'idle' | 'checking' | 'done' | 'error';

export interface PrecheckCheck {
  shotId: string;
  isVehiclePhoto: boolean;
  poseMatches: boolean;
  quality: 'good' | 'blurry' | 'dark' | 'obstructed';
  passed: boolean;
  issue: string;
}

interface PrecheckApiResponse {
  checks: PrecheckCheck[];
}

export interface UsePhotoPrecheckResult {
  status: PrecheckStatus;
  /**
   * True once this hook has any trustworthy result to report (fresh or
   * cached) for the most recent `runPrecheck` call. False means nothing
   * could be verified at all — no backend configured, or a fresh check
   * failed with nothing usable cached from before.
   */
  attempted: boolean;
  /** Keyed by shot id. A shot with no entry here should be treated as unverified, not passed — callers must consult `attempted`/`status` before drawing conclusions from a missing entry. */
  checksByShotId: Record<string, PrecheckCheck>;
  error?: { code: ApiErrorCode; message: string };
  runPrecheck: (shots: CapturedShotSummary[]) => Promise<void>;
}

interface CacheEntry {
  /** The uri this check result was computed from — lets a later call tell "unchanged, reuse it" from "this shot was retaken, must recheck". */
  uri: string;
  check: PrecheckCheck;
}

/**
 * Local hook, not a global context like `InspectionResultContext` —
 * precheck results only matter during the review step, nothing downstream
 * reads them. Called from `CaptureFlowScreen` (not `CaptureReviewScreen`
 * directly) specifically so its cache survives the review screen
 * unmounting/remounting during a retake — without that, every retake
 * would silently re-check every other unchanged photo too.
 *
 * Cost-conscious by design: `runPrecheck` only resizes and sends shots
 * whose photo actually changed since their last successful check (or that
 * have never been checked) — unchanged shots reuse their cached result
 * instead of re-paying for a Gemini call. Results are merged, not
 * replaced: a fresh check of one retaken photo never discards a still-valid
 * cached result for the other 14. In-memory only (this session), not
 * persisted to disk — an explicit, smaller scope than the draft-photo
 * persistence elsewhere in this feature.
 *
 * This is a quality-of-life gate, not a hard requirement on its own —
 * whether a failed/unverified check actually blocks the user from
 * proceeding is decided by the caller (`CaptureReviewScreen`), not here.
 */
export function usePhotoPrecheck(): UsePhotoPrecheckResult {
  const [status, setStatus] = useState<PrecheckStatus>('idle');
  const [attempted, setAttempted] = useState(false);
  const [checksByShotId, setChecksByShotId] = useState<Record<string, PrecheckCheck>>({});
  const [error, setError] = useState<{ code: ApiErrorCode; message: string } | undefined>();
  const cacheRef = useRef<Record<string, CacheEntry>>({});

  /** Publishes whatever's currently in the cache for exactly the given shots (dropping anything else) into state. */
  const publish = useCallback((shots: CapturedShotSummary[]) => {
    const merged: Record<string, PrecheckCheck> = {};
    for (const s of shots) {
      const cached = cacheRef.current[s.id];
      if (cached) merged[s.id] = cached.check;
    }
    setChecksByShotId(merged);
    return merged;
  }, []);

  const runPrecheck = useCallback(
    async (shots: CapturedShotSummary[]) => {
      setError(undefined);

      // Drop cache entries for shots no longer present at all (deleted
      // with nothing recaptured yet) so a stale result never lingers.
      const currentIds = new Set(shots.map((s) => s.id));
      for (const id of Object.keys(cacheRef.current)) {
        if (!currentIds.has(id)) delete cacheRef.current[id];
      }

      // Only shots that are new or whose photo actually changed need a
      // fresh check — everything else reuses its cached result.
      const toRecheck = shots.filter((s) => {
        const cached = cacheRef.current[s.id];
        return !cached || cached.uri !== s.uri;
      });

      if (!env.API_BASE_URL) {
        publish(shots);
        setAttempted(Object.keys(cacheRef.current).length > 0);
        setStatus('done');
        return;
      }

      if (toRecheck.length === 0) {
        // Every shot's result is already cached and still valid — no
        // network call needed at all.
        publish(shots);
        setAttempted(true);
        setStatus('done');
        return;
      }

      setStatus('checking');

      const photos = await resizePhotosWithBudget(toRecheck);
      if (photos.length === 0) {
        // Couldn't prepare the changed shots — their old cached results
        // (if any) no longer reflect their current photo, so drop them
        // rather than show a stale badge for a since-retaken shot.
        for (const s of toRecheck) delete cacheRef.current[s.id];
        publish(shots);
        setAttempted(Object.keys(cacheRef.current).length > 0);
        setStatus('done');
        return;
      }

      const result = await postPhotosToServer<PrecheckApiResponse>('/api/precheck', photos);

      if (!result.ok) {
        // Same reasoning as above: invalidate the shots we tried (and
        // failed) to recheck, but keep every other still-valid cached
        // result — a transient failure on one retaken photo shouldn't
        // throw away 14 perfectly good prior results.
        for (const s of toRecheck) delete cacheRef.current[s.id];
        publish(shots);
        setStatus('error');
        setError(result.error);
        return;
      }

      for (const check of result.data.checks) {
        const shot = toRecheck.find((s) => s.id === check.shotId);
        if (shot) cacheRef.current[check.shotId] = { uri: shot.uri, check };
      }

      publish(shots);
      setAttempted(true);
      setStatus('done');
    },
    [publish]
  );

  return { status, attempted, checksByShotId, error, runPrecheck };
}
