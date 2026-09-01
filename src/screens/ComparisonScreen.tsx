import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PROPAGATION_MODELS } from '../models/propagation';
import type { EnvironmentCategory, PropagationInputs } from '../models/propagation';
import { formatPathLoss } from '../utils/format';

interface ComparisonScreenProps {
  environment: EnvironmentCategory;
  inputs: PropagationInputs;
  onBack: () => void;
}

interface ComparisonEntry {
  modelId: string;
  label: string;
  citation: string;
  pathLossDb: number | null;
  distanceToIdealDb: number | null;
  errorMessage: string | null;
}

/**
 * "Distancia a la predicción ideal": |pérdida del modelo - pérdida en
 * espacio libre| con los mismos parámetros. Espacio libre es la cota
 * teórica inferior ya usada en toda la app (freeSpace.ts) -- se trata
 * aquí como la "predicción ideal" de referencia. El modelo con menor
 * distancia se declara ganador. Un modelo que no tiene los parámetros
 * que necesita (p. ej. geometría de calle sin llenar) se muestra como
 * no disponible en vez de forzar un valor.
 */
export function ComparisonScreen({ environment, inputs, onBack }: ComparisonScreenProps) {
  const entries = useMemo<ComparisonEntry[]>(() => {
    const idealPathLossDb = PROPAGATION_MODELS['free-space'].calculate(inputs).pathLossDb;

    return environment.applicableModelIds
      .map((id) => PROPAGATION_MODELS[id])
      .filter((candidateModel) => candidateModel.implemented && candidateModel.id !== 'free-space')
      .map((candidateModel) => {
        try {
          const result = candidateModel.calculate(inputs);
          return {
            modelId: candidateModel.id,
            label: candidateModel.label,
            citation: candidateModel.citation,
            pathLossDb: result.pathLossDb,
            distanceToIdealDb: Math.abs(result.pathLossDb - idealPathLossDb),
            errorMessage: null,
          };
        } catch (error) {
          return {
            modelId: candidateModel.id,
            label: candidateModel.label,
            citation: candidateModel.citation,
            pathLossDb: null,
            distanceToIdealDb: null,
            errorMessage: error instanceof Error ? error.message : 'Error desconocido.',
          };
        }
      });
  }, [environment, inputs]);

  const availableEntries = entries.filter((entry) => entry.distanceToIdealDb !== null);
  const winnerId =
    availableEntries.length > 0
      ? availableEntries.reduce((best, entry) => (entry.distanceToIdealDb! < best.distanceToIdealDb! ? entry : best))
          .modelId
      : null;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Pressable onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>‹ Volver a la calculadora</Text>
      </Pressable>

      <Text style={styles.title}>Comparación de modelos</Text>
      <Text style={styles.subtitle}>{environment.label}</Text>
      <Text style={styles.explainer}>
        "Distancia al ideal" = diferencia absoluta contra la pérdida en espacio libre (cota teórica inferior) con los
        mismos parámetros. Menor distancia = mejor.
      </Text>

      {entries.map((entry) => {
        const isWinner = entry.modelId === winnerId;
        return (
          <View
            key={entry.modelId}
            style={[styles.card, isWinner && styles.cardWinner, entry.errorMessage && styles.cardUnavailable]}
          >
            {isWinner ? <Text style={styles.winnerBadge}>MEJOR AJUSTE</Text> : null}
            <Text style={styles.cardTitle}>{entry.label}</Text>

            {entry.errorMessage ? (
              <Text style={styles.cardError}>{entry.errorMessage}</Text>
            ) : (
              <>
                <Text style={styles.cardValue}>{formatPathLoss(entry.pathLossDb!)}</Text>
                <Text style={styles.cardDistance}>
                  Distancia al ideal: {entry.distanceToIdealDb!.toFixed(2)} dB
                </Text>
              </>
            )}
            <Text style={styles.cardCitation}>{entry.citation}</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, color: '#1f6feb', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#102a43' },
  subtitle: { fontSize: 15, fontWeight: '600', color: '#6b21a8', marginTop: 4 },
  explainer: { fontSize: 12, color: '#7b8794', marginTop: 8, marginBottom: 20, lineHeight: 17 },
  card: {
    borderWidth: 2,
    borderColor: '#e4e9ee',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    backgroundColor: '#ffffff',
  },
  cardWinner: { borderColor: '#c084fc', backgroundColor: '#faf5ff' },
  cardUnavailable: { backgroundColor: '#f4f5f6', borderColor: '#e4e9ee' },
  winnerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#c084fc',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#102a43' },
  cardValue: { fontSize: 26, fontWeight: '700', color: '#102a43', marginTop: 6 },
  cardDistance: { fontSize: 13, color: '#52606d', marginTop: 4 },
  cardError: { fontSize: 13, color: '#9aa5b1', marginTop: 6, fontStyle: 'italic' },
  cardCitation: { fontSize: 10, color: '#9aa5b1', marginTop: 10 },
});
