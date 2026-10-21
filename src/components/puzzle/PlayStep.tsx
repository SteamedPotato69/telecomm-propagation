import { Dispatch, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  LATTICE_ROTATIONS_DEG,
  clusterColors,
  clusterTools,
  findMinimalTiling,
  frameAnchoredAt,
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
} from '../../models/layout';
import type { GameMission } from '../../models/plan';
import { useTheme } from '../../theme';
import { Intro, Panel } from '../plan/parts';
import { SmallButton } from './controls';
import { AreaLayer, ClustersLayer } from './layers';
import { MapCanvas } from './MapCanvas';
import { ResultPanel } from './ResultPanel';
import type { SourceImage } from './imageSource';

interface PlayStepProps {
  mission: GameMission;
  image: SourceImage;
  pxPerKm: number;
  evaluation: AreaEvaluation;
  placement: PlacementState;
  dispatch: Dispatch<PlacementAction>;
  onInteraction: (active: boolean) => void;
  onToSummary: () => void;
}

interface Ghost {
  frame: HexFrame;
  translation: ClusterTranslation;
  /** Dropping here would take a placed piece back instead of adding one. */
  removes: boolean;
}

const EMPTY_SUMMARY: CoverageSummary = { fraction: 0, clusters: 0, cells: 0, cellsInsideArea: 0, cellsOutsideArea: 0 };

/** Last screen: cover the area with clusters that snap into the lattice. */
export function PlayStep({ mission, image, pxPerKm, evaluation, placement, dispatch, onInteraction, onToSummary }: PlayStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [rotationIndex, setRotationIndex] = useState(0);
  const [ghost, setGhost] = useState<Ghost | null>(null);

  const n = mission.clusterSize;
  const { polygonKm } = evaluation;
  const tools = clusterTools(n);
  const palette = useMemo(() => clusterColors(n), [n]);

  // Same sample points for the player's coverage, the hints and the optimum, so "100 %" means the same everywhere.
  const samples = useMemo(() => sampleArea(polygonKm), [polygonKm]);
  const optimum = useMemo(() => findMinimalTiling(polygonKm, mission.hexRadiusKm, n), [polygonKm, mission.hexRadiusKm, n]);

  const { frame, translations, helpLevel } = placement;
  const summary = useMemo(
    () => (frame ? summarizeCoverage(samples, polygonKm, { clusterSize: n, frame, translations }) : EMPTY_SUMMARY),
    [samples, polygonKm, n, frame, translations]
  );
  const score = scorePuzzle({
    coverage: summary.fraction,
    clustersUsed: translations.length,
    optimumClusters: optimum.clusters,
    helpLevel,
  });

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
    const base = frame ?? optimum.frame;
    const next = suggestNextCluster(samples, base, n, translations);
    if (next !== null) dispatch({ type: 'hint', translation: next, frame: base });
  };

  const autofill = () => {
    const base = frame ?? optimum.frame;
    dispatch({ type: 'autofill', translations: remainingClusters(samples, base, n, translations), frame: base });
  };

  const percent = Math.floor(summary.fraction * 100);
  const isEmpty = translations.length === 0;

  return (
    <View>
      <Intro>{n > 1 ? t('puzzle.steps.play.introCluster', { n }) : t('puzzle.steps.play.introSingle')}</Intro>

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
          </>
        )}
      </MapCanvas>

      <View
        accessibilityRole="progressbar"
        accessibilityLabel={t('puzzle.play.coverage')}
        accessibilityValue={{ min: 0, max: 100, now: percent }}
        style={[styles.track, { backgroundColor: colors.borderMuted }]}
      >
        <View style={[styles.bar, { width: `${percent}%`, backgroundColor: score.covered ? '#22c55e' : colors.accent }]} />
      </View>
      <View style={styles.stats}>
        <Stat label={t('puzzle.play.coverage')} value={`${percent} %`} />
        <Stat label={t('puzzle.play.clusters')} value={String(translations.length)} />
        <Stat label={t('puzzle.play.cells')} value={String(translations.length * n)} />
      </View>

      <View style={styles.row}>
        <SmallButton label={t('puzzle.play.undo')} onPress={() => dispatch({ type: 'undo' })} disabled={isEmpty} />
        <SmallButton label={t('puzzle.play.reset')} onPress={() => dispatch({ type: 'reset' })} disabled={isEmpty} />
        <SmallButton label={t('puzzle.play.hint')} onPress={hint} disabled={score.covered} />
        <SmallButton label={t('puzzle.play.autofill')} onPress={autofill} disabled={score.covered} />
        <SmallButton
          label={`${t('puzzle.play.rotateLattice')} (${LATTICE_ROTATIONS_DEG[rotationIndex]}°)`}
          onPress={() => setRotationIndex((index) => (index + 1) % LATTICE_ROTATIONS_DEG.length)}
          disabled={frame !== null}
        />
      </View>
      <Text style={[styles.help, { color: colors.textMuted }]}>{t('puzzle.play.latticeHelp')}</Text>

      {score.covered ? (
        <ResultPanel
          mission={mission}
          score={score}
          summary={summary}
          optimumClusters={optimum.clusters}
          helpLevel={helpLevel}
          onAgain={() => dispatch({ type: 'new' })}
          onToSummary={onToSummary}
        />
      ) : (
        <Panel>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {t('puzzle.result.optimum')}: {optimum.clusters}
          </Text>
        </Panel>
      )}
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.stat}>
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
