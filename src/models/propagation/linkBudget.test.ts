import { describe, expect, it } from 'vitest';
import { calculateMapl } from './linkBudget';

describe('calculateMapl', () => {
  // docs/curso-referencia.md §13.3 (diap. 45-46, confirmed against the
  // original PDF). See the [note] in linkBudget.ts: the 2G example
  // reproduces exactly once EIRP is derived (not taken from that slide's
  // own inconsistent stated EIRP); the 1G example has an unexplained 2dB
  // gap even with fully self-consistent inputs -- documented, not hidden.
  it('2G example: matches the slide-stated MAPL=133dB exactly (diap. 46)', () => {
    const result = calculateMapl({
      transmitPowerDbm: 30,
      transmitAntennaGainDbi: 0,
      bodyLossDb: 3,
      receiveAntennaGainDbi: 15,
      feederLossDb: 3,
      receiverSensitivityDbm: -104,
      shadowFadingMarginDb: 8,
      interferenceMarginDb: 2,
    });
    // Derived EIRP (27), not the slide's own inconsistent "EIRP MS = 30dBm".
    expect(result.eirpDbm).toBe(27);
    expect(result.maplDb).toBeCloseTo(133, 6);
  });

  it('1G example: computes 143dB, an unexplained 2dB above the slide-stated 141dB (diap. 45)', () => {
    const result = calculateMapl({
      transmitPowerDbm: 33,
      transmitAntennaGainDbi: 0,
      bodyLossDb: 3,
      receiveAntennaGainDbi: 13,
      feederLossDb: 3,
      receiverSensitivityDbm: -116,
      shadowFadingMarginDb: 8,
      interferenceMarginDb: 5,
    });
    expect(result.eirpDbm).toBe(30); // matches the slide's own stated EIRP exactly
    expect(result.maplDb).toBeCloseTo(143, 6);
  });

  it('throws when the link budget leaves no margin (MAPL <= 0)', () => {
    expect(() =>
      calculateMapl({
        transmitPowerDbm: 0,
        transmitAntennaGainDbi: 0,
        bodyLossDb: 0,
        receiveAntennaGainDbi: 0,
        feederLossDb: 0,
        receiverSensitivityDbm: 0,
        shadowFadingMarginDb: 0,
        interferenceMarginDb: 0,
      })
    ).toThrow();
  });
});
