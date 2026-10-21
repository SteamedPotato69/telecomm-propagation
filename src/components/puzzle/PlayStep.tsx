import { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  LATTICE_ROTATIONS_DEG,
  clusterColors,
  clusterTools,
  findMinimalTilingAsync,
  frameAnchoredAt,
  nearestSameColorPair,
  remainingClusters,
  sampleArea,
  scorePuzzle,
  suggestNextCluster,
  summarizeCoverage,
  translationKey,
} from '../../models/layout';
import type {
  AreaEvaluation,
  ClusterTranslation,
  CoverageSummary,
  HexFrame,
  PlacementAction,
  PlacementState,
  PuzzleScore,
  TilingSolution,
} from '../../models/layout';
import type { RecordedResult, Stars } from '../../models/game';
import type { GameMission } from '../../models/plan';
import { useProgress } from '../../progress/ProgressContext';
import { useTheme } from '../../theme';
import { Intro, Panel } from '../plan/parts';
import { ConfettiBurst } from './ConfettiBurst';
import { SmallButton } from './controls';
import { placeFeedback, successFeedback } from './feedback';
import { AreaLayer, ClustersLayer, ReuseLayer } from './layers';
import { MapCanvas } from './MapCanvas';
import { ResultPanel } from './ResultPanel';
import { useReducedMotion } from './useReducedMotion';
import type { MapSurface } from './imageSource';

interface PlayStepProps {
  mission: GameMission;
  image: MapSurface;
  pxPerKm: number;
  evaluation: AreaEvaluation;
  placement: PlacementState;
  dispatch: Dispatch<PlacementAction>;
  onInteraction: (active: boolean) => void;
  /** 'mission': the student's plan and picture. 'tutorial': made-up data, no plan to compare with. */
  variant: 'mission' | 'tutorial';
  /** The tutorial screen says what to do in its own words, so the generic instruction is left out. */
  hideIntro?: boolean;
  /** Draw the reuse distance D between same-colour cells of neighbouring clusters (the "reuse" tutorial). */
  showReuse?: boolean;
  /** Called when the area gets covered, with the stars earned; returns what was recorded (XP, streak, unlock). */
  onCovered?: (stars: Stars) => RecordedResult | null;
  /** Tutorials: go to the next level from the result. */
  onNextLevel?: () => void;
  onToPath: () => void;
}

interface Ghost {
  frame: HexFrame;
  translation: ClusterTranslation;
  /** Dropping here would take a placed piece back instead of adding one. */
  removes: boolean;
}

const EMPTY_SUMMARY: CoverageSummary = { fraction: 0, clusters: 0, cells: 0, cellsInsideArea: 0, cellsOutsideArea: 0 };

/** Until the minimum is known there is nothing to score against. */
const NOT_SCORED: PuzzleScore = { covered: false, stars: 0, extraClusters: 0 };

/** Cover the area with clusters that snap into the lattice. Used by the mission and by every tutorial. */
export function PlayStep({
  mission,
  image,
  pxPerKm,
  evaluation,
  placement,
  dispatch,
  onInteraction,
  variant,
  hideIntro = false,
  showReuse = false,
  onCovered,
  onNextLevel,
  onToPath,
}: PlayStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [rotationIndex, setRotationIndex] = useState(0);
  const [ghost, setGhost] = useState<Ghost | null>(null);
  const [reward, setReward] = useState<RecordedResult | null>(null);
  const [burst, setBurst] = useState<{ key: number; stars: number } | null>(null);
  const { progress } = useProgress();
  const effects = progress.effects;

  const n = mission.clusterSize;
  const { polygonKm } = evaluation;
  const tools = clusterTools(n);
  const palette = useMemo(() => clusterColors(n), [n]);

  // Same sample points for the player's coverage, the hints and the optimum, so "100 %" means the same everywhere.
  const samples = useMemo(() => sampleArea(polygonKm), [polygonKm]);

  // The search for the minimum takes about 200 ms in one block, which freezes a phone. It runs in small
  // slices instead (same answer, see findMinimalTilingAsync), so the map is on screen and playable straight
  // away and the page keeps responding while it finishes.
  const [optimum, setOptimum] = useState<TilingSolution | null>(null);
  useEffect(() => {
    let cancelled = false;
    setOptimum(null);
    findMinimalTilingAsync(polygonKm, mission.hexRadiusKm, n, {}, 8, () => cancelled).then((solution) => {
      if (!cancelled && solution) setOptimum(solution);
    });
    return () => {
      cancelled = true;
    };
  }, [polygonKm, mission.hexRadiusKm, n]);

  const { frame, translations, helpLevel } = placement;
  const summary = useMemo(
    () => (frame ? summarizeCoverage(samples, polygonKm, { clusterSize: n, frame, translations }) : EMPTY_SUMMARY),
    [samples, polygonKm, n, frame, translations]
  );
  const score = optimum
    ? scorePuzzle({ coverage: summary.fraction, clustersUsed: translations.length, optimumClusters: optimum.clusters, helpLevel })
    : NOT_SCORED;

  // Record the result when the area gets covered. Going through undo and covering again records again, which is
  // harmless (only more stars earn XP); what this play earned is added up so the panel does not lose it.
  const onCoveredRef = useRef(onCovered);
  onCoveredRef.current = onCovered;
  useEffect(() => {
    if (!score.covered) return;
    const result = onCoveredRef.current?.(score.stars);
    if (!result) return;
    setReward((previous) =>
      previous
        ? {
            ...result,
            xpGained: previous.xpGained + result.xpGained,
            improved: previous.improved || result.improved,
            unlocked: previous.unlocked ?? result.unlocked,
          }
        : result
    );
  }, [score.covered, score.stars]);

  // Feedback: a light tap when a piece is placed (not when one is taken back), and a success buzz
  // plus confetti the moment the area becomes covered.
  const placedBefore = useRef(translations.length);
  useEffect(() => {
    if (translations.length > placedBefore.current) placeFeedback(effects);
    placedBefore.current = translations.length;
  }, [translations.length, effects]);

  const burstCount = useRef(0);
  const wasCovered = useRef(false);
  useEffect(() => {
    if (score.covered && !wasCovered.current && score.stars > 0) {
      successFeedback(effects);
      burstCount.current += 1;
      setBurst({ key: burstCount.current, stars: score.stars });
    }
    wasCovered.current = score.covered;
  }, [score.covered, score.stars, effects]);

  const aim = (x: number, y: number): Ghost => {
    const pointKm = { x: x / pxPerKm, y: y / pxPerKm };
    if (frame === null) {
      const rotationRad = (LATTICE_ROTATIONS_DEG[rotationIndex] * Math.PI) / 180;
      return { frame: frameAnchoredAt(pointKm, mission.hexRadiusKm, rotationRad, n), translation: { a: 0, b: 0 }, removes: false };
    }
    const translation = tools.snap(pointKm, frame);
    return { frame, translation, removes: translations.some((item) => translationKey(item) === translationKey(translation)) };
  };

  const drop = (target: Ghost) => {
    if (frame === null) dispatch({ type: 'anchor', frame: target.frame, translation: target.translation });
    else dispatch({ type: 'toggle', translation: target.translation });
  };

  const hint = () => {
    if (!optimum) return;
    const base = frame ?? optimum.frame;
    const next = suggestNextCluster(samples, base, n, translations);
    if (next !== null) dispatch({ type: 'hint', translation: next, frame: base });
  };

  const autofill = () => {
    if (!optimum) return;
    const base = frame ?? optimum.frame;
    dispatch({ type: 'autofill', translations: remainingClusters(samples, base, n, translations), frame: base });
  };

  const playAgain = () => {
    setReward(null);
    dispatch({ type: 'new' });
  };

  const reuse = showReuse && frame ? nearestSameColorPair(n, frame, translations) : null;
  const percent = Math.floor(summary.fraction * 100);
  const isEmpty = translations.length === 0;

  return (
    <View>
      {burst ? (
        <ConfettiBurst key={burst.key} stars={burst.stars} burstKey={burst.key} enabled={effects} onDone={() => setBurst(null)} />
      ) : null}
      {hideIntro ? null : <Intro>{n > 1 ? t('puzzle.steps.play.introCluster', { n }) : t('puzzle.steps.play.introSingle')}</Intro>}

      <MapCanvas
        image={image}
        accessibilityLabel={t('puzzle.a11y.mapPlay')}
        onInteraction={onInteraction}
        onPointerStart={(p) => setGhost(aim(p.x, p.y))}
        onPointerMove={(p) => setGhost(aim(p.x, p.y))}
        onPointerEnd={(p) => {
          drop(aim(p.x, p.y));
          setGhost(null);
        }}
      >
        {({ unit }) => (
          <>
            <AreaLayer polygonKm={polygonKm} pxPerKm={pxPerKm} unit={unit} />
            {frame ? (
              <ClustersLayer clusterSize={n} frame={frame} translations={translations} pxPerKm={pxPerKm} colors={palette} unit={unit} />
            ) : null}
            {ghost ? (
              <ClustersLayer
                clusterSize={n}
                frame={ghost.frame}
                translations={[ghost.translation]}
                pxPerKm={pxPerKm}
                colors={palette}
                unit={unit}
                opacity={ghost.removes ? 0.15 : 0.4}
                labels={false}
                outline={ghost.removes ? colors.error : '#c084fc'}
              />
            ) : null}
            {reuse ? (
              <ReuseLayer
                pair={reuse}
                pxPerKm={pxPerKm}
                unit={unit}
                label={t('game.reuse.label', { n, d: reuse.distance.toFixed(2) })}
              />
            ) : null}
          </>
        )}
      </MapCanvas>

      <CoverageBar percent={percent} covered={score.covered} label={t('puzzle.play.coverage')} />
      <View style={styles.stats}>
        <Stat label={t('puzzle.play.coverage')} value={`${percent} %`} live />
        <Stat label={t('puzzle.play.clusters')} value={String(translations.length)} />
        <Stat label={t('puzzle.play.cells')} value={String(translations.length * n)} />
      </View>

      <View style={styles.row}>
        <SmallButton label={t('puzzle.play.undo')} onPress={() => dispatch({ type: 'undo' })} disabled={isEmpty} />
        <SmallButton label={t('puzzle.play.reset')} onPress={() => dispatch({ type: 'reset' })} disabled={isEmpty} />
        <SmallButton label={t('puzzle.play.hint')} onPress={hint} disabled={score.covered || optimum === null} />
        <SmallButton label={t('puzzle.play.autofill')} onPress={autofill} disabled={score.covered || optimum === null} />
        <SmallButton
          label={`${t('puzzle.play.rotateLattice')} (${LATTICE_ROTATIONS_DEG[rotationIndex]}°)`}
          onPress={() => setRotationIndex((index) => (index + 1) % LATTICE_ROTATIONS_DEG.length)}
          disabled={frame !== null}
        />
      </View>
      <Text style={[styles.help, { color: colors.textMuted }]}>{t('puzzle.play.latticeHelp')}</Text>

      {score.covered && optimum ? (
        <ResultPanel
          mission={mission}
          variant={variant}
          score={score}
          summary={summary}
          optimumClusters={optimum.clusters}
          helpLevel={helpLevel}
          reward={reward}
          onAgain={playAgain}
          onNextLevel={onNextLevel}
          onToPath={onToPath}
        />
      ) : (
        <Panel>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {t('puzzle.result.optimum')}: {optimum ? optimum.clusters : '…'}
          </Text>
        </Panel>
      )}
    </View>
  );
}

/** The coverage bar, growing smoothly (instantly when the system asks for reduced motion). */
function CoverageBar({ percent, covered, label }: { percent: number; covered: boolean; label: string }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const width = useRef(new Animated.Value(percent)).current;
  useEffect(() => {
    Animated.timing(width, {
      toValue: percent,
      duration: reduced ? 0 : 250,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false, // a width cannot run on the native driver
    }).start();
  }, [percent, reduced, width]);
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 0, max: 100, now: percent }}
      style={[styles.track, { backgroundColor: colors.borderMuted }]}
    >
      <Animated.View
        style={[
          styles.bar,
          {
            width: width.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: covered ? '#22c55e' : colors.accent,
          },
        ]}
      />
    </View>
  );
}

function Stat({ label, value, live = false }: { label: string; value: string; live?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${label}: ${value}`} accessibilityLiveRegion={live ? 'polite' : 'none'}>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  bar: { height: 8, borderRadius: 4 },
  stats: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 8, marginBottom: 8 },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 11 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  help: { fontSize: 12, lineHeight: 16, marginBottom: 4 },
});
