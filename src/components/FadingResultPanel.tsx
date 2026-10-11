import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { FadingResult } from '../models/fading';
import { useTheme } from '../theme';
import { formatCoherenceBandwidth, formatCoherenceTime, formatDopplerShift } from '../utils/format';

interface FadingResultPanelProps {
  result: FadingResult | null;
  errorMessage: string | null;
}

/**
 * Fading-specific variant of ResultPanel.tsx: same container/typography
 * scale, but shows 3 derived quantities (Bc, fd, Tc) plus the
 * flat/selective and slow/fast classification in plain language, instead
 * of a single path-loss number -- the zone name itself is shown by
 * FadingZoneChart, not duplicated here.
 */
export function FadingResultPanel({ result, errorMessage }: FadingResultPanelProps) {
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
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('fading.result.bc')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {formatCoherenceBandwidth(result.coherenceBandwidthHz)}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('fading.result.fd')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {formatDopplerShift(result.dopplerShiftHz)}
          </Text>
        </View>
      </View>
      <View style={styles.row}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{t('fading.result.tc')}</Text>
          <Text style={[styles.metricValue, { color: colors.textPrimary }]}>
            {formatCoherenceTime(result.coherenceTimeS)}
          </Text>
        </View>
      </View>

      <View style={[styles.classificationBlock, { borderTopColor: colors.borderMuted }]}>
        <Text style={[styles.classificationText, { color: colors.textPrimary }]}>
          {result.frequencySelective
            ? t('fading.result.frequencySelective')
            : t('fading.result.frequencyFlat')}
        </Text>
        <Text style={[styles.classificationText, { color: colors.textPrimary }]}>
          {result.timeSelective
            ? t('fading.result.timeSelective')
            : t('fading.result.timeFlat')}
        </Text>
        {result.zone === 1 ? (
          <Text style={[styles.warningText, { color: colors.warning }]}>
            {t('fading.result.nyquistWarning')}
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
  },
  errorText: { fontSize: 14 },
  row: { flexDirection: 'row', marginBottom: 8 },
  metric: { flex: 1 },
  metricLabel: { fontSize: 12 },
  metricValue: { fontSize: 20, fontWeight: '700', marginTop: 2 },
  classificationBlock: { marginTop: 8, borderTopWidth: 1, paddingTop: 10 },
  classificationText: { fontSize: 13, marginTop: 4 },
  warningText: { fontSize: 12, marginTop: 8 },
});
