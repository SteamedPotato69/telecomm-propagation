import { Pressable, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

interface BackButtonProps {
  onPress: () => void;
}

/**
 * Icon-only back button (no "‹ <destination label>" text -- every screen
 * used to spell out where it goes, which got long and didn't leave room
 * for a properly sized tap target). Sized to a 48x48dp box, the minimum
 * recommended touch target (Material Design's 48dp / Apple HIG's 44pt),
 * well above the old text link's effective hit area.
 */
export function BackButton({ onPress }: BackButtonProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={t('common.back')}
      style={({ pressed }) => [styles.button, pressed && { backgroundColor: colors.surfaceMuted }]}
    >
      <Text style={[styles.arrow, { color: colors.accentText }]}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    marginLeft: -12, // optically aligns the glyph with the screen's left text edge
  },
  arrow: { fontSize: 32, fontWeight: '700', lineHeight: 34 },
});
