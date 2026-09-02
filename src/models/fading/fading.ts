import { assertNonNegative, assertPositive } from '../../utils/validation';
import type { FadingInputs, FadingResult, FadingZone } from './types';

/** Speed of light, m/s -- course's own value (docs/curso-referencia.md §8.4), not a higher-precision constant. */
const SPEED_OF_LIGHT_M_S = 3e8;

/**
 * Determines which of the 5 zones (§8.7) the operating point falls in.
 *
 * Zones 2-5 follow directly from the two inequalities named in the
 * source text (BT vs Bc, Ts vs Tc). Zone 1 ("zona rayada: no es posible
 * la transmisión") is named in §8.7 but its defining inequality lives in
 * a diagram that didn't survive text extraction -- [interpretación no
 * verificada]: this implementation flags it as BT·Ts < 1 (the signal's
 * own bandwidth too narrow for its claimed symbol rate), restricted to
 * the flat/flat quadrant (BT < Bc and Ts < Tc).
 *
 * That restriction is deliberate, not incidental: an earlier version
 * applied BT·Ts < 1 unconditionally and it misclassified the course's
 * own GSM worked example (§8.8: BW=200kHz, Tb=3.7µs -> BT·Ts = 0.74 < 1)
 * as zone 1, when the course states GSM lands in zone 4
 * (frequency-selective). That's not a fluke -- occupied bandwidth below
 * the raw symbol rate is routine for spectrally-efficient modulations
 * (GMSK included), not evidence transmission is impossible. Confining
 * the Nyquist check to the flat/flat quadrant keeps the one case it was
 * meant to catch (a signal claimed flat in both dimensions whose own
 * bandwidth still can't carry its symbol rate) without overriding a
 * quadrant the sourced BT-vs-Bc/Ts-vs-Tc comparison already resolves.
 */
function classifyZone(nyquistViolated: boolean, frequencySelective: boolean, timeSelective: boolean): FadingZone {
  if (!frequencySelective && !timeSelective) {
    return nyquistViolated ? 1 : 2;
  }
  if (!frequencySelective && timeSelective) return 3;
  if (frequencySelective && !timeSelective) return 4;
  return 5;
}

/**
 * Core fading-simulator computation (docs/curso-referencia.md §8,
 * "Canales multitrayecto (caracterización en banda ancha)").
 *
 * - Bc ≈ 1/(2π·D)      §8.3, D the delay spread
 * - fd = f0·(v/c)      §8.4, Doppler shift
 * - Tc ≈ 9/(16π·fd)    §8.4, coherence time
 * - BT vs Bc, Ts vs Tc classify flat/selective in frequency and slow/fast
 *   in time, and together the 5 zones of §8.7 -- see classifyZone above.
 */
export function calculateFading(inputs: FadingInputs): FadingResult {
  const { frequencyMHz, delaySpreadUs, speedKmh, bandwidthKHz, symbolDurationUs } = inputs;

  assertPositive(frequencyMHz, 'Frecuencia portadora');
  assertPositive(delaySpreadUs, 'Dispersión de retardo (D)');
  assertNonNegative(speedKmh, 'Velocidad del móvil');
  assertPositive(bandwidthKHz, 'Ancho de banda de la señal (BT)');
  assertPositive(symbolDurationUs, 'Duración de símbolo (Ts)');

  const delaySpreadS = delaySpreadUs * 1e-6;
  const coherenceBandwidthHz = 1 / (2 * Math.PI * delaySpreadS);

  const f0Hz = frequencyMHz * 1e6;
  const speedMS = speedKmh / 3.6;
  const dopplerShiftHz = f0Hz * (speedMS / SPEED_OF_LIGHT_M_S);

  // fd = 0 (stationary mobile) would divide by zero in the Tc formula; a
  // motionless channel is the limiting case of infinite coherence time
  // (never time-selective), not an error.
  const coherenceTimeS = dopplerShiftHz === 0 ? Infinity : 9 / (16 * Math.PI * dopplerShiftHz);

  const bandwidthHz = bandwidthKHz * 1000;
  const symbolDurationS = symbolDurationUs * 1e-6;

  const frequencySelective = bandwidthHz > coherenceBandwidthHz;
  const timeSelective = symbolDurationS > coherenceTimeS;
  const nyquistViolated = bandwidthHz * symbolDurationS < 1;

  const zone = classifyZone(nyquistViolated, frequencySelective, timeSelective);

  return {
    coherenceBandwidthHz,
    dopplerShiftHz,
    coherenceTimeS,
    frequencySelective,
    timeSelective,
    nyquistViolated,
    zone,
    bandwidthRatio: bandwidthHz / coherenceBandwidthHz,
    // symbolDurationS / Infinity naturally evaluates to 0 (stationary mobile) -- no special-case needed.
    symbolRatio: symbolDurationS / coherenceTimeS,
  };
}
