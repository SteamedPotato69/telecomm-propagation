export function formatPathLoss(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(2)} dB`;
}

/** Bc, in Hz -- displayed in kHz to match the course's own table (§8.6). */
export function formatCoherenceBandwidth(hz: number): string {
  if (!Number.isFinite(hz)) {
    return '—';
  }
  return `${(hz / 1000).toFixed(2)} kHz`;
}

/** fd, in Hz -- displayed as-is to match the course's Doppler table (§8.6). */
export function formatDopplerShift(hz: number): string {
  if (!Number.isFinite(hz)) {
    return '—';
  }
  return `${hz.toFixed(1)} Hz`;
}

/**
 * Tc, in seconds -- displayed in ms to match §8.6/§8.8. A stationary
 * mobile (v = 0) yields Tc = +Infinity, which is a legitimate physical
 * result (channel never decorrelates), not an error -- shown as "∞ ms"
 * rather than the generic '—' used for NaN/undefined.
 */
export function formatCoherenceTime(seconds: number): string {
  if (Number.isNaN(seconds)) {
    return '—';
  }
  if (!Number.isFinite(seconds)) {
    return '∞ ms';
  }
  return `${(seconds * 1000).toFixed(2)} ms`;
}
