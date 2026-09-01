import type { GeometryFieldKey } from '../models/propagation';

export interface GeometryFieldConfig {
  label: string;
  unit?: string;
  helperText?: string;
  /** Matches the worked exercise in docs/curso-referencia.md §5.2 so fields aren't blank by default. */
  defaultValue: string;
}

/**
 * UI metadata (label/unit/helper/default) for every optional geometry
 * field a model can declare via `PropagationModelDefinition.extraFields`.
 * Lives in the screens layer, not models/, since it's presentation
 * concern -- the models layer only knows the field exists and what it
 * means physically.
 */
export const GEOMETRY_FIELD_CONFIG: Record<GeometryFieldKey, GeometryFieldConfig> = {
  streetWidthM: { label: 'Ancho de calle (W)', unit: 'm', defaultValue: '20' },
  diffractingBuildingHeightM: {
    label: 'Altura del edificio de difracción (H)',
    unit: 'm',
    helperText: 'Debe ser mayor que la altura del móvil de arriba.',
    defaultValue: '12',
  },
  streetOrientationDeg: {
    label: 'Orientación de calle (Φ)',
    unit: '°',
    helperText: 'Ángulo entre el rayo incidente y la calle. El rango válido depende del modelo elegido.',
    defaultValue: '30',
  },
  facadeReflectionLr: {
    label: 'Reflexión de fachada (lr)',
    helperText: 'Típico: 2 en VHF, 3.2 en UHF.',
    defaultValue: '3.2',
  },
  baseStationHeightAboveRoofM: {
    label: 'Altura de estación base sobre tejados (H)',
    unit: 'm',
    helperText: 'Altura de la antena SOBRE el nivel de los tejados cercanos, no su altura absoluta.',
    defaultValue: '28',
  },
  averageBuildingHeightM: {
    label: 'Altura media de edificios (hR)',
    unit: 'm',
    helperText: 'Debe ser mayor que la altura del móvil de arriba.',
    defaultValue: '12',
  },
  buildingSeparationM: { label: 'Separación entre edificios (b)', unit: 'm', defaultValue: '50' },
};
