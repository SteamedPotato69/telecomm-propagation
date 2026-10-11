import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '../i18n';
import type { PropagationWarning } from '../models/propagation';
import { useTheme } from '../theme';
import { formatPathLoss } from '../utils/format';

interface ResultPanelProps {
  pathLossDb: number | null;
  warnings: PropagationWarning[];
  errorMessage: string | null;
}

export function ResultPanel({ pathLossDb, warnings, errorMessage }: ResultPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (errorMessage) {
    return (
      <View style={[styles.container, { backgroundColor: colors.errorSurface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
      </View>
    );
  }

  if (pathLossDb === null) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{t('results.pathLoss')}</Text>
      <Text style={[styles.resultValue, { color: colors.textPrimary }]}>{formatPathLoss(pathLossDb)}</Text>
      {warnings.map((warning, index) => (
        <Text key={`${warning.field}-${index}`} style={[styles.warningText, { color: colors.warning }]}>
          ⚠ {translateMessage(t, warning.message)}
        </Text>
      ))}
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
  resultLabel: { fontSize: 13, marginBottom: 4 },
  resultValue: { fontSize: 28, fontWeight: '700' },
  warningText: { fontSize: 12, marginTop: 8 },
});
