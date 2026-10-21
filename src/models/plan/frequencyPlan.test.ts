import { describe, expect, it } from 'vitest';
import { LocalizedError } from '../../utils/localizedMessage';
import { calculateAnalogFrequencyPlan, calculateDigitalFrequencyPlan } from './frequencyPlan';

describe('calculateAnalogFrequencyPlan (1G, diap. 44-45)', () => {
  it('12.5 MHz / 30 kHz = 416 channels; 416 / N=7 = 59 per cell (course example)', () => {
    expect(calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 7 })).toEqual({
      totalChannels: 416,
      channelsPerCell: 59,
    });
  });

  it('control channels are NOT subtracted by default (the course does not), but can be: (416-21)/7 -> 56', () => {
    // 21 is the real AMPS control-channel count [contexto de industria]; the
    // 56 vs 59 gap is the "two correct answers in front of the professor" risk
    // that is why the default stays at the course's 0.
    const withControl = calculateAnalogFrequencyPlan({
      bandwidthMHz: 12.5,
      channelWidthKHz: 30,
      clusterSize: 7,
      controlChannels: 21,
    });
    expect(withControl.totalChannels).toBe(416);
    expect(withControl.channelsPerCell).toBe(56);
  });

  it('a larger cluster leaves fewer channels per cell', () => {
    const n4 = calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 4 });
    const n12 = calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 12 });
    expect(n4.channelsPerCell).toBe(104);
    expect(n12.channelsPerCell).toBe(34);
  });

  it('rejects an invalid cluster size, non-positive spectrum, and fractional control channels', () => {
    expect(() => calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 5 })).toThrow(LocalizedError);
    expect(() => calculateAnalogFrequencyPlan({ bandwidthMHz: 0, channelWidthKHz: 30, clusterSize: 7 })).toThrow();
    expect(() => calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: -30, clusterSize: 7 })).toThrow();
    expect(() =>
      calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 7, controlChannels: 2.5 })
    ).toThrow();
  });

  it('throws errors.noChannelsPerCell when the spectrum cannot feed every cell of the cluster', () => {
    const run = () => calculateAnalogFrequencyPlan({ bandwidthMHz: 0.1, channelWidthKHz: 30, clusterSize: 7 });
    expect(run).toThrow(LocalizedError);
    try {
      run();
    } catch (error) {
      expect((error as LocalizedError).key).toBe('errors.noChannelsPerCell');
    }
    // control channels eating the whole band
    expect(() =>
      calculateAnalogFrequencyPlan({ bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 7, controlChannels: 416 })
    ).toThrow(LocalizedError);
  });
});

describe('calculateDigitalFrequencyPlan (2G, diap. 46)', () => {
  it('8 MHz / 200 kHz = 40 carriers; N=4 -> 10 TRX; 10 x 7 = 70 TCH per cell (course example)', () => {
    expect(
      calculateDigitalFrequencyPlan({ bandwidthMHz: 8, carrierWidthKHz: 200, clusterSize: 4, tchPerCarrier: 7 })
    ).toEqual({ totalChannels: 280, channelsPerCell: 70, carriers: 40, transceiversPerCell: 10 });
  });

  it('8 time slots per carrier (no control slot) gives 80 TCH per cell', () => {
    const result = calculateDigitalFrequencyPlan({ bandwidthMHz: 8, carrierWidthKHz: 200, clusterSize: 4, tchPerCarrier: 8 });
    expect(result.channelsPerCell).toBe(80);
  });

  it('floors carriers per cell: 40 carriers over N=3 -> 13 TRX (not 13.33)', () => {
    const result = calculateDigitalFrequencyPlan({ bandwidthMHz: 8, carrierWidthKHz: 200, clusterSize: 3, tchPerCarrier: 7 });
    expect(result.transceiversPerCell).toBe(13);
    expect(result.channelsPerCell).toBe(91);
  });

  it('rejects tchPerCarrier outside 1-8, fractional, or an invalid cluster size', () => {
    const base = { bandwidthMHz: 8, carrierWidthKHz: 200, clusterSize: 4, tchPerCarrier: 7 };
    expect(() => calculateDigitalFrequencyPlan({ ...base, tchPerCarrier: 0 })).toThrow();
    expect(() => calculateDigitalFrequencyPlan({ ...base, tchPerCarrier: 9 })).toThrow();
    expect(() => calculateDigitalFrequencyPlan({ ...base, tchPerCarrier: 6.5 })).toThrow();
    expect(() => calculateDigitalFrequencyPlan({ ...base, clusterSize: 5 })).toThrow(LocalizedError);
  });

  it('throws when fewer carriers than cells in the cluster', () => {
    expect(() =>
      calculateDigitalFrequencyPlan({ bandwidthMHz: 0.6, carrierWidthKHz: 200, clusterSize: 4, tchPerCarrier: 7 })
    ).toThrow(LocalizedError);
  });
});
