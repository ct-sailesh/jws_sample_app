type CustomActionHandler = () => void;

/**
 * id -> function map for `{ kind: 'custom' }` actions — anything a content
 * config needs to trigger that's too bespoke for the declarative union
 * (types.ts) to express. Empty today; register handlers here as real needs
 * appear, keyed by a stable id the relevant content file references.
 */
export const customActionRegistry: Record<string, CustomActionHandler> = {};

export function registerCustomAction(id: string, handler: CustomActionHandler): void {
  customActionRegistry[id] = handler;
}
