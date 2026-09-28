import type { ServiceMix } from './types';

/**
 * The course's own worked example service mix (docs/curso-referencia.md
 * §13.4, diap. 66/71-72): 70% voice / 20% 64kbps data / 10% 384kbps data.
 * Eb/No, activity factor, and soft-handover gain per service come
 * directly from the slide's link-budget table.
 */
export const DEFAULT_SERVICE_MIX: ServiceMix[] = [
  { label: 'Voz AMR', shareOfUsers: 0.7, bitRateKbps: 12.2, ebN0Db: 5.0, activityFactor: 0.67, softHandoverGainDb: 3.0 },
  { label: 'PS 64k', shareOfUsers: 0.2, bitRateKbps: 64, ebN0Db: 3.5, activityFactor: 1.0, softHandoverGainDb: 1.5 },
  { label: 'PS 384k', shareOfUsers: 0.1, bitRateKbps: 384, ebN0Db: 2.0, activityFactor: 1.0, softHandoverGainDb: 0.0 },
];
