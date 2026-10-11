import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { LineChart } from '../components/LineChart';
import type { ChartSeries } from '../components/LineChart';
import { PROPAGATION_MODELS, generateLogSpacedDistances, sampleModelOverDistance } from '../models/propagation';
import type { EnvironmentCategory, PropagationInputs, PropagationModelId } from '../models/propagation';
import { translateError } from '../i18n';
import { useTheme } from '../theme';
import { formatPathLoss } from '../utils/format';

interface ComparisonScreenProps {
  environment: EnvironmentCategory;
  inputs: PropagationInputs;
  onBack: () => void;
}

interface ComparisonEntry {
  modelId: PropagationModelId;
  pathLossDb: number | null;
  distanceToIdealDb: number | null;
  errorMessage: string | null;
}

/** Distinct color per model so the same series reads consistently across both charts. */
const MODEL_COLORS: Partial<Record<PropagationModelId, string>> = {
  hata: '#2563eb',
  'cost231-hata': '#059669',
  ecc33: '#d97706',
  ikegami: '#dc2626',
  'walfisch-bertoni': '#7c3aed',
  'cost231-walfish-ikegami': '#db2777',
};
const IDEAL_COLOR = '#9aa5b1';

const CHART_DISTANCE_MIN_KM = 0.3;
const CHART_DISTANCE_MAX_KM = 20;
const CHART_SAMPLE_COUNT = 40;

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
  const { colors } = useTheme();
  const { t } = useTranslation();
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
            pathLossDb: result.pathLossDb,
            distanceToIdealDb: Math.abs(result.pathLossDb - idealPathLossDb),
            errorMessage: null,
          };
        } catch (error) {
          return {
            modelId: candidateModel.id,
            pathLossDb: null,
            distanceToIdealDb: null,
            errorMessage: translateError(t, error),
          };
        }
      });
  }, [environment, inputs, t]);

  const availableEntries = entries.filter((entry) => entry.distanceToIdealDb !== null);
  const winnerId =
    availableEntries.length > 0
      ? availableEntries.reduce((best, entry) => (entry.distanceToIdealDb! < best.distanceToIdealDb! ? entry : best))
          .modelId
      : null;

  const chartSeries = useMemo<ChartSeries[]>(() => {
    const distances = generateLogSpacedDistances(CHART_DISTANCE_MIN_KM, CHART_DISTANCE_MAX_KM, CHART_SAMPLE_COUNT);

    const idealSeries: ChartSeries = {
      id: 'ideal',
      label: t('comparison.idealSeries'),
      color: IDEAL_COLOR,
      dashed: true,
      points: sampleModelOverDistance(PROPAGATION_MODELS['free-space'], inputs, distances).map((p) => ({
        x: p.distanceKm,
        y: p.pathLossDb,
      })),
    };

    const modelSeries = environment.applicableModelIds
      .map((id) => PROPAGATION_MODELS[id])
      .filter((candidateModel) => candidateModel.implemented && candidateModel.id !== 'free-space')
      .map((candidateModel): ChartSeries => ({
        id: candidateModel.id,
        label: t(`models.${candidateModel.id}.label`),
        color: MODEL_COLORS[candidateModel.id] ?? '#374151',
        strokeWidth: candidateModel.id === winnerId ? 3 : 1.5,
        points: sampleModelOverDistance(candidateModel, inputs, distances).map((p) => ({
          x: p.distanceKm,
          y: p.pathLossDb,
        })),
      }));

    return [idealSeries, ...modelSeries];
  }, [environment, inputs, winnerId, t]);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <BackButton onPress={onBack} />

      <Text style={[styles.title, { color: colors.textPrimary }]}>{t('comparison.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.accentText }]}>{t(`environments.${environment.id}.label`)}</Text>
      <Text style={[styles.explainer, { color: colors.textMuted }]}>
        {t('comparison.explainer')}
      </Text>

      {entries.map((entry) => {
        const isWinner = entry.modelId === winnerId;
        return (
          <View
            key={entry.modelId}
            style={[
              styles.card,
              { borderColor: colors.borderMuted, backgroundColor: colors.surface },
              isWinner && { borderColor: colors.accent, backgroundColor: colors.accentSurface },
              entry.errorMessage && { backgroundColor: colors.surfaceDisabled, borderColor: colors.borderMuted },
            ]}
          >
            {isWinner ? (
              <Text style={[styles.winnerBadge, { backgroundColor: colors.accent }]}>{t('comparison.bestFit')}</Text>
            ) : null}
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{t(`models.${entry.modelId}.label`)}</Text>

            {entry.errorMessage ? (
              <Text style={[styles.cardError, { color: colors.textDisabled }]}>{entry.errorMessage}</Text>
            ) : (
              <>
                <Text style={[styles.cardValue, { color: colors.textPrimary }]}>
                  {formatPathLoss(entry.pathLossDb!)}
                </Text>
                <Text style={[styles.cardDistance, { color: colors.textSecondary }]}>
                  {t('comparison.distanceToIdeal', { value: entry.distanceToIdealDb!.toFixed(2) })}
                </Text>
              </>
            )}
            <Text style={[styles.cardCitation, { color: colors.textDisabled }]}>{t(`models.${entry.modelId}.citation`)}</Text>
          </View>
        );
      })}

      <View style={styles.chartsSection}>
        <Text style={[styles.chartsHeading, { color: colors.textPrimary }]}>{t('comparison.chartsHeading')}</Text>
        <Text style={[styles.explainer, { color: colors.textMuted }]}>
          {t('comparison.chartsExplainer')}
        </Text>
        <LineChart
          title={t('comparison.logScaleTitle')}
          series={chartSeries}
          xScale="log"
          xLabel={t('comparison.xLabelLog')}
          yLabel={t('comparison.yLabel')}
        />
        <LineChart
          title={t('comparison.linearScaleTitle')}
          series={chartSeries}
          xScale="linear"
          xLabel={t('comparison.xLabelLinear')}
          yLabel={t('comparison.yLabel')}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  explainer: { fontSize: 12, marginTop: 8, marginBottom: 20, lineHeight: 17 },
  card: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
  },
  winnerBadge: {
    alignSelf: 'flex-start',
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardValue: { fontSize: 26, fontWeight: '700', marginTop: 6 },
  cardDistance: { fontSize: 13, marginTop: 4 },
  cardError: { fontSize: 13, marginTop: 6, fontStyle: 'italic' },
  cardCitation: { fontSize: 10, marginTop: 10 },
  chartsSection: { marginTop: 8 },
  chartsHeading: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
