import { ScrollView, StyleSheet, Text } from 'react-native';
import { BackButton } from '../components/BackButton';
import { ListCard } from '../components/ListCard';
import { ENVIRONMENT_CATEGORIES } from '../models/propagation';
import type { EnvironmentCategory } from '../models/propagation';
import { useTheme } from '../theme';

interface EnvironmentScreenProps {
  onSelectEnvironment: (environment: EnvironmentCategory) => void;
  onBack: () => void;
}

export function EnvironmentScreen({ onSelectEnvironment, onBack }: EnvironmentScreenProps) {
  const { colors } = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />

      <Text style={[styles.title, { color: colors.textPrimary }]}>Elige un entorno</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Determina qué modelos de predicción de pérdida están disponibles para tu ejercicio.
      </Text>

      {ENVIRONMENT_CATEGORIES.map((environment) => {
        const count = environment.applicableModelIds.length;
        const isEmpty = count === 0;
        return (
          <ListCard
            key={environment.id}
            title={environment.label}
            description={environment.description}
            statusText={
              isEmpty ? 'Próximamente' : `${count} modelo${count === 1 ? '' : 's'} disponible${count === 1 ? '' : 's'}`
            }
            disabled={isEmpty}
            onPress={() => onSelectEnvironment(environment)}
          />
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
});
