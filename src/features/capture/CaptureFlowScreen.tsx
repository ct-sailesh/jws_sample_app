import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCaptureSession } from './hooks/useCaptureSession';
import { CameraCaptureScreen } from './CameraCaptureScreen';
import { CaptureReviewScreen } from './CaptureReviewScreen';
import type { RootStackParamList } from '../../navigation/types';
import { useInspectionResult } from '../../state/InspectionResultContext';
import { useVehicleSession } from '../../state/VehicleSessionContext';
import { deleteDraft } from '../../state/captureDrafts';
import { usePhotoPrecheck } from '../../state/usePhotoPrecheck';
import type { CapturedShotSummary } from '../../types/inspection';

/**
 * Owns the guided-capture session end to end: live camera + pose overlay
 * while shots are outstanding, then a review grid once the walk-around is
 * done, before handing off to AIAnalysisScreen for real inspection.
 *
 * The session is keyed by `registration` (from `VehicleSessionContext`) so
 * it can hydrate from — and auto-save to — a local draft (see
 * `useCaptureSession.ts` / `state/captureDrafts.ts`), letting a pending
 * inspection survive the app being closed and reopened.
 *
 * The review grid can also appear mid-flow: pressing back while shooting
 * (past the first angle) shows the gallery instead of stepping back to
 * re-shoot the previous angle one at a time (`showReview`, toggled by
 * `CameraCaptureScreen`'s `onShowGallery`) — this is a peek, not
 * completion, so `CaptureReviewScreen` itself skips the AI photo-quality
 * check until `session.isComplete` is actually true.
 *
 * `showReview` is the single source of truth for which screen renders —
 * it is NOT derived as `session.isComplete || showReview` at render time.
 * That would silently kick the user into the camera if a photo is deleted
 * from the final (complete) review: deleting flips `isComplete` back to
 * `false`, and with `showReview` never having been set `true` on that
 * path, the OR'd condition would go false. Instead, an effect flips
 * `showReview` to `true` the moment completion is first reached, and it
 * stays `true` afterward regardless of edits made from the gallery.
 *
 * `usePhotoPrecheck` is called HERE, not inside `CaptureReviewScreen` —
 * its cache (see `usePhotoPrecheck.ts`) needs to survive the review
 * screen unmounting/remounting during a retake (`showReview` toggles
 * false then true again), otherwise every retake of one photo would
 * silently re-check all the others too, at real cost/latency.
 */
export function CaptureFlowScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { registration } = useVehicleSession();
  const session = useCaptureSession(registration);
  const { reset } = useInspectionResult();
  const [showReview, setShowReview] = useState(false);
  const precheck = usePhotoPrecheck();

  // A fresh capture session means a fresh inspection — explicitly clear
  // any previous result rather than relying on unmount, so a second
  // inspection run in the same app session (there are two cars in
  // mockVehicles) never shows stale findings from the first. Keyed on
  // `registration`, not just mount: this screen can be REUSED rather than
  // freshly remounted (`navigation.navigate('CaptureFlow')` brings an
  // already-mounted instance back into focus if it's still in the stack),
  // so relying on mount-only `[]` deps missed exactly the case that
  // matters — switching to a genuinely different car in that same
  // instance. See `useCaptureSession.ts`'s hydration-effect fix for the
  // matching bug on the captured-photos side of this same root cause.
  useEffect(() => {
    reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration]);

  useEffect(() => {
    if (session.isComplete) setShowReview(true);
  }, [session.isComplete]);

  // Same reused-instance concern as the `reset()` effect above: if this
  // screen is still showing a finished car's review grid (`showReview`
  // left `true` from before) and gets reused for a different car,
  // starting that new inspection would otherwise land straight back on
  // the gallery instead of the camera — harmless-looking with the
  // photos-leak bug fixed (the grid would just show all-empty tiles), but
  // still the wrong starting screen for a brand-new walk-around.
  useEffect(() => {
    setShowReview(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registration]);

  // Runs (or re-runs) the photo-quality check every time the session
  // reaches completion — including after a delete+retake cycle, since
  // that necessarily flips isComplete false then true again. The hook's
  // own cache means this only actually re-sends the shot(s) that changed.
  useEffect(() => {
    if (!session.isComplete) return;
    const shots: CapturedShotSummary[] = session.shots
      .filter((s) => s.uri !== null)
      .map((s) => ({ id: s.id, title: s.title, category: s.category, uri: s.uri! }));
    precheck.runPrecheck(shots);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.isComplete]);

  const handleRetake = (index: number) => {
    session.retakeAt(index);
    // Retaking means actually taking a new photo — drop back into the
    // camera for that shot rather than staying on the (now-incomplete) gallery.
    setShowReview(false);
  };

  const handleDelete = (index: number) => {
    // Just clears the photo — stays on the gallery, no forced camera jump.
    session.clearShot(index);
  };

  const handleContinueFromReview = () => {
    if (session.isComplete) {
      const shots: CapturedShotSummary[] = session.shots
        .filter((s) => s.uri !== null)
        .map((s) => ({ id: s.id, title: s.title, category: s.category, uri: s.uri! }));
      // The draft's job is done once we hand off to real analysis — results
      // live in InspectionResultContext from here on.
      deleteDraft(registration);
      navigation.navigate('AIAnalysis', { shots });
      return;
    }
    // Mid-flow gallery peek — resume shooting from wherever the session left off.
    setShowReview(false);
  };

  if (showReview) {
    return (
      <CaptureReviewScreen
        session={session}
        onContinue={handleContinueFromReview}
        onRetake={handleRetake}
        onDelete={handleDelete}
        precheckStatus={precheck.status}
        precheckAttempted={precheck.attempted}
        checksByShotId={precheck.checksByShotId}
      />
    );
  }

  return <CameraCaptureScreen session={session} onShowGallery={() => setShowReview(true)} />;
}
