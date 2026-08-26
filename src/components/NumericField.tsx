import { StyleSheet, Text, TextInput, View } from 'react-native';

interface NumericFieldProps {
  label: string;
  unit: string;
  value: string;
  onChangeText: (value: string) => void;
  helperText?: string;
}

export function NumericField({ label, unit, value, onChangeText, helperText }: NumericFieldProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} ({unit})
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholderTextColor="#8a8a8a"
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, color: '#1f2933' },
  input: {
    borderWidth: 1,
    borderColor: '#c7ccd1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: '#1f2933',
  },
  helperText: { fontSize: 11, color: '#7b8794', marginTop: 4 },
});
