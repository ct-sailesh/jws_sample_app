import type { RootStackParamList } from '../../navigation/types';

/**
 * A closed set of declarative actions a content-config file is allowed to
 * express. Deliberately NOT eval/Function-based — the classic
 * server-driven-UI trap is letting config carry executable code; this union
 * is the whole vocabulary, so a content file can only ever request one of
 * these specific, reviewable effects. That matters even though config is
 * local-only today: it's what would keep a future remote-config source safe
 * without any further redesign.
 */

/** Generic so `screen`'s literal value narrows `params` to that route's own param type. */
export interface NavigateAction<K extends keyof RootStackParamList = keyof RootStackParamList> {
  kind: 'navigate';
  screen: K;
  params?: RootStackParamList[K];
}

export interface GoBackAction {
  kind: 'goBack';
}

/** Host-allowlisted even though config is local/trusted today — see useConfigAction.ts. */
export interface OpenUrlAction {
  kind: 'openUrl';
  url: string;
}

export interface CallAction {
  kind: 'call';
  number: string;
}

/**
 * Explicit, documented placeholder — replaces the old silent
 * `onPress={() => {}}` pattern. Logs a dev-only warning so an unwired row
 * stays visible during development without doing anything at runtime.
 */
export interface NoopAction {
  kind: 'noop';
  reason?: string;
}

/** Escape hatch for anything too bespoke to express declaratively — id maps to a function registered in code, never a string of code itself. */
export interface CustomAction {
  kind: 'custom';
  id: string;
}

export type ConfigAction =
  | NavigateAction
  | GoBackAction
  | OpenUrlAction
  | CallAction
  | NoopAction
  | CustomAction;
