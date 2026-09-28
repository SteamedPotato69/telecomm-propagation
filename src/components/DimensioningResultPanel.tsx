import { StyleSheet, Text, View } from 'react-native';
import type { DimensioningResult } from '../models/dimensioning';
import { useTheme } from '../theme';

interface DimensioningResultPanelProps {
  result: DimensioningResult | null;
  errorMessage: string | null;
}

const BINDING_LABEL: Record<DimensioningResult['bindingConstraint'], string> = {
  capacity: 'Capacidad',
  coverage: 'Cobertura',
};

export function DimensioningResultPanel({ result, errorMessage }: DimensioningResultPanelProps) {
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
      <Text style={[styles.stageLabel, { color: colors.accentText }]}>Por capacidad</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Tráfico/celda (A_c)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.trafficPerCellErlangs.toFixed(3)} Erlang
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Celdas por capacidad</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellsByCapacity}</Text>
        </View>
      </View>

      <Text style={[styles.stageLabel, { color: colors.accentText, marginTop: 12 }]}>Por cobertura</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>MAPL</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.maplDb.toFixed(2)} dB</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Radio de celda (R)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellRadiusKm.toFixed(3)} km</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Área de celda (π·R²)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellAreaKm2.toFixed(3)} km²</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Celdas por cobertura</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellsByCoverage}</Text>
        </View>
      </View>

      <View style={[styles.finalBlock, { borderTopColor: colors.borderMuted }]}>
        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
          Resultado final -- factor limitante: {BINDING_LABEL[result.bindingConstraint]}
        </Text>
        <Text style={[styles.finalValue, { color: colors.textPrimary }]}>{result.cellsFinal} celdas</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, padding: 16, borderRadius: 12 },
  errorText: { fontSize: 14 },
  stageLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginTop: 8 },
  metric: { flex: 1 },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  finalBlock: { marginTop: 12, borderTopWidth: 1, paddingTop: 10 },
  finalValue: { fontSize: 26, fontWeight: '700', marginTop: 4 },
});
