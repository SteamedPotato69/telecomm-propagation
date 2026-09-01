/**
 * Types for the fading simulator (docs/curso-referencia.md §8, "Canales
 * multitrayecto (caracterización en banda ancha)"). Mirrors the shape of
 * models/propagation/types.ts (typed Inputs/Result, pure calculate()) but
 * is a separate module: this is a different physical model (multipath
 * time/frequency dispersion, not path loss) with its own vocabulary, and
 * mixing the two PropagationInputs unions would force every path-loss
 * model to carry fields it never reads.
 */
export interface FadingInputs {
  /** f0: carrier frequency, MHz. */
  frequencyMHz: number;
  /** D: delay spread, µs (§8.3/§8.6). */
  delaySpreadUs: number;
  /** v: mobile speed, km/h -- drives the Doppler shift (§8.4). */
  speedKmh: number;
  /** BT: signal (occupied) bandwidth, kHz. */
  bandwidthKHz: number;
  /** Ts: symbol duration, µs. */
  symbolDurationUs: number;
}

/** The 5 zones of the BT-vs-Bc / Ts-vs-Tc plane, §8.7. */
export type FadingZone = 1 | 2 | 3 | 4 | 5;

export interface FadingResult {
  /** Bc ≈ 1/(2π·D), in Hz. */
  coherenceBandwidthHz: number;
  /** fd = f0·(v/c), in Hz. */
  dopplerShiftHz: number;
  /** Tc ≈ 9/(16π·fd), in seconds. +Infinity when v = 0 (fd = 0 -- channel is time-invariant). */
  coherenceTimeS: number;
  /** BT > Bc → frequency-selective fading (FSF); false → flat in frequency. */
  frequencySelective: boolean;
  /** Ts > Tc → time-selective fading (TSF, "fast fading"); false → slow/non-time-selective. */
  timeSelective: boolean;
  /**
   * BT·Ts < 1: the signal's own bandwidth can't support the claimed
   * symbol rate (Nyquist). Only promotes the classification to zone 1
   * when the channel is otherwise flat in both frequency and time --
   * see classifyZone() in fading.ts for why (an unconditional check
   * misclassifies the course's own GSM worked example, §8.8).
   */
  nyquistViolated: boolean;
  zone: FadingZone;
  /** BT/Bc, dimensionless -- x-axis of the zone chart (log scale). */
  bandwidthRatio: number;
  /** Ts/Tc, dimensionless -- y-axis of the zone chart (log scale). 0 when Tc = Infinity. */
  symbolRatio: number;
}
