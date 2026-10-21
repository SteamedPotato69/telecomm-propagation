import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '../theme';

interface NumericFieldProps {
  label: string;
  /** Physical unit shown in parens next to the label (e.g. "MHz"). Omit for dimensionless parameters (e.g. lr). */
  unit?: string;
  value: string;
  onChangeText: (value: string) => void;
  helperText?: string;
  /** Red border: the text is not a usable number. */
  invalid?: boolean;
}

export function NumericField({ label, unit, value, onChangeText, helperText, invalid = false }: NumericFieldProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.textPrimary }]}>{unit ? `${label} (${unit})` : label}</Text>
      <TextInput
        style={[
          styles.input,
          { borderColor: invalid ? colors.error : colors.border, color: colors.textPrimary, backgroundColor: colors.surface },
        ]}
        accessibilityLabel={unit ? `${label} (${unit})` : label}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholderTextColor={colors.textMuted}
      />
      {helperText ? (
        <Text style={[styles.helperText, { color: invalid ? colors.error : colors.textMuted }]}>{helperText}</Text>
      ) : null}
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
