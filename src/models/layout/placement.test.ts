import { describe, expect, it } from 'vitest';
import type { HexFrame } from './hexGrid';
import { initialPlacement, placementReducer } from './placement';
import type { PlacementAction, PlacementState } from './placement';

const frameA: HexFrame = { radius: 1, rotationRad: 0, origin: { x: 1, y: 2 } };
const frameB: HexFrame = { radius: 1, rotationRad: 0.5, origin: { x: -3, y: 4 } };

const run = (actions: PlacementAction[], start: PlacementState = initialPlacement()) => actions.reduce(placementReducer, start);
const t = (a: number, b: number) => ({ a, b });

describe('placementReducer', () => {
  it('starts empty: no lattice, nothing placed, no help', () => {
    expect(initialPlacement()).toEqual({ frame: null, translations: [], helpLevel: 'none' });
  });

  it('the first piece fixes the lattice; a second anchor is ignored', () => {
    const state = run([{ type: 'anchor', frame: frameA, translation: t(0, 0) }, { type: 'anchor', frame: frameB, translation: t(5, 5) }]);
    expect(state.frame).toBe(frameA);
    expect(state.translations).toEqual([t(0, 0)]);
  });

  it('a later piece is added, and tapping a placed piece takes it back', () => {
    const anchored = run([{ type: 'anchor', frame: frameA, translation: t(0, 0) }]);
    const added = run([{ type: 'toggle', translation: t(1, 0) }], anchored);
    expect(added.translations).toEqual([t(0, 0), t(1, 0)]);
    const removed = run([{ type: 'toggle', translation: t(1, 0) }], added);
    expect(removed.translations).toEqual([t(0, 0)]);
  });

  it('toggling with no lattice does nothing (the first piece must be an anchor)', () => {
    expect(run([{ type: 'toggle', translation: t(1, 1) }])).toEqual(initialPlacement());
  });

  it('undo removes the latest piece; undoing the last one frees the lattice again', () => {
    const two = run([
      { type: 'anchor', frame: frameA, translation: t(0, 0) },
      { type: 'toggle', translation: t(1, 0) },
    ]);
    const one = run([{ type: 'undo' }], two);
    expect(one.translations).toEqual([t(0, 0)]);
    expect(one.frame).toBe(frameA);
    const none = run([{ type: 'undo' }], one);
    expect(none.translations).toEqual([]);
    expect(none.frame).toBeNull();
    // undo on an empty board is harmless
    expect(run([{ type: 'undo' }], none)).toEqual(none);
  });

  it('removing the only piece by tapping it also frees the lattice', () => {
    const state = run([
      { type: 'anchor', frame: frameA, translation: t(0, 0) },
      { type: 'toggle', translation: t(0, 0) },
    ]);
    expect(state.frame).toBeNull();
    expect(state.translations).toEqual([]);
  });

  it('reset clears the board and the lattice but keeps the record of help used', () => {
    const helped = run([{ type: 'hint', translation: t(0, 0), frame: frameA }]);
    expect(helped.helpLevel).toBe('hints');
    const reset = run([{ type: 'reset' }], helped);
    expect(reset).toEqual({ frame: null, translations: [], helpLevel: 'hints' });
  });
});

describe('help', () => {
  it('a hint on an empty board places the piece in the suggested frame and marks hints', () => {
    const state = run([{ type: 'hint', translation: t(2, -1), frame: frameB }]);
    expect(state.frame).toBe(frameB);
    expect(state.translations).toEqual([t(2, -1)]);
    expect(state.helpLevel).toBe('hints');
  });

  it('a hint on an existing lattice keeps the player\'s frame, not the suggested one', () => {
    const state = run([
      { type: 'anchor', frame: frameA, translation: t(0, 0) },
      { type: 'hint', translation: t(1, 1), frame: frameB },
    ]);
    expect(state.frame).toBe(frameA);
    expect(state.translations).toEqual([t(0, 0), t(1, 1)]);
  });

  it('a hint for a piece that is already there adds nothing but still counts as help', () => {
    const state = run([
      { type: 'anchor', frame: frameA, translation: t(0, 0) },
      { type: 'hint', translation: t(0, 0), frame: frameA },
    ]);
    expect(state.translations).toEqual([t(0, 0)]);
    expect(state.helpLevel).toBe('hints');
  });

  it('auto-fill adds only the missing pieces and marks the highest help level', () => {
    const state = run([
      { type: 'anchor', frame: frameA, translation: t(0, 0) },
      { type: 'autofill', translations: [t(0, 0), t(1, 0), t(0, 1)], frame: frameB },
    ]);
    expect(state.frame).toBe(frameA);
    expect(state.translations).toEqual([t(0, 0), t(1, 0), t(0, 1)]);
    expect(state.helpLevel).toBe('autofill');
  });

  it('help never goes back down: a hint after auto-fill stays auto-fill', () => {
    const state = run([
      { type: 'autofill', translations: [t(0, 0)], frame: frameA },
      { type: 'hint', translation: t(1, 0), frame: frameA },
    ]);
    expect(state.helpLevel).toBe('autofill');
  });

  it('help survives undo: undoing a hinted piece does not make the game unaided', () => {
    const state = run([
      { type: 'hint', translation: t(0, 0), frame: frameA },
      { type: 'undo' },
    ]);
    expect(state.helpLevel).toBe('hints');
    expect(state.frame).toBeNull();
  });
});
