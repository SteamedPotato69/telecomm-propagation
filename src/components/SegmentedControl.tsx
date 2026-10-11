import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  selected: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
}

/** Pill-shaped single-choice switch for a few short options (theme mode). */
export function SegmentedControl<T extends string>({
  options,
  selected,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[styles.track, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
            style={[styles.segment, isSelected && { backgroundColor: colors.accentSolid }]}
          >
            <Text style={[styles.text, { color: isSelected ? '#ffffff' : colors.textSecondary }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    padding: 3,
  },
  segment: {
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 40,
    justifyContent: 'center',
  },
  text: { fontSize: 13, fontWeight: '600' },
});
