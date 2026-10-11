import type { GeometryFieldKey } from '../models/propagation';

export interface GeometryFieldConfig {
  unit?: string;
  /** Matches the worked exercise in docs/curso-referencia.md §5.2 so fields aren't blank by default. */
  defaultValue: string;
}

/**
 * UI metadata (unit/default) for every optional geometry
 * field a model can declare via `PropagationModelDefinition.extraFields`.
 * Lives in the screens layer, not models/, since it's presentation
 * concern -- the models layer only knows the field exists and what it
 * means physically. Each field's label and helper text are the translations
 * under `geometryFields.<key>` (an empty helper means "none").
 */
export const GEOMETRY_FIELD_CONFIG: Record<GeometryFieldKey, GeometryFieldConfig> = {
  streetWidthM: { unit: 'm', defaultValue: '20' },
  diffractingBuildingHeightM: { unit: 'm', defaultValue: '12' },
  streetOrientationDeg: { unit: '°', defaultValue: '30' },
  facadeReflectionLr: { defaultValue: '3.2' },
  baseStationHeightAboveRoofM: { unit: 'm', defaultValue: '28' },
  averageBuildingHeightM: { unit: 'm', defaultValue: '12' },
  buildingSeparationM: { unit: 'm', defaultValue: '50' },
};
