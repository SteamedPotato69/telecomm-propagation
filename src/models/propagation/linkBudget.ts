import { LocalizedError } from '../../utils/localizedMessage';
import { assertNonNegative } from '../../utils/validation';
import type { LinkBudgetInputs, LinkBudgetResult } from './types';

/**
 * Maximum allowable path loss from a full link budget
 * (docs/curso-referencia.md §13.3, diap. 45-46).
 *
 * The course slides (diap. 45-46) show the parameter table and the final
 * MAPL directly, not the intermediate combination formula -- this is the
 * standard telecom-textbook form:
 *
 *   MAPL = EIRP + Gr - feederLoss - sensitivity - shadowMargin - interferenceMargin
 *
 * Checked against the original PDF's own two worked examples: the 2G
 * example (diap. 46) reproduces the stated MAPL=133dB exactly -- but only
 * once EIRP is *derived* from Pt+Gt-bodyLoss (30+0-3=27) rather than using
 * that slide's own stated "EIRP MS = 30dBm", which is inconsistent with
 * its own Pt/Gt/bodyLoss row (the 1G slide's EIRP is self-consistent;
 * the 2G one has this apparent copy-paste error, most likely from reusing
 * the 1G slide as a template). The 1G example (diap. 45), whose EIRP *is*
 * self-consistent, still comes out 2dB high (143 vs the stated 141) with
 * no equivalent explanation found in the source material -- flagged here
 * rather than fudged away, same as ikegami.ts's [OCR-verificar] signs.
 * The distance-solving side of Phase 4 (solveHataDistanceKm) doesn't
 * depend on this function at all -- it's verified independently and more
 * tightly (see hata.test.ts) using the exact MAPL the slides state.
 */
export function calculateMapl(inputs: LinkBudgetInputs): LinkBudgetResult {
  const {
    transmitPowerDbm,
    transmitAntennaGainDbi,
    bodyLossDb,
    receiveAntennaGainDbi,
    feederLossDb,
    receiverSensitivityDbm,
    shadowFadingMarginDb,
    interferenceMarginDb,
  } = inputs;

  assertNonNegative(bodyLossDb, 'bodyLoss');
  assertNonNegative(feederLossDb, 'feederLoss');
  assertNonNegative(shadowFadingMarginDb, 'shadowFadingMargin');
  assertNonNegative(interferenceMarginDb, 'interferenceMargin');

  const eirpDbm = transmitPowerDbm + transmitAntennaGainDbi - bodyLossDb;
  const maplDb =
    eirpDbm +
    receiveAntennaGainDbi -
    feederLossDb -
    receiverSensitivityDbm -
    shadowFadingMarginDb -
    interferenceMarginDb;

  if (maplDb <= 0) {
    throw new LocalizedError('errors.maplNonPositive');
  }

  return { eirpDbm, maplDb };
}
