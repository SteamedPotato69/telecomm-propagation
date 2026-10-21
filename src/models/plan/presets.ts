import type { Plan1g2gInputs } from './plan1g2g';

/**
 * The course's own worked example (docs/curso-referencia.md §13.3, diap. 44-46):
 * cover 50 km^2 with 10 000 active users at 0.025 Erlang each and GoS = 2 %.
 * These are the defaults the planning wizard opens with, so the student can
 * reproduce the pencil-and-paper sheet in the defence.
 */
export const COURSE_SCENARIO = {
  totalAreaKm2: 50,
  users: 10000,
  erlangPerUser: 0.025,
  targetGoS: 0.02,
} as const;

/** 1G / AMPS, diap. 44-45: N=7, 12.5 MHz in 30 kHz channels, Okumura-Hata urban at 900 MHz. */
export const COURSE_1G: Plan1g2gInputs = {
  generation: '1g',
  scenario: { ...COURSE_SCENARIO },
  spectrum: { bandwidthMHz: 12.5, channelWidthKHz: 30, clusterSize: 7 },
  coverage: {
    frequencyMHz: 900,
    baseStationHeightM: 30,
    mobileHeightM: 1.5,
    citySize: 'large',
    environment: 'urban',
    metropolitanCenter: false,
    linkBudget: {
      transmitPowerDbm: 33,
      transmitAntennaGainDbi: 0,
      bodyLossDb: 3,
      receiveAntennaGainDbi: 13,
      feederLossDb: 3,
      receiverSensitivityDbm: -116,
      shadowFadingMarginDb: 8,
      interferenceMarginDb: 5,
    },
  },
};

/** 2G / GSM, diap. 46: N=4, 8 MHz in 200 kHz carriers with 7 TCH each, Okumura-Hata urban at 900 MHz. */
export const COURSE_2G: Plan1g2gInputs = {
  generation: '2g',
  scenario: { ...COURSE_SCENARIO },
  spectrum: { bandwidthMHz: 8, channelWidthKHz: 200, clusterSize: 4, tchPerCarrier: 7 },
  coverage: {
    frequencyMHz: 900,
    baseStationHeightM: 30,
    mobileHeightM: 1.5,
    citySize: 'large',
    environment: 'urban',
    metropolitanCenter: false,
    // The slide's "EIRP MS = 30 dBm" row is inconsistent with its own Pt = 30 dBm and body
    // loss = 3 dB (that gives 27); the MAPL it states (133 dB) only comes out with 27. The
    // link budget derives EIRP from Pt+Gt-body, see models/propagation/linkBudget.ts.
    linkBudget: {
      transmitPowerDbm: 30,
      transmitAntennaGainDbi: 0,
      bodyLossDb: 3,
      receiveAntennaGainDbi: 15,
      feederLossDb: 3,
      receiverSensitivityDbm: -104,
      shadowFadingMarginDb: 8,
      interferenceMarginDb: 2,
    },
  },
};
