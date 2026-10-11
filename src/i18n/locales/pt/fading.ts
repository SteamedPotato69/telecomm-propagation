import type { DeepStrings } from '../types';
import type { fading as esFading } from '../es/fading';

export const fading: DeepStrings<typeof esFading> = {
  fading: {
    title: 'Simulador de desvanecimento',
    subtitle:
      'Dispersão de atraso, largura de banda de coerência, Doppler e tempo de coerência — ' +
      'docs/curso-referencia.md §8.',
    carrierFrequency: 'Frequência da portadora',
    presets: {
      rural: 'Rural',
      suburban: 'Suburbano',
      urban: 'Urbano',
    },
    delaySpreadHelper: 'Regra prática do curso: 1 µs ≈ 300 m de diferença de percurso.',
    speedHelper: 'v = 0 é um móvel estático: fd = 0, Tc → ∞ (canal invariante no tempo).',
    symbolHeading: 'Duração do símbolo',
    tsDirect: 'Ts direto',
    symbolRate: 'Taxa de símbolo (R)',
    symbolRateHelper: 'Assume-se Ts = 1/R (1 símbolo por bit), como no exemplo do curso (§8.8).',

    result: {
      bc: 'Largura de banda de coerência (Bc)',
      fd: 'Deslocamento Doppler (fd)',
      tc: 'Tempo de coerência (Tc)',
      frequencySelective: '⚠ Seletivo em frequência (FSF): BT > Bc.',
      frequencyFlat: '✓ Plano em frequência: BT < Bc.',
      timeSelective: '⚠ Seletivo no tempo (TSF / fast fading): Ts > Tc.',
      timeFlat: '✓ Plano no tempo / lento: Ts < Tc.',
      nyquistWarning:
        '⚠ BT·Ts < 1: a largura de banda não é suficiente para a taxa de símbolo pedida (zona hachurada, veja o gráfico).',
    },

    chart: {
      title: 'Zona de desvanecimento (§8.7)',
      zoneName: 'Zona {{zone}}',
      zoneSummary: 'Zona {{zone}}: {{title}}',
    },

    zones: {
      zone1: {
        title: 'Zona hachurada',
        description:
          'A transmissão não é possível: a largura de banda do sinal (BT) é insuficiente para a taxa de símbolo pedida (BT·Ts < 1).',
      },
      zone2: {
        title: 'Canal plano em frequência e no tempo',
        description: 'Não sofre nenhum desvanecimento seletivo: BT < Bc e Ts < Tc.',
      },
      zone3: {
        title: 'Canal plano em frequência, seletivo no tempo',
        description: 'Desvanecimento seletivo no tempo (TSF / fast fading): BT < Bc e Ts > Tc.',
      },
      zone4: {
        title: 'Canal plano no tempo, seletivo em frequência',
        description: 'Desvanecimento seletivo em frequência (FSF): BT > Bc e Ts < Tc.',
      },
      zone5: {
        title: 'Canal não plano',
        description: 'Sofre os dois tipos de desvanecimento (seletivo em frequência e no tempo): BT > Bc e Ts > Tc.',
      },
    },
  },
};
