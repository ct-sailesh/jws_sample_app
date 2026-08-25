import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CAPTURE_ANGLES, CaptureAngle } from '../../../config/content/screens/capture.angles';
import { loadDraft, saveDraft } from '../../../state/captureDrafts';

export interface CapturedShot extends CaptureAngle {
  uri: string | null;
}

export interface CaptureSession {
  shots: CapturedShot[];
  currentIndex: number;
  currentShot: CapturedShot;
  takenCount: number;
  total: number;
  isComplete: boolean;
  recordCapture: (uri: string) => void;
  goToNext: () => void;
  goToPrevious: () => void;
  goToIndex: (index: number) => void;
  retakeCurrent: () => void;
  retakeAt: (index: number) => void;
  /** Clears a shot's photo without moving `currentIndex` or navigating anywhere — distinct from `retakeAt`, which also jumps the session to it. */
  clearShot: (index: number) => void;
}

/**
 * Drives the guided-capture flow: which angle is active, what's been shot,
 * and navigation between steps. Also hydrates from — and best-effort
 * auto-saves to — a local draft keyed by `registration`, so a pending
 * inspection survives the app being closed and reopened (see
 * `state/captureDrafts.ts`). Losing a draft read/write never blocks or
 * throws; this is a convenience, not a guarantee.
 */
export function useCaptureSession(registration: string): CaptureSession {
  const [shots, setShots] = useState<CapturedShot[]>(
    CAPTURE_ANGLES.map((angle) => ({ ...angle, uri: null }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const hydratedRef = useRef(false);

  // Load any existing draft for this registration once, on mount — and
  // every time `registration` itself changes. Matches by angle `id`, so a
  // draft saved under a different angle set (e.g. the dev-mode 5-shot
  // subset vs. the full 15) degrades gracefully — ids that no longer exist
  // are simply dropped, ids not in the draft stay uncaptured.
  //
  // FIX: this used to only ever ADD uris found in the loaded draft,
  // leaving every other shot's `uri` exactly as it already was in state —
  // fine on a truly fresh mount (every shot starts `null` anyway), but
  // `VehicleSessionContext`'s `registration` is app-wide state, not
  // per-screen-instance: if this component is reused rather than freshly
  // remounted (e.g. `navigation.navigate('CaptureFlow')` bringing an
  // already-mounted instance back into focus instead of pushing a new
  // one), switching to a genuinely different car left the PREVIOUS car's
  // captured photos sitting in `shots` — either because the new
  // registration had no draft at all (the `if (draft)` branch never ran),
  // or because its draft didn't cover every angle the old one did. Now
  // every shot is explicitly set from the new draft (or to `null`) on
  // every registration change, never left as "whatever it already was".
  useEffect(() => {
    let cancelled = false;
    // Block the auto-save effect below until THIS registration's
    // hydration actually completes — without this, the moment between a
    // registration change and `loadDraft` resolving still has the
    // PREVIOUS registration's `shots` in state, and the auto-save effect
    // (unaware anything is mid-transition) would happily persist them
    // into the NEW registration's draft on disk, corrupting it before its
    // own load even finishes.
    hydratedRef.current = false;
    loadDraft(registration).then((draft) => {
      if (cancelled) return;
      setShots(
        CAPTURE_ANGLES.map((angle) => ({
          ...angle,
          uri: draft?.capturedUris[angle.id] ?? null,
        }))
      );
      setCurrentIndex(draft ? Math.max(0, Math.min(draft.currentIndex, CAPTURE_ANGLES.length - 1)) : 0);
      hydratedRef.current = true;
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration]);

  // Best-effort auto-save after every change, once initial hydration has
  // happened — otherwise the pre-hydration default state would immediately
  // overwrite a real draft before it even loads.
  useEffect(() => {
    if (!hydratedRef.current) return;
    const capturedUris: Record<string, string> = {};
    for (const shot of shots) {
      if (shot.uri) capturedUris[shot.id] = shot.uri;
    }
    saveDraft({ registration, updatedAt: Date.now(), currentIndex, capturedUris });
  }, [registration, shots, currentIndex]);

  const takenCount = useMemo(() => shots.filter((s) => s.uri).length, [shots]);
  const isComplete = takenCount === shots.length;

  const recordCapture = useCallback(
    (uri: string) => {
      setShots((prev) => {
        const next = [...prev];
        next[currentIndex] = { ...next[currentIndex], uri };
        return next;
      });
      setCurrentIndex((i) => Math.min(i + 1, shots.length - 1));
    },
    [currentIndex, shots.length]
  );

  const goToNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(i + 1, shots.length - 1));
  }, [shots.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  }, []);

  const goToIndex = useCallback(
    (index: number) => {
      setCurrentIndex(Math.max(0, Math.min(index, shots.length - 1)));
    },
    [shots.length]
  );

  const retakeCurrent = useCallback(() => {
    setShots((prev) => {
      const next = [...prev];
      next[currentIndex] = { ...next[currentIndex], uri: null };
      return next;
    });
  }, [currentIndex]);

  /** Clear a specific shot (by index) and jump the session to it — used from the review grid, where the tapped tile may not be the current shot. */
  const retakeAt = useCallback(
    (index: number) => {
      setShots((prev) => {
        const next = [...prev];
        next[index] = { ...next[index], uri: null };
        return next;
      });
      setCurrentIndex(Math.max(0, Math.min(index, shots.length - 1)));
    },
    [shots.length]
  );

  /** Clear a specific shot without moving `currentIndex` — the gallery's delete action, which stays on the review screen rather than jumping into the camera. */
  const clearShot = useCallback((index: number) => {
    setShots((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], uri: null };
      return next;
    });
  }, []);

  return {
    shots,
    currentIndex,
    currentShot: shots[currentIndex],
    takenCount,
    total: shots.length,
    isComplete,
    recordCapture,
    goToNext,
    goToPrevious,
    goToIndex,
    retakeCurrent,
    retakeAt,
    clearShot,
  };
}
