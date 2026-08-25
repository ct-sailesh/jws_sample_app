/**
 * The 15-shot guided-capture script. Relocated here as-is from the former
 * `src/features/capture/angles.ts` — same array order, same `id`/`index`
 * semantics, unchanged. `useCaptureSession.ts` indexes this array
 * positionally (`shots[currentIndex]`, etc.), so treat this as data to move,
 * never to reshape/reorder/dedupe.
 */

import { env } from '../../env';

export type CaptureCategory = 'Exterior' | 'Interior' | 'Dashboard' | 'Tyres' | 'Odometer' | 'Engine bay';

export type SkeletonVariant =
  | 'car-front'
  | 'car-rear'
  | 'car-side-left'
  | 'car-side-right'
  | 'car-3q-front-left'
  | 'car-3q-front-right'
  | 'car-3q-rear-left'
  | 'car-3q-rear-right'
  | 'dashboard'
  | 'odometer'
  | 'engine-bay'
  | 'seat'
  | 'boot'
  | 'tyre';

/**
 * Alignment mode used by `useDeviceAlignment` to decide how the skeleton
 * reacts to the phone's real-world pose:
 *  - "orientation": exterior walk-around shots. We check the phone is held
 *    upright and level (matching `targetPitchDeg`, roll near zero) and
 *    steady, as a proxy for "framed the way this guide expects".
 *  - "steady": close-up / interior shots where framing matters more than
 *    tilt — we mostly ask the phone to stop moving at roughly the right
 *    downward angle.
 */
export type AlignmentMode = 'orientation' | 'steady';

export interface CaptureAngle {
  id: string;
  index: number; // 1-indexed, matches "N of 15"
  category: CaptureCategory;
  title: string;
  instruction: string;
  skeleton: SkeletonVariant;
  alignmentMode: AlignmentMode;
  /**
   * Target device pitch in degrees for this shot: 0 = phone held upright
   * and level (typical walk-around exterior shot), negative = tilted
   * downward (close-ups: dashboard, odometer, engine bay, tyre).
   * We deliberately do NOT model a target compass heading/yaw — a phone's
   * motion sensors can't tell which side of the car the walker is standing
   * on, only how the phone itself is held. See `useDeviceAlignment` for
   * the honest scope of what this measures today, and the seam for
   * swapping in real vision-based pose/edge detection later.
   */
  targetPitchDeg: number;
}

const FULL_CAPTURE_ANGLES: CaptureAngle[] = [
  {
    id: 'front',
    index: 1,
    category: 'Exterior',
    title: 'Front',
    instruction: 'Stand about three steps back, centred on the bonnet.',
    skeleton: 'car-front',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'front-3q-left',
    index: 2,
    category: 'Exterior',
    title: 'Front-left corner',
    instruction: 'Move to the left headlamp, angled to see the front and side.',
    skeleton: 'car-3q-front-left',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'left-side',
    index: 3,
    category: 'Exterior',
    title: 'Left side',
    instruction: 'Stand level with the driver’s door, facing the car straight on.',
    skeleton: 'car-side-left',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'rear-3q-left',
    index: 4,
    category: 'Exterior',
    title: 'Rear-left corner',
    instruction: 'Move to the left tail-lamp, angled to see the rear and side.',
    skeleton: 'car-3q-rear-left',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'rear',
    index: 5,
    category: 'Exterior',
    title: 'Rear',
    instruction: 'Stand behind the car, centred on the boot.',
    skeleton: 'car-rear',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'rear-3q-right',
    index: 6,
    category: 'Exterior',
    title: 'Rear-right corner',
    instruction: 'Move to the right tail-lamp, angled to see the rear and side.',
    skeleton: 'car-3q-rear-right',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'right-side',
    index: 7,
    category: 'Exterior',
    title: 'Right side',
    instruction: 'Stand level with the passenger door, facing the car straight on.',
    skeleton: 'car-side-right',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'front-3q-right',
    index: 8,
    category: 'Exterior',
    title: 'Front-right corner',
    instruction: 'Move to the right headlamp, angled to see the front and side.',
    skeleton: 'car-3q-front-right',
    alignmentMode: 'orientation',
    targetPitchDeg: 0,
  },
  {
    id: 'dashboard',
    index: 9,
    category: 'Dashboard',
    title: 'Dashboard',
    instruction: 'Sit in the driver’s seat and frame the full dashboard.',
    skeleton: 'dashboard',
    alignmentMode: 'steady',
    targetPitchDeg: -25,
  },
  {
    id: 'odometer',
    index: 10,
    category: 'Odometer',
    title: 'Odometer reading',
    instruction: 'Turn on the ignition and get close enough to read the digits.',
    skeleton: 'odometer',
    alignmentMode: 'steady',
    targetPitchDeg: -25,
  },
  {
    id: 'front-seats',
    index: 11,
    category: 'Interior',
    title: 'Front seats',
    instruction: 'Open the front door and frame both front seats.',
    skeleton: 'seat',
    alignmentMode: 'steady',
    targetPitchDeg: 0,
  },
  {
    id: 'rear-seats',
    index: 12,
    category: 'Interior',
    title: 'Rear seats',
    instruction: 'Open the rear door and frame the back seat.',
    skeleton: 'seat',
    alignmentMode: 'steady',
    targetPitchDeg: 0,
  },
  {
    id: 'boot',
    index: 13,
    category: 'Interior',
    title: 'Boot / trunk',
    instruction: 'Open the boot and frame the storage area.',
    skeleton: 'boot',
    alignmentMode: 'steady',
    targetPitchDeg: -20,
  },
  {
    id: 'engine-bay',
    index: 14,
    category: 'Engine bay',
    title: 'Engine bay',
    instruction: 'Open the bonnet and frame the full engine bay.',
    skeleton: 'engine-bay',
    alignmentMode: 'steady',
    targetPitchDeg: -35,
  },
  {
    id: 'tyre',
    index: 15,
    category: 'Tyres',
    title: 'Tyre close-up',
    instruction: 'Crouch and get close to any one tyre, tread facing the camera.',
    skeleton: 'tyre',
    alignmentMode: 'steady',
    targetPitchDeg: -10,
  },
];

/**
 * A short dev-only walk-around (front, rear, right side, tyre, odometer)
 * so testing the capture → precheck → AI-analysis pipeline doesn't require
 * shooting all 15 real photos every iteration. `index` is renumbered 1..N
 * for this subset — `CaptureHeader`/`ShutterControls` display
 * `currentShot.index` alongside `session.total` (the array length), so the
 * two must stay consistent; the original angles' 1/5/7/10/15 index values
 * would otherwise show as "7 of 5", etc.
 */
const DEV_ANGLE_IDS = ['front', 'rear', 'right-side', 'tyre', 'odometer'];

const DEV_CAPTURE_ANGLES: CaptureAngle[] = DEV_ANGLE_IDS.map((id, i) => {
  const angle = FULL_CAPTURE_ANGLES.find((a) => a.id === id);
  if (!angle) {
    throw new Error(`[capture.angles] dev subset references unknown angle id "${id}"`);
  }
  return { ...angle, index: i + 1 };
});

/**
 * `useCaptureSession.ts` indexes this array positionally (`shots[currentIndex]`,
 * etc.), so whichever array this resolves to must stay internally
 * consistent (sequential 1..N `index` values matching array position) —
 * true of both `FULL_CAPTURE_ANGLES` (as shipped) and `DEV_CAPTURE_ANGLES`
 * (renumbered above). Swapped automatically by `EXPO_PUBLIC_APP_ENV`
 * (see `.env.development`) — production/preview builds always get the
 * full 15-shot walk-around regardless of this file.
 */
export const CAPTURE_ANGLES: CaptureAngle[] = env.APP_ENV === 'development' ? DEV_CAPTURE_ANGLES : FULL_CAPTURE_ANGLES;
