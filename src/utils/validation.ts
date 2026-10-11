import { LocalizedError, toFieldRef } from './localizedMessage';
import type { FieldLabel, LocalizedMessage } from './localizedMessage';

/**
 * Hard validation: throws when a value is physically impossible for the
 * math involved (every model takes log10 of frequency/distance/heights,
 * which is undefined or -Infinity at <= 0). This must block the
 * calculation rather than warn, since the result would otherwise be
 * silently nonsensical (e.g. -Infinity dB).
 *
 * `label` is a `fields.*` translation key (or a FieldRef) -- the error
 * carries it as data and the UI translates it, see localizedMessage.ts.
 */
export function assertPositive(value: number, label: FieldLabel): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new LocalizedError('errors.mustBePositive', { field: toFieldRef(label) });
  }
}

/**
 * Hard validation for values that are physically valid at exactly zero
 * (e.g. a stationary mobile has v = 0, which is a legitimate
 * Doppler-free case -- see the fading simulator) but never negative.
 */
export function assertNonNegative(value: number, label: FieldLabel): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new LocalizedError('errors.mustBeNonNegative', { field: toFieldRef(label) });
  }
}

/** Hard validation for a value that must be a whole number (e.g. a channel count). */
export function assertInteger(value: number, label: FieldLabel): void {
  if (!Number.isInteger(value)) {
    throw new LocalizedError('errors.mustBeInteger', { field: toFieldRef(label) });
  }
}

/**
 * Soft validation: a model's coefficients were fitted over an empirical
 * range (e.g. Hata: 150-1500 MHz). Outside it the formula still produces
 * a number, but it's an extrapolation the UI should flag, not an error.
 * Returns a structured message (translated by the UI), or null in range.
 */
export function rangeWarningMessage(
  value: number,
  min: number,
  max: number,
  label: FieldLabel,
  unit: string
): LocalizedMessage | null {
  if (value < min || value > max) {
    return { key: 'warnings.outOfRange', params: { field: toFieldRef(label), value, min, max, unit } };
  }
  return null;
}

/** Normalizes a user-typed decimal (accepts ',' as separator) into a JS number, or NaN if blank/invalid. */
export function parseDecimal(text: string): number {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') {
    return NaN;
  }
  return Number(normalized);
}

/**
 * Hard validation for a probability/ratio that must be strictly between
 * 0 and 1 (e.g. a target blocking probability GoS, or a WCDMA cell load
 * η) -- 0 or 1 themselves are degenerate (GoS=0 needs infinite channels;
 * η=1 makes the load-margin formula -10*log10(1-η) undefined).
 */
export function assertUnitInterval(value: number, label: FieldLabel): void {
  if (!Number.isFinite(value) || value <= 0 || value >= 1) {
    throw new LocalizedError('errors.mustBeUnitInterval', { field: toFieldRef(label) });
  }
}

/**
 * Hard validation for the optional geometry fields on PropagationInputs
 * (Ikegami / Walfisch-Bertoni): throws a clear "missing parameter"
 * error instead of letting `undefined` flow into a log10() as NaN.
 */
export function requireField<T>(value: T | undefined, label: FieldLabel, modelName: string): T {
  if (value === undefined) {
    throw new LocalizedError('errors.missingParameter', { field: toFieldRef(label), model: modelName });
  }
  return value;
}
