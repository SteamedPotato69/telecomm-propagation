import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ENVIRONMENT_CATEGORIES } from '../models/propagation';
import type { EnvironmentCategory } from '../models/propagation';

interface EnvironmentScreenProps {
  onSelectEnvironment: (environment: EnvironmentCategory) => void;
  onBack: () => void;
}

export function EnvironmentScreen({ onSelectEnvironment, onBack }: EnvironmentScreenProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Inicio</Text>
      </Pressable>

      <Text style={styles.title}>Elige un entorno</Text>
      <Text style={styles.subtitle}>
        Determina qué modelos de predicción de pérdida están disponibles para tu ejercicio.
      </Text>

      {ENVIRONMENT_CATEGORIES.map((environment) => {
        const isEmpty = environment.applicableModelIds.length === 0;
        return (
          <Pressable
            key={environment.id}
            disabled={isEmpty}
            onPress={() => onSelectEnvironment(environment)}
            style={[styles.card, isEmpty && styles.cardDisabled]}
          >
            <Text style={[styles.cardTitle, isEmpty && styles.cardTitleDisabled]}>{environment.label}</Text>
            <Text style={[styles.cardDescription, isEmpty && styles.cardTitleDisabled]}>
              {environment.description}
            </Text>
            {!isEmpty ? (
              <Text style={styles.cardModelCount}>
                {environment.applicableModelIds.length} modelo{environment.applicableModelIds.length === 1 ? '' : 's'}{' '}
                disponible{environment.applicableModelIds.length === 1 ? '' : 's'}
              </Text>
            ) : (
              <Text style={styles.cardModelCountDisabled}>Próximamente</Text>
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
  backButtonText: { fontSize: 15, color: '#1f6feb', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#102a43' },
  subtitle: { fontSize: 13, color: '#7b8794', marginTop: 4, marginBottom: 20 },
  card: {
    borderWidth: 1,
    borderColor: '#c7ccd1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#ffffff',
  },
  cardDisabled: { backgroundColor: '#f4f5f6', opacity: 0.55 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#102a43' },
  cardTitleDisabled: { color: '#9aa5b1' },
  cardDescription: { fontSize: 12, color: '#52606d', marginTop: 4, lineHeight: 16 },
  cardModelCount: { fontSize: 11, color: '#1f6feb', fontWeight: '600', marginTop: 8 },
  cardModelCountDisabled: { fontSize: 11, color: '#9aa5b1', fontWeight: '600', marginTop: 8 },
});
