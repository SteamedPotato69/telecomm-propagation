import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

interface LinkBudgetResultPanelProps {
  eirpDbm: number | null;
  maplDb: number | null;
  cellRadiusKm: number | null;
  errorMessage: string | null;
}

export function LinkBudgetResultPanel({ eirpDbm, maplDb, cellRadiusKm, errorMessage }: LinkBudgetResultPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (errorMessage) {
    return (
      <View style={[styles.container, { backgroundColor: colors.errorSurface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
      </View>
    );
  }

  if (eirpDbm === null || maplDb === null) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>EIRP</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{eirpDbm.toFixed(2)} dBm</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>MAPL</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{maplDb.toFixed(2)} dB</Text>
        </View>
      </View>
      {cellRadiusKm !== null ? (
        <View style={styles.row}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('linkBudget.result.maxRadius')}</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{cellRadiusKm.toFixed(3)} km</Text>
          </View>
        </View>
      ) : null}
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
