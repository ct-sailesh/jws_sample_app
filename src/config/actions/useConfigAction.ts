import { useCallback } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { ConfigAction } from './types';
import { customActionRegistry } from './registry';

/**
 * Domains an `openUrl` action is allowed to open, even though config is
 * local/trusted today — defense in depth, and the seam that would matter
 * if config ever moved to a remote source. Update when a real backend/
 * marketing domain exists; https-only.
 */
const ALLOWED_URL_HOSTS = ['jsw-usedcars.example.com'];

function isAllowedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    return ALLOWED_URL_HOSTS.some(
      (host) => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

/**
 * Resolves a `ConfigAction` (or none) into a stable `() => void` handler,
 * suitable for `onPress`. The single `as any` below is intentional and
 * contained to this one line: `NavigateAction` stays fully typed against
 * `RootStackParamList` at every content-config call site, and only the
 * hand-off into React Navigation's own overload-heavy `navigate()` signature
 * needs the cast.
 */
export function useConfigAction(action?: ConfigAction): () => void {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return useCallback(() => {
    if (!action) return;

    switch (action.kind) {
      case 'navigate':
        navigation.navigate(action.screen as any, action.params as any);
        return;
      case 'goBack':
        navigation.goBack();
        return;
      case 'openUrl':
        if (isAllowedUrl(action.url)) {
          Linking.openURL(action.url).catch(() => {});
        } else if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`[config/actions] blocked openUrl to a non-allowlisted host: ${action.url}`);
        }
        return;
      case 'call':
        Linking.openURL(`tel:${action.number}`).catch(() => {});
        return;
      case 'noop':
        if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(
            `[config/actions] noop action fired${action.reason ? ` — ${action.reason}` : ''}`
          );
        }
        return;
      case 'custom': {
        const handler = customActionRegistry[action.id];
        if (handler) {
          handler();
        } else if (__DEV__) {
          // eslint-disable-next-line no-console
          console.warn(`[config/actions] no custom action registered for id "${action.id}"`);
        }
        return;
      }
    }
  }, [action, navigation]);
}
