import { LocalizedError } from '../../utils/localizedMessage';
import { assertPositive, assertUnitInterval } from '../../utils/validation';
import type {
  ServiceLoad,
  ServiceMix,
  WcdmaCommonLinkBudget,
  WcdmaIterationStep,
  WcdmaLoadInputs,
  WcdmaLoadResult,
} from './types';

const DEFAULT_MAX_ITERATIONS = 50;
const DEFAULT_CONVERGENCE_TOLERANCE_KM = 0.001;

/** Hexagonal cell area coefficient, 3*sqrt(3)/2 -- same constant as models/geometry's Sc formula (confirmed against the course's own U_celda=920 worked number, §13.4 diap. 73), not the circular pi*R^2 used in models/dimensioning's 1G/2G flow (§13.3 uses a different area convention). */
const HEX_AREA_COEFFICIENT = (3 * Math.sqrt(3)) / 2;

/**
 * Per-service processing gain, uplink load contribution, sensitivity, and
 * zero-load MAPL (docs/curso-referencia.md §13.4, diap. 66/72).
 *
 * Gp and sensitivity/MAPL match the course's worked example exactly for
 * all 3 services. The load factor (rho) formula matches PS64k and PS384k
 * exactly (0.0360~=0.0357, 0.1368~=0.137) but NOT voice: with the table's
 * own stated Eb/No=5dB, alpha=0.67, R=12.2kbps, this formula gives
 * rho=0.0148, not the slide's stated 0.0210 -- no combination of the
 * given inputs reproduces 0.0210 exactly. Flagged here rather than
 * fudged; see wcdma.test.ts.
 */
export function calculateServiceLoad(
  service: ServiceMix,
  chipRateMcps: number,
  linkBudget: WcdmaCommonLinkBudget
): ServiceLoad {
  assertPositive(service.bitRateKbps, { key: 'serviceBitRate', params: { service: { key: `wcdma.services.${service.id}` } } });
  assertPositive(chipRateMcps, 'chipRate');
  assertPositive(service.activityFactor, { key: 'serviceActivityFactor', params: { service: { key: `wcdma.services.${service.id}` } } });

  const chipRateKcps = chipRateMcps * 1000;
  const processingGainDb = 10 * Math.log10(chipRateKcps / service.bitRateKbps);

  const ebN0Linear = Math.pow(10, service.ebN0Db / 10);
  const chipRateCps = chipRateMcps * 1e6;
  const bitRateBps = service.bitRateKbps * 1000;
  const loadFactorPerUser = 1 / (1 + chipRateCps / ((bitRateBps * ebN0Linear) / service.activityFactor));

  const sensitivityDbm = linkBudget.thermalNoiseDbm + linkBudget.noiseFigureDb + service.ebN0Db - processingGainDb;
  const maplZeroLoadDb =
    linkBudget.eirpDbm -
    sensitivityDbm +
    linkBudget.receiveAntennaGainDbi +
    service.softHandoverGainDb -
    linkBudget.feederLossDb -
    linkBudget.shadowFadingMarginDb;

  return { id: service.id, processingGainDb, loadFactorPerUser, sensitivityDbm, maplZeroLoadDb };
}

/**
 * Uplink load + cell-breathing convergence loop (docs/curso-referencia.md
 * §13.4, diap. 68-74).
 *
 * [interpretación no verificada]: the course's own iteration table (diap.
 * 73) shows a column "U_CELDA (GEOG.)" -- registered population in the
 * cell's footprint (population density * cell area, e.g. 920 at R=1.33km)
 * -- next to "H_SALIDA" (output load), but the slide never shows the
 * formula connecting them. Feeding that registered-population figure
 * directly into the standard load equation (eta = rho_mix * N * (1+i_oc))
 * the way the other terms in this module are verified gives values wildly
 * inconsistent with a load fraction (order 10-50, not 0-1) and an
 * undamped iteration oscillates/diverges instead of settling, the
 * opposite of the slide's own smooth 3-step convergence. Converting
 * registered population to *active* users first (population *
 * averageErlangPerUser, the same Erlang-as-expected-concurrent-users
 * reading already used in models/dimensioning) is dimensionally correct
 * and matches standard WCDMA planning practice, but still isn't provably
 * the professor's own exact method -- no formula for that conversion step
 * survived extraction either. Implemented here with damped fixed-point
 * iteration (a standard stabilization technique for this class of
 * feedback loop, not a fudge -- see WcdmaLoadInputs.dampingFactor):
 * converges to a physically sensible, self-consistent operating point,
 * but not numerically identical to the slide's specific R=1.07km/eta=54%
 * trace. See wcdma.test.ts for what IS verified exactly (Gp, sensitivity,
 * MAPL, and the loop's own internal consistency) vs. what diverges.
 *
 * Reference service: the course uses voice (the design-priority service
 * whose coverage the operator wants to guarantee), not whichever service
 * happens to have the lowest MAPL -- see WcdmaLoadInputs.referenceServiceId.
 *
 * Downlink (eta_DL) is out of scope, same as the project's existing
 * precedent for Ericsson-9999/Lee: the course's own extracted material
 * uses an undefined variable (beta) with no verification example.
 */
export function calculateWcdmaUplinkLoad(inputs: WcdmaLoadInputs): WcdmaLoadResult {
  const {
    chipRateMcps,
    services,
    referenceServiceId,
    interferenceFactor,
    targetUplinkLoad,
    linkBudget,
    propagationInputs,
    solveDistanceKm,
    totalUsers,
    averageErlangPerUser,
    totalAreaKm2,
    maxIterations = DEFAULT_MAX_ITERATIONS,
    convergenceToleranceKm = DEFAULT_CONVERGENCE_TOLERANCE_KM,
    dampingFactor = 0.3,
  } = inputs;

  assertUnitInterval(targetUplinkLoad, 'targetLoad');
  assertPositive(totalUsers, 'totalUsers');
  assertPositive(totalAreaKm2, 'totalArea');
  assertPositive(averageErlangPerUser, 'averageErlangPerUser');
  assertPositive(interferenceFactor, 'interferenceFactor');
  if (!Number.isFinite(dampingFactor) || dampingFactor <= 0 || dampingFactor > 1) {
    throw new LocalizedError('errors.invalidDamping');
  }

  const serviceLoads = services.map((service) => calculateServiceLoad(service, chipRateMcps, linkBudget));

  const mixLoadFactor = serviceLoads.reduce(
    (sum, load, i) => sum + services[i].shareOfUsers * load.loadFactorPerUser,
    0
  );

  const maxSimultaneousUsersPerCell = targetUplinkLoad / (mixLoadFactor * (1 + interferenceFactor));
  const usersPerServicePerCell = services.map((service) => ({
    id: service.id,
    users: Math.round(maxSimultaneousUsersPerCell * service.shareOfUsers),
  }));

  const referenceLoad = serviceLoads.find((load) => load.id === referenceServiceId);
  if (!referenceLoad) {
    throw new LocalizedError('errors.referenceServiceNotFound', { service: referenceServiceId });
  }

  const totalTrafficErlangs = totalUsers * averageErlangPerUser;
  const nodeBsByCapacity = Math.ceil(totalTrafficErlangs / maxSimultaneousUsersPerCell);

  const iterations: WcdmaIterationStep[] = [];
  let previousRadiusKm: number | null = null;
  let currentLoad = 0; // starts at zero load, per the course's own description (diap. 68)
  let converged = false;
  let finalRadiusKm: number | null = null;
  let finalLoad: number | null = null;

  for (let iteration = 0; iteration <= maxIterations; iteration++) {
    const loadMarginDb = currentLoad === 0 ? 0 : -10 * Math.log10(1 - currentLoad);
    const maplEffectiveDb = referenceLoad.maplZeroLoadDb - loadMarginDb;
    const radiusKm = solveDistanceKm(propagationInputs, maplEffectiveDb);
    const cellAreaKm2 = HEX_AREA_COEFFICIENT * radiusKm ** 2;
    const registeredPopulationInCell = (totalUsers / totalAreaKm2) * cellAreaKm2;
    const activeUsersPerCell = registeredPopulationInCell * averageErlangPerUser;
    const computedLoad = Math.min(mixLoadFactor * activeUsersPerCell * (1 + interferenceFactor), 0.999);
    const nextLoad = currentLoad + dampingFactor * (computedLoad - currentLoad);

    const deltaRadiusKm = previousRadiusKm === null ? NaN : radiusKm - previousRadiusKm;
    iterations.push({
      iteration,
      loadFactor: currentLoad,
      loadMarginDb,
      maplEffectiveDb,
      radiusKm,
      activeUsersPerCell,
      deltaRadiusKm,
    });

    if (previousRadiusKm !== null && Math.abs(radiusKm - previousRadiusKm) < convergenceToleranceKm) {
      converged = true;
      finalRadiusKm = radiusKm;
      finalLoad = nextLoad;
      break;
    }

    previousRadiusKm = radiusKm;
    currentLoad = nextLoad;
  }

  const nodeBsByCoverage =
    finalRadiusKm !== null ? Math.ceil(totalAreaKm2 / (HEX_AREA_COEFFICIENT * finalRadiusKm ** 2)) : null;
  const nodeBsFinal = nodeBsByCoverage !== null ? Math.max(nodeBsByCapacity, nodeBsByCoverage) : null;
  const bindingConstraint: 'capacity' | 'coverage' | null =
    nodeBsByCoverage === null ? null : nodeBsByCapacity >= nodeBsByCoverage ? 'capacity' : 'coverage';

  return {
    services: serviceLoads,
    mixLoadFactor,
    maxSimultaneousUsersPerCell,
    usersPerServicePerCell,
    iterations,
    converged,
    finalRadiusKm,
    finalLoad,
    nodeBsByCoverage,
    nodeBsByCapacity,
    nodeBsFinal,
    bindingConstraint,
  };
}
