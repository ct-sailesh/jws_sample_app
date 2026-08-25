import type { TabParamList } from '../../navigation/types';

/** `iconKey` resolves through `MainTabs.tsx`'s local icon registry — components can't live in config. */
export interface TabConfig {
  routeName: keyof TabParamList;
  label: string;
  iconKey: 'home' | 'garage' | 'account';
}

export const tabs: TabConfig[] = [
  { routeName: 'Home', label: 'Home', iconKey: 'home' },
  { routeName: 'Garage', label: 'My Garage', iconKey: 'garage' },
  { routeName: 'Account', label: 'Account', iconKey: 'account' },
];

export const appInfo = {
  name: 'JSW Used Cars',
  /** Shown on AccountScreen's "About this app" row. Kept as a plain literal here rather than wired to app.config.ts's version field, to avoid a Node/RN import boundary for one display string. */
  version: 'v1.0.0',
};
