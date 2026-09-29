import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme';

interface ListCardProps {
  title: string;
  description: string;
  statusText?: string;
  disabled?: boolean;
  onPress: () => void;
}

/**
 * Plain bordered list-item card, extracted from EnvironmentScreen's
 * original inline JSX. Used for sub-navigation hub screens (a list of
 * choices under a HomeScreen feature), as opposed to GlowCard's neon
 * treatment reserved for HomeScreen's own top-level entries.
 */
export function ListCard({ title, description, statusText, disabled = false, onPress }: ListCardProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={statusText ? `${title}, ${statusText}` : title}
      style={[
        styles.card,
        { borderColor: colors.border, backgroundColor: colors.surface },
        disabled && { backgroundColor: colors.surfaceDisabled, opacity: 0.55 },
      ]}
    >
      <Text style={[styles.title, { color: disabled ? colors.textDisabled : colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.description, { color: disabled ? colors.textDisabled : colors.textSecondary }]}>
        {description}
      </Text>
      {statusText ? (
        <Text style={[styles.status, { color: disabled ? colors.textDisabled : colors.accentText }]}>
          {statusText}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  title: { fontSize: 15, fontWeight: '700' },
  description: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  status: { fontSize: 11, fontWeight: '600', marginTop: 8 },
});
