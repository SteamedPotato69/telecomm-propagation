import { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { CoverageSummary, HelpLevel, PuzzleScore } from '../../models/layout';
import type { RecordedResult } from '../../models/game';
import type { GameMission } from '../../models/plan';
import { useTheme } from '../../theme';
import { Panel } from '../plan/parts';
import { ResultRows } from '../plan/ResultRows';
import type { ResultRow } from '../plan/ResultRows';
import { SmallButton } from './controls';
import { useReducedMotion } from './useReducedMotion';

interface ResultPanelProps {
  mission: GameMission;
  /** A tutorial has no plan to compare with: only the player's clusters against the minimum. */
  variant: 'mission' | 'tutorial';
  score: PuzzleScore;
  summary: CoverageSummary;
  optimumClusters: number;
  helpLevel: HelpLevel;
  /** What this play earned (XP, streak, unlocked level); null when nothing was recorded. */
  reward: RecordedResult | null;
  onAgain: () => void;
  /** Tutorials only: go straight to the next level. */
  onNextLevel?: () => void;
  onToPath: () => void;
}

const CHEER_KEYS = { 1: 'game.cheer.one', 2: 'game.cheer.two', 3: 'game.cheer.three' } as const;

/** Shown as soon as the whole area is covered: stars, what they earned, and how the player's tiling compares. */
export function ResultPanel({
  mission,
  variant,
  score,
  summary,
  optimumClusters,
  helpLevel,
  reward,
  onAgain,
  onNextLevel,
  onToPath,
}: ResultPanelProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const reduced = useReducedMotion();

  // The stars pop in (a spring) when the panel appears; with reduced motion they are simply there.
  const pop = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    if (reduced) {
      pop.setValue(1);
      return;
    }
    Animated.spring(pop, { toValue: 1, friction: 4, tension: 120, useNativeDriver: Platform.OS !== 'web' }).start();
  }, [reduced, pop]);

  const rows: ResultRow[] = [
    { label: t('puzzle.result.yourClusters'), value: String(summary.clusters), emphasis: true },
    { label: t('puzzle.result.optimum'), value: String(optimumClusters) },
  ];
  if (variant === 'mission') {
    rows.push(
      { label: t('puzzle.result.qCourse'), value: String(mission.clusterCountQ) },
      { label: t('puzzle.result.planCells'), value: String(mission.plannedCells) },
      { label: t('puzzle.result.cellsInside'), value: String(summary.cellsInsideArea) },
      { label: t('puzzle.result.cellsOutside'), value: String(summary.cellsOutsideArea) }
    );
  }

  // What the play itself earned, before the help cap: the criteria are about the tiling, the cap about the help.
  const criteria = [
    { text: t('puzzle.result.starCovered'), met: score.covered },
    { text: t('puzzle.result.starClose'), met: score.covered && score.extraClusters <= 2 },
    { text: t('puzzle.result.starOptimal'), met: score.covered && score.extraClusters === 0 },
  ];

  const cheer = score.stars > 0 ? t(CHEER_KEYS[score.stars as 1 | 2 | 3]) : null;

  return (
    <Panel>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {t('puzzle.result.title')}
      </Text>
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        <Text accessibilityLabel={t('puzzle.result.stars', { count: score.stars })} style={[styles.stars, { color: colors.accent }]}>
          {'★'.repeat(score.stars)}
          <Text style={{ color: colors.textMuted }}>{'☆'.repeat(3 - score.stars)}</Text>
        </Text>
      </Animated.View>
      {cheer ? <Text style={[styles.cheer, { color: colors.textPrimary }]}>{cheer}</Text> : null}

      {reward ? (
        <View style={[styles.reward, { backgroundColor: colors.accentSurface, borderColor: colors.accent }]} accessibilityLiveRegion="polite">
          {reward.xpGained > 0 ? <Text style={[styles.rewardMain, { color: colors.accentText }]}>{t('game.reward.xp', { xp: reward.xpGained })}</Text> : null}
          {reward.streak > 0 ? (
            <Text style={[styles.rewardLine, { color: colors.textPrimary }]}>🔥 {t('game.reward.streak', { count: reward.streak })}</Text>
          ) : null}
          {reward.unlocked ? (
            <Text style={[styles.rewardLine, { color: colors.textPrimary }]}>
              🔓 {t('game.reward.unlocked', { name: t(`game.levels.${reward.unlocked}.title`) })}
            </Text>
          ) : null}
        </View>
      ) : null}

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
      {variant === 'mission' ? <Text style={[styles.note, { color: colors.textMuted }]}>{t('puzzle.result.note')}</Text> : null}

      <View style={styles.actions}>
        {onNextLevel ? <SmallButton label={t('game.tutorial.next')} onPress={onNextLevel} primary /> : null}
        <SmallButton label={t('puzzle.result.again')} onPress={onAgain} primary={!onNextLevel} />
        <SmallButton label={t('game.tutorial.toPath')} onPress={onToPath} />
      </View>
    </Panel>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  stars: { fontSize: 38, textAlign: 'center', marginVertical: 6 },
  cheer: { fontSize: 14, textAlign: 'center', marginBottom: 10 },
  reward: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, alignItems: 'center' },
  rewardMain: { fontSize: 22, fontWeight: '700' },
  rewardLine: { fontSize: 14, marginTop: 4 },
  criterion: { fontSize: 13, lineHeight: 20 },
  help: { fontSize: 12, marginTop: 6 },
  rows: { marginTop: 10 },
  note: { fontSize: 12, lineHeight: 16, marginTop: 8 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
});
