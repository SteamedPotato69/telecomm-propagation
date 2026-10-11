import type { DeepStrings } from '../types';
import type { cellular as esCellular } from '../es/cellular';

export const cellular: DeepStrings<typeof esCellular> = {
  geometry: {
    title: 'Cell geometry and frequency reuse',
    subtitle: 'Hexagonal lattice, reuse distance and number of clusters — docs/curso-referencia.md §13.1.',
    clusterSize: 'Cluster size (N)',
    clusterHelper: 'Must be a rhombic number: N = i²+ij+j² for integers i,j ≥ 0 (1, 3, 4, 7, 9, 12, 13...).',
    totalAreaHelper: 'Optional -- leave it empty if you only need one cell’s geometry, without the number of clusters.',
    result: {
      latticeStep: 'Lattice step (d)',
      reuseDistance: 'Reuse distance (D)',
      cellArea: 'Cell area (S_c)',
      cocellArea: 'Co-channel rhombus area (S_RC)',
      sectorArea: 'Area per sector (three-sector)',
      clusterCount: 'Number of clusters (Q)',
    },
  },

  traffic: {
    title: 'Traffic (Erlang B)',
    subtitle: 'Blocking, supportable traffic, required channels or traffic density -- docs/curso-referencia.md §13.2-13.3.',
    whatToCompute: 'What do you want to compute?',
    modes: {
      blocking: 'Blocking',
      traffic: 'Traffic',
      channels: 'Channels',
      density: 'Density',
    },
    cellArea: 'Cell area (S_c)',
    cellAreaHelper: 'From the cell geometry module, or any known cell area.',
    gosHelper: 'Fraction between 0 and 1 (0.02 = 2% target blocking).',
    results: {
      blocking: 'Blocking probability (GoS)',
      supportableTraffic: 'Supportable traffic (A)',
      requiredChannels: 'Required channels (K)',
      maxDensity: 'Maximum supportable traffic density (ρ)',
    },
  },

  linkBudget: {
    title: 'Link budget (Hata / COST-231-Hata)',
    subtitle:
      'MAPL from a full link budget, and its inversion to a maximum cell radius -- docs/curso-referencia.md §13.3.',
    result: {
      maxRadius: 'Maximum cell radius (R)',
    },
  },

  linkBudgetForm: {
    transmitPower: 'MS power (Pt)',
    msAntennaGain: 'MS antenna gain',
    btsAntennaGain: 'BTS antenna gain',
    btsFeederLoss: 'BTS feeder loss',
    btsSensitivity: 'BTS sensitivity',
    sensitivityHelper: 'Negative, e.g. -116.',
  },

  dimensioning: {
    title: '1G/2G dimensioning',
    subtitle: 'Capacity vs. coverage -- the final result is the limiting factor. docs/curso-referencia.md §13.3.',
    channelsPerCell: 'Channels per cell (K)',
    gosHelper: 'Fraction between 0 and 1 (0.02 = 2%).',
    result: {
      byCapacity: 'By capacity',
      trafficPerCell: 'Traffic/cell (A_c)',
      cellsByCapacity: 'Cells by capacity',
      byCoverage: 'By coverage',
      mapl: 'MAPL',
      cellRadius: 'Cell radius (R)',
      cellArea: 'Cell area (π·R²)',
      cellsByCoverage: 'Cells by coverage',
      capacity: 'Capacity',
      coverage: 'Coverage',
      finalLabel: 'Final result -- limiting factor: {{constraint}}',
      cellsFinal_one: '{{count}} cell',
      cellsFinal_other: '{{count}} cells',
    },
  },

  wcdma: {
    title: 'UMTS uplink load and cell breathing',
    subtitle:
      'Processing gain, per-user load and the iterative convergence loop -- docs/curso-referencia.md §13.4.',
    serviceMixHeading: 'Service mix (fixed, course example)',
    services: {
      voice: 'AMR voice',
      ps64: 'PS 64k',
      ps384: 'PS 384k',
    },
    targetLoadHelper: 'Fraction between 0 and 1 (0.5 = 50%).',
    referenceService: 'Reference service (coverage)',
    linkBudgetHeading: 'UMTS link budget',
    mobileEirp: 'Mobile EIRP',
    thermalNoise: 'Thermal noise (kTB)',
    noiseFigure: 'NodeB noise figure',
    nodeBAntennaGain: 'NodeB antenna gain',
    result: {
      loadPerService: 'Load per service',
      processingGain: '{{service}} -- Gp',
      loadPerUser: 'ρ (per user)',
      maplZeroLoad: 'Zero-load MAPL',
      simultaneousUsers: 'Simultaneous users',
      maxPerCell: 'Maximum per cell (N_max)',
      convergence: 'Convergence (cell breathing)',
      converged_one: 'Converged in {{count}} iteration',
      converged_other: 'Converged in {{count}} iterations',
      notConverged_one: 'Did not converge in {{count}} iteration -- see trace',
      notConverged_other: 'Did not converge in {{count}} iterations -- see trace',
      convergedRadius: 'Converged radius (R)',
      convergedLoad: 'Converged load (η)',
      nodeBsByCoverage: 'NodeBs by coverage',
      nodeBsByCapacity: 'NodeBs by capacity',
      nodeBsFinal: '{{count}} NodeB',
      downlinkNote:
        'Downlink (η_DL) is not implemented -- the course material uses an undefined variable (β) with no ' +
        'verification exercise (docs/curso-referencia.md §13.4-13.5).',
    },
  },
};
