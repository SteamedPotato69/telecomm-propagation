import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { Intro } from '../components/plan/parts';
import { SmallButton } from '../components/puzzle/controls';
import { TUTORIAL_LEVELS, isUnlocked, missionKey, starsOf, totalStars } from '../models/game';
import type { Stars, TutorialId } from '../models/game';
import type { GameMission } from '../models/plan';
import { useProgress } from '../progress/ProgressContext';
import { useTheme } from '../theme';

interface PuzzlePathScreenProps {
  mission: GameMission;
  /** Back to the plan's summary. */
  onBack: () => void;
  onPlayTutorial: (id: TutorialId) => void;
  onPlayMission: () => void;
}

/** Horizontal shifts of the nodes, so the path winds instead of being a straight column. */
const ZIGZAG = [-44, 0, 44, 0];

const starGlyphs = (stars: Stars) => '★'.repeat(stars) + '☆'.repeat(3 - stars);

/**
 * The path between the plan summary and the puzzle: four short levels that teach
 * the pieces, then the student's own mission. XP, stars and the streak live here.
 * Nothing blocks the mission: it is the deliverable, so it is always open.
 */
export function PuzzlePathScreen({ mission, onBack, onPlayTutorial, onPlayMission }: PuzzlePathScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { progress, streakToday, saveFailed } = useProgress();

  const missionStars = starsOf(progress, missionKey(mission.generation));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />
      <Text accessibilityRole="header" style={[styles.title, { color: colors.textPrimary }]}>
        {t('game.path.title')}
      </Text>
      <Intro>{t('game.path.intro')}</Intro>

      <View style={styles.stats}>
        <Stat value={`⚡ ${progress.xp}`} label={t('game.path.xp')} accessibilityLabel={`${t('game.path.xp')}: ${progress.xp}`} />
        <Stat
          value={`★ ${totalStars(progress)}`}
          label={t('game.path.totalStars')}
          accessibilityLabel={`${t('game.path.totalStars')}: ${totalStars(progress)}`}
        />
        <Stat
          value={`🔥 ${streakToday}`}
          label={streakToday > 0 ? t('game.path.streak', { count: streakToday }) : t('game.path.noStreak')}
          accessibilityLabel={streakToday > 0 ? t('game.path.streak', { count: streakToday }) : t('game.path.noStreak')}
        />
      </View>
      {saveFailed ? <Text style={[styles.warning, { color: colors.warning }]}>⚠ {t('game.path.saveFailed')}</Text> : null}

      <SmallButton label={t('game.path.goToMission')} onPress={onPlayMission} primary />

      <View style={styles.path}>
        {TUTORIAL_LEVELS.map((level, index) => {
          const stars = starsOf(progress, level.id);
          const open = isUnlocked(progress, level.id);
          const title = t(`game.levels.${level.id}.title`);
          const state = !open ? t('game.path.locked') : stars > 0 ? t('game.path.stars', { count: stars }) : t('game.path.notPlayed');
          return (
            <View key={level.id} style={styles.step}>
              {index > 0 ? (
                <View
                  style={[
                    styles.link,
                    { backgroundColor: colors.borderMuted, transform: [{ translateX: (ZIGZAG[(index - 1) % ZIGZAG.length] + ZIGZAG[index % ZIGZAG.length]) / 2 }] },
                  ]}
                />
              ) : null}
              <Node
                label={String(index + 1)}
                locked={!open}
                done={stars > 0}
                stars={stars}
                title={title}
                offset={ZIGZAG[index % ZIGZAG.length]}
                onPress={() => onPlayTutorial(level.id)}
                accessibilityLabel={`${t('game.path.level', { number: index + 1 })}: ${title}. ${state}`}
                actionLabel={open ? (stars > 0 ? t('game.path.replay') : t('game.path.play')) : undefined}
              />
            </View>
          );
        })}

        <View style={styles.step}>
          <View
            style={[
              styles.link,
              { backgroundColor: colors.borderMuted, transform: [{ translateX: ZIGZAG[(TUTORIAL_LEVELS.length - 1) % ZIGZAG.length] / 2 }] },
            ]}
          />
          <Node
            label="★"
            large
            locked={false}
            done={missionStars > 0}
            stars={missionStars}
            title={t('game.path.yourMission')}
            subtitle={t('game.path.missionLine', {
              generation: mission.generation.toUpperCase(),
              area: mission.totalAreaKm2.toFixed(0),
              n: mission.clusterSize,
            })}
            offset={0}
            onPress={onPlayMission}
            accessibilityLabel={`${t('game.path.yourMission')}. ${t('game.path.stars', { count: missionStars })}`}
            actionLabel={missionStars > 0 ? t('game.path.replay') : t('game.path.play')}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function Stat({ value, label, accessibilityLabel }: { value: string; label: string; accessibilityLabel: string }) {
  const { colors } = useTheme();
  return (
    <View accessible accessibilityLabel={accessibilityLabel} style={[styles.stat, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

interface NodeProps {
  label: string;
  locked: boolean;
  done: boolean;
  stars: Stars;
  title: string;
  subtitle?: string;
  offset: number;
  large?: boolean;
  onPress: () => void;
  accessibilityLabel: string;
  actionLabel?: string;
}

function Node({ label, locked, done, stars, title, subtitle, offset, large = false, onPress, accessibilityLabel, actionLabel }: NodeProps) {
  const { colors } = useTheme();
  const size = large ? 84 : 68;
  return (
    <Pressable
      onPress={onPress}
      disabled={locked}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: locked }}
      style={[styles.node, { transform: [{ translateX: offset }] }]}
    >
      <View
        style={[
          styles.circle,
          { width: size, height: size, borderRadius: size / 2 },
          locked
            ? { backgroundColor: colors.surfaceMuted, borderColor: colors.border }
            : { backgroundColor: colors.accentSolid, borderColor: done ? '#22c55e' : colors.accent },
        ]}
      >
        <Text style={[styles.circleText, { color: locked ? colors.textDisabled : '#ffffff', fontSize: large ? 34 : 26 }]}>
          {locked ? '🔒' : label}
        </Text>
      </View>
      <Text style={[styles.nodeStars, { color: stars > 0 ? colors.accent : colors.textMuted }]}>{starGlyphs(stars)}</Text>
      <Text style={[styles.nodeTitle, { color: locked ? colors.textDisabled : colors.textPrimary }]}>{title}</Text>
      {subtitle ? <Text style={[styles.nodeSubtitle, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      {actionLabel ? <Text style={[styles.nodeAction, { color: colors.accentText }]}>{actionLabel}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  stats: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  stat: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 11, textAlign: 'center', marginTop: 2 },
  warning: { fontSize: 12, lineHeight: 16, marginBottom: 10 },
  path: { alignItems: 'center', marginTop: 16 },
  step: { alignItems: 'center' },
  link: { width: 4, height: 22, borderRadius: 2 },
  node: { alignItems: 'center', minWidth: 160, paddingVertical: 4 },
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 4 },
  circleText: { fontWeight: '700' },
  nodeStars: { fontSize: 18, marginTop: 6, letterSpacing: 2 },
  nodeTitle: { fontSize: 14, fontWeight: '700', marginTop: 2, textAlign: 'center' },
  nodeSubtitle: { fontSize: 12, textAlign: 'center', marginTop: 2, maxWidth: 240 },
  nodeAction: { fontSize: 12, fontWeight: '700', marginTop: 4 },
});
