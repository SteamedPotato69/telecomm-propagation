import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { SegmentedControl } from '../components/SegmentedControl';
import { LANGUAGES, LANGUAGE_NATIVE_NAMES, useLocale } from '../i18n';
import type { LanguagePreference } from '../i18n';
import { useProgress } from '../progress/ProgressContext';
import { useTheme } from '../theme';
import type { ThemeMode } from '../theme';

interface SettingsScreenProps {
  onBack: () => void;
}

const THEME_MODES: ThemeMode[] = ['dark', 'system', 'light'];
const THEME_ICONS: Record<ThemeMode, string> = { dark: '🌙 ', system: '', light: '☀ ' };

/** Groups the two user preferences (theme, language) in one place instead of crowding Home. */
export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { t } = useTranslation();
  const { colors, mode, setMode } = useTheme();
  const { preference, setPreference } = useLocale();
  const { progress, setEffects } = useProgress();

  const themeLabels: Record<ThemeMode, string> = {
    dark: t('settings.theme.dark'),
    system: t('settings.theme.system'),
    light: t('settings.theme.light'),
  };
  const languageOptions: { value: LanguagePreference; label: string }[] = [
    { value: 'system', label: t('settings.language.system') },
    // Native names are deliberately not translated -- see LANGUAGE_NATIVE_NAMES.
    ...LANGUAGES.map((language) => ({ value: language, label: LANGUAGE_NATIVE_NAMES[language] })),
  ];

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />

      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {t('settings.title')}
      </Text>

      <Text style={[styles.sectionTitle, { color: colors.accentText }]}>{t('settings.theme.title')}</Text>
      <SegmentedControl
        accessibilityLabel={t('settings.theme.title')}
        selected={mode}
        onChange={setMode}
        options={THEME_MODES.map((value) => ({ value, label: `${THEME_ICONS[value]}${themeLabels[value]}` }))}
      />

      <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.accentText }]}>
        {t('settings.language.title')}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={t('settings.language.title')}>
        {languageOptions.map((option) => {
          const isSelected = preference === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => setPreference(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={[
                styles.row,
                { borderColor: isSelected ? colors.accentSolid : colors.border, backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.rowText, { color: colors.textPrimary }]}>{option.label}</Text>
              {isSelected ? <Text style={[styles.check, { color: colors.accentText }]}>✓</Text> : null}
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('settings.language.hint')}</Text>

      <Text style={[styles.sectionTitle, styles.sectionSpacing, { color: colors.accentText }]}>{t('game.effects.title')}</Text>
      <SegmentedControl
        accessibilityLabel={t('game.effects.title')}
        selected={progress.effects ? 'on' : 'off'}
        onChange={(value) => setEffects(value === 'on')}
        options={[
          { value: 'on', label: t('game.effects.on') },
          { value: 'off', label: t('game.effects.off') },
        ]}
      />
      <Text style={[styles.hint, styles.effectsHint, { color: colors.textMuted }]}>{t('game.effects.hint')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  sectionSpacing: { marginTop: 28 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    minHeight: 48,
    marginBottom: 8,
  },
  rowText: { fontSize: 15, fontWeight: '600' },
  check: { fontSize: 18, fontWeight: '700' },
  hint: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  effectsHint: { marginTop: 10 },
});
