import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CoverageSummary, HelpLevel, PuzzleScore } from '../../models/layout';
import type { GameMission } from '../../models/plan';
import { useTheme } from '../../theme';
import { Panel } from '../plan/parts';
import { ResultRows } from '../plan/ResultRows';
import type { ResultRow } from '../plan/ResultRows';
import { SmallButton } from './controls';

interface ResultPanelProps {
  mission: GameMission;
  score: PuzzleScore;
  summary: CoverageSummary;
  optimumClusters: number;
  helpLevel: HelpLevel;
  onAgain: () => void;
  onToSummary: () => void;
}

/** Shown as soon as the whole area is covered: stars, and how the player's tiling compares with the plan. */
export function ResultPanel({ mission, score, summary, optimumClusters, helpLevel, onAgain, onToSummary }: ResultPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  const rows: ResultRow[] = [
    { label: t('puzzle.result.yourClusters'), value: String(summary.clusters), emphasis: true },
    { label: t('puzzle.result.optimum'), value: String(optimumClusters) },
    { label: t('puzzle.result.qCourse'), value: String(mission.clusterCountQ) },
    { label: t('puzzle.result.planCells'), value: String(mission.plannedCells) },
    { label: t('puzzle.result.cellsInside'), value: String(summary.cellsInsideArea) },
    { label: t('puzzle.result.cellsOutside'), value: String(summary.cellsOutsideArea) },
  ];

  // What the play itself earned, before the help cap: the criteria are about the tiling, the cap about the help.
  const criteria = [
    { text: t('puzzle.result.starCovered'), met: score.covered },
    { text: t('puzzle.result.starClose'), met: score.covered && score.extraClusters <= 2 },
    { text: t('puzzle.result.starOptimal'), met: score.covered && score.extraClusters === 0 },
  ];

  return (
    <Panel>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {t('puzzle.result.title')}
      </Text>
      <Text accessibilityLabel={t('puzzle.result.stars', { count: score.stars })} style={[styles.stars, { color: colors.accent }]}>
        {'★'.repeat(score.stars)}
        <Text style={{ color: colors.textMuted }}>{'☆'.repeat(3 - score.stars)}</Text>
      </Text>

      {criteria.map((criterion) => (
        <Text key={criterion.text} style={[styles.criterion, { color: criterion.met ? colors.textPrimary : colors.textMuted }]}>
          {criterion.met ? '✓' : '○'} {criterion.text}
        </Text>
      ))}
      {helpLevel === 'hints' ? <Text style={[styles.help, { color: colors.warning }]}>{t('puzzle.result.helpHints')}</Text> : null}
      {helpLevel === 'autofill' ? <Text style={[styles.help, { color: colors.warning }]}>{t('puzzle.result.helpAutofill')}</Text> : null}

      <View style={styles.rows}>
        <ResultRows rows={rows} />
      </View>
      <Text style={[styles.note, { color: colors.textMuted }]}>{t('puzzle.result.note')}</Text>

      <View style={styles.actions}>
        <SmallButton label={t('puzzle.result.again')} onPress={onAgain} primary />
        <SmallButton label={t('puzzle.result.toSummary')} onPress={onToSummary} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  stars: { fontSize: 38, textAlign: 'center', marginVertical: 6 },
  criterion: { fontSize: 13, lineHeight: 20 },
  help: { fontSize: 12, marginTop: 6 },
  rows: { marginTop: 10 },
  note: { fontSize: 12, lineHeight: 16, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
});
