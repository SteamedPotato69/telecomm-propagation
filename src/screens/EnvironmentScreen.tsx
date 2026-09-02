import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={[styles.backButtonText, { color: colors.accentText }]}>‹ Inicio</Text>
      </Pressable>

      <Text style={[styles.title, { color: colors.textPrimary }]}>Elige un entorno</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Determina qué modelos de predicción de pérdida están disponibles para tu ejercicio.
      </Text>

      {ENVIRONMENT_CATEGORIES.map((environment) => {
        const isEmpty = environment.applicableModelIds.length === 0;
        return (
          <Pressable
            key={environment.id}
            disabled={isEmpty}
            onPress={() => onSelectEnvironment(environment)}
            style={[
              styles.card,
              { borderColor: colors.border, backgroundColor: colors.surface },
              isEmpty && { backgroundColor: colors.surfaceDisabled, opacity: 0.55 },
            ]}
          >
            <Text style={[styles.cardTitle, { color: isEmpty ? colors.textDisabled : colors.textPrimary }]}>
              {environment.label}
            </Text>
            <Text style={[styles.cardDescription, { color: isEmpty ? colors.textDisabled : colors.textSecondary }]}>
              {environment.description}
            </Text>
            {!isEmpty ? (
              <Text style={[styles.cardModelCount, { color: colors.accentText }]}>
                {environment.applicableModelIds.length} modelo{environment.applicableModelIds.length === 1 ? '' : 's'}{' '}
                disponible{environment.applicableModelIds.length === 1 ? '' : 's'}
              </Text>
            ) : (
              <Text style={[styles.cardModelCount, { color: colors.textDisabled }]}>Próximamente</Text>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 16 },
  backButtonText: { fontSize: 15, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 4, marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '700' },
  cardDescription: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  cardModelCount: { fontSize: 11, fontWeight: '600', marginTop: 8 },
});
