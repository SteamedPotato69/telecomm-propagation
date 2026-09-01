import type { FadingZone } from './types';

/**
 * Display metadata for each of the 5 zones (§8.7). Lives apart from
 * fading.ts (the pure calculation) since these strings are a
 * presentation concern, not physics -- mirrors why geometryFieldConfig.ts
 * is in screens/ rather than models/propagation/.
 */
export const FADING_ZONE_LABELS: Record<FadingZone, { title: string; description: string }> = {
  1: {
    title: 'Zona rayada',
    description:
      'No es posible la transmisión: el ancho de banda de la señal (BT) es insuficiente para la tasa de símbolo pedida (BT·Ts < 1).',
  },
  2: {
    title: 'Canal plano en frecuencia y en tiempo',
    description: 'No sufre ningún desvanecimiento selectivo: BT < Bc y Ts < Tc.',
  },
  3: {
    title: 'Canal plano en frecuencia, selectivo en tiempo',
    description: 'Desvanecimiento selectivo en tiempo (TSF / fast fading): BT < Bc y Ts > Tc.',
  },
  4: {
    title: 'Canal plano en el tiempo, selectivo en frecuencia',
    description: 'Desvanecimiento selectivo en frecuencia (FSF): BT > Bc y Ts < Tc.',
  },
  5: {
    title: 'Canal no plano',
    description: 'Sufre ambos tipos de desvanecimiento (selectivo en frecuencia y en tiempo): BT > Bc y Ts > Tc.',
  },
};
