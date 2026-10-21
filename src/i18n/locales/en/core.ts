import type { DeepStrings } from '../types';
import type { core as esCore } from '../es/core';

export const core: DeepStrings<typeof esCore> = {
  common: {
    back: 'Back',
    comingSoon: 'Coming soon',
    soon: 'coming soon',
    missingValues: 'All numeric fields must have a value.',
  },

  results: {
    pathLoss: 'Path loss',
  },

  home: {
    chooseFeature: 'Please choose a feature',
    settings: 'Settings',
    cards: {
      empirical: {
        title: 'Empirical propagation models',
        subtitle: 'Path-loss calculator: pick an environment and compare the applicable models.',
      },
      fading: {
        title: 'Fading simulator',
        subtitle:
          'Flat vs. frequency-selective, slow vs. fast: enter delay spread, speed and signal parameters ' +
          'and place the channel in the course’s 5 zones.',
      },
      cellular: {
        title: 'Cellular planning',
        subtitle:
          'Frequency-reuse geometry, traffic dimensioning (Erlang B), link budget and UMTS load.',
      },
    },
  },

  settings: {
    title: 'Settings',
    theme: {
      title: 'Theme',
      dark: 'Dark',
      system: 'Auto',
      light: 'Light',
    },
    language: {
      title: 'Language',
      system: 'Automatic (device language)',
      hint: 'Your choice is remembered on this device.',
    },
  },

  errors: {
    unknown: 'Unknown error.',
    mustBePositive: '{{field}} must be a number greater than 0.',
    mustBeNonNegative: '{{field}} must be a number greater than or equal to 0.',
    mustBeUnitInterval: '{{field}} must be a number strictly between 0 and 1.',
    mustBeInteger: '{{field}} must be a whole number.',
    mustBeBetween: '{{field}} must be between {{min}} and {{max}}.',
    referenceLineTooShort: 'The reference line is too short: it must be at least {{min}} pixels long.',
    polygonDegenerate: 'The area needs at least 3 points and cannot have zero surface.',
    noChannelsPerCell: 'With N={{n}} the available spectrum does not give even one channel per cell.',
    missingParameter: 'Missing parameter "{{field}}", required by the {{model}} model.',
    diffractingBuildingBelowMobile:
      'The diffracting building height (H) must be greater than the mobile height (hr): otherwise ' +
      'rooftop diffraction makes no physical sense and log10(H - hr) is undefined.',
    streetOrientationSinZero:
      'The street orientation angle (Φ) cannot be 0° or 180°: it makes log10(sin Φ) undefined (sin Φ = 0).',
    streetOrientationRange:
      'The street orientation angle (Φ) must be between 0° and 90° for this model: the Lori formula ' +
      'has no defined branch outside that range.',
    averageBuildingBelowMobile:
      'The average building height (hR) must be greater than the mobile height (hm): ΔhR = hR - hm must be ' +
      'positive for the calculation to make physical sense.',
    maplNonPositive:
      'The link budget leaves no margin (MAPL <= 0 dB): check power, gains, sensitivity and margins.',
    invalidClusterSize:
      'Cluster size N={{n}} is not geometrically valid: it must be expressible as i²+ij+j² for ' +
      'integers i,j >= 0 (for example 1, 3, 4, 7, 9, 12, 13...).',
    gosUnreachable: 'The target GoS was not reached with a reasonable number of channels.',
    invalidDamping: 'The damping factor must be between 0 (exclusive) and 1 (inclusive).',
    referenceServiceNotFound: 'The reference service "{{service}}" was not found among the given services.',
  },

  warnings: {
    modelOutOfRange:
      '{{model}} was used at {{frequency}} MHz, outside its range [{{min}}-{{max}}] MHz: it is the best available approximation (the course example does the same).',
    clusterLargerThanPlan:
      'The cluster has N={{n}} cells and the plan only has {{cells}}: the reuse pattern does not even complete once.',
    cellBreathingNotConverged: 'The cell-breathing loop did not converge: a final NodeB count cannot be given.',
    uplinkOnly: 'Only the uplink was evaluated; the downlink is not implemented.',
    outOfRange:
      '{{field}} = {{value}} {{unit}} is outside the model’s valid range [{{min}}-{{max}}] {{unit}}; ' +
      'the result is an extrapolation.',
  },

  fields: {
    frequency: 'Frequency',
    distance: 'Distance',
    baseStationHeight: 'Base-station height',
    baseStationHeightAboveRoof: 'Base-station height above rooftops (H)',
    mobileHeight: 'Mobile height',
    streetWidth: 'Street width (W)',
    diffractingBuildingHeight: 'Diffracting building height (H)',
    streetOrientation: 'Street orientation angle (Φ)',
    facadeReflection: 'Facade reflection parameter (lr)',
    averageBuildingHeight: 'Average building height (hR)',
    buildingSeparation: 'Building separation (b)',
    bodyLoss: 'Body loss',
    feederLoss: 'Feeder loss',
    shadowFadingMargin: 'Shadow-fading margin',
    interferenceMargin: 'Interference margin',
    cellRadius: 'Cell radius (R)',
    bandwidth: 'Available bandwidth',
    channelWidth: 'Channel width',
    clusterSize: 'Cluster size (N)',
    tchPerCarrier: 'Traffic channels (TCH) per carrier',
    controlChannels: 'Control channels',
    plannedCells: 'Cells in the plan',
    aspectRatio: 'Aspect ratio',
    referenceLength: 'Reference length',
    cellArea: 'Cell area (S_c)',
    carrierFrequency: 'Carrier frequency',
    totalCoverageArea: 'Total area to cover (S_T)',
    channels: 'Number of channels (K)',
    offeredTraffic: 'Offered traffic (A)',
    targetGos: 'Target GoS',
    trafficDensity: 'Traffic density (ρ)',
    totalTraffic: 'Total traffic',
    delaySpread: 'Delay spread (D)',
    mobileSpeed: 'Mobile speed',
    signalBandwidth: 'Signal bandwidth (BT)',
    symbolDuration: 'Symbol duration (Ts)',
    serviceBitRate: 'Bit rate ({{service}})',
    serviceActivityFactor: 'Activity factor ({{service}})',
    chipRate: 'Chip rate (W)',
    targetLoad: 'Target load (η)',
    totalUsers: 'Total users',
    totalArea: 'Total area',
    averageErlangPerUser: 'Average Erlang per user',
    interferenceFactor: 'Interference factor (i_oc)',
  },
};
