import type { RowConfig } from '../types';
import { appInfo } from '../global';

export const accountContent = {
  title: 'Account',
  preferenceRows: [
    { title: 'Notification preferences', action: { kind: 'noop', reason: 'notification preferences screen not built yet' } },
    {
      title: 'Consent and privacy',
      subtitle: 'VAHAN lookup · CNS-4927-A',
      action: { kind: 'noop', reason: 'consent detail screen not built yet' },
    },
    { title: 'Export my data', action: { kind: 'noop', reason: 'data export flow not built yet' } },
    {
      title: 'Delete my account and data',
      destructive: true,
      action: { kind: 'noop', reason: 'account deletion flow not built yet' },
    },
  ] as RowConfig[],
  supportRows: [
    { title: 'Support', action: { kind: 'noop', reason: 'support flow not built yet' } },
  ] as RowConfig[],
  aboutRow: { title: 'About this app', trailingText: appInfo.version, showChevron: false } as RowConfig,
  /** Appearance/theme row is rendered specially by AccountScreen (needs live `useTheme()` state), not a plain RowConfig. */
  appearanceLabel: 'Appearance',
  appearanceOptionLabels: { light: 'Light', dark: 'Dark' } as Record<'light' | 'dark', string>,
};
