import type { CitySize, Environment, PropagationInputs, PropagationModelId } from './types';

export interface EnvironmentCategory {
  id: string;
  label: string;
  description: string;
  /**
   * Models applicable to this environment. May be empty (e.g. the
   * 3GPP-only environments) when no implemented model covers it yet --
   * the environment still shows up in the picker, just with nothing
   * selectable inside it, same "próximamente" treatment as an
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
    label: 'Urbano — ciudad grande / centro metropolitano',
    description: 'Alta densidad de edificios altos, centros metropolitanos densos.',
    applicableModelIds: ['hata', 'cost231-hata', 'ecc33', 'cost231-walfish-ikegami'],
    defaultOverrides: { citySize: LARGE_CITY, environment: URBAN, metropolitanCenter: true },
  },
  {
    id: 'urban-medium',
    label: 'Urbano — ciudad media/pequeña',
    description: 'Densidad de edificación moderada, sin rascacielos dominantes.',
    applicableModelIds: ['hata', 'cost231-hata', 'ecc33', 'cost231-walfish-ikegami'],
    defaultOverrides: { citySize: SMALL_MEDIUM_CITY, environment: URBAN, metropolitanCenter: false },
  },
  {
    id: 'urban-macro-3gpp',
    label: 'Urbano Macro (3GPP UMa)',
    description: 'Macroceldas urbanas 3GPP TR 38.901. Pendiente: modelo aún no implementado.',
    applicableModelIds: [],
  },
  {
    id: 'urban-micro-3gpp',
    label: 'Urbano Micro / cañón de calle (3GPP UMi)',
    description: 'Microceldas urbanas 3GPP TR 38.901, geometría de cañón de calle. Pendiente: modelo aún no implementado.',
    applicableModelIds: [],
  },
  {
    id: 'suburban',
    label: 'Suburbano',
    description: 'Zonas residenciales de baja densidad, mezcla de árboles y casas.',
    applicableModelIds: ['hata'],
    defaultOverrides: { environment: SUBURBAN },
  },
  {
    id: 'rural',
    label: 'Rural / abierto',
    description: 'Espacio abierto sin obstáculos significativos.',
    applicableModelIds: ['hata'],
    defaultOverrides: { environment: OPEN_RURAL },
  },
  {
    id: 'street-geometry',
    label: 'Geometría de calle urbana (edificios y calles explícitos)',
    description: 'Cuando se conocen ancho de calle, altura de edificios y orientación -- no una categoría de ciudad, sino datos geométricos concretos del trayecto.',
    applicableModelIds: ['ikegami', 'walfisch-bertoni', 'cost231-walfish-ikegami'],
  },
  {
    id: 'indoor-3gpp',
    label: 'Interior (3GPP InH / InF)',
    description: 'Oficinas (InH) y entornos industriales (InF), 3GPP TR 38.901. Pendiente: modelo aún no implementado.',
    applicableModelIds: [],
  },
  {
    id: 'universal',
    label: 'Universal (sin entorno)',
    description: 'Cota teórica inferior, no depende de ningún tipo de entorno.',
    applicableModelIds: ['free-space'],
  },
];
