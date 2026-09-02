import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme';

interface NumericFieldProps {
  label: string;
  /** Physical unit shown in parens next to the label (e.g. "MHz"). Omit for dimensionless parameters (e.g. lr). */
  unit?: string;
  value: string;
  onChangeText: (value: string) => void;
  helperText?: string;
}

export function NumericField({ label, unit, value, onChangeText, helperText }: NumericFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{unit ? `${label} (${unit})` : label}</Text>
      <TextInput
        style={[styles.input, { borderColor: colors.border, color: colors.textPrimary, backgroundColor: colors.surface }]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
      />
      {helperText ? <Text style={[styles.helperText, { color: colors.textMuted }]}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
  },
  helperText: { fontSize: 11, marginTop: 4 },
});
