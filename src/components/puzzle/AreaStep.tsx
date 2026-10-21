import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  ASPECT_OPTIONS,
  AREA_ROTATION_STEP_DEG,
  areaDimensionsKm,
  clampAreaCenterPx,
  initialAreaPlacement,
} from '../../models/layout';
import type { AreaEvaluation, AreaPlacement, Point } from '../../models/layout';
import type { GameMission } from '../../models/plan';
import { useTheme } from '../../theme';
import { ChoiceChips } from '../plan/ChoiceChips';
import { Intro, Panel } from '../plan/parts';
import { SmallButton } from './controls';
import type { SourceImage } from './imageSource';
import { AreaLayer, ReferenceLayer } from './layers';
import { MapCanvas } from './MapCanvas';
import type { LineEnds } from './ReferenceStep';

interface AreaStepProps {
  mission: GameMission;
  image: SourceImage;
  line: LineEnds;
  realKm: number;
  pxPerKm: number;
  placement: AreaPlacement;
  evaluation: AreaEvaluation;
  onPlacement: (placement: AreaPlacement) => void;
  onInteraction: (active: boolean) => void;
}

/** Third screen: drag the area (the plan's S_T, fixed) over the map and choose its proportions. */
export function AreaStep({ mission, image, line, realKm, pxPerKm, placement, evaluation, onPlacement, onInteraction }: AreaStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const grabbed = useRef<Point>(placement.centerPx);

  // Any change re-clamps the centre so the shape never leaves the picture.
  const update = (changes: Partial<AreaPlacement>) => {
    const next = { ...placement, ...changes };
    onPlacement({ ...next, centerPx: clampAreaCenterPx(mission.totalAreaKm2, next, pxPerKm, image) });
  };

  const { widthKm, heightKm } = areaDimensionsKm(placement.kind, mission.totalAreaKm2, placement.aspectRatio);
  const stepRad = (AREA_ROTATION_STEP_DEG * Math.PI) / 180;
  const { fit } = evaluation;

  return (
    <View>
      <Intro>{t('puzzle.steps.area.intro', { area: mission.totalAreaKm2.toFixed(0) })}</Intro>

      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('puzzle.area.shape')}</Text>
      <ChoiceChips
        options={[
          { value: 'rectangle' as const, label: t('puzzle.area.rectangle') },
          { value: 'ellipse' as const, label: t('puzzle.area.ellipse') },
        ]}
        selected={placement.kind}
        onSelect={(kind) => update({ kind })}
        accessibilityLabel={t('puzzle.area.shape')}
      />
      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('puzzle.area.proportion')}</Text>
      <ChoiceChips
        options={ASPECT_OPTIONS.map(({ value, label }) => ({ value, label }))}
        selected={placement.aspectRatio}
        onSelect={(aspectRatio) => update({ aspectRatio })}
        accessibilityLabel={t('puzzle.area.proportion')}
      />

      <MapCanvas
        image={image}
        accessibilityLabel={t('puzzle.a11y.mapArea')}
        onInteraction={onInteraction}
        onPointerStart={() => {
          grabbed.current = placement.centerPx;
        }}
        onPointerMove={(point, start) =>
          update({ centerPx: { x: grabbed.current.x + point.x - start.x, y: grabbed.current.y + point.y - start.y } })
        }
      >
        {({ unit }) => (
          <>
            <AreaLayer polygonKm={evaluation.polygonKm} pxPerKm={pxPerKm} unit={unit} />
            <ReferenceLayer a={line.a} b={line.b} label={`${realKm} km`} unit={unit} />
          </>
        )}
      </MapCanvas>

      <View style={styles.row}>
        <SmallButton label={`↺ ${t('puzzle.area.rotate')}`} onPress={() => update({ rotationRad: placement.rotationRad - stepRad })} />
        <SmallButton label={`↻ ${t('puzzle.area.rotate')}`} onPress={() => update({ rotationRad: placement.rotationRad + stepRad })} />
        <SmallButton
          label={t('puzzle.area.center')}
          onPress={() => update({ centerPx: initialAreaPlacement(image).centerPx })}
        />
      </View>

      <Panel>
        <Text style={{ color: colors.textPrimary }}>
          {t('puzzle.area.size', { w: widthKm.toFixed(2), h: heightKm.toFixed(2) })}
        </Text>
        {fit.fits ? (
          <Text style={[styles.note, { color: colors.textSecondary }]}>{t('puzzle.area.fits')}</Text>
        ) : (
          <Text accessibilityRole="alert" style={[styles.note, { color: colors.error }]}>
            {t('puzzle.area.doesNotFit', {
              needW: Math.ceil(fit.requiredWidthPx),
              needH: Math.ceil(fit.requiredHeightPx),
              imgW: image.width,
              imgH: image.height,
              km: realKm,
              maxPx: Math.floor(fit.maxPxPerKmToFit * realKm),
            })}
          </Text>
        )}
        {evaluation.hexTooSmall ? (
          <Text style={[styles.note, { color: colors.warning }]}>⚠ {t('puzzle.area.hexSmall', { px: Math.round(evaluation.hexRadiusPx) })}</Text>
        ) : null}
        {evaluation.tooManyCells ? (
          <Text accessibilityRole="alert" style={[styles.note, { color: colors.error }]}>
            {t('puzzle.area.tooMany', { count: mission.plannedCells })}
          </Text>
        ) : null}
      </Panel>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  note: { fontSize: 12, lineHeight: 17, marginTop: 6 },
});
