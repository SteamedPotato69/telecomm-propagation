/**
 * Spanish is the source of truth: en/ and pt/ are typed against this shape
 * (see ../types.ts), so a key missing in either fails `tsc`.
 */
export const core = {
  common: {
    back: 'Volver',
    comingSoon: 'Próximamente',
    soon: 'próximamente',
    missingValues: 'Todos los campos numéricos deben tener un valor.',
  },

  results: {
    pathLoss: 'Pérdida de propagación',
  },

  home: {
    chooseFeature: 'Por favor, elige una funcionalidad',
    settings: 'Ajustes',
    cards: {
      empirical: {
        title: 'Métodos empíricos de propagación',
        subtitle: 'Calculadora de pérdida de trayecto: elige un entorno y compara los modelos aplicables.',
      },
      fading: {
        title: 'Simulador de desvanecimiento',
        subtitle:
          'Plano vs. selectivo en frecuencia, lento vs. rápido: ingresa dispersión de retardo, velocidad y ' +
          'parámetros de la señal y ubica el canal en las 5 zonas del curso.',
      },
      cellular: {
        title: 'Planificación celular',
        subtitle:
          'Geometría de reutilización de frecuencias, dimensionamiento por tráfico (Erlang B), link budget y ' +
          'carga UMTS.',
      },
    },
  },

  settings: {
    title: 'Ajustes',
    theme: {
      title: 'Tema',
      dark: 'Oscuro',
      system: 'Auto',
      light: 'Claro',
    },
    language: {
      title: 'Idioma',
      system: 'Automático (idioma del dispositivo)',
      hint: 'Tu elección se recuerda en este dispositivo.',
    },
  },

  errors: {
    unknown: 'Error desconocido.',
    mustBePositive: '{{field}} debe ser un número mayor que 0.',
    mustBeNonNegative: '{{field}} debe ser un número mayor o igual que 0.',
    mustBeUnitInterval: '{{field}} debe ser un número estrictamente entre 0 y 1.',
    mustBeInteger: '{{field}} debe ser un número entero.',
    missingParameter: 'Falta el parámetro "{{field}}", requerido por el modelo {{model}}.',
    diffractingBuildingBelowMobile:
      'La altura del edificio de difracción (H) debe ser mayor que la altura del móvil (hr): sin eso, la ' +
      'difracción sobre el tejado no tiene sentido físico y log10(H - hr) queda indefinido.',
    streetOrientationSinZero:
      'El ángulo de orientación de calle (Φ) no puede ser 0° o 180°: produce log10(sen Φ) indefinido (sen Φ = 0).',
    streetOrientationRange:
      'El ángulo de orientación de calle (Φ) debe estar entre 0° y 90° para este modelo: la fórmula de Lori ' +
      'no tiene una rama definida fuera de ese rango.',
    averageBuildingBelowMobile:
      'La altura media de edificios (hR) debe ser mayor que la altura del móvil (hm): ΔhR = hR - hm debe ser ' +
      'positivo para que el cálculo tenga sentido físico.',
    maplNonPositive:
      'El presupuesto de enlace no deja margen (MAPL <= 0 dB): revisa potencia, ganancias, sensibilidad y márgenes.',
    invalidClusterSize:
      'El tamaño de agrupación N={{n}} no es geométricamente válido: debe ser expresable como i²+ij+j² para ' +
      'enteros i,j >= 0 (por ejemplo 1, 3, 4, 7, 9, 12, 13...).',
    gosUnreachable: 'No se alcanzó el GoS objetivo con un número razonable de canales.',
    invalidDamping: 'El factor de amortiguación debe estar entre 0 (exclusivo) y 1 (inclusivo).',
    referenceServiceNotFound: 'No se encontró el servicio de referencia "{{service}}" entre los servicios dados.',
  },

  warnings: {
    outOfRange:
      '{{field}} = {{value}} {{unit}} está fuera del rango válido del modelo [{{min}}-{{max}}] {{unit}}; ' +
      'el resultado es una extrapolación.',
  },

  /** Field names used inside error/warning messages (the `field` parameter). */
  fields: {
    frequency: 'Frecuencia',
    distance: 'Distancia',
    baseStationHeight: 'Altura de estación base',
    baseStationHeightAboveRoof: 'Altura de estación base sobre tejados (H)',
    mobileHeight: 'Altura del móvil',
    streetWidth: 'Ancho de calle (W)',
    diffractingBuildingHeight: 'Altura del edificio de difracción (H)',
    streetOrientation: 'Ángulo de orientación de calle (Φ)',
    facadeReflection: 'Parámetro de reflexión de fachada (lr)',
    averageBuildingHeight: 'Altura media de edificios (hR)',
    buildingSeparation: 'Separación entre edificios (b)',
    bodyLoss: 'Pérdida por el cuerpo (body loss)',
    feederLoss: 'Pérdida de feeder',
    shadowFadingMargin: 'Margen de sombra',
    interferenceMargin: 'Margen de interferencia',
    cellRadius: 'Radio de celda (R)',
    totalCoverageArea: 'Área total a cubrir (S_T)',
    channels: 'Número de canales (K)',
    offeredTraffic: 'Tráfico ofrecido (A)',
    targetGos: 'GoS objetivo',
    trafficDensity: 'Densidad de tráfico (ρ)',
    totalTraffic: 'Tráfico total',
    delaySpread: 'Dispersión de retardo (D)',
    mobileSpeed: 'Velocidad del móvil',
    signalBandwidth: 'Ancho de banda de la señal (BT)',
    symbolDuration: 'Duración de símbolo (Ts)',
    serviceBitRate: 'Tasa de bits ({{service}})',
    serviceActivityFactor: 'Factor de actividad ({{service}})',
    chipRate: 'Chip rate (W)',
    targetLoad: 'Carga objetivo (η)',
    totalUsers: 'Usuarios totales',
    totalArea: 'Área total',
    averageErlangPerUser: 'Erlang promedio por usuario',
    interferenceFactor: 'Factor de interferencia (i_oc)',
  },
};
