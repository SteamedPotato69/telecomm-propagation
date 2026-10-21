import { LocalizedError } from '../../utils/localizedMessage';
import { assertInRange, assertInteger, assertNonNegative, assertPositive } from '../../utils/validation';
import { isValidRhombicNumber } from '../geometry';

/**
 * Frequency plan: how many channels a cell gets from the operator's
 * spectrum (docs/curso-referencia.md §13.3, diap. 44-46). Until now the
 * dimensioning flow took "59 channels per cell" as an already-computed
 * input; this is the step that produces it, as the course does by hand.
 */
export interface FrequencyPlanResult {
  /** Channels (1G) or traffic channels (2G) in the whole band. */
  totalChannels: number;
  /** K: channels available per cell -- the input Erlang B needs. */
  channelsPerCell: number;
  /** 2G only: carriers in the band, floor(BW / carrier width). */
  carriers?: number;
  /** 2G only: transceivers (carriers) per cell, floor(carriers / N). */
  transceiversPerCell?: number;
}

/** Epsilon so an exact quotient (e.g. 8000 kHz / 200 kHz) is never floored to one less by float noise. */
const EPSILON = 1e-9;

function assertValidClusterSize(clusterSize: number): void {
  if (!isValidRhombicNumber(clusterSize)) {
    throw new LocalizedError('errors.invalidClusterSize', { n: clusterSize });
  }
}

export interface AnalogFrequencyPlanInputs {
  bandwidthMHz: number;
  channelWidthKHz: number;
  clusterSize: number;
  /**
   * Channels reserved for signalling. The course does NOT subtract any
   * (diap. 44-45 divide all 416 channels by N), so the default is 0.
   * Real AMPS reserves 21 per operator [contexto de industria] -- exposed so
   * the difference can be shown, never applied silently.
   */
  controlChannels?: number;
}

/**
 * 1G (AMPS, FDMA): #channels = floor(BW / channel width); per cell =
 * floor((#channels - control) / N).
 *   12.5 MHz / 30 kHz = 416.67 -> 416 channels; 416 / 7 = 59.43 -> 59 per cell
 * (diap. 44-45).
 */
export function calculateAnalogFrequencyPlan(inputs: AnalogFrequencyPlanInputs): FrequencyPlanResult {
  const { bandwidthMHz, channelWidthKHz, clusterSize, controlChannels = 0 } = inputs;

  assertPositive(bandwidthMHz, 'bandwidth');
  assertPositive(channelWidthKHz, 'channelWidth');
  assertValidClusterSize(clusterSize);
  assertNonNegative(controlChannels, 'controlChannels');
  assertInteger(controlChannels, 'controlChannels');

  const totalChannels = Math.floor((bandwidthMHz * 1000) / channelWidthKHz + EPSILON);
  const channelsPerCell = Math.floor((totalChannels - controlChannels) / clusterSize + EPSILON);
  if (channelsPerCell < 1) {
    throw new LocalizedError('errors.noChannelsPerCell', { n: clusterSize });
  }
  return { totalChannels, channelsPerCell };
}

export interface DigitalFrequencyPlanInputs {
  bandwidthMHz: number;
  /** GSM carrier spacing, kHz (diap. 40: 200 kHz). */
  carrierWidthKHz: number;
  clusterSize: number;
  /**
   * Traffic channels per carrier. The course uses 7 (diap. 46: "10 TRX x 7
   * IT"): a GSM carrier has 8 time slots and one is assumed to carry control.
   */
  tchPerCarrier: number;
}

/**
 * 2G (GSM, TDMA): carriers = floor(BW / 200 kHz); transceivers per cell =
 * floor(carriers / N); TCH per cell = TRX * tchPerCarrier.
 *   8 MHz / 200 kHz = 40 carriers; 40 / 4 = 10 TRX; 10 x 7 = 70 TCH (diap. 46)
 */
export function calculateDigitalFrequencyPlan(inputs: DigitalFrequencyPlanInputs): FrequencyPlanResult {
  const { bandwidthMHz, carrierWidthKHz, clusterSize, tchPerCarrier } = inputs;

  assertPositive(bandwidthMHz, 'bandwidth');
  assertPositive(carrierWidthKHz, 'channelWidth');
  assertValidClusterSize(clusterSize);
  assertInteger(tchPerCarrier, 'tchPerCarrier');
  assertInRange(tchPerCarrier, 1, 8, 'tchPerCarrier');

  const carriers = Math.floor((bandwidthMHz * 1000) / carrierWidthKHz + EPSILON);
  const transceiversPerCell = Math.floor(carriers / clusterSize + EPSILON);
  if (transceiversPerCell < 1) {
    throw new LocalizedError('errors.noChannelsPerCell', { n: clusterSize });
  }
  return {
    totalChannels: carriers * tchPerCarrier,
    channelsPerCell: transceiversPerCell * tchPerCarrier,
    carriers,
    transceiversPerCell,
  };
}
