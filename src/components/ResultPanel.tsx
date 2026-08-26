import { StyleSheet, Text, View } from 'react-native';
import type { PropagationWarning } from '../models/propagation';
import { formatPathLoss } from '../utils/format';

interface ResultPanelProps {
  pathLossDb: number | null;
  warnings: PropagationWarning[];
  errorMessage: string | null;
}

export function ResultPanel({ pathLossDb, warnings, errorMessage }: ResultPanelProps) {
  if (errorMessage) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{errorMessage}</Text>
      </View>
    );
  }

  if (pathLossDb === null) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resultLabel}>Pérdida de propagación</Text>
      <Text style={styles.resultValue}>{formatPathLoss(pathLossDb)}</Text>
      {warnings.map((warning, index) => (
        <Text key={`${warning.field}-${index}`} style={styles.warningText}>
          ⚠ {warning.message}
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
    backgroundColor: '#f0f4f8',
  },
  errorContainer: { backgroundColor: '#fdecea' },
  errorText: { color: '#b3261e', fontSize: 14 },
  resultLabel: { fontSize: 13, color: '#52606d', marginBottom: 4 },
  resultValue: { fontSize: 28, fontWeight: '700', color: '#102a43' },
  warningText: { fontSize: 12, color: '#8a6d00', marginTop: 8 },
});
