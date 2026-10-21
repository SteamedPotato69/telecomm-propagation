import { cost231HataModel } from './cost231Hata';
import { cost231WalfishIkegamiModel } from './cost231WalfishIkegami';
import { ecc33Model } from './ecc33';
import { freeSpaceModel } from './freeSpace';
import { hataModel } from './hata';
import { ikegamiModel } from './ikegami';
import type { PropagationModelDefinition, PropagationModelId } from './types';
import { walfischBertoniModel } from './walfischBertoni';

export const PROPAGATION_MODELS: Record<PropagationModelId, PropagationModelDefinition> = {
  'free-space': freeSpaceModel,
  hata: hataModel,
  'cost231-hata': cost231HataModel,
  ecc33: ecc33Model,
  ikegami: ikegamiModel,
  'walfisch-bertoni': walfischBertoniModel,
  'cost231-walfish-ikegami': cost231WalfishIkegamiModel,
};

/** Stable display order for the model picker: simplest model first, then increasing empirical complexity. */
export const PROPAGATION_MODEL_LIST: PropagationModelDefinition[] = [
  freeSpaceModel,
  hataModel,
  cost231HataModel,
  ecc33Model,
  ikegamiModel,
  walfischBertoniModel,
  cost231WalfishIkegamiModel,
];
