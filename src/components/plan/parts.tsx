import { ReactNode, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { translateMessage } from '../../i18n';
import type { LocalizedMessage } from '../../utils/localizedMessage';
import { useTheme } from '../../theme';

/** One-paragraph explanation under a step's title. */
export function Intro({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.intro, { color: colors.textSecondary }]}>{children}</Text>;
}

/** A bordered block for a step's result. */
export function Panel({ children }: { children: ReactNode }) {
  const { colors } = useTheme();
  return <View style={[styles.panel, { backgroundColor: colors.surfaceMuted }]}>{children}</View>;
}

/** The step's own message when its inputs are impossible: translated, never a crash. */
export function ErrorBox({ error }: { error: LocalizedMessage }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View accessibilityRole="alert" style={[styles.panel, { backgroundColor: colors.errorSurface }]}>
      <Text style={[styles.errorText, { color: colors.error }]}>{translateMessage(t, error)}</Text>
    </View>
  );
}

/** Non-blocking notes (model out of range, uplink only...), one line each. */
export function WarningList({ warnings }: { warnings: LocalizedMessage[] }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (warnings.length === 0) return null;
  return (
    <View style={styles.warnings}>
      {warnings.map((warning, index) => (
        <Text key={`${warning.key}-${index}`} style={[styles.warning, { color: colors.warning }]}>
          ⚠ {translateMessage(t, warning)}
        </Text>
      ))}
    </View>
  );
}

/**
 * Values the course fixes (link budget, service mix...) live here, folded by
 * default: the student sees only the few numbers that matter, and can still
 * open the rest when asked in the defence.
 */
export function AdvancedSection({ intro, children }: { intro: string; children: ReactNode }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.advanced, { borderColor: colors.borderMuted }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.advancedHeader}
      >
        <Text style={[styles.advancedTitle, { color: colors.accentText }]}>
          {open ? '▾' : '▸'} {t('plan.shell.advanced')}
        </Text>
      </Pressable>
      {open ? (
        <View style={styles.advancedBody}>
          <Text style={[styles.advancedIntro, { color: colors.textMuted }]}>{intro}</Text>
          {children}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 13, lineHeight: 18, marginBottom: 14 },
  panel: { borderRadius: 12, padding: 14, marginTop: 8, marginBottom: 8 },
  errorText: { fontSize: 14 },
  warnings: { marginTop: 4, marginBottom: 8 },
  warning: { fontSize: 12, lineHeight: 16, marginTop: 4 },
  advanced: { borderWidth: 1, borderRadius: 12, marginTop: 12, marginBottom: 8 },
  advancedHeader: { paddingHorizontal: 14, minHeight: 44, justifyContent: 'center' },
  advancedTitle: { fontSize: 13, fontWeight: '700' },
  advancedBody: { paddingHorizontal: 14, paddingBottom: 6 },
  advancedIntro: { fontSize: 12, lineHeight: 16, marginBottom: 10 },
});
