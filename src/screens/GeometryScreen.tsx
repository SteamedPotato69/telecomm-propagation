import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { GeometryResultPanel } from '../components/GeometryResultPanel';
import { NumericField } from '../components/NumericField';
import { RHOMBIC_NUMBER_EXAMPLES, calculateCellularGeometry } from '../models/geometry';
import type { GeometryResult } from '../models/geometry';
import { translateError } from '../i18n';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface GeometryScreenProps {
  onBack: () => void;
}

// Quick-pick chips: deduped, since a few {m,n} pairs in the course table
// share the same N (e.g. (1,1) and (-1,2) both give N=3).
const CLUSTER_SIZE_CHIPS = Array.from(new Set(RHOMBIC_NUMBER_EXAMPLES.map((e) => e.clusterSize))).sort(
  (a, b) => a - b
);

export function GeometryScreen({ onBack }: GeometryScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [cellRadiusKm, setCellRadiusKm] = useState('1');
  const [clusterSize, setClusterSize] = useState('7');
  const [totalAreaKm2, setTotalAreaKm2] = useState('');

  const { result, errorMessage } = useMemo<{ result: GeometryResult | null; errorMessage: string | null }>(() => {
    const parsedRadius = parseDecimal(cellRadiusKm);
    const parsedCluster = parseDecimal(clusterSize);
    const parsedArea = totalAreaKm2.trim() === '' ? undefined : parseDecimal(totalAreaKm2);

    if (
      Number.isNaN(parsedRadius) ||
      Number.isNaN(parsedCluster) ||
      (parsedArea !== undefined && Number.isNaN(parsedArea))
    ) {
      return { result: null, errorMessage: t('common.missingValues') };
    }

    try {
      const calculated = calculateCellularGeometry({
        cellRadiusKm: parsedRadius,
        clusterSize: parsedCluster,
        totalAreaKm2: parsedArea,
      });
      return { result: calculated, errorMessage: null };
    } catch (error) {
      return { result: null, errorMessage: translateError(t, error) };
    }
  }, [cellRadiusKm, clusterSize, totalAreaKm2, t]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('geometry.title')}</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          {t('geometry.subtitle')}
        </Text>

        <NumericField label={t('fields.cellRadius')} unit="km" value={cellRadiusKm} onChangeText={setCellRadiusKm} />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('geometry.clusterSize')}</Text>
        <View style={styles.chipRow}>
          {CLUSTER_SIZE_CHIPS.map((n) => {
            const isSelected = Number(clusterSize) === n;
            return (
              <Pressable
                key={n}
                onPress={() => setClusterSize(String(n))}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>N={n}</Text>
              </Pressable>
            );
          })}
        </View>
        <NumericField
          label={t('geometry.clusterSize')}
          value={clusterSize}
          onChangeText={setClusterSize}
          helperText={t('geometry.clusterHelper')}
        />

        <NumericField
          label={t('fields.totalCoverageArea')}
          unit="km²"
          value={totalAreaKm2}
          onChangeText={setTotalAreaKm2}
          helperText={t('geometry.totalAreaHelper')}
        />

        <GeometryResultPanel result={result} errorMessage={errorMessage} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: '700' },
  citation: { fontSize: 11, marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13 },
});
