import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';

interface HomeScreenProps {
  onSelectEmpiricalMethods: () => void;
}

const NEON_LILAC = '#c084fc';

export function HomeScreen({ onSelectEmpiricalMethods }: HomeScreenProps) {
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
    <View style={styles.container}>
      <Text style={styles.title}>telecomm-propagation</Text>
      <Text style={styles.subtitle}>Elige una funcionalidad</Text>

      <Pressable onPress={onSelectEmpiricalMethods} style={styles.cardShell}>
        {/* Static glow: always visible, guarantees the neon look renders even if the
            animation below doesn't (e.g. reduced-motion). Pulsing layer sits on top. */}
        <View style={[styles.glowLayerStatic, styles.noPointerEvents]} />
        <Animated.View style={[styles.glowLayerPulse, styles.noPointerEvents, { opacity: glowPulse }]} />
        <View style={[styles.card, styles.cardEnabled]}>
          <Text style={styles.cardTitleEnabled}>Métodos empíricos de propagación</Text>
          <Text style={styles.cardSubtitle}>
            Calculadora de pérdida de trayecto: elige un entorno y compara los modelos aplicables.
          </Text>
        </View>
      </Pressable>

      <View style={[styles.card, styles.cardDisabled]} accessibilityState={{ disabled: true }}>
        <Text style={styles.cardTitleDisabled}>Simulador de desvanecimiento</Text>
        <Text style={styles.cardSubtitleDisabled}>Próximamente</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 90, backgroundColor: '#ffffff' },
  title: { fontSize: 22, fontWeight: '700', color: '#102a43', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#7b8794', textAlign: 'center', marginTop: 4, marginBottom: 32 },
  cardShell: { position: 'relative', marginBottom: 20 },
  card: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
  },
  cardEnabled: {
    borderColor: NEON_LILAC,
    backgroundColor: '#faf5ff',
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
  cardTitleEnabled: { fontSize: 18, fontWeight: '700', color: '#6b21a8' },
  cardSubtitle: { fontSize: 13, color: '#7b8794', marginTop: 8, lineHeight: 18 },
  cardDisabled: {
    borderColor: '#c7ccd1',
    backgroundColor: '#f4f5f6',
    opacity: 0.6,
  },
  cardTitleDisabled: { fontSize: 18, fontWeight: '700', color: '#9aa5b1' },
  cardSubtitleDisabled: { fontSize: 13, color: '#9aa5b1', marginTop: 8 },
});
