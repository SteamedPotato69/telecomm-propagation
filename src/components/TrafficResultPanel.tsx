import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface TrafficResultPanelProps {
  label: string;
  value: string | null;
  errorMessage: string | null;
}

/**
 * Generic single-number result panel for TrafficScreen -- each Erlang B
 * solve mode (blocking / traffic / channels, and density in a later phase)
 * produces one labeled number, not a fixed multi-metric shape like
 * FadingResultPanel/GeometryResultPanel, so this takes the label and
 * pre-formatted value as props instead of a mode-specific result type.
 */
export function TrafficResultPanel({ label, value, errorMessage }: TrafficResultPanelProps) {
  const { colors } = useTheme();

  if (errorMessage) {
    return (
      <View style={[styles.container, { backgroundColor: colors.errorSurface }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
      </View>
    );
  }

  if (value === null) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 16, padding: 16, borderRadius: 12 },
  errorText: { fontSize: 14 },
  label: { fontSize: 12 },
  value: { fontSize: 24, fontWeight: '700', marginTop: 4 },
});
