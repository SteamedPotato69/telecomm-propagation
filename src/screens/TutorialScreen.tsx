import { useMemo, useReducer, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { Panel } from '../components/plan/parts';
import { PlayStep } from '../components/puzzle/PlayStep';
import { TUTORIAL_IDS, nextTutorial, tutorialLevel, tutorialSetup } from '../models/game';
import type { TutorialId } from '../models/game';
import { evaluateArea, initialPlacement, placementReducer } from '../models/layout';
import { useProgress } from '../progress/ProgressContext';
import { useTheme } from '../theme';

interface TutorialScreenProps {
  id: TutorialId;
  /** Back to the path. */
  onBack: () => void;
  onNext: (id: TutorialId) => void;
}

/**
 * One tutorial level: made-up data, no picture, no line to trace and no area to place --
 * the puzzle opens already set up, with a sentence on what to do and one on why it works.
 * It is the same puzzle as the mission (same component), with a different setup.
 */
export function TutorialScreen({ id, onBack, onNext }: TutorialScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { record } = useProgress();
  const [placement, dispatch] = useReducer(placementReducer, undefined, initialPlacement);
  const [dragging, setDragging] = useState(false);

  const setup = useMemo(() => tutorialSetup(id), [id]);
  const evaluation = useMemo(
    () => evaluateArea(setup.mission, setup.placement, setup.pxPerKm, setup.canvas),
    [setup]
  );

  const level = tutorialLevel(id);
  const next = nextTutorial(id);

  return (
    <ScrollView contentContainerStyle={styles.content} scrollEnabled={!dragging} keyboardShouldPersistTaps="handled">
      <BackButton onPress={onBack} />
      <Text style={[styles.step, { color: colors.accentText }]}>
        {t('game.tutorial.header', { number: TUTORIAL_IDS.indexOf(id) + 1, total: TUTORIAL_IDS.length })}
      </Text>
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {t(`game.levels.${id}.title`)}
      </Text>
      <Text style={[styles.goal, { color: colors.textPrimary }]}>{t(`game.levels.${id}.goal`)}</Text>
      <Panel>
        <Text style={[styles.lesson, { color: colors.textSecondary }]}>{t(`game.levels.${id}.lesson`)}</Text>
      </Panel>

      <View style={styles.play}>
        <PlayStep
          mission={setup.mission}
          image={setup.canvas}
          pxPerKm={setup.pxPerKm}
          evaluation={evaluation}
          placement={placement}
          dispatch={dispatch}
          onInteraction={setDragging}
          variant="tutorial"
          hideIntro
          showReuse={level.showReuseDistance}
          onCovered={(stars) => record(id, stars)}
          onNextLevel={next ? () => onNext(next) : undefined}
          onToPath={onBack}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  step: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', marginTop: 4 },
  title: { fontSize: 20, fontWeight: '700', marginTop: 4, marginBottom: 6 },
  goal: { fontSize: 15, lineHeight: 21, marginBottom: 4 },
  lesson: { fontSize: 13, lineHeight: 19 },
  play: { marginTop: 8 },
});
