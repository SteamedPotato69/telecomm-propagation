import type { ClusterTranslation } from './clusterLattice';
import type { HexFrame } from './hexGrid';
import type { HelpLevel } from './puzzle';
import { translationKey } from './puzzle';

/**
 * What the player has placed. A reducer (pure) instead of ad-hoc screen state,
 * so the rules -- the first piece fixes the lattice, tapping a placed piece
 * takes it back, an empty board frees the lattice again, help only ever goes
 * up -- are written once and tested.
 */
export interface PlacementState {
  /** Position and rotation of the lattice. Null until the first piece is dropped: it decides them. */
  frame: HexFrame | null;
  translations: ClusterTranslation[];
  /** The most help used so far; it never goes back down, even after undo. */
  helpLevel: HelpLevel;
}

export type PlacementAction =
  /** The first piece: fixes the lattice at `frame`. Ignored if a lattice already exists. */
  | { type: 'anchor'; frame: HexFrame; translation: ClusterTranslation }
  /** A later piece: adds the cluster, or takes it back if it is already placed. */
  | { type: 'toggle'; translation: ClusterTranslation }
  | { type: 'undo' }
  | { type: 'reset' }
  /** A different puzzle (new image, scale or area): nothing carries over, not even the record of help. */
  | { type: 'new' }
  /** A hint places one cluster for the player (in the existing lattice, or in `frame` if the board is empty). */
  | { type: 'hint'; translation: ClusterTranslation; frame: HexFrame }
  /** Auto-fill places every missing cluster (in the existing lattice, or in `frame` if the board is empty). */
  | { type: 'autofill'; translations: ClusterTranslation[]; frame: HexFrame };

export const initialPlacement = (): PlacementState => ({ frame: null, translations: [], helpLevel: 'none' });

const HELP_RANK: Record<HelpLevel, number> = { none: 0, hints: 1, autofill: 2 };
const higher = (a: HelpLevel, b: HelpLevel): HelpLevel => (HELP_RANK[a] >= HELP_RANK[b] ? a : b);

const without = (list: ClusterTranslation[], translation: ClusterTranslation) =>
  list.filter((item) => translationKey(item) !== translationKey(translation));

const has = (list: ClusterTranslation[], translation: ClusterTranslation) =>
  list.some((item) => translationKey(item) === translationKey(translation));

/** An empty board has no lattice: the next piece decides it again. Help already used is kept. */
const freeLatticeIfEmpty = (state: PlacementState): PlacementState =>
  state.translations.length === 0 ? { ...state, frame: null } : state;

export function placementReducer(state: PlacementState, action: PlacementAction): PlacementState {
  switch (action.type) {
    case 'anchor':
      if (state.frame !== null) return state;
      return { ...state, frame: action.frame, translations: [action.translation] };

    case 'toggle': {
      if (state.frame === null) return state;
      const next = has(state.translations, action.translation)
        ? without(state.translations, action.translation)
        : [...state.translations, action.translation];
      return freeLatticeIfEmpty({ ...state, translations: next });
    }

    case 'undo':
      return freeLatticeIfEmpty({ ...state, translations: state.translations.slice(0, -1) });

    case 'reset':
      // Help used stays on record: restarting the board does not turn a hinted game into an unaided one.
      return { frame: null, translations: [], helpLevel: state.helpLevel };

    case 'new':
      return initialPlacement();

    case 'hint': {
      const frame = state.frame ?? action.frame;
      if (has(state.translations, action.translation)) return { ...state, helpLevel: higher(state.helpLevel, 'hints') };
      return {
        frame,
        translations: [...state.translations, action.translation],
        helpLevel: higher(state.helpLevel, 'hints'),
      };
    }

    case 'autofill': {
      const frame = state.frame ?? action.frame;
      const missing = action.translations.filter((translation) => !has(state.translations, translation));
      return { frame, translations: [...state.translations, ...missing], helpLevel: higher(state.helpLevel, 'autofill') };
    }
  }
}
