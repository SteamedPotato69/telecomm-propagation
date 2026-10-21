import { useEffect, useMemo, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AreaStep } from '../components/puzzle/AreaStep';
import { ImageStep } from '../components/puzzle/ImageStep';
import { PlayStep } from '../components/puzzle/PlayStep';
import { ReferenceStep } from '../components/puzzle/ReferenceStep';
import type { LineEnds } from '../components/puzzle/ReferenceStep';
import { PlanShell } from '../components/plan/PlanShell';
import type { SourceImage } from '../components/puzzle/imageSource';
import {
  DEFAULT_REFERENCE_KM,
  clampAreaCenterPx,
  evaluateArea,
  initialAreaPlacement,
  initialPlacement,
  pixelsPerKm,
  placementReducer,
} from '../models/layout';
import type { AreaPlacement } from '../models/layout';
import type { GameMission } from '../models/plan';

const STEPS = ['image', 'reference', 'area', 'play'] as const;

interface CellPuzzleScreenProps {
  mission: GameMission;
  step: number;
  onStep: (step: number) => void;
  /** Back to the plan's summary. */
  onLeave: () => void;
}

/**
 * The minigame. It only READS the mission the plan produced: nothing here can
 * change the plan. The image, the line and the placed pieces live only in this
 * screen (nothing is stored), and any change to the picture, the scale or the
 * area starts a fresh puzzle, because the pieces are positioned in those units.
 */
export function CellPuzzleScreen({ mission, step, onStep, onLeave }: CellPuzzleScreenProps) {
  const { t } = useTranslation();
  const [image, setImage] = useState<SourceImage | null>(null);
  const [ends, setEnds] = useState<LineEnds | null>(null);
  const [realKm, setRealKm] = useState(DEFAULT_REFERENCE_KM);
  const [rawArea, setRawArea] = useState<AreaPlacement | null>(null);
  const [placement, dispatch] = useReducer(placementReducer, undefined, initialPlacement);
  const [dragging, setDragging] = useState(false);

  const pxPerKm = useMemo(
    () => (ends ? pixelsPerKm({ a: ends.a, b: ends.b, realKm }) : null),
    [ends, realKm]
  );

  // The area keeps its place on the picture when the scale changes, but never leaves it.
  const area = useMemo(
    () =>
      rawArea && image && pxPerKm
        ? { ...rawArea, centerPx: clampAreaCenterPx(mission.totalAreaKm2, rawArea, pxPerKm, image) }
        : rawArea,
    [rawArea, image, pxPerKm, mission.totalAreaKm2]
  );

  const evaluation = useMemo(
    () => (image && area && pxPerKm ? evaluateArea(mission, area, pxPerKm, image) : null),
    [mission, image, area, pxPerKm]
  );

  // A different picture, scale or area is a different puzzle.
  const puzzleKey = `${image?.uri ?? ''}|${ends ? `${ends.a.x},${ends.a.y},${ends.b.x},${ends.b.y}` : ''}|${realKm}|${
    area ? `${area.kind},${area.aspectRatio},${area.rotationRad},${area.centerPx.x},${area.centerPx.y}` : ''
  }`;
  useEffect(() => {
    dispatch({ type: 'new' });
  }, [puzzleKey]);

  // How far the student can be: each step needs the one before it.
  const reachable = image === null ? 0 : ends === null ? 1 : evaluation?.playable ? 3 : 2;
  const index = Math.min(Math.max(step, 0), reachable);
  const name = STEPS[index];

  useEffect(() => {
    if (step !== index) onStep(index);
  }, [step, index, onStep]);

  const nextDisabled = (index === 0 && image === null) || (index === 1 && ends === null) || (index === 2 && !evaluation?.playable);

  return (
    <PlanShell
      title={t(`puzzle.steps.${name}.title`)}
      stepIndex={index}
      totalSteps={STEPS.length}
      onLeave={onLeave}
      onPrevious={() => (index > 0 ? onStep(index - 1) : onLeave())}
      onNext={index < STEPS.length - 1 ? () => onStep(index + 1) : undefined}
      nextDisabled={nextDisabled}
      scrollEnabled={!dragging}
    >
      {name === 'image' ? (
        <ImageStep
          image={image}
          onImage={(next) => {
            setImage(next);
            setRawArea(initialAreaPlacement(next));
            setEnds(null);
          }}
        />
      ) : null}

      {name === 'reference' && image ? (
        <ReferenceStep
          image={image}
          ends={ends}
          realKm={realKm}
          onEnds={setEnds}
          onRealKm={setRealKm}
          onInteraction={setDragging}
        />
      ) : null}

      {name === 'area' && image && ends && area && pxPerKm && evaluation ? (
        <AreaStep
          mission={mission}
          image={image}
          line={ends}
          realKm={realKm}
          pxPerKm={pxPerKm}
          placement={area}
          evaluation={evaluation}
          onPlacement={setRawArea}
          onInteraction={setDragging}
        />
      ) : null}

      {name === 'play' && image && pxPerKm && evaluation ? (
        <PlayStep
          mission={mission}
          image={image}
          pxPerKm={pxPerKm}
          evaluation={evaluation}
          placement={placement}
          dispatch={dispatch}
          onInteraction={setDragging}
          onToSummary={onLeave}
        />
      ) : null}
    </PlanShell>
  );
}
