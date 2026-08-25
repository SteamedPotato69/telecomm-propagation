export type PropagationModelId =
  | 'free-space'
  | 'hata'
  | 'cost231-hata'
  | 'ecc33'
  | 'ikegami'
  | 'walfisch-bertoni';

/** Okumura-Hata / ECC-33 classify the coverage area by city size; this drives which correction branch is used. */
export type CitySize = 'small-medium' | 'large';

/** Only consumed by Hata: COST-231 uses `metropolitanCenter` instead, ECC-33 reuses `citySize`. */
export type Environment = 'urban' | 'suburban' | 'open-rural';

/**
 * Union of every parameter any supported model needs. Individual models
 * only read the subset relevant to their formula; unused fields are
 * ignored rather than validated, so the UI can expose one shared form.
 */
export interface PropagationInputs {
  frequencyMHz: number;
  distanceKm: number;
  baseStationHeightM: number;
  mobileHeightM: number;
  citySize: CitySize;
  environment: Environment;
  /** COST-231 Hata `Cm` term: 3 dB for dense metropolitan centers, 0 dB otherwise. */
  metropolitanCenter: boolean;
}

export interface PropagationWarning {
  field: keyof PropagationInputs;
  message: string;
}

export interface PropagationResult {
  pathLossDb: number;
  warnings: PropagationWarning[];
}

export interface PropagationModelDefinition {
  id: PropagationModelId;
  label: string;
  shortLabel: string;
  citation: string;
  /** false for models whose exact formula is still pending verification (see ikegami.ts / walfischBertoni.ts). */
  implemented: boolean;
  calculate: (inputs: PropagationInputs) => PropagationResult;
}
