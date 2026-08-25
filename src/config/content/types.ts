import type { ConfigAction } from '../actions/types';
import type { ChipTone } from '../../components/Chip';

/**
 * Shared building-block shapes reused across `content/screens/*.ts`. No
 * zod here — these are same-repo, same-compiler TS objects; `tsc --strict`
 * already guarantees their shape at zero runtime cost. (Contrast with
 * `config/env.ts`, the one file that validates at runtime, because it's
 * reading actual external input.)
 */

/** A tappable list row (Garage/Account screens) — `action` is resolved via `useConfigAction()`. */
export interface RowConfig {
  title: string;
  subtitle?: string;
  trailingText?: string;
  destructive?: boolean;
  showChevron?: boolean;
  action?: ConfigAction;
}

/** A primary/secondary/ghost/danger CTA — `action` is resolved via `useConfigAction()`. */
export interface ButtonConfig {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  action?: ConfigAction;
}

/** A plain tappable text link (e.g. "Download report") — many of these are intentionally `undefined` (dead) today; that's still explicit, not silent. */
export interface LinkTextConfig {
  label: string;
  action?: ConfigAction;
}

export interface ChipConfig {
  label: string;
  tone?: ChipTone;
}

/**
 * `iconKey` resolves through a small local string -> component registry
 * (icons aren't serializable, so the component itself can never live in
 * config — only which one to use can).
 */
export interface IconRef {
  iconKey: string;
}
