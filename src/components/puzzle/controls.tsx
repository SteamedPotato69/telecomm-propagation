import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme';

interface SmallButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Filled lilac button for the main action of a row. */
  primary?: boolean;
}

/** The compact action button used under the map (undo, hint, rotate...). 44 px high: a comfortable touch target. */
export function SmallButton({ label, onPress, disabled = false, primary = false }: SmallButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      style={[
        styles.button,
        primary ? { backgroundColor: colors.accentSolid } : { borderWidth: 1, borderColor: colors.border },
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.text, { color: primary ? '#ffffff' : colors.textPrimary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14, marginRight: 8, marginBottom: 8 },
  text: { fontSize: 13, fontWeight: '700' },
  disabled: { opacity: 0.4 },
});
