import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

const NEON_LILAC = '#c084fc';

interface GlowCardProps {
  title: string;
  subtitle: string;
  onPress: () => void;
}

/**
 * The neon-glow card used for HomeScreen's top-level feature entries.
 * Extracted so HomeScreen can render its cards from a data list instead of
 * one hand-copied JSX block per feature -- adding a 4th feature is one
 * array entry, not a new block.
 */
export function GlowCard({ title, subtitle, onPress }: GlowCardProps) {
  const { colors } = useTheme();
  const glowPulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    // useNativeDriver: false -- this app's only current target is web, where
    // RCTAnimation doesn't exist; `true` here just produces a console warning
    // and an identical JS-driven fallback anyway.
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1, duration: 1400, useNativeDriver: false }),
        Animated.timing(glowPulse, { toValue: 0.4, duration: 1400, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [glowPulse]);

  return (
    <Pressable onPress={onPress} style={styles.cardShell}>
      {/* Static glow: always visible, guarantees the neon look renders even if the
          animation below doesn't (e.g. reduced-motion). Pulsing layer sits on top.
          Uses the literal NEON_LILAC constant, not a theme token: this color is
          intentionally identical in light and dark mode. */}
      <View style={[styles.glowLayerStatic, styles.noPointerEvents]} />
      <Animated.View style={[styles.glowLayerPulse, styles.noPointerEvents, { opacity: glowPulse }]} />
      <View style={[styles.card, { backgroundColor: colors.accentSurface }]}>
        <Text style={[styles.cardTitle, { color: colors.accentText }]}>{title}</Text>
        <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardShell: { position: 'relative', marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: NEON_LILAC,
  },
  // `shadow*` style props render on iOS/Android but are silently dropped by
  // React Native Web (confirmed: computed boxShadow stayed "none") -- this
  // app's primary target for now. `boxShadow` is the cross-platform
  // replacement in RN's New Architecture, used here instead.
  glowLayerStatic: {
    position: 'absolute',
    inset: -4,
    borderRadius: 20,
    boxShadow: `0 0 18px 2px ${NEON_LILAC}66`,
  },
  glowLayerPulse: {
    position: 'absolute',
    inset: -4,
    borderRadius: 20,
    boxShadow: `0 0 32px 6px ${NEON_LILAC}b3`,
  },
  // `pointerEvents` as a direct prop is deprecated in favor of the style
  // property (RN/RNW warn on the prop form) -- these glow layers must stay
  // click-through so the Pressable underneath still receives taps.
  noPointerEvents: { pointerEvents: 'none' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, marginTop: 8, lineHeight: 18 },
});
