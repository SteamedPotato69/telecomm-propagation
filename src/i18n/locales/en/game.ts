import type { DeepStrings } from '../types';
import type { gameTexts as esGame } from '../es/game';

export const gameTexts: DeepStrings<typeof esGame> = {
  game: {
    path: {
      title: 'Puzzle path',
      intro: 'Four short levels teach each piece; at the end is your mission: the puzzle with your plan and your image.',
      xp: 'XP',
      totalStars: 'Stars',
      streak_one: '{{count}} day streak',
      streak_other: '{{count}} day streak',
      noStreak: 'No streak: play today to start one',
      level: 'Level {{number}}',
      locked: 'Locked: earn a star on the previous level',
      play: 'Play',
      replay: 'Replay',
      stars_one: '{{count}} star out of 3',
      stars_other: '{{count}} stars out of 3',
      notPlayed: 'Not played',
      yourMission: 'Your mission',
      missionLine: 'Your {{generation}} plan: {{area}} km², clusters of {{n}} cells',
      goToMission: 'Go to my mission',
      saveFailed: 'Your progress could not be saved on this device: it is kept while the app stays open.',
    },

    levels: {
      hexagon: {
        title: 'One hexagon',
        goal: 'Cover the area with cells: each tap places one.',
        lesson:
          'A cell is drawn as a hexagon because hexagons fit together with no gaps and no overlap. Its area is S_c = (3√3/2)·R² (slide 21).',
      },
      patch: {
        title: 'Tiling a patch',
        goal: 'Cover a bigger patch: the cells snap into the lattice by themselves.',
        lesson: 'Every cell is the same distance from its neighbours, d = R·√3 (slide 21): that is why they fit.',
      },
      cluster: {
        title: 'Building the cluster',
        goal: 'Place clusters of 3 cells: each colour is a group of frequencies.',
        lesson:
          'A cluster of N cells uses N different frequency groups and repeats with no gaps. N = i² + i·j + j² (slides 22-23): here N = 3.',
      },
      reuse: {
        title: 'Reuse',
        goal: 'Cover the area with clusters of 7 cells and look at the distance between cells of the same colour.',
        lesson: 'Two cells of the same colour are the reuse distance D = √(3N)·R apart (slide 23): with N = 7, D = √21·R.',
      },
    },

    tutorial: {
      header: 'Level {{number}} of {{total}}',
      next: 'Next level',
      toPath: 'Back to the path',
    },

    reuse: {
      label: 'D = √(3·{{n}})·R = {{d}} km',
    },

    reward: {
      xp: '+{{xp}} XP',
      unlocked: 'Level unlocked: {{name}}',
      streak_one: '{{count}} day in a row',
      streak_other: '{{count}} days in a row',
    },

    cheer: {
      one: 'You did it! With fewer clusters you earn another star.',
      two: 'Almost perfect! One cluster fewer and it is three stars.',
      three: 'Perfect! You matched the game’s minimum.',
    },

    effects: {
      title: 'Game effects',
      on: 'On',
      off: 'Off',
      hint: 'Confetti and vibration. If the system asks to reduce motion, the confetti does not animate even when this is on.',
    },
  },
};
