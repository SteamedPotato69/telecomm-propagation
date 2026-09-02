import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import type { PropagationModelDefinition, PropagationModelId } from '../models/propagation';
import { useTheme } from '../theme';

interface ModelSelectorProps {
  models: PropagationModelDefinition[];
  selectedId: PropagationModelId;
  onSelect: (id: PropagationModelId) => void;
}

/**
 * Chip row instead of a native <Picker>: with only 6 options it's more
 * discoverable at a glance (all options visible, disabled ones clearly
 * grayed out) and avoids adding @react-native-picker/picker as a native
 * dependency for a single control.
 */
export function ModelSelector({ models, selectedId, onSelect }: ModelSelectorProps) {
  const { colors } = useTheme();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {models.map((model) => {
        const isSelected = model.id === selectedId;
        const disabled = !model.implemented;
        return (
          <Pressable
            key={model.id}
            disabled={disabled}
            onPress={() => onSelect(model.id)}
            style={[
              styles.chip,
              { borderColor: colors.border },
              isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
              disabled && styles.chipDisabled,
            ]}
          >
            <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
              {model.shortLabel}
              {disabled ? ' (próximamente)' : ''}
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
    paddingVertical: 8,
    marginRight: 8,
  },
  chipDisabled: { opacity: 0.4 },
  chipText: { fontSize: 14, fontWeight: '600' },
});
