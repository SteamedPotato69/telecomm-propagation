import type { DeepStrings } from '../types';
import type { propagation as esPropagation } from '../es/propagation';

export const propagation: DeepStrings<typeof esPropagation> = {
  models: {
    'free-space': {
      label: 'Free space (Friis)',
      shortLabel: 'Free space',
      citation: 'Friis, H.T. (1946). Standard logarithmic form, d in km, f in MHz.',
    },
    hata: {
      label: 'Okumura-Hata',
      shortLabel: 'Hata',
      citation: 'Hata, M. (1980), IEEE Trans. Vehicular Technology. Valid for f: 150-1500 MHz.',
    },
    'cost231-hata': {
      label: 'COST-231 Hata',
      shortLabel: 'COST-231',
      citation: 'COST Action 231 (1999). Extension of Hata for f: 1500-2000 MHz.',
    },
    ecc33: {
      label: 'ECC-33',
      shortLabel: 'ECC-33',
      citation:
        'Electronic Communications Committee, Report 33. Valid for f: 0-4000 MHz (docs/curso-referencia.md §5.5).',
    },
    ikegami: {
      label: 'Ikegami',
      shortLabel: 'Ikegami',
      citation:
        'Ikegami et al. (1984). Formula: docs/curso-referencia.md §5.6 (the source flags this section’s signs as [OCR-verify]).',
    },
    'walfisch-bertoni': {
      label: 'Walfisch-Bertoni',
      shortLabel: 'Walfisch-B.',
      citation:
        'Walfisch & Bertoni (1988). Formula: docs/curso-referencia.md §5.7. Valid for f: 300-3000 MHz, d: 0.2-5 km.',
    },
    'cost231-walfish-ikegami': {
      label: 'COST-231 Walfish-Ikegami',
      shortLabel: 'COST231-WI',
      citation:
        'COST Action 231. Formula: docs/curso-referencia.md §5.8, checked against independent technical documentation (Altair WinProp).',
    },
  },

  environments: {
    'urban-large': {
      label: 'Urban — large city / metropolitan center',
      description: 'High density of tall buildings, dense metropolitan centers.',
    },
    'urban-medium': {
      label: 'Urban — medium/small city',
      description: 'Moderate building density, no dominant skyscrapers.',
    },
    'urban-macro-3gpp': {
      label: 'Urban Macro (3GPP UMa)',
      description: 'Urban macrocells, 3GPP TR 38.901. Pending: model not implemented yet.',
    },
    'urban-micro-3gpp': {
      label: 'Urban Micro / street canyon (3GPP UMi)',
      description: 'Urban microcells, 3GPP TR 38.901, street-canyon geometry. Pending: model not implemented yet.',
    },
    suburban: {
      label: 'Suburban',
      description: 'Low-density residential areas, a mix of trees and houses.',
    },
    rural: {
      label: 'Rural / open',
      description: 'Open terrain without significant obstacles.',
    },
    'street-geometry': {
      label: 'Urban street geometry (explicit buildings and streets)',
      description:
        'When street width, building height and orientation are known -- not a city category, but concrete geometric data about the path.',
    },
    'indoor-3gpp': {
      label: 'Indoor (3GPP InH / InF)',
      description: 'Offices (InH) and industrial environments (InF), 3GPP TR 38.901. Pending: model not implemented yet.',
    },
    universal: {
      label: 'Universal (no environment)',
      description: 'Theoretical lower bound; does not depend on any kind of environment.',
    },
  },

  environment: {
    title: 'Choose an environment',
    subtitle: 'It determines which path-loss prediction models are available for your exercise.',
    modelsAvailable_one: '{{count}} model available',
    modelsAvailable_other: '{{count}} models available',
  },

  cellularHub: {
    title: 'Cellular planning',
    subtitle: 'Geometry, traffic dimensioning and capacity/coverage -- docs/curso-referencia.md §13.',
    features: {
      geometry: {
        title: 'Cell geometry and frequency reuse',
        description: 'Cell radius, lattice step, reuse distance and number of clusters.',
      },
      traffic: {
        title: 'Traffic (Erlang B) and density',
        description:
          'Blocking, supportable traffic, required channels or maximum traffic density for a target GoS.',
      },
      'link-budget': {
        title: 'Link budget (Hata / COST-231-Hata)',
        description: 'MAPL from a full link budget, and its inversion to a maximum cell radius.',
      },
      dimensioning: {
        title: '1G/2G dimensioning',
        description: 'Full capacity vs. coverage flow -- the final result is the limiting factor.',
      },
      wcdma: {
        title: 'UMTS uplink load and cell breathing',
        description: 'Processing gain, per-user load factor and the iterative convergence loop.',
      },
    },
  },
};
