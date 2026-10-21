import { calculator } from './calculator';
import { cellular } from './cellular';
import { core } from './core';
import { fading } from './fading';
import { planTexts } from './plan';
import { propagation } from './propagation';

/** Source-of-truth locale: en/ and pt/ are typed as the same shape (see ../types.ts). */
export const es = { ...core, ...propagation, ...calculator, ...fading, ...cellular, ...planTexts };
