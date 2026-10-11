import type { CitySize, Environment, PropagationInputs, PropagationModelId } from './types';

export type EnvironmentCategoryId =
  | 'urban-large'
  | 'urban-medium'
  | 'urban-macro-3gpp'
  | 'urban-micro-3gpp'
  | 'suburban'
  | 'rural'
  | 'street-geometry'
  | 'indoor-3gpp'
  | 'universal';

export interface EnvironmentCategory {
  /** Name and description live in the translation files under `environments.<id>.*`. */
  id: EnvironmentCategoryId;
  /**
   * Models applicable to this environment. May be empty (e.g. the
   * 3GPP-only environments) when no implemented model covers it yet --
   * the environment still shows up in the picker, just with nothing
   * selectable inside it, same "coming soon" treatment as an
   * unimplemented model.
   */
  applicableModelIds: PropagationModelId[];
  /** Pre-selected values for the shared citySize/environment/metropolitanCenter fields when this environment is chosen. */
  defaultOverrides?: Partial<Pick<PropagationInputs, 'citySize' | 'environment' | 'metropolitanCenter'>>;
}

const LARGE_CITY: CitySize = 'large';
const SMALL_MEDIUM_CITY: CitySize = 'small-medium';
const URBAN: Environment = 'urban';
const SUBURBAN: Environment = 'suburban';
const OPEN_RURAL: Environment = 'open-rural';

/**
 * Environment taxonomy approved by the project owner (2026-09-01),
 * grouping every environment/scenario named across docs/curso-referencia.md
 * §5.3-§5.10 by physical category rather than by literal model-specific
 * name. Ericsson 9999 and Lee are intentionally excluded (out of scope --
 * unresolved formula/constant discrepancies against literature, see
 * project history). 3GPP TR 38.901 environments are listed with an
 * empty `applicableModelIds` because that model isn't implemented yet
 * (deferred as its own work session).
 */
export const ENVIRONMENT_CATEGORIES: EnvironmentCategory[] = [
  {
    id: 'urban-large',
    applicableModelIds: ['hata', 'cost231-hata', 'ecc33', 'cost231-walfish-ikegami'],
    defaultOverrides: { citySize: LARGE_CITY, environment: URBAN, metropolitanCenter: true },
  },
  {
    id: 'urban-medium',
    applicableModelIds: ['hata', 'cost231-hata', 'ecc33', 'cost231-walfish-ikegami'],
    defaultOverrides: { citySize: SMALL_MEDIUM_CITY, environment: URBAN, metropolitanCenter: false },
  },
  {
    id: 'urban-macro-3gpp',
    applicableModelIds: [],
  },
  {
    id: 'urban-micro-3gpp',
    applicableModelIds: [],
  },
  {
    id: 'suburban',
    applicableModelIds: ['hata'],
    defaultOverrides: { environment: SUBURBAN },
  },
  {
    id: 'rural',
    applicableModelIds: ['hata'],
    defaultOverrides: { environment: OPEN_RURAL },
  },
  {
    id: 'street-geometry',
    applicableModelIds: ['ikegami', 'walfisch-bertoni', 'cost231-walfish-ikegami'],
  },
  {
    id: 'indoor-3gpp',
    applicableModelIds: [],
  },
  {
    id: 'universal',
    applicableModelIds: ['free-space'],
  },
];
