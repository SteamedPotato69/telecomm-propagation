import { useEffect, useMemo } from 'react';
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native';
import { confettiCount, confettiPieces } from '../../models/game';
import { useReducedMotion } from './useReducedMotion';

/** The lilac of the app first, then colours that read on both themes. */
const PALETTE = ['#c084fc', '#22c55e', '#f59e0b', '#38bdf8', '#f43f5e', '#facc15'];

/** How far a piece falls, px. */
const FALL = 460;
/** How far a piece can drift sideways, px. */
const DRIFT = 90;

interface ConfettiBurstProps {
  stars: number;
  /** A new value throws a new burst (it also seeds the layout, so a burst is reproducible). */
  burstKey: number;
  /** The student's switch in Settings. */
  enabled: boolean;
  /** Called when the last piece has landed, so the parent can remove the layer. */
  onDone: () => void;
}

// The native driver does not exist on web: asking for it there only prints a warning.
const NATIVE = Platform.OS !== 'web';

/**
 * A short burst of confetti over the map when the area gets covered; more stars, more pieces.
 * Plain `Animated.View`s (no extra library). It renders nothing when the effects are off or the
 * system asks for reduced motion, and it never takes touches.
 */
export function ConfettiBurst({ stars, burstKey, enabled, onDone }: ConfettiBurstProps) {
  const reduced = useReducedMotion();
  const active = enabled && !reduced && stars > 0;

  const pieces = useMemo(() => confettiPieces(confettiCount(stars), burstKey, PALETTE.length), [stars, burstKey]);
  const progress = useMemo(() => pieces.map(() => new Animated.Value(0)), [pieces]);

  useEffect(() => {
    if (!active) {
      onDone();
      return undefined;
    }
    const animation = Animated.parallel(
      pieces.map((piece, index) =>
        Animated.timing(progress[index], {
          toValue: 1,
          duration: piece.duration * 1000,
          delay: piece.delay * 1000,
          easing: Easing.in(Easing.quad),
          useNativeDriver: NATIVE,
        })
      )
    );
    animation.start(({ finished }) => {
      if (finished) onDone();
    });
    return () => animation.stop();
    // The burst is one-off: it runs once per mount (the parent remounts it with a new key).
  }, []);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.layer} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {pieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.piece,
            {
              left: `${piece.x * 100}%`,
              width: piece.size,
              height: piece.size * 0.6,
              backgroundColor: PALETTE[piece.colorIndex],
              opacity: progress[index].interpolate({ inputRange: [0, 0.08, 0.75, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateY: progress[index].interpolate({ inputRange: [0, 1], outputRange: [-20, FALL] }) },
                { translateX: progress[index].interpolate({ inputRange: [0, 1], outputRange: [0, piece.drift * DRIFT] }) },
                { rotate: progress[index].interpolate({ inputRange: [0, 1], outputRange: ['0deg', `${piece.turns * 360}deg`] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, right: 0, top: 0, height: FALL + 40, zIndex: 10, overflow: 'hidden' },
  piece: { position: 'absolute', top: 0, borderRadius: 2 },
});
