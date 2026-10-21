import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { BackButton } from '../BackButton';

interface PlanShellProps {
  title: string;
  /** 0-based index of the current step. */
  stepIndex: number;
  totalSteps: number;
  /** Header back button: leaves the wizard (to the start screen). */
  onLeave: () => void;
  onPrevious: () => void;
  /** Absent on the last step. */
  onNext?: () => void;
  nextDisabled?: boolean;
  /** "Tu plan hasta ahora", shown above the step. */
  ledger?: ReactNode;
  /** false while a finger is dragging over a map, so the page does not scroll under it. */
  scrollEnabled?: boolean;
  children: ReactNode;
}

/**
 * The frame every wizard step shares: back button, "Paso 2 de 6" with a
 * progress bar, the ledger of what was decided so far, the step itself, and
 * Previous / Next. Keeping it in one place is what makes every step look like
 * the same screen with different content.
 */
export function PlanShell({
  title,
  stepIndex,
  totalSteps,
  onLeave,
  onPrevious,
  onNext,
  nextDisabled = false,
  ledger,
  scrollEnabled = true,
  children,
}: PlanShellProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const progress = (stepIndex + 1) / totalSteps;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" scrollEnabled={scrollEnabled}>
        <BackButton onPress={onLeave} />

        <Text style={[styles.step, { color: colors.accentText }]}>
          {t('plan.shell.stepOf', { step: stepIndex + 1, total: totalSteps })}
        </Text>
        <View
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 1, max: totalSteps, now: stepIndex + 1 }}
          style={[styles.track, { backgroundColor: colors.borderMuted }]}
        >
          <View style={[styles.bar, { width: `${progress * 100}%`, backgroundColor: colors.accent }]} />
        </View>

        <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
          {title}
        </Text>

        {ledger}
        {children}

        <View style={styles.footer}>
          <Pressable
            onPress={onPrevious}
            accessibilityRole="button"
            style={[styles.button, styles.secondary, { borderColor: colors.border }]}
          >
            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>{t('plan.shell.previous')}</Text>
          </Pressable>
          {onNext ? (
            <Pressable
              onPress={onNext}
              disabled={nextDisabled}
              accessibilityRole="button"
              accessibilityState={{ disabled: nextDisabled }}
              style={[styles.button, { backgroundColor: colors.accentSolid }, nextDisabled && styles.disabled]}
            >
              <Text style={[styles.buttonText, { color: '#ffffff' }]}>{t('plan.shell.next')}</Text>
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  step: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  track: { height: 6, borderRadius: 3, marginTop: 8, marginBottom: 14, overflow: 'hidden' },
  bar: { height: 6, borderRadius: 3 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 24 },
  button: { flex: 1, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  secondary: { borderWidth: 1 },
  buttonText: { fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.4 },
});
