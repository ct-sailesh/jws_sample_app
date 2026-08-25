import type { ButtonConfig, LinkTextConfig } from '../types';

export const dealerSelectionContent = {
  headingSuffix: 'dealers near you',
  /** No handler today — kept explicit rather than silently dead. */
  directionsLink: { label: 'Directions' } as LinkTextConfig,
  /** FIX: was a silent `onPress={() => {}}` — now an explicit, dev-visible placeholder. */
  cta: {
    label: 'Send to this dealer',
    action: { kind: 'noop', reason: 'dealer hand-off flow not built yet' },
  } as ButtonConfig,
};
