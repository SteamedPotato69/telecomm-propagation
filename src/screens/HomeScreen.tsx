import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';
import type { ThemeMode } from '../theme';

interface HomeScreenProps {
  onSelectEmpiricalMethods: () => void;
  onSelectFadingSimulator: () => void;
}

const NEON_LILAC = '#c084fc';


const THEME_MODE_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'dark', label: '🌙 Oscuro' },
  { mode: 'system', label: 'Auto' },
  { mode: 'light', label: '☀ Claro' },
];

export function HomeScreen({ onSelectEmpiricalMethods, onSelectFadingSimulator }: HomeScreenProps) {
  const { colors, mode, setMode } = useTheme();
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>PROPAPP</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>Por favor, elige una funcionalidad</Text>

      <View
        style={[styles.themeSwitchTrack, { borderColor: colors.border, backgroundColor: colors.surfaceMuted }]}
      >
        {THEME_MODE_OPTIONS.map((option) => {
          const isSelected = mode === option.mode;
          return (
            <Pressable
              key={option.mode}
              onPress={() => setMode(option.mode)}
              style={[styles.themeSwitchSegment, isSelected && { backgroundColor: colors.accentSolid }]}
            >
              <Text
                style={[
                  styles.themeSwitchText,
                  { color: isSelected ? '#ffffff' : colors.textSecondary },
                ]}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={onSelectEmpiricalMethods} style={styles.cardShell}>
        {/* Static glow: always visible, guarantees the neon look renders even if the
            animation below doesn't (e.g. reduced-motion). Pulsing layer sits on top.
            Uses the literal NEON_LILAC constant, not a theme token: this color is
            intentionally identical in light and dark mode. */}
        <View style={[styles.glowLayerStatic, styles.noPointerEvents]} />
        <Animated.View style={[styles.glowLayerPulse, styles.noPointerEvents, { opacity: glowPulse }]} />
        <View style={[styles.card, styles.cardEnabled, { backgroundColor: colors.accentSurface }]}>
          <Text style={[styles.cardTitleEnabled, { color: colors.accentText }]}>Métodos empíricos de propagación</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
            Calculadora de pérdida de trayecto: elige un entorno y compara los modelos aplicables.
          </Text>
        </View>
      </Pressable>

      <Pressable onPress={onSelectFadingSimulator} style={styles.cardShell}>
        <View style={[styles.glowLayerStatic, styles.noPointerEvents]} />
        <Animated.View style={[styles.glowLayerPulse, styles.noPointerEvents, { opacity: glowPulse }]} />
        <View style={[styles.card, styles.cardEnabled, { backgroundColor: colors.accentSurface }]}>
          <Text style={[styles.cardTitleEnabled, { color: colors.accentText }]}>Simulador de desvanecimiento</Text>
          <Text style={[styles.cardSubtitle, { color: colors.textMuted }]}>
            Plano vs. selectivo en frecuencia, lento vs. rápido: ingresa dispersión de retardo, velocidad y
            parámetros de la señal y ubica el canal en las 5 zonas del curso.
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, textAlign: 'center', marginTop: 4, marginBottom: 20 },
  themeSwitchTrack: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: 20,
    padding: 3,
    marginBottom: 32,
  },
  themeSwitchSegment: {
    borderRadius: 17,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  themeSwitchText: { fontSize: 12, fontWeight: '600' },
  cardShell: { position: 'relative', marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
  },
  cardEnabled: {
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
  cardTitleEnabled: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { fontSize: 13, marginTop: 8, lineHeight: 18 },
});
