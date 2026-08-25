import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { Sensors, type DeviceMotion } from 'react-native-nitro-sensors';

export type AlignmentStatus = 'idle' | 'aligning' | 'aligned' | 'unavailable';

export interface AlignmentState {
  status: AlignmentStatus;
  /** 0-1 continuous confidence, smoothed. Drives the skeleton's colour/glow. */
  confidence: number;
  pitchDeg: number;
  rollDeg: number;
}

const UPDATE_INTERVAL_MS = 60;
const SMOOTHING = 0.18; // low-pass filter factor
const STABILITY_WINDOW_MS = 600; // must hold within tolerance this long to be "aligned"
const ALIGNED_CONFIDENCE_THRESHOLD = 0.72;
const ALIGNING_CONFIDENCE_THRESHOLD = 0.35;

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/**
 * Pure pitch/roll trigonometry from a raw accelerometer-including-gravity
 * sample. Exported (and separately unit-tested) because it's the one part
 * of this file worth verifying against known vectors without a real device
 * or a mocked native sensor stream.
 *
 * Pitch: forward/back tilt of the phone (0 = upright vertical).
 * Roll: side-to-side tilt (0 = level, not rotated left/right).
 */
export function computeTilt(x: number, y: number, z: number): { pitchDeg: number; rollDeg: number } {
  return {
    pitchDeg: (Math.atan2(-y, Math.sqrt(x * x + z * z)) * 180) / Math.PI,
    rollDeg: (Math.atan2(x, z) * 180) / Math.PI,
  };
}

/**
 * Confidence falls off linearly past a tolerance band around the target
 * pitch (and around level for roll, which has no target — a capture angle
 * only ever specifies a target pitch); tuned to be forgiving, this is a
 * guide, not a strict gate.
 */
export function computeConfidence(smoothedPitchDeg: number, smoothedRollDeg: number, targetPitchDeg: number): number {
  const pitchError = Math.abs(smoothedPitchDeg - targetPitchDeg);
  const rollError = Math.abs(smoothedRollDeg);
  const pitchScore = clamp01(1 - pitchError / 35);
  const rollScore = clamp01(1 - rollError / 30);
  return clamp01(0.55 * pitchScore + 0.45 * rollScore);
}

/**
 * The stability state machine: confidence has to stay above the "aligned"
 * threshold continuously for `STABILITY_WINDOW_MS` before status flips to
 * `aligned` (any dip resets the clock), which is what makes the auto-capture
 * ring feel like it's rewarding a *held* pose rather than a lucky instant.
 */
export function nextAlignmentStatus(
  confidence: number,
  now: number,
  stableSince: number | null
): { status: AlignmentStatus; stableSince: number | null } {
  const withinTolerance = confidence > ALIGNED_CONFIDENCE_THRESHOLD;
  const nextStableSince = withinTolerance ? stableSince ?? now : null;
  const held = nextStableSince != null && now - nextStableSince >= STABILITY_WINDOW_MS;
  const status: AlignmentStatus = held ? 'aligned' : confidence > ALIGNING_CONFIDENCE_THRESHOLD ? 'aligning' : 'idle';
  return { status, stableSince: nextStableSince };
}

/**
 * Turns raw device-motion data (via `react-native-nitro-sensors`' Nitro
 * `DeviceMotion` sensor) into a single alignment confidence for the
 * guided-capture pose overlay.
 *
 * `reading.accelerationIncludingGravity` is exactly the same field name and
 * physical quantity Expo's `DeviceMotion.accelerationIncludingGravity`
 * exposed, so the pitch/roll trigonometry above is unchanged from the Expo
 * original. (An earlier pass of this port used `react-native-sensors`
 * instead — dropped after discovering its native Android build config is
 * stale: a Gradle 9-incompatible `jcenter()` repository declaration and an
 * `abiFilters` list that omits `arm64-v8a`, i.e. most real Android phones.
 * `react-native-nitro-sensors` is actively maintained, ships a modern Gradle
 * config, and is built on Nitro Modules — the same actively-developed
 * native-module framework `react-native-vision-camera` v5 uses, just
 * without that library's separate `react-native-nitro-image` requirement.)
 *
 * Scope, honestly: this measures how the PHONE is being held (level vs.
 * tilted, steady vs. moving) relative to the tilt a given capture angle
 * expects. It cannot see the car, and it cannot tell which side of the
 * vehicle the photographer is standing on — that would need computer
 * vision (edge/vehicle detection) or the actual camera frame, not just
 * motion sensors. It's a real, working signal that makes the overlay feel
 * alive and rewards good phone handling, and it's built as a self-contained
 * hook so a future pass can swap or blend in a frame-based pose model
 * (e.g. on-device vehicle keypoint detection) without touching the UI.
 */
export function useDeviceAlignment(targetPitchDeg: number, active: boolean): AlignmentState {
  const [state, setState] = useState<AlignmentState>({
    status: 'idle',
    confidence: 0,
    pitchDeg: 0,
    rollDeg: 0,
  });

  const smoothedPitch = useRef(0);
  const smoothedRoll = useRef(0);
  const stableSinceRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setState((s) => ({ ...s, status: 'idle' }));
      return;
    }

    let mounted = true;
    let sensor: DeviceMotion | null = null;

    try {
      sensor = Sensors.createDeviceMotion();
      if (!sensor.isAvailable) {
        setState((s) => ({ ...s, status: 'unavailable' }));
      } else {
        sensor.startObserving(
          { intervalMs: UPDATE_INTERVAL_MS },
          (reading) => {
            const { x, y, z } = reading.accelerationIncludingGravity;
            const { pitchDeg, rollDeg } = computeTilt(x, y, z);

            if (!initializedRef.current) {
              smoothedPitch.current = pitchDeg;
              smoothedRoll.current = rollDeg;
              initializedRef.current = true;
            } else {
              smoothedPitch.current += SMOOTHING * (pitchDeg - smoothedPitch.current);
              smoothedRoll.current += SMOOTHING * (rollDeg - smoothedRoll.current);
            }

            const confidence = computeConfidence(smoothedPitch.current, smoothedRoll.current, targetPitchDeg);
            const { status, stableSince } = nextAlignmentStatus(confidence, Date.now(), stableSinceRef.current);
            stableSinceRef.current = stableSince;

            if (mounted) {
              setState({
                status,
                confidence,
                pitchDeg: smoothedPitch.current,
                rollDeg: smoothedRoll.current,
              });
            }
          },
          () => {
            if (mounted) setState((s) => ({ ...s, status: 'unavailable' }));
          }
        );
      }
    } catch {
      if (mounted) setState((s) => ({ ...s, status: 'unavailable' }));
    }

    const appStateSub = AppState.addEventListener('change', (next) => {
      if (next !== 'active') sensor?.stopObserving();
    });

    return () => {
      mounted = false;
      sensor?.stopObserving();
      appStateSub.remove();
      initializedRef.current = false;
      stableSinceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, targetPitchDeg]);

  return state;
}
