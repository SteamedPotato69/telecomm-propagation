export const calculator = {
  /** Shared by every screen that asks for propagation-model options. */
  propagationOptions: {
    model: 'Modelo de propagación',
    modelCoverage: 'Modelo de propagación (cobertura)',
    largeCityHataOnly: 'Ciudad grande (solo Hata)',
    metropolitanCostOnly: 'Centro metropolitano — Cm (solo COST-231)',
    environmentHataOnly: 'Entorno (solo Hata)',
    budgetHeading: 'Presupuesto de enlace',
  },

  /** Keys are the `Environment` option values of the shared propagation inputs. */
  envOptions: {
    urban: 'Urbano',
    suburban: 'Suburbano',
    'open-rural': 'Abierto/rural',
  },

  calculator: {
    title: 'Calculadora de pérdida de propagación',
    geometryRequired: 'Geometría requerida por {{model}}',
    largeCity: 'Ciudad grande (Hata / ECC-33)',
    metropolitanCenter: 'Centro metropolitano — Cm (COST-231)',
    environmentHataOnly: 'Entorno (solo Hata)',
    compareAll: 'Comparar todos los modelos de este entorno',
  },

  comparison: {
    title: 'Comparación de modelos',
    explainer:
      '"Distancia al ideal" = diferencia absoluta contra la pérdida en espacio libre (cota teórica inferior) con ' +
      'los mismos parámetros. Menor distancia = mejor.',
    bestFit: 'MEJOR AJUSTE',
    distanceToIdeal: 'Distancia al ideal: {{value}} dB',
    idealSeries: 'Ideal (espacio libre)',
    chartsHeading: 'Pérdida vs. distancia',
    chartsExplainer:
      'Cada modelo evaluado en un rango de distancias fijo (0.3-20 km), con los demás parámetros iguales a los de ' +
      'arriba. La línea gris punteada es espacio libre (la "predicción ideal"); entre más cerca esté una curva de ' +
      'esa línea, mejor ajuste.',
    logScaleTitle: 'Escala logarítmica de distancia',
    linearScaleTitle: 'Escala lineal de distancia',
    xLabelLog: 'Distancia (km, escala log)',
    xLabelLinear: 'Distancia (km)',
    yLabel: 'Pérdida (dB)',
  },

  /** Per optional geometry field; an empty `helper` means "no helper text". */
  geometryFields: {
    streetWidthM: { label: 'Ancho de calle (W)', helper: '' },
    diffractingBuildingHeightM: {
      label: 'Altura del edificio de difracción (H)',
      helper: 'Debe ser mayor que la altura del móvil de arriba.',
    },
    streetOrientationDeg: {
      label: 'Orientación de calle (Φ)',
      helper: 'Ángulo entre el rayo incidente y la calle. El rango válido depende del modelo elegido.',
    },
    facadeReflectionLr: {
      label: 'Reflexión de fachada (lr)',
      helper: 'Típico: 2 en VHF, 3.2 en UHF.',
    },
    baseStationHeightAboveRoofM: {
      label: 'Altura de estación base sobre tejados (H)',
      helper: 'Altura de la antena SOBRE el nivel de los tejados cercanos, no su altura absoluta.',
    },
    averageBuildingHeightM: {
      label: 'Altura media de edificios (hR)',
      helper: 'Debe ser mayor que la altura del móvil de arriba.',
    },
    buildingSeparationM: { label: 'Separación entre edificios (b)', helper: '' },
  },
};
