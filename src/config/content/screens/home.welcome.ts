import type { ButtonConfig } from '../types';

/** `iconKey` resolves through WelcomeScreen's local icon registry — icon components aren't serializable. */
export interface FeatureRowConfig {
  iconKey: 'rupee' | 'sparkle' | 'check' | 'exchange';
  label: string;
}

export const welcomeContent = {
  heroTitle: 'Find out what your car is worth',
  heroSubtitle: 'An estimate in under a minute, then a guided inspection if you want a sharper number.',
  features: [
    { iconKey: 'rupee', label: 'Instant estimate' },
    { iconKey: 'sparkle', label: 'AI self-inspection' },
    { iconKey: 'check', label: 'Real dealer offers' },
    { iconKey: 'exchange', label: 'Exchange for a new car' },
  ] as FeatureRowConfig[],
  cta: { label: 'Check My Car Value', action: { kind: 'navigate', screen: 'VehicleDetails' } } as ButtonConfig,
  footnote: 'No account needed to see an estimate',
};
