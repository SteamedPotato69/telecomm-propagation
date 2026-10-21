import type { LocalizedMessage } from '../../utils/localizedMessage';

export type PropagationModelId =
  | 'free-space'
  | 'hata'
  | 'cost231-hata'
  | 'ecc33'
  | 'ikegami'
  | 'walfisch-bertoni'
  | 'cost231-walfish-ikegami';

/** Okumura-Hata / ECC-33 classify the coverage area by city size; this drives which correction branch is used. */
export type CitySize = 'small-medium' | 'large';

/** Only consumed by Hata: COST-231 uses `metropolitanCenter` instead, ECC-33 reuses `citySize`. */
export type Environment = 'urban' | 'suburban' | 'open-rural';

/**
 * Union of every parameter any supported model needs. Individual models
 * only read the subset relevant to their formula; unused fields are
 * ignored rather than validated, so the UI can expose one shared form.
 *
 * The original four models (free-space, Hata, COST-231, ECC-33) share
 * one antenna-height/environment vocabulary, so their fields are
 * required -- every model reads a value from every field even if it
 * ignores some of them. Ikegami and Walfisch-Bertoni need street/
 * building geometry the other four have no use for at all, so those
 * fields are optional here; each model validates its own required
 * subset at the top of its `calculate()` (see requireField in
 * utils/validation.ts) instead of forcing every caller -- including
 * the four models that will never touch these fields -- to supply
 * meaningless values.
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

  // --- Ikegami only (docs/curso-referencia.md §5.6) ---
  /** W: street width at the receiver, in meters. */
  streetWidthM?: number;
  /**
   * H: height of the building where diffraction occurs, in meters.
   * Named distinctly from Walfisch-Bertoni's own "H" below -- the
   * course source reuses the letter H for two different physical
   * quantities across §5.6 and §5.7; this codebase does not.
   */
  diffractingBuildingHeightM?: number;
  /** Φ: angle between the incident ray and the street direction, in degrees. Must not be 0° or 180° (sin(Φ) would be 0). */
  streetOrientationDeg?: number;
  /** lr: facade reflection parameter. Course gives typical values of 2 (VHF) and 3.2 (UHF). */
  facadeReflectionLr?: number;

  // --- Walfisch-Bertoni only (docs/curso-referencia.md §5.7) ---
  /**
   * H: transmitter antenna height *above* nearby rooftops, in meters
   * (not its absolute height above ground). The course wording
   * ("altura antena Tx sobre edificios próximos") is ambiguous between
   * an absolute height and a height-above-roofline reading; this is
   * modeled as the latter and taken as a direct input rather than
   * auto-derived from `baseStationHeightM` minus a building height, to
   * avoid silently picking a subtraction the source doesn't spell out.
   * See the comment in walfischBertoni.ts for the full reasoning.
   */
  baseStationHeightAboveRoofM?: number;
  /** hR: average building height along the path, in meters. */
  averageBuildingHeightM?: number;
  /** b: spacing between building rows, in meters. */
  buildingSeparationM?: number;
}

export interface PropagationWarning {
  field: keyof PropagationInputs;
  /** Structured, language-neutral -- the UI translates it (see utils/localizedMessage.ts). */
  message: LocalizedMessage;
}

export interface PropagationResult {
  pathLossDb: number;
  warnings: PropagationWarning[];
}

/** The optional geometry fields a model can require -- see PropagationInputs. */
export type GeometryFieldKey =
  | 'streetWidthM'
  | 'diffractingBuildingHeightM'
  | 'streetOrientationDeg'
  | 'facadeReflectionLr'
  | 'baseStationHeightAboveRoofM'
  | 'averageBuildingHeightM'
  | 'buildingSeparationM';

export interface PropagationModelDefinition {
  /**
   * Display name, short name and citation live in the translation files
   * under `models.<id>.*` -- this module stays language-free.
   */
  id: PropagationModelId;
  /** false for models whose exact formula is still pending verification (see ikegami.ts / walfischBertoni.ts). */
  implemented: boolean;
  /**
   * Documented empirical frequency range, MHz [min, max] -- the same constant the
   * model's own out-of-range warning uses, exposed as data so a caller can pick the
   * model whose range fits (see modelSelection.ts). Absent when the course documents no
   * numeric frequency range (free space, Ikegami, COST-231 Walfish-Ikegami).
   */
  frequencyRangeMHz?: readonly [number, number];
  /**
   * Which optional geometry fields this model reads. Drives which
   * extra NumericFields the calculator screen renders for the
   * currently selected model -- adding a model that needs a subset of
   * these fields means listing them here, not adding a new
   * model-specific JSX block.
   */
  extraFields?: GeometryFieldKey[];
  calculate: (inputs: PropagationInputs) => PropagationResult;
  /**
   * Inverts calculate() for distance given a target path loss (a link
   * budget's MAPL) -- only defined for models linear in log10(d), where
   * that's closed-form algebra rather than a search. Absent, not `false`,
   * for every other model: LinkBudgetScreen filters
   * `PROPAGATION_MODEL_LIST` on this field's presence, so the registry
   * itself is the single source of truth for which models are invertible
   * instead of a hardcoded exclusion list.
   */
  solveDistanceKm?: (inputs: Omit<PropagationInputs, 'distanceKm'>, targetLossDb: number) => number;
}

/**
 * Link budget for the cellular-planning link-budget/dimensioning
 * features (docs/curso-referencia.md §13.3, diap. 45-46). The course
 * slides show the parameter table and the resulting MAPL but not the
 * intermediate combination formula -- see linkBudget.ts for the standard
 * telecom formula used here and how closely it reproduces the two worked
 * examples.
 */
export interface LinkBudgetInputs {
  /** Pt: mobile transmit power, dBm. */
  transmitPowerDbm: number;
  /** Gt: mobile antenna gain, dBi. */
  transmitAntennaGainDbi: number;
  /** Loss from the body/hand blocking the mobile antenna, dB. */
  bodyLossDb: number;
  /** Gr: base-station antenna gain, dBi. */
  receiveAntennaGainDbi: number;
  /** Loss in the feeder cable between the BTS antenna and receiver, dB. */
  feederLossDb: number;
  /** Base-station receiver sensitivity, dBm (negative, e.g. -116). */
  receiverSensitivityDbm: number;
  /** Fade margin against shadowing, dB. */
  shadowFadingMarginDb: number;
  /** Margin reserved for co-channel/adjacent-channel interference, dB. */
  interferenceMarginDb: number;
}

export interface LinkBudgetResult {
  /** Effective isotropic radiated power = Pt + Gt - bodyLoss, dBm. */
  eirpDbm: number;
  /** Maximum allowable path loss, dB. */
  maplDb: number;
}
