export const propagation = {
  /** Display data for each propagation model; keys are PropagationModelId. */
  models: {
    'free-space': {
      label: 'Espacio libre (Friis)',
      shortLabel: 'Espacio libre',
      citation: 'Friis, H.T. (1946). Forma logarítmica estándar, d en km, f en MHz.',
    },
    hata: {
      label: 'Okumura-Hata',
      shortLabel: 'Hata',
      citation: 'Hata, M. (1980), IEEE Trans. Vehicular Technology. Válido para f: 150-1500 MHz.',
    },
    'cost231-hata': {
      label: 'COST-231 Hata',
      shortLabel: 'COST-231',
      citation: 'COST Action 231 (1999). Extensión de Hata para f: 1500-2000 MHz.',
    },
    ecc33: {
      label: 'ECC-33',
      shortLabel: 'ECC-33',
      citation:
        'Electronic Communications Committee, Report 33. Válido para f: 0-4000 MHz (docs/curso-referencia.md §5.5).',
    },
    ikegami: {
      label: 'Ikegami',
      shortLabel: 'Ikegami',
      citation:
        'Ikegami et al. (1984). Fórmula: docs/curso-referencia.md §5.6 (la fuente marca los signos de esta sección como [OCR-verificar]).',
    },
    'walfisch-bertoni': {
      label: 'Walfisch-Bertoni',
      shortLabel: 'Walfisch-B.',
      citation:
        'Walfisch & Bertoni (1988). Fórmula: docs/curso-referencia.md §5.7. Válido para f: 300-3000 MHz, d: 0.2-5 km.',
    },
    'cost231-walfish-ikegami': {
      label: 'COST-231 Walfish-Ikegami',
      shortLabel: 'COST231-WI',
      citation:
        'COST Action 231. Fórmula: docs/curso-referencia.md §5.8, verificada contra documentación técnica independiente (Altair WinProp).',
    },
  },

  /** Keys are EnvironmentCategory ids. */
  environments: {
    'urban-large': {
      label: 'Urbano — ciudad grande / centro metropolitano',
      description: 'Alta densidad de edificios altos, centros metropolitanos densos.',
    },
    'urban-medium': {
      label: 'Urbano — ciudad media/pequeña',
      description: 'Densidad de edificación moderada, sin rascacielos dominantes.',
    },
    'urban-macro-3gpp': {
      label: 'Urbano Macro (3GPP UMa)',
      description: 'Macroceldas urbanas 3GPP TR 38.901. Pendiente: modelo aún no implementado.',
    },
    'urban-micro-3gpp': {
      label: 'Urbano Micro / cañón de calle (3GPP UMi)',
      description:
        'Microceldas urbanas 3GPP TR 38.901, geometría de cañón de calle. Pendiente: modelo aún no implementado.',
    },
    suburban: {
      label: 'Suburbano',
      description: 'Zonas residenciales de baja densidad, mezcla de árboles y casas.',
    },
    rural: {
      label: 'Rural / abierto',
      description: 'Espacio abierto sin obstáculos significativos.',
    },
    'street-geometry': {
      label: 'Geometría de calle urbana (edificios y calles explícitos)',
      description:
        'Cuando se conocen ancho de calle, altura de edificios y orientación -- no una categoría de ciudad, sino datos geométricos concretos del trayecto.',
    },
    'indoor-3gpp': {
      label: 'Interior (3GPP InH / InF)',
      description:
        'Oficinas (InH) y entornos industriales (InF), 3GPP TR 38.901. Pendiente: modelo aún no implementado.',
    },
    universal: {
      label: 'Universal (sin entorno)',
      description: 'Cota teórica inferior, no depende de ningún tipo de entorno.',
    },
  },

  environment: {
    title: 'Elige un entorno',
    subtitle: 'Determina qué modelos de predicción de pérdida están disponibles para tu ejercicio.',
    modelsAvailable_one: '{{count}} modelo disponible',
    modelsAvailable_other: '{{count}} modelos disponibles',
  },

  cellularHub: {
    title: 'Planificación celular',
    subtitle: 'Geometría, dimensionamiento por tráfico y capacidad/cobertura -- docs/curso-referencia.md §13.',
    features: {
      geometry: {
        title: 'Geometría celular y reutilización de frecuencias',
        description: 'Radio de celda, paso de retícula, distancia de reutilización y número de agrupaciones.',
      },
      traffic: {
        title: 'Tráfico (Erlang B) y densidad',
        description:
          'Bloqueo, tráfico soportable, canales necesarios o densidad máxima de tráfico dado un GoS objetivo.',
      },
      'link-budget': {
        title: 'Link budget (Hata / COST-231-Hata)',
        description: 'MAPL a partir de un presupuesto de enlace completo, e inversión a radio de celda máximo.',
      },
      dimensioning: {
        title: 'Dimensionamiento 1G/2G',
        description: 'Flujo completo capacidad vs. cobertura -- el resultado final es el factor limitante.',
      },
      wcdma: {
        title: 'Carga UMTS uplink y cell breathing',
        description: 'Ganancia de procesado, factor de carga por usuario y el bucle iterativo de convergencia.',
      },
    },
  },
};
