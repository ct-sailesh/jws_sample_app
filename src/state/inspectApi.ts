import { env } from '../config/env';
import type { CapturedShotSummary } from '../types/inspection';

/**
 * Shared resize/POST plumbing for every call to the inspect server —
 * extracted so `InspectionResultContext` (damage analysis) and
 * `usePhotoPrecheck` (pose/quality check) call one implementation instead
 * of two copies. Neither hook/context owns this logic itself.
 */

export type ApiErrorCode =
  | 'RATE_LIMITED'
  | 'SAFETY_BLOCKED'
  | 'UPSTREAM_ERROR'
  | 'UNAUTHORIZED'
  | 'INVALID_REQUEST'
  | 'NETWORK_ERROR';

export interface ApiError {
  code: ApiErrorCode;
  message: string;
}

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: ApiError };

const MAX_DIMENSION = 1024;
const JPEG_COMPRESS = 0.6;
// Step-down settings if the first pass still exceeds the payload budget —
// smaller/lower-quality, used only for an unusually detailed batch.
const FALLBACK_DIMENSION = 768;
const FALLBACK_COMPRESS = 0.45;
// Hard cap on the combined base64 payload before sending. Comfortably
// under Vercel's function body limit (4.5MB as of writing — re-verify at
// deploy time, this has moved before) with margin for JSON overhead.
const MAX_TOTAL_BASE64_BYTES = 3_500_000;

export interface ResizedPhoto {
  id: string;
  title: string;
  category: string;
  base64: string;
}

/**
 * Resize-and-base64-encode a captured photo ahead of upload.
 *
 * NOT IMPLEMENTED — and, as things stand, unreachable: both callers of
 * `resizePhotosWithBudget` below check `env.API_BASE_URL` first and return
 * before ever calling it (see `InspectionResultContext.runInspection` /
 * `usePhotoPrecheck.runPrecheck`), and this build never sets `API_BASE_URL`
 * (see `config/env.ts`) — the backend integration was intentionally left as
 * a stub for this port. This function exists so the seam's *shape* survives
 * intact: wiring up a real backend later means implementing this one
 * function (e.g. with `react-native-image-resizer` or similar) and setting
 * `API_BASE_URL`, not restructuring the callers.
 */
async function resizePhoto(
  shot: CapturedShotSummary,
  _maxDimension: number,
  _quality: number
): Promise<ResizedPhoto | null> {
  throw new Error(
    `[inspectApi] resizePhoto("${shot.id}") called with no real implementation — this should be unreachable while env.API_BASE_URL is unset.`
  );
}

function isFulfilled<T>(v: T | null): v is T {
  return v !== null;
}

/**
 * Filters out any `mock://` shot (the capture flow's real per-shot
 * fallback for a native-camera hiccup, not just a wholesale simulator
 * case), resizes the rest, and steps down quality once if the combined
 * payload would be too large. Returns an empty array if nothing came out
 * usable — callers treat that the same as "no backend configured": skip
 * the network call and fall back to mock data.
 */
export async function resizePhotosWithBudget(shots: CapturedShotSummary[]): Promise<ResizedPhoto[]> {
  const realShots = shots.filter((s) => !s.uri.startsWith('mock://'));
  if (realShots.length === 0) {
    if (__DEV__ && shots.length > 0) {
      // eslint-disable-next-line no-console
      console.warn(
        '[inspectApi] every shot was a mock:// fallback (no real camera capture) — skipping the AI call entirely, nothing was actually checked.'
      );
    }
    return [];
  }

  let photos = (await Promise.all(realShots.map((s) => resizePhoto(s, MAX_DIMENSION, JPEG_COMPRESS)))).filter(
    isFulfilled
  );
  if (photos.length === 0) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn('[inspectApi] resizing failed for every shot — skipping the AI call entirely, nothing was actually checked.');
    }
    return [];
  }

  const totalBytes = photos.reduce((sum, p) => sum + p.base64.length, 0);
  if (totalBytes > MAX_TOTAL_BASE64_BYTES) {
    // Don't let an unusually detailed batch hit the server's own cap as an
    // opaque error — step down and retry once, client-side.
    photos = (await Promise.all(realShots.map((s) => resizePhoto(s, FALLBACK_DIMENSION, FALLBACK_COMPRESS)))).filter(
      isFulfilled
    );
  }
  return photos;
}

/**
 * POSTs an already-resized photo batch to a server path (e.g.
 * `/api/inspect`, `/api/precheck`) and normalizes the result into a typed
 * `ApiResult`, mapping network failures and the server's own
 * `{error, code, message}` shape onto the same `ApiError` union.
 */
export async function postPhotosToServer<T>(path: string, photos: ResizedPhoto[]): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${env.API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(env.INSPECT_APP_KEY ? { 'x-app-key': env.INSPECT_APP_KEY } : {}),
      },
      body: JSON.stringify({ photos }),
    });

    const body: any = await res.json().catch(() => null);

    if (!res.ok || !body || body.error) {
      const code: ApiErrorCode = body?.code ?? 'NETWORK_ERROR';
      const message = body?.message ?? `Request failed (${res.status})`;
      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.warn(`[inspectApi] ${path} failed (${code}): ${message}`);
      }
      return { ok: false, error: { code, message } };
    }

    if (__DEV__) {
      // The server-side [gemini] log (Vercel logs) has the raw model text;
      // this is the already-parsed/computed response the app actually
      // receives — printed here so it shows up directly in the Metro/Expo
      // console while testing through the app, without needing a second
      // terminal open for `vercel logs`.
      // eslint-disable-next-line no-console
      console.log(`[inspectApi] ${path} response:`, JSON.stringify(body, null, 2));
    }

    return { ok: true, data: body as T };
  } catch (err) {
    if (__DEV__) {
      // eslint-disable-next-line no-console
      console.warn(`[inspectApi] ${path} threw:`, err);
    }
    return {
      ok: false,
      error: { code: 'NETWORK_ERROR', message: err instanceof Error ? err.message : 'Network error' },
    };
  }
}
