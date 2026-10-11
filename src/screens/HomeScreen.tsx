import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlowCard } from '../components/GlowCard';
import { useTheme } from '../theme';

interface HomeScreenProps {
  onSelectEmpiricalMethods: () => void;
  onSelectFadingSimulator: () => void;
  onSelectCellularPlanning: () => void;
  onOpenSettings: () => void;
}

export function HomeScreen({
  onSelectEmpiricalMethods,
  onSelectFadingSimulator,
  onSelectCellularPlanning,
  onOpenSettings,
}: HomeScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  // Data-driven so a future feature is one array entry, not a new
  // hand-copied JSX block (see README's own note on this).
  const cards = [
    {
      id: 'empirical',
      title: t('home.cards.empirical.title'),
      subtitle: t('home.cards.empirical.subtitle'),
      onPress: onSelectEmpiricalMethods,
    },
    {
      id: 'fading',
      title: t('home.cards.fading.title'),
      subtitle: t('home.cards.fading.subtitle'),
      onPress: onSelectFadingSimulator,
    },
    {
      id: 'cellular',
      title: t('home.cards.cellular.title'),
      subtitle: t('home.cards.cellular.subtitle'),
      onPress: onSelectCellularPlanning,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
          PROPAPP
        </Text>
        <Pressable
          onPress={onOpenSettings}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={t('home.settings')}
          style={({ pressed }) => [styles.settingsButton, pressed && { backgroundColor: colors.surfaceMuted }]}
        >
          <Text style={[styles.settingsIcon, { color: colors.accentText }]}>⚙</Text>
        </Pressable>
      </View>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('home.chooseFeature')}</Text>

      {cards.map((card) => (
        <GlowCard key={card.id} title={card.title} subtitle={card.subtitle} onPress={card.onPress} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 20 },
  header: { justifyContent: 'center', minHeight: 48 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  // Absolutely positioned so the title stays optically centered regardless of the button.
  settingsButton: {
    position: 'absolute',
    right: -12,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: 24 },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 28 },
});
