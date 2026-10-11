export const fading = {
  fading: {
    title: 'Simulador de desvanecimiento',
    subtitle:
      'Dispersión de retardo, ancho de banda de coherencia, Doppler y tiempo de coherencia — ' +
      'docs/curso-referencia.md §8.',
    carrierFrequency: 'Frecuencia portadora',
    presets: {
      rural: 'Rural',
      suburban: 'Suburbano',
      urban: 'Urbano',
    },
    delaySpreadHelper: 'Regla práctica del curso: 1 µs ≈ 300 m de diferencia de recorrido.',
    speedHelper: 'v = 0 es un móvil estático: fd = 0, Tc → ∞ (canal invariante en el tiempo).',
    symbolHeading: 'Duración de símbolo',
    tsDirect: 'Ts directo',
    symbolRate: 'Tasa de símbolo (R)',
    symbolRateHelper: 'Se asume Ts = 1/R (1 símbolo por bit), igual que el ejemplo del curso (§8.8).',

    result: {
      bc: 'Ancho de banda de coherencia (Bc)',
      fd: 'Corrimiento Doppler (fd)',
      tc: 'Tiempo de coherencia (Tc)',
      frequencySelective: '⚠ Selectivo en frecuencia (FSF): BT > Bc.',
      frequencyFlat: '✓ Plano en frecuencia: BT < Bc.',
      timeSelective: '⚠ Selectivo en tiempo (TSF / fast fading): Ts > Tc.',
      timeFlat: '✓ Plano en tiempo / lento: Ts < Tc.',
      nyquistWarning:
        '⚠ BT·Ts < 1: el ancho de banda no alcanza para la tasa de símbolo pedida (zona rayada, ver gráfica).',
    },

    chart: {
      title: 'Zona de desvanecimiento (§8.7)',
      zoneName: 'Zona {{zone}}',
      zoneSummary: 'Zona {{zone}}: {{title}}',
    },

    /** The 5 zones of docs/curso-referencia.md §8.7; keys are `zone<FadingZone>`. */
    zones: {
      zone1: {
        title: 'Zona rayada',
        description:
          'No es posible la transmisión: el ancho de banda de la señal (BT) es insuficiente para la tasa de símbolo pedida (BT·Ts < 1).',
      },
      zone2: {
        title: 'Canal plano en frecuencia y en tiempo',
        description: 'No sufre ningún desvanecimiento selectivo: BT < Bc y Ts < Tc.',
      },
      zone3: {
        title: 'Canal plano en frecuencia, selectivo en tiempo',
        description: 'Desvanecimiento selectivo en tiempo (TSF / fast fading): BT < Bc y Ts > Tc.',
      },
      zone4: {
        title: 'Canal plano en el tiempo, selectivo en frecuencia',
        description: 'Desvanecimiento selectivo en frecuencia (FSF): BT > Bc y Ts < Tc.',
      },
      zone5: {
        title: 'Canal no plano',
        description: 'Sufre ambos tipos de desvanecimiento (selectivo en frecuencia y en tiempo): BT > Bc y Ts > Tc.',
      },
    },
  },
};
