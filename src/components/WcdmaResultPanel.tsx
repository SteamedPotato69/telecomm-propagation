import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { WcdmaLoadResult } from '../models/wcdma';
import { useTheme } from '../theme';

interface WcdmaResultPanelProps {
  result: WcdmaLoadResult | null;
  errorMessage: string | null;
}

export function WcdmaResultPanel({ result, errorMessage }: WcdmaResultPanelProps) {
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
      <Text style={[styles.stageLabel, { color: colors.accentText }]}>{t('wcdma.result.loadPerService')}</Text>
      {result.services.map((service) => (
        <View key={service.id} style={styles.row}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.processingGain', { service: t(`wcdma.services.${service.id}`) })}</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {service.processingGainDb.toFixed(1)} dB
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.loadPerUser')}</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {(service.loadFactorPerUser * 100).toFixed(2)}%
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.maplZeroLoad')}</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
              {service.maplZeroLoadDb.toFixed(1)} dB
            </Text>
          </View>
        </View>
      ))}

      <Text style={[styles.stageLabel, { color: colors.accentText, marginTop: 12 }]}>{t('wcdma.result.simultaneousUsers')}</Text>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.maxPerCell')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {result.maxSimultaneousUsersPerCell.toFixed(2)}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        {result.usersPerServicePerCell.map((entry) => (
          <View key={entry.id} style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t(`wcdma.services.${entry.id}`)}</Text>
            <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{entry.users}</Text>
          </View>
        ))}
      </View>

      <Text style={[styles.stageLabel, { color: colors.accentText, marginTop: 12 }]}>
        {t('wcdma.result.convergence')}
      </Text>
      <Text style={[styles.metricLabel, { color: colors.textSecondary, marginTop: 4 }]}>
        {result.converged
          ? t('wcdma.result.converged', { count: result.iterations.length - 1 })
          : t('wcdma.result.notConverged', { count: result.iterations.length })}
      </Text>
      {result.converged ? (
        <>
          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.convergedRadius')}</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {result.finalRadiusKm?.toFixed(3)} km
              </Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.convergedLoad')}</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
                {((result.finalLoad ?? 0) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.nodeBsByCoverage')}</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.nodeBsByCoverage}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('wcdma.result.nodeBsByCapacity')}</Text>
              <Text style={[styles.metricValue, { color: colors.textPrimary }]}>{result.nodeBsByCapacity}</Text>
            </View>
          </View>
          <View style={[styles.finalBlock, { borderTopColor: colors.borderMuted }]}>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
              {t('dimensioning.result.finalLabel', {
                constraint: result.bindingConstraint ? t(`dimensioning.result.${result.bindingConstraint}`) : '--',
              })}
            </Text>
            <Text style={[styles.finalValue, { color: colors.textPrimary }]}>{t('wcdma.result.nodeBsFinal', { count: result.nodeBsFinal ?? 0 })}</Text>
          </View>
        </>
      ) : null}

      <Text style={[styles.note, { color: colors.warning }]}>
        {t('wcdma.result.downlinkNote')}
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
