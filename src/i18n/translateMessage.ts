import type { TFunction } from 'i18next';
import { LocalizedError } from '../utils/localizedMessage';
import type { FieldRef, LocalizedMessage, MessageParams } from '../utils/localizedMessage';

type LooseT = (key: string, options?: Record<string, unknown>) => string;

function isFieldRef(value: unknown): value is FieldRef {
  return typeof value === 'object' && value !== null && 'key' in value;
}

/** A bare key means `fields.<key>`; a dotted key is an absolute translation path. */
function translateFieldRef(t: LooseT, ref: FieldRef): string {
  const path = ref.key.includes('.') ? ref.key : `fields.${ref.key}`;
  return t(path, resolveParams(t, ref.params));
}

function resolveParams(t: LooseT, params: MessageParams | undefined): Record<string, string | number> {
  const resolved: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(params ?? {})) {
    resolved[name] = isFieldRef(value) ? translateFieldRef(t, value) : value;
  }
  return resolved;
}

/**
 * Turns the language-neutral messages the pure calculation modules produce
 * (see utils/localizedMessage.ts) into text in the active language.
 */
export function translateMessage(t: TFunction, message: LocalizedMessage): string {
  const loose = t as unknown as LooseT;
  return loose(message.key, resolveParams(loose, message.params));
}

/** Text for anything a calculation `catch` block can receive: a LocalizedError is translated, anything else falls back to a generic message. */
export function translateError(t: TFunction, error: unknown): string {
  if (error instanceof LocalizedError) {
    return translateMessage(t, error);
  }
  return (t as unknown as LooseT)('errors.unknown');
}
