/**
 * The guided-capture screen's colour palette — deliberately fixed and
 * outside the light/dark theme system. This is a correctness requirement,
 * not a style preference: the live camera preview needs guaranteed
 * contrast for overlay text/brackets against real-world video, regardless
 * of which app theme is active. Import this directly wherever capture UI
 * needs colour; never resolve it through `useTheme()`.
 *
 * Values unchanged from the former `colors.camera` block in
 * `src/theme/colors.ts`.
 */
export const cameraColors = {
  background: '#0B0D12',
  panel: 'rgba(17,20,28,0.72)',
  panelStrong: 'rgba(17,20,28,0.88)',
  bracket: 'rgba(255,255,255,0.85)',
  bracketDim: 'rgba(255,255,255,0.35)',
  text: '#FFFFFF',
  textDim: 'rgba(255,255,255,0.62)',
  skeletonIdle: 'rgba(255,255,255,0.42)',
  skeletonAligning: '#F2C572',
  skeletonAligned: '#3DDC84',
  skeletonMiss: '#FF7A6E',
  shutterRing: 'rgba(255,255,255,0.92)',
  accentAmber: '#F2C572',
} as const;

export type CameraColors = typeof cameraColors;
