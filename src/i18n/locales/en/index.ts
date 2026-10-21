import type { es } from '../es';
import type { DeepStrings } from '../types';
import { calculator } from './calculator';
import { cellular } from './cellular';
import { core } from './core';
import { fading } from './fading';
import { gameTexts } from './game';
import { planTexts } from './plan';
import { propagation } from './propagation';
import { puzzleTexts } from './puzzle';

export const en: DeepStrings<typeof es> = { ...core, ...propagation, ...calculator, ...fading, ...cellular, ...planTexts, ...puzzleTexts, ...gameTexts };
