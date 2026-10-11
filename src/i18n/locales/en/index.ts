import type { es } from '../es';
import type { DeepStrings } from '../types';
import { calculator } from './calculator';
import { cellular } from './cellular';
import { core } from './core';
import { fading } from './fading';
import { propagation } from './propagation';

export const en: DeepStrings<typeof es> = { ...core, ...propagation, ...calculator, ...fading, ...cellular };
