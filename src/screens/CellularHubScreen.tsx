import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { ListCard } from '../components/ListCard';
import { useTheme } from '../theme';

interface CellularHubScreenProps {
  onBack: () => void;
  onSelectGeometry: () => void;
  onSelectTraffic: () => void;
  onSelectLinkBudget: () => void;
}

interface CellularFeatureItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

/**
 * Hub for the cellular-planning features (docs/curso-referencia.md §13),
 * mirroring EnvironmentScreen's list-of-choices shape. Items go from
 * disabled to enabled one at a time as each phase of the feature lands --
 * see the project plan for the phase order.
 */
const CELLULAR_FEATURES: CellularFeatureItem[] = [
  {
    id: 'geometry',
    title: 'Geometría celular y reutilización de frecuencias',
    description: 'Radio de celda, paso de retícula, distancia de reutilización y número de agrupaciones.',
    enabled: true,
  },
  {
    id: 'traffic',
    title: 'Tráfico (Erlang B) y densidad',
    description: 'Bloqueo, tráfico soportable, canales necesarios o densidad máxima de tráfico dado un GoS objetivo.',
    enabled: true,
  },
  {
    id: 'link-budget',
    title: 'Link budget (Hata / COST-231-Hata)',
    description: 'MAPL a partir de un presupuesto de enlace completo, e inversión a radio de celda máximo.',
    enabled: true,
  },
  {
    id: 'dimensioning',
    title: 'Dimensionamiento 1G/2G',
    description: 'Flujo completo capacidad vs. cobertura -- el resultado final es el factor limitante.',
    enabled: false,
  },
  {
    id: 'wcdma',
    title: 'Carga UMTS uplink y cell breathing',
    description: 'Ganancia de procesado, factor de carga por usuario y el bucle iterativo de convergencia.',
    enabled: false,
  },
];

export function CellularHubScreen({
  onBack,
  onSelectGeometry,
  onSelectTraffic,
  onSelectLinkBudget,
}: CellularHubScreenProps) {
  const { colors } = useTheme();

  const onPressById: Record<string, (() => void) | undefined> = {
    geometry: onSelectGeometry,
    traffic: onSelectTraffic,
    'link-budget': onSelectLinkBudget,
  };

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: colors.accentText }]}>‹ Inicio</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.textPrimary }]}>Planificación celular</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Geometría, dimensionamiento por tráfico y capacidad/cobertura -- docs/curso-referencia.md §13.
      </Text>

      {CELLULAR_FEATURES.map((feature) => (
        <ListCard
          key={feature.id}
          title={feature.title}
          description={feature.description}
          statusText={feature.enabled ? undefined : 'Próximamente'}
          disabled={!feature.enabled}
          onPress={onPressById[feature.id] ?? (() => {})}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  backButtonText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
});
