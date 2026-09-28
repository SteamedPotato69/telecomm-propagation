import { StyleSheet, Text, View } from 'react-native';
import type { GeometryResult } from '../models/geometry';
import { useTheme } from '../theme';

interface GeometryResultPanelProps {
  result: GeometryResult | null;
  errorMessage: string | null;
}

export function GeometryResultPanel({ result, errorMessage }: GeometryResultPanelProps) {
  const { colors } = useTheme();

  if (errorMessage) {
    return (
      <View style={[styles.container, { backgroundColor: colors.errorSurface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
      </View>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Paso de retícula (d)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.latticeStepKm.toFixed(3)} km</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Distancia de reutilización (D)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.reuseDistanceKm.toFixed(3)} km
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Área de celda (S_c)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellAreaKm2.toFixed(3)} km²</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Área del rombo cocanal (S_RC)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.cocellAreaKm2.toFixed(3)} km²
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Área por sector (trisectorial)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.sectorAreaKm2.toFixed(3)} km²
          </Text>
        </View>
        {result.clusterCount !== undefined ? (
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Número de agrupaciones (Q)</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.clusterCount}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, padding: 16, borderRadius: 12 },
  errorText: { fontSize: 14 },
  row: { flexDirection: 'row', marginBottom: 8 },
  metric: { flex: 1 },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 20, fontWeight: '700', marginTop: 2 },
});
