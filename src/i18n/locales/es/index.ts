import { calculator } from './calculator';
import { cellular } from './cellular';
import { core } from './core';
import { fading } from './fading';
import { gameTexts } from './game';
import { planTexts } from './plan';
import { propagation } from './propagation';
import { puzzleTexts } from './puzzle';

/** Source-of-truth locale: en/ and pt/ are typed as the same shape (see ../types.ts). */
export const es = { ...core, ...propagation, ...calculator, ...fading, ...cellular, ...planTexts, ...puzzleTexts, ...gameTexts };
