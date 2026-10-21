import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme';

interface ChoiceChipsProps<T extends string | number> {
  options: { value: T; label: string }[];
  selected: T;
  onSelect: (value: T) => void;
  accessibilityLabel: string;
}

/** A row of single-choice chips (cluster size, environment). Same look as the chips on the other screens. */
export function ChoiceChips<T extends string | number>({ options, selected, onSelect, accessibilityLabel }: ChoiceChipsProps<T>) {
  const { colors } = useTheme();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.row}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onSelect(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.chip,
              { borderColor: colors.border },
              isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
            ]}
          >
            <Text style={[styles.text, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 40,
    marginRight: 8,
    marginBottom: 8,
    justifyContent: 'center',
  },
  text: { fontSize: 13 },
});
