import type { ButtonConfig } from '../types';

/** `key: 'totalPhotos'` marks the one stat that must stay derived from `CAPTURE_ANGLES.length` rather than a literal, so it can never drift from the actual shot list. */
export type StatConfig = { key: 'totalPhotos'; unit: string } | { value: string; unit: string };

export const inspectionIntroContent = {
  step: 3,
  totalSteps: 5,
  stepLabel: 'Inspection',
  diagramCaption: 'Walk-around arc diagram — phone and car',
  heading: "Let's look at your car properly",
  stats: [
    { key: 'totalPhotos', unit: 'photos' },
    { value: '~5', unit: 'minutes' },
    { value: 'Every', unit: 'step guided' },
  ] as StatConfig[],
  categories: ['Exterior', 'Interior', 'Dashboard', 'Tyres', 'Odometer', 'Engine bay'],
  beforeYouStartTitle: 'Before you start',
  rules: [
    'Park in an open, well-lit place.',
    'Leave room to walk around the car.',
    'A clean car produces a clearer assessment.',
    'Keep the engine off and the bonnet accessible.',
  ],
  footer: 'Stop any time — your progress is saved for 72 hours.',
  cta: { label: 'Start Inspection', action: { kind: 'navigate', screen: 'CaptureFlow' } } as ButtonConfig,
};
