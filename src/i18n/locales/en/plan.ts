import type { DeepStrings } from '../types';
import type { planTexts as esPlan } from '../es/plan';

export const planTexts: DeepStrings<typeof esPlan> = {
  plan: {
    start: {
      title: 'Guided planning',
      subtitle:
        'Follow the same order as by hand: each step uses what was computed in the previous one, and everything is saved on this device.',
      privacy: 'Your plan is saved only on this device.',
      generation: {
        g1: { title: '1G — AMPS', subtitle: 'Analog, FDMA. 30 kHz channels and a typical cluster of N=7.' },
        g2: { title: '2G — GSM', subtitle: 'Digital, TDMA. 200 kHz carriers with 7 traffic channels each.' },
        g3: { title: '3G — UMTS', subtitle: 'Almost automatic: just three inputs, the rest is computed for you.' },
      },
      savedStatus: 'Saved plan · step {{step}} of {{total}}',
      savedCells_one: '{{count}} cell in your plan',
      savedCells_other: '{{count}} cells in your plan',
      noResult: 'No final result yet',
      begin: 'Start with the course example',
      continue: 'Continue',
      restart: 'Start over',
      restartConfirm: 'Tap again to delete this plan and go back to the course example',
      changed: 'With the current models this plan gives {{now}} cells (it gave {{before}} when you saved it).',
      saveFailed: 'It could not be saved on this device: your plan stays here while the app is open.',
    },

    shell: {
      stepOf: 'Step {{step}} of {{total}}',
      previous: 'Previous',
      next: 'Next',
      advanced: 'Advanced',
      invalidNumber: 'Enter a valid number: the last valid value is used meanwhile.',
      ledgerTitle: 'Your plan so far',
    },

    constraint: {
      capacity: 'Capacity',
      coverage: 'Coverage',
    },

    ledger: {
      totalArea: 'Area to cover (S_T)',
      totalTraffic: 'Total traffic (A_T)',
      clusterSize: 'Cluster (N)',
      totalChannels: 'Channels in the band',
      channelsPerCell: 'Channels per cell (K)',
      carriers: 'Carriers in the band',
      transceiversPerCell: 'Transceivers per cell',
      trafficPerCell: 'Traffic per cell (A_c)',
      cellsByCapacity: 'Cells by capacity',
      propagationModel: 'Propagation model',
      mapl: 'Maximum allowable path loss (MAPL)',
      cellRadius: 'Cell radius (R)',
      cellArea: 'Cell area (π·R²)',
      cellsByCoverage: 'Cells by coverage',
      cellsFinal: 'Cells in the plan',
      bindingConstraint: 'Limiting factor',
      maxUsersPerCell: 'Max simultaneous users per cell',
      convergedRadius: 'Converged radius (R)',
      convergedLoad: 'Converged load (η)',
      nodeBsByCoverage: 'NodeBs by coverage',
      nodeBsByCapacity: 'NodeBs by capacity',
    },

    steps: {
      scenario: {
        title: 'Scenario',
        intro: 'How much area has to be covered and how much traffic people generate in the peak hour.',
        users: 'Active users in the peak hour',
        erlangPerUser: 'Traffic per user',
        gosHelper: 'A fraction between 0 and 1: 0.02 means 2 % of calls blocked.',
        result: 'Total traffic = users × Erlang per user = {{value}} Erlang.',
      },
      spectrum: {
        title: 'Spectrum and cluster',
        intro1g: 'AMPS splits the spectrum into 30 kHz channels. Each cluster of N cells uses every channel once.',
        intro2g: 'GSM splits the spectrum into 200 kHz carriers; each carrier carries several traffic channels.',
        clusterHelper: 'Larger N = less interference between cells that reuse frequencies, but fewer channels per cell.',
        carrierWidth: 'Carrier spacing',
        controlHelper: 'The course does not subtract control channels. Real AMPS uses 21 per operator [industry context].',
        tchHelper: 'The course uses 7: one of the carrier’s 8 time slots is assumed to carry signalling.',
        result1g: 'The band has {{total}} channels; with N={{n}} each cell gets {{perCell}}.',
        result2g: '{{carriers}} carriers → {{trx}} per cell × {{tch}} traffic channels = {{perCell}} channels per cell.',
      },
      capacity: {
        title: 'Capacity',
        intro: 'With K channels per cell and the requested GoS, Erlang B tells how much traffic each cell can carry.',
        formula: 'A_c = B⁻¹(K, GoS)',
        note: 'A printed Erlang B table may give a slightly different value: here the calculation is exact.',
      },
      coverage: {
        title: 'Coverage',
        intro: 'The link budget gives the maximum allowable path loss (MAPL); with it the propagation model gives the cell radius.',
        modelAuto: 'Model chosen from the frequency: {{model}}',
        advancedIntro: 'They come from the course example. You can change them, but you do not have to.',
      },
      result: {
        title: 'Result',
        intro: 'The number of cells is the larger of what capacity asks for and what coverage asks for.',
        cellsTitle: 'Cells needed',
        bindingCapacity: 'Capacity rules: more cells are needed to carry all the traffic.',
        bindingCoverage: 'Coverage rules: more cells are needed to reach the whole area.',
      },
      summary: {
        title: 'Summary for the puzzle',
        intro: 'This is what the minigame will use. It only reads it: it does not change your plan.',
        play: 'Go to the puzzle',
        unavailable: 'The 3G plan has no final NodeB count (the calculation did not converge), so the game cannot start.',
      },
      scenario3g: {
        title: '3G scenario',
        intro:
          'Just three inputs. The rest (70/20/10 service mix, link budget, target load, 2100 MHz band) comes from the course example and is computed for you.',
        advancedIntro: 'Values from the course example. You can change them, but you do not have to.',
        targetLoadHelper: 'A fraction between 0 and 1: 0.5 means planning at 50 % of the maximum load.',
      },
      result3g: {
        title: '3G result',
        intro: 'Computed for you: processing gain, load per service and the cell-breathing loop until the radius settles.',
        smallerStep: 'With the standard calculation step the loop oscillated: it was repeated with a smaller step ({{step}}), which reaches the same point.',
        minByCapacity: 'At least {{count}} NodeBs are needed by capacity.',
        bindingCapacity: 'Capacity rules: more NodeBs are needed to serve all the users.',
        bindingCoverage: 'Coverage rules: more NodeBs are needed to reach the whole area.',
      },
    },

    summary: {
      items: {
        totalArea: {
          label: 'Area to cover (S_T)',
          hint: 'The area that has to be covered. It comes from the first step and does not change in the game.',
        },
        clusterSize: {
          label: 'Cluster (N)',
          hint: 'Cells per cluster: each uses a different set of frequencies. In 3G they all share one frequency, so N = 1.',
        },
        plannedCells: {
          label: 'Cells in the plan',
          hint: 'How many cells your plan needs: the larger of capacity and coverage.',
        },
        cellArea: {
          label: 'Area per cell',
          hint: 'What each cell gets: the total area divided by the cells of the plan.',
        },
        hexRadius: {
          label: 'Hexagon radius',
          hint: 'Radius of the hexagon with that area: the size of each cell on the map.',
        },
        circleRadius: {
          label: 'Equivalent circle radius',
          hint: 'Radius of a circle with the same area, to compare with the R of your link budget.',
        },
        reuseDistance: {
          label: 'Reuse distance (D)',
          hint: 'Minimum distance between two cells that use the same frequencies: D = √(3N)·R.',
        },
        clusterCountQ: {
          label: 'Estimated clusters (Q)',
          hint: 'What the course estimates to cover the area (slide 24). The game will tell you how many are really needed.',
        },
      },
    },
  },
};
