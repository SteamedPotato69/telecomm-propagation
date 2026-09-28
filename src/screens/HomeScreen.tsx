import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GlowCard } from '../components/GlowCard';
import { useTheme } from '../theme';
import type { ThemeMode } from '../theme';

interface HomeScreenProps {
  onSelectEmpiricalMethods: () => void;
  onSelectFadingSimulator: () => void;
  onSelectCellularPlanning: () => void;
}

const THEME_MODE_OPTIONS: { mode: ThemeMode; label: string }[] = [
  { mode: 'dark', label: '🌙 Oscuro' },
  { mode: 'system', label: 'Auto' },
  { mode: 'light', label: '☀ Claro' },
];

export function HomeScreen({
  onSelectEmpiricalMethods,
  onSelectFadingSimulator,
  onSelectCellularPlanning,
}: HomeScreenProps) {
  const { colors, mode, setMode } = useTheme();

  // Data-driven so a future feature is one array entry, not a new
  // hand-copied JSX block (see README's own note on this).
  const cards = [
    {
      id: 'empirical',
      title: 'Métodos empíricos de propagación',
      subtitle: 'Calculadora de pérdida de trayecto: elige un entorno y compara los modelos aplicables.',
      onPress: onSelectEmpiricalMethods,
    },
    {
      id: 'fading',
      title: 'Simulador de desvanecimiento',
      subtitle:
        'Plano vs. selectivo en frecuencia, lento vs. rápido: ingresa dispersión de retardo, velocidad y ' +
        'parámetros de la señal y ubica el canal en las 5 zonas del curso.',
      onPress: onSelectFadingSimulator,
    },
    {
      id: 'cellular',
      title: 'Planificación celular',
      subtitle:
        'Geometría de reutilización de frecuencias, dimensionamiento por tráfico (Erlang B), link budget y ' +
        'carga UMTS.',
      onPress: onSelectCellularPlanning,
    },
  ];

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

      {cards.map((card) => (
        <GlowCard key={card.id} title={card.title} subtitle={card.subtitle} onPress={card.onPress} />
      ))}
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
});
