import { StyleSheet, Text, View } from 'react-native';
import type { WcdmaLoadResult } from '../models/wcdma';
import { useTheme } from '../theme';

interface WcdmaResultPanelProps {
  result: WcdmaLoadResult | null;
  errorMessage: string | null;
}

const BINDING_LABEL: Record<'capacity' | 'coverage', string> = {
  capacity: 'Capacidad',
  coverage: 'Cobertura',
};

export function WcdmaResultPanel({ result, errorMessage }: WcdmaResultPanelProps) {
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
      <Text style={[styles.stageLabel, { color: colors.accentText }]}>Carga por servicio</Text>
      {result.services.map((service) => (
        <View key={service.label} style={styles.row}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{service.label} -- Gp</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {service.processingGainDb.toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>ρ (por usuario)</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {(service.loadFactorPerUser * 100).toFixed(2)}%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>MAPL carga cero</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {service.maplZeroLoadDb.toFixed(1)} dB
            </Text>
          </View>
        </View>
      ))}

      <Text style={[styles.stageLabel, { color: colors.accentText, marginTop: 12 }]}>Usuarios simultáneos</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Máximo por celda (N_max)</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.maxSimultaneousUsersPerCell.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        {result.usersPerServicePerCell.map((entry) => (
          <View key={entry.label} style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{entry.label}</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{entry.users}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.stageLabel, { color: colors.accentText, marginTop: 12 }]}>
        Convergencia (cell breathing)
      </Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary, marginTop: 4 }]}>
        {result.converged
          ? `Convergió en ${result.iterations.length - 1} iteraciones`
          : `No convergió en ${result.iterations.length} iteraciones -- ver traza`}
      </Text>
      {result.converged ? (
        <>
          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Radio convergido (R)</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {result.finalRadiusKm?.toFixed(3)} km
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Carga convergida (η)</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {((result.finalLoad ?? 0) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>NodeB por cobertura</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.nodeBsByCoverage}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>NodeB por capacidad</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.nodeBsByCapacity}</Text>
            </View>
          </View>
          <View style={[styles.finalBlock, { borderTopColor: colors.borderMuted }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              Resultado final -- factor limitante:{' '}
              {result.bindingConstraint ? BINDING_LABEL[result.bindingConstraint] : '--'}
            </Text>
            <Text style={[styles.finalValue, { color: colors.textPrimary }]}>{result.nodeBsFinal} NodeB</Text>
          </View>
        </>
      ) : null}

      <Text style={[styles.note, { color: colors.warning }]}>
        Downlink (η_DL) no implementado -- el material del curso usa una variable (β) sin definir y sin ejercicio de
        verificación (docs/curso-referencia.md §13.4-13.5).
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, padding: 16, borderRadius: 12 },
  errorText: { fontSize: 14 },
  stageLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginTop: 8, flexWrap: 'wrap' },
  metric: { flex: 1, minWidth: 100 },
  metricLabel: { fontSize: 11 },
  metricValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  finalBlock: { marginTop: 12, borderTopWidth: 1, paddingTop: 10 },
  finalValue: { fontSize: 24, fontWeight: '700', marginTop: 4 },
  note: { fontSize: 11, marginTop: 12, lineHeight: 15 },
});
