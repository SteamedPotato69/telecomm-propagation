import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme';

interface ModelSelectorItem {
  id: string;
  label: string;
  disabled: boolean;
}

interface ModelSelectorProps {
  items: ModelSelectorItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

/**
 * Chip row instead of a native <Picker>: with only a handful of options
 * it's more discoverable at a glance (all options visible, disabled ones
 * clearly grayed out) and avoids adding @react-native-picker/picker as a
 * native dependency for a single control.
 *
 * Generic over {id, label, disabled} rather than PropagationModelDefinition
 * directly -- LinkBudgetScreen reuses this same chip row to pick among
 * models filtered by solveDistanceKm presence, a different "why disabled"
 * reason than CalculatorScreen's `implemented` flag. Callers compute their
 * own disabled reason and map to this shape.
 */
export function ModelSelector({ items, selectedId, onSelect }: ModelSelectorProps) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map((item) => {
        const isSelected = item.id === selectedId;
        return (
          <Pressable
            key={item.id}
            disabled={item.disabled}
            onPress={() => onSelect(item.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected, disabled: item.disabled }}
            accessibilityLabel={item.disabled ? `${item.label}, próximamente` : item.label}
            style={[
              styles.chip,
              { borderColor: colors.border },
              isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
              item.disabled && styles.chipDisabled,
            ]}
          >
            <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
              {item.label}
              {item.disabled ? ' (próximamente)' : ''}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingVertical: 4, paddingRight: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 8,
  },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 14, fontWeight: '600' },
});
