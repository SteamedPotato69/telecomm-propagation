/**
 * Hard validation: throws when a value is physically impossible for the
 * math involved (every model takes log10 of frequency/distance/heights,
 * which is undefined or -Infinity at <= 0). This must block the
 * calculation rather than warn, since the result would otherwise be
 * silently nonsensical (e.g. -Infinity dB).
 */
export function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} debe ser un número mayor que 0.`);
  }
}

/**
 * Soft validation: a model's coefficients were fitted over an empirical
 * range (e.g. Hata: 150-1500 MHz). Outside it the formula still produces
 * a number, but it's an extrapolation the UI should flag, not an error.
 */
export function rangeWarningMessage(
  value: number,
  min: number,
  max: number,
  label: string,
  unit: string
): string | null {
  if (value < min || value > max) {
    return `${label} = ${value} ${unit} está fuera del rango válido del modelo [${min}-${max}] ${unit}; el resultado es una extrapolación.`;
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
