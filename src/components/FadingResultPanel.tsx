import { StyleSheet, Text, View } from 'react-native';
import type { FadingResult } from '../models/fading';
import { formatCoherenceBandwidth, formatCoherenceTime, formatDopplerShift } from '../utils/format';

interface FadingResultPanelProps {
  result: FadingResult | null;
  errorMessage: string | null;
}

/**
 * Fading-specific variant of ResultPanel.tsx: same container/typography
 * scale, but shows 3 derived quantities (Bc, fd, Tc) plus the
 * flat/selective and slow/fast classification in plain Spanish, instead
 * of a single path-loss number -- the zone name itself is shown by
 * FadingZoneChart, not duplicated here.
 */
export function FadingResultPanel({ result, errorMessage }: FadingResultPanelProps) {
  if (errorMessage) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Ancho de banda de coherencia (Bc)</Text>
          <Text style={styles.metricValue}>{formatCoherenceBandwidth(result.coherenceBandwidthHz)}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Corrimiento Doppler (fd)</Text>
          <Text style={styles.metricValue}>{formatDopplerShift(result.dopplerShiftHz)}</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Tiempo de coherencia (Tc)</Text>
          <Text style={styles.metricValue}>{formatCoherenceTime(result.coherenceTimeS)}</Text>
        </View>
      </View>

      <View style={styles.classificationBlock}>
        <Text style={styles.classificationText}>
          {result.frequencySelective
            ? '⚠ Selectivo en frecuencia (FSF): BT > Bc.'
            : '✓ Plano en frecuencia: BT < Bc.'}
        </Text>
        <Text style={styles.classificationText}>
          {result.timeSelective
            ? '⚠ Selectivo en tiempo (TSF / fast fading): Ts > Tc.'
            : '✓ Plano en tiempo / lento: Ts < Tc.'}
        </Text>
        {result.zone === 1 ? (
          <Text style={styles.warningText}>
            ⚠ BT·Ts &lt; 1: el ancho de banda no alcanza para la tasa de símbolo pedida (zona rayada, ver
            gráfica).
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f0f4f8',
  },
  errorContainer: { backgroundColor: '#fdecea' },
  errorText: { color: '#b3261e', fontSize: 14 },
  row: { flexDirection: 'row', marginBottom: 8 },
  metric: { flex: 1 },
  metricLabel: { fontSize: 12, color: '#52606d' },
  metricValue: { fontSize: 20, fontWeight: '700', color: '#102a43', marginTop: 2 },
  classificationBlock: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#e4e9ee', paddingTop: 10 },
  classificationText: { fontSize: 13, color: '#1f2933', marginTop: 4 },
  warningText: { fontSize: 12, color: '#8a6d00', marginTop: 8 },
});
