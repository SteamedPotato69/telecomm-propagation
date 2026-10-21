import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { computePlan1g2g, computePlan3g, stepsFor } from '../models/plan';
import type { Generation } from '../models/plan';
import { usePlanStore } from '../plan/PlanContext';
import { useTheme } from '../theme';

interface PlanStartScreenProps {
  onBack: () => void;
  /** Open the wizard of a generation at a step. */
  onOpen: (generation: Generation, step: number) => void;
}

const GENERATIONS: { generation: Generation; key: 'g1' | 'g2' | 'g3' }[] = [
  { generation: '1g', key: 'g1' },
  { generation: '2g', key: 'g2' },
  { generation: '3g', key: 'g3' },
];

type SavedPlans = ReturnType<typeof usePlanStore>['stored']['plans'];

/** Final cell count of a saved plan with the CURRENT models, to compare with what it gave when it was saved. */
function currentCells(generation: Generation, plans: SavedPlans): number | null {
  if (generation === '3g') {
    const saved = plans['3g'];
    return saved ? (computePlan3g(saved.inputs).result?.cellsFinal ?? null) : null;
  }
  const saved = plans[generation];
  return saved ? (computePlan1g2g(saved.inputs).result?.cellsFinal ?? null) : null;
}

export function PlanStartScreen({ onBack, onOpen }: PlanStartScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { ready, saveFailed, stored, begin, resume } = usePlanStore();
  const [confirming, setConfirming] = useState<Generation | null>(null);

  const cells = useMemo(
    () => ({
      '1g': currentCells('1g', stored.plans),
      '2g': currentCells('2g', stored.plans),
      '3g': currentCells('3g', stored.plans),
    }),
    [stored.plans]
  );

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {t('plan.start.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>{t('plan.start.subtitle')}</Text>

      {saveFailed ? (
        <View accessibilityRole="alert" style={[styles.banner, { backgroundColor: colors.errorSurface }]}>
          <Text style={{ color: colors.error, fontSize: 12 }}>{t('plan.start.saveFailed')}</Text>
        </View>
      ) : null}

      {ready
        ? GENERATIONS.map(({ generation, key }) => {
            const entry = stored.plans[generation];
            const total = stepsFor(generation).length;
            const now = cells[generation];
            const before = entry?.snapshot?.cellsFinal ?? null;
            const changed = entry !== undefined && before !== null && now !== null && before !== now;
            return (
              <View
                key={generation}
                style={[styles.card, { borderColor: entry ? colors.accent : colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t(`plan.start.generation.${key}.title`)}</Text>
                <Text style={[styles.cardSubtitle, { color: colors.textSecondary }]}>
                  {t(`plan.start.generation.${key}.subtitle`)}
                </Text>

                {entry ? (
                  <View style={styles.status}>
                    <Text style={[styles.statusText, { color: colors.accentText }]}>
                      {t('plan.start.savedStatus', { step: entry.step + 1, total })}
                    </Text>
                    <Text style={[styles.statusText, { color: colors.textSecondary }]}>
                      {now === null ? t('plan.start.noResult') : t('plan.start.savedCells', { count: now })}
                    </Text>
                    {changed ? (
                      <Text style={[styles.statusText, { color: colors.warning }]}>
                        {t('plan.start.changed', { now, before })}
                      </Text>
                    ) : null}
                  </View>
                ) : null}

                <View style={styles.buttons}>
                  {entry ? (
                    <>
                      <Pressable
                        onPress={() => {
                          resume(generation);
                          onOpen(generation, entry.step);
                        }}
                        accessibilityRole="button"
                        style={[styles.button, { backgroundColor: colors.accentSolid }]}
                      >
                        <Text style={styles.primaryText}>{t('plan.start.continue')}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          if (confirming === generation) {
                            setConfirming(null);
                            begin(generation);
                            onOpen(generation, 0);
                          } else {
                            setConfirming(generation);
                          }
                        }}
                        accessibilityRole="button"
                        style={[styles.button, styles.secondary, { borderColor: confirming === generation ? colors.error : colors.border }]}
                      >
                        <Text style={[styles.secondaryText, { color: confirming === generation ? colors.error : colors.textPrimary }]}>
                          {confirming === generation ? t('plan.start.restartConfirm') : t('plan.start.restart')}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    <Pressable
                      onPress={() => {
                        begin(generation);
                        onOpen(generation, 0);
                      }}
                      accessibilityRole="button"
                      style={[styles.button, { backgroundColor: colors.accentSolid }]}
                    >
                      <Text style={styles.primaryText}>{t('plan.start.begin')}</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })
        : null}

      <Text style={[styles.privacy, { color: colors.textMuted }]}>{t('plan.start.privacy')}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 4, marginBottom: 16 },
  banner: { borderRadius: 10, padding: 12, marginBottom: 12 },
  card: { borderWidth: 1, borderRadius: 14, padding: 16, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 4 },
  status: { marginTop: 10, gap: 2 },
  statusText: { fontSize: 12, lineHeight: 17 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  button: { minHeight: 44, borderRadius: 10, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', flexGrow: 1 },
  secondary: { borderWidth: 1 },
  primaryText: { color: '#ffffff', fontSize: 14, fontWeight: '700', textAlign: 'center' },
  secondaryText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  privacy: { fontSize: 11, textAlign: 'center', marginTop: 8 },
});
