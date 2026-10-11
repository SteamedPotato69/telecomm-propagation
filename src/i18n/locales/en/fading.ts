import type { DeepStrings } from '../types';
import type { fading as esFading } from '../es/fading';

export const fading: DeepStrings<typeof esFading> = {
  fading: {
    title: 'Fading simulator',
    subtitle: 'Delay spread, coherence bandwidth, Doppler and coherence time — docs/curso-referencia.md §8.',
    carrierFrequency: 'Carrier frequency',
    presets: {
      rural: 'Rural',
      suburban: 'Suburban',
      urban: 'Urban',
    },
    delaySpreadHelper: 'Course rule of thumb: 1 µs ≈ 300 m of path difference.',
    speedHelper: 'v = 0 is a stationary mobile: fd = 0, Tc → ∞ (time-invariant channel).',
    symbolHeading: 'Symbol duration',
    tsDirect: 'Ts directly',
    symbolRate: 'Symbol rate (R)',
    symbolRateHelper: 'Ts = 1/R is assumed (1 symbol per bit), like the course example (§8.8).',

    result: {
      bc: 'Coherence bandwidth (Bc)',
      fd: 'Doppler shift (fd)',
      tc: 'Coherence time (Tc)',
      frequencySelective: '⚠ Frequency-selective (FSF): BT > Bc.',
      frequencyFlat: '✓ Frequency-flat: BT < Bc.',
      timeSelective: '⚠ Time-selective (TSF / fast fading): Ts > Tc.',
      timeFlat: '✓ Time-flat / slow: Ts < Tc.',
      nyquistWarning:
        '⚠ BT·Ts < 1: the bandwidth is not enough for the requested symbol rate (hatched zone, see chart).',
    },

    chart: {
      title: 'Fading zone (§8.7)',
      zoneName: 'Zone {{zone}}',
      zoneSummary: 'Zone {{zone}}: {{title}}',
    },

    zones: {
      zone1: {
        title: 'Hatched zone',
        description:
          'Transmission is not possible: the signal bandwidth (BT) is insufficient for the requested symbol rate (BT·Ts < 1).',
      },
      zone2: {
        title: 'Flat in frequency and in time',
        description: 'No selective fading at all: BT < Bc and Ts < Tc.',
      },
      zone3: {
        title: 'Flat in frequency, selective in time',
        description: 'Time-selective fading (TSF / fast fading): BT < Bc and Ts > Tc.',
      },
      zone4: {
        title: 'Flat in time, selective in frequency',
        description: 'Frequency-selective fading (FSF): BT > Bc and Ts < Tc.',
      },
      zone5: {
        title: 'Non-flat channel',
        description: 'Suffers both kinds of fading (frequency- and time-selective): BT > Bc and Ts > Tc.',
      },
    },
  },
};
