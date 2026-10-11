/**
 * Language-neutral messages for the pure calculation modules.
 *
 * models/** and utils/** must stay free of React/i18n imports (vitest runs
 * them under plain Node, and they shouldn't know which language the UI is
 * in). Instead of throwing/returning pre-translated Spanish strings, they
 * produce a translation *key* plus parameters, and the UI layer turns that
 * into text with `translateMessage` (src/i18n/translateMessage.ts).
 */

/** A reference to a translatable label, usable as a message parameter. A bare key (no dot) is looked up under `fields.`; a dotted key is an absolute path. */
export interface FieldRef {
  key: string;
  params?: MessageParams;
}

export type MessageParams = Record<string, string | number | FieldRef>;

/** A translation key under `errors.*` / `warnings.*` plus the values to interpolate into it. */
export interface LocalizedMessage {
  key: string;
  params: MessageParams;
}

/** What validation helpers accept as a "field name": a `fields.*` key, or a full FieldRef when the label itself takes parameters. */
export type FieldLabel = string | FieldRef;

export function toFieldRef(label: FieldLabel): FieldRef {
  return typeof label === 'string' ? { key: label } : label;
}

/**
 * Thrown by the calculation modules for physically impossible inputs.
 * `message` is the translation key (useful in logs/tests); the UI shows
 * translateMessage(error) instead.
 */
export class LocalizedError extends Error implements LocalizedMessage {
  readonly key: string;
  readonly params: MessageParams;

  constructor(key: string, params: MessageParams = {}) {
    super(key);
    this.name = 'LocalizedError';
    this.key = key;
    this.params = params;
  }
}
