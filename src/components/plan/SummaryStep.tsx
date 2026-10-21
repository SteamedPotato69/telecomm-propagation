import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { GameMission } from '../../models/plan';
import { useTheme } from '../../theme';
import { ResultRows } from './ResultRows';
import type { ResultRow } from './ResultRows';
import { Intro, Panel, WarningList } from './parts';

/**
 * The last screen before the minigame: the values the puzzle will use, each with
 * a one-line explanation of what it means. The puzzle only reads these; nothing
 * here can change the plan.
 */
export function SummaryStep({ mission }: { mission: GameMission | null }) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  if (mission === null) {
    return (
      <View>
        <Intro>{t('plan.steps.summary.intro')}</Intro>
        <View style={[styles.unavailable, { backgroundColor: colors.errorSurface }]}>
          <Text style={{ color: colors.error }}>{t('plan.steps.summary.unavailable')}</Text>
        </View>
      </View>
    );
  }

  const row = (
    id: 'totalArea' | 'clusterSize' | 'plannedCells' | 'cellArea' | 'hexRadius' | 'circleRadius' | 'reuseDistance' | 'clusterCountQ',
    value: string
  ): ResultRow => ({
    label: t(`plan.summary.items.${id}.label`),
    hint: t(`plan.summary.items.${id}.hint`),
    value,
  });

  const rows: ResultRow[] = [
    row('totalArea', `${mission.totalAreaKm2.toFixed(0)} km²`),
    row('clusterSize', `N = ${mission.clusterSize}`),
    row('plannedCells', String(mission.plannedCells)),
    row('cellArea', `${mission.cellAreaKm2.toFixed(2)} km²`),
    row('hexRadius', `${mission.hexRadiusKm.toFixed(3)} km`),
    row('circleRadius', `${mission.circleEquivalentRadiusKm.toFixed(3)} km`),
    row('reuseDistance', `${mission.reuseDistanceKm.toFixed(3)} km`),
    row('clusterCountQ', String(mission.clusterCountQ)),
  ];

  return (
    <View>
      <Intro>{t('plan.steps.summary.intro')}</Intro>
      <Panel>
        <ResultRows rows={rows} />
      </Panel>
      <WarningList warnings={mission.warnings} />

      {/* The puzzle itself arrives in a later delivery: the button is here so the flow reads end to end. */}
      <Pressable
        disabled
        accessibilityRole="button"
        accessibilityState={{ disabled: true }}
        style={[styles.play, { backgroundColor: colors.accentSolid }]}
      >
        <Text style={styles.playText}>{t('plan.steps.summary.play')}</Text>
      </Pressable>
      <Text style={[styles.soon, { color: colors.textMuted }]}>{t('plan.steps.summary.soon')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  unavailable: { borderRadius: 12, padding: 14 },
  play: { minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 16, opacity: 0.4 },
  playText: { color: '#ffffff', fontSize: 15, fontWeight: '700' },
  soon: { fontSize: 12, textAlign: 'center', marginTop: 8 },
});
