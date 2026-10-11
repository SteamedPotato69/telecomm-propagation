import type { DeepStrings } from '../types';
import type { calculator as esCalculator } from '../es/calculator';

export const calculator: DeepStrings<typeof esCalculator> = {
  propagationOptions: {
    model: 'Propagation model',
    modelCoverage: 'Propagation model (coverage)',
    largeCityHataOnly: 'Large city (Hata only)',
    metropolitanCostOnly: 'Metropolitan center — Cm (COST-231 only)',
    environmentHataOnly: 'Environment (Hata only)',
    budgetHeading: 'Link budget',
  },

  envOptions: {
    urban: 'Urban',
    suburban: 'Suburban',
    'open-rural': 'Open/rural',
  },

  calculator: {
    title: 'Propagation loss calculator',
    geometryRequired: 'Geometry required by {{model}}',
    largeCity: 'Large city (Hata / ECC-33)',
    metropolitanCenter: 'Metropolitan center — Cm (COST-231)',
    environmentHataOnly: 'Environment (Hata only)',
    compareAll: 'Compare all models for this environment',
  },

  comparison: {
    title: 'Model comparison',
    explainer:
      '"Distance to ideal" = absolute difference against free-space loss (the theoretical lower bound) with the ' +
      'same parameters. Smaller distance = better.',
    bestFit: 'BEST FIT',
    distanceToIdeal: 'Distance to ideal: {{value}} dB',
    idealSeries: 'Ideal (free space)',
    chartsHeading: 'Loss vs. distance',
    chartsExplainer:
      'Each model evaluated over a fixed distance range (0.3-20 km), with all other parameters equal to those ' +
      'above. The dotted gray line is free space (the "ideal prediction"); the closer a curve is to that line, ' +
      'the better the fit.',
    logScaleTitle: 'Logarithmic distance scale',
    linearScaleTitle: 'Linear distance scale',
    xLabelLog: 'Distance (km, log scale)',
    xLabelLinear: 'Distance (km)',
    yLabel: 'Loss (dB)',
  },

  geometryFields: {
    streetWidthM: { label: 'Street width (W)', helper: '' },
    diffractingBuildingHeightM: {
      label: 'Diffracting building height (H)',
      helper: 'Must be greater than the mobile height above.',
    },
    streetOrientationDeg: {
      label: 'Street orientation (Φ)',
      helper: 'Angle between the incident ray and the street. The valid range depends on the selected model.',
    },
    facadeReflectionLr: {
      label: 'Facade reflection (lr)',
      helper: 'Typical: 2 in VHF, 3.2 in UHF.',
    },
    baseStationHeightAboveRoofM: {
      label: 'Base-station height above rooftops (H)',
      helper: 'Antenna height ABOVE the nearby rooftop level, not its absolute height.',
    },
    averageBuildingHeightM: {
      label: 'Average building height (hR)',
      helper: 'Must be greater than the mobile height above.',
    },
    buildingSeparationM: { label: 'Building separation (b)', helper: '' },
  },
};
