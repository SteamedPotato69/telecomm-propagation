export const cellular = {
  geometry: {
    title: 'Geometría celular y reutilización de frecuencias',
    subtitle:
      'Retícula hexagonal, distancia de reutilización y número de agrupaciones — docs/curso-referencia.md §13.1.',
    clusterSize: 'Tamaño de agrupación (N)',
    clusterHelper: 'Debe ser un número rómbico: N = i²+ij+j² para enteros i,j ≥ 0 (1, 3, 4, 7, 9, 12, 13...).',
    totalAreaHelper:
      'Opcional -- déjalo vacío si solo necesitas la geometría de una celda, sin el número de agrupaciones.',
    result: {
      latticeStep: 'Paso de retícula (d)',
      reuseDistance: 'Distancia de reutilización (D)',
      cellArea: 'Área de celda (S_c)',
      cocellArea: 'Área del rombo cocanal (S_RC)',
      sectorArea: 'Área por sector (trisectorial)',
      clusterCount: 'Número de agrupaciones (Q)',
    },
  },

  traffic: {
    title: 'Tráfico (Erlang B)',
    subtitle:
      'Bloqueo, tráfico soportable, canales necesarios o densidad de tráfico -- docs/curso-referencia.md §13.2-13.3.',
    whatToCompute: '¿Qué quieres calcular?',
    modes: {
      blocking: 'Bloqueo',
      traffic: 'Tráfico',
      channels: 'Canales',
      density: 'Densidad',
    },
    cellArea: 'Área de celda (S_c)',
    cellAreaHelper: 'Del módulo de geometría celular, o cualquier área de celda conocida.',
    gosHelper: 'Fracción entre 0 y 1 (0.02 = 2% de bloqueo objetivo).',
    results: {
      blocking: 'Probabilidad de bloqueo (GoS)',
      supportableTraffic: 'Tráfico soportable (A)',
      requiredChannels: 'Canales necesarios (K)',
      maxDensity: 'Densidad de tráfico máxima soportable (ρ)',
    },
  },

  linkBudget: {
    title: 'Link budget (Hata / COST-231-Hata)',
    subtitle:
      'MAPL a partir de un presupuesto de enlace completo, e inversión a radio de celda máximo -- ' +
      'docs/curso-referencia.md §13.3.',
    result: {
      maxRadius: 'Radio de celda máximo (R)',
    },
  },

  linkBudgetForm: {
    transmitPower: 'Potencia MS (Pt)',
    msAntennaGain: 'Ganancia antena MS',
    btsAntennaGain: 'Ganancia antena BTS',
    btsFeederLoss: 'Pérdida feeder BTS',
    btsSensitivity: 'Sensibilidad BTS',
    sensitivityHelper: 'Negativa, p. ej. -116.',
  },

  dimensioning: {
    title: 'Dimensionamiento 1G/2G',
    subtitle: 'Capacidad vs. cobertura -- el resultado final es el factor limitante. docs/curso-referencia.md §13.3.',
    channelsPerCell: 'Canales por celda (K)',
    gosHelper: 'Fracción entre 0 y 1 (0.02 = 2%).',
    result: {
      byCapacity: 'Por capacidad',
      trafficPerCell: 'Tráfico/celda (A_c)',
      cellsByCapacity: 'Celdas por capacidad',
      byCoverage: 'Por cobertura',
      mapl: 'MAPL',
      cellRadius: 'Radio de celda (R)',
      cellArea: 'Área de celda (π·R²)',
      cellsByCoverage: 'Celdas por cobertura',
      capacity: 'Capacidad',
      coverage: 'Cobertura',
      finalLabel: 'Resultado final -- factor limitante: {{constraint}}',
      cellsFinal_one: '{{count}} celda',
      cellsFinal_other: '{{count}} celdas',
    },
  },

  wcdma: {
    title: 'Carga UMTS uplink y cell breathing',
    subtitle:
      'Ganancia de procesado, carga por usuario y bucle iterativo de convergencia -- docs/curso-referencia.md §13.4.',
    serviceMixHeading: 'Mix de servicios (fijo, ejemplo del curso)',
    /** Keys are WcdmaServiceId. */
    services: {
      voice: 'Voz AMR',
      ps64: 'PS 64k',
      ps384: 'PS 384k',
    },
    targetLoadHelper: 'Fracción entre 0 y 1 (0.5 = 50%).',
    referenceService: 'Servicio de referencia (cobertura)',
    linkBudgetHeading: 'Presupuesto de enlace UMTS',
    mobileEirp: 'EIRP móvil',
    thermalNoise: 'Ruido térmico (kTB)',
    noiseFigure: 'Figura de ruido NodeB',
    nodeBAntennaGain: 'Ganancia antena NodeB',
    result: {
      loadPerService: 'Carga por servicio',
      processingGain: '{{service}} -- Gp',
      loadPerUser: 'ρ (por usuario)',
      maplZeroLoad: 'MAPL carga cero',
      simultaneousUsers: 'Usuarios simultáneos',
      maxPerCell: 'Máximo por celda (N_max)',
      convergence: 'Convergencia (cell breathing)',
      converged_one: 'Convergió en {{count}} iteración',
      converged_other: 'Convergió en {{count}} iteraciones',
      notConverged_one: 'No convergió en {{count}} iteración -- ver traza',
      notConverged_other: 'No convergió en {{count}} iteraciones -- ver traza',
      convergedRadius: 'Radio convergido (R)',
      convergedLoad: 'Carga convergida (η)',
      nodeBsByCoverage: 'NodeB por cobertura',
      nodeBsByCapacity: 'NodeB por capacidad',
      nodeBsFinal: '{{count}} NodeB',
      downlinkNote:
        'Downlink (η_DL) no implementado -- el material del curso usa una variable (β) sin definir y sin ejercicio ' +
        'de verificación (docs/curso-referencia.md §13.4-13.5).',
    },
  },
};
