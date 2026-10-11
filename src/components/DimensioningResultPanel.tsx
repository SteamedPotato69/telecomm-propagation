import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { DimensioningResult } from '../models/dimensioning';
import { useTheme } from '../theme';

interface DimensioningResultPanelProps {
  result: DimensioningResult | null;
  errorMessage: string | null;
}

export function DimensioningResultPanel({ result, errorMessage }: DimensioningResultPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

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
      <Text style={[styles.stageLabel, { color: colors.accentText }]}>{t('dimensioning.result.byCapacity')}</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('dimensioning.result.trafficPerCell')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.trafficPerCellErlangs.toFixed(3)} Erlang
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('dimensioning.result.cellsByCapacity')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellsByCapacity}</Text>
        </View>
      </View>

      <Text style={[styles.stageLabel, { color: colors.accentText, marginTop: 12 }]}>{t('dimensioning.result.byCoverage')}</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('dimensioning.result.mapl')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.maplDb.toFixed(2)} dB</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('dimensioning.result.cellRadius')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellRadiusKm.toFixed(3)} km</Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('dimensioning.result.cellArea')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellAreaKm2.toFixed(3)} km²</Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('dimensioning.result.cellsByCoverage')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.cellsByCoverage}</Text>
        </View>
      </View>

      <View style={[styles.finalBlock, { borderTopColor: colors.borderMuted }]}>
        <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
          {t('dimensioning.result.finalLabel', { constraint: t(`dimensioning.result.${result.bindingConstraint}`) })}
        </Text>
        <Text style={[styles.finalValue, { color: colors.textPrimary }]}>{t('dimensioning.result.cellsFinal', { count: result.cellsFinal })}</Text>
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
