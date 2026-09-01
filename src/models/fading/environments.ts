/**
 * Delay-spread presets by environment, docs/curso-referencia.md §8.6
 * ("Tablas de valores típicos"). Bc column in the source table is shown
 * only as a cross-check that it's internally consistent with
 * Bc ≈ 1/(2π·D) (it is, to within rounding) -- the app always derives Bc
 * from D through calculateFading() rather than hardcoding the table's Bc
 * column, so there's a single source of truth for the formula.
 */
export interface DelaySpreadPreset {
  id: 'rural' | 'suburban' | 'urban';
  label: string;
  delaySpreadUs: number;
}

export const DELAY_SPREAD_PRESETS: DelaySpreadPreset[] = [
  { id: 'rural', label: 'Rural', delaySpreadUs: 0.2 },
  { id: 'suburban', label: 'Suburbano', delaySpreadUs: 0.5 },
  { id: 'urban', label: 'Urbano', delaySpreadUs: 3 },
];
