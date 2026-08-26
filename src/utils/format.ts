export function formatPathLoss(value: number): string {
  if (!Number.isFinite(value)) {
    return '—';
  }
  return `${value.toFixed(2)} dB`;
}
