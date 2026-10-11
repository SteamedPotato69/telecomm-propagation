import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { NumericField } from '../components/NumericField';
import { TrafficResultPanel } from '../components/TrafficResultPanel';
import { erlangBBlocking, erlangBInverseChannels, erlangBInverseTraffic, maxDensityForGoS } from '../models/traffic';
import { translateError } from '../i18n';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

interface TrafficScreenProps {
  onBack: () => void;
}

type Mode = 'blocking' | 'traffic' | 'channels' | 'density';

const MODES: Mode[] = ['blocking', 'traffic', 'channels', 'density'];

export function TrafficScreen({ onBack }: TrafficScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('blocking');
  const [channelsInput, setChannelsInput] = useState('42');
  const [trafficInput, setTrafficInput] = useState('30.77');
  const [gosInput, setGosInput] = useState('0.01');
  const [cellAreaInput, setCellAreaInput] = useState('500');

  const showChannels = mode === 'blocking' || mode === 'traffic' || mode === 'density';
  const showTraffic = mode === 'blocking' || mode === 'channels';
  const showGos = mode === 'traffic' || mode === 'channels' || mode === 'density';
  const showCellArea = mode === 'density';

  const { resultLabel, resultValue, errorMessage } = useMemo<{
    resultLabel: string;
    resultValue: string | null;
    errorMessage: string | null;
  }>(() => {
    try {
      if (mode === 'blocking') {
        const channels = parseDecimal(channelsInput);
        const traffic = parseDecimal(trafficInput);
        if (Number.isNaN(channels) || Number.isNaN(traffic)) {
          return { resultLabel: '', resultValue: null, errorMessage: t('common.missingValues') };
        }
        const blocking = erlangBBlocking(channels, traffic);
        return { resultLabel: t('traffic.results.blocking'), resultValue: `${(blocking * 100).toFixed(3)} %`, errorMessage: null };
      }

      if (mode === 'traffic') {
        const channels = parseDecimal(channelsInput);
        const gos = parseDecimal(gosInput);
        if (Number.isNaN(channels) || Number.isNaN(gos)) {
          return { resultLabel: '', resultValue: null, errorMessage: t('common.missingValues') };
        }
        const traffic = erlangBInverseTraffic(channels, gos);
        return { resultLabel: t('traffic.results.supportableTraffic'), resultValue: `${traffic.toFixed(3)} Erlang`, errorMessage: null };
      }

      if (mode === 'channels') {
        const traffic = parseDecimal(trafficInput);
        const gos = parseDecimal(gosInput);
        if (Number.isNaN(traffic) || Number.isNaN(gos)) {
          return { resultLabel: '', resultValue: null, errorMessage: t('common.missingValues') };
        }
        const channels = erlangBInverseChannels(traffic, gos);
        return { resultLabel: t('traffic.results.requiredChannels'), resultValue: String(channels), errorMessage: null };
      }

      const channels = parseDecimal(channelsInput);
      const gos = parseDecimal(gosInput);
      const cellAreaKm2 = parseDecimal(cellAreaInput);
      if (Number.isNaN(channels) || Number.isNaN(gos) || Number.isNaN(cellAreaKm2)) {
        return { resultLabel: '', resultValue: null, errorMessage: t('common.missingValues') };
      }
      const density = maxDensityForGoS(channels, gos, cellAreaKm2);
      return {
        resultLabel: t('traffic.results.maxDensity'),
        resultValue: `${density.toFixed(4)} Erlang/km²`,
        errorMessage: null,
      };
    } catch (error) {
      return { resultLabel: '', resultValue: null, errorMessage: translateError(t, error) };
    }
  }, [mode, channelsInput, trafficInput, gosInput, cellAreaInput, t]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('traffic.title')}</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          {t('traffic.subtitle')}
        </Text>

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('traffic.whatToCompute')}</Text>
        <View style={styles.chipRow}>
          {MODES.map((option) => {
            const isSelected = mode === option;
            return (
              <Pressable
                key={option}
                onPress={() => setMode(option)}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {t(`traffic.modes.${option}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {showChannels ? (
          <NumericField label={t('fields.channels')} value={channelsInput} onChangeText={setChannelsInput} />
        ) : null}

        {showTraffic ? (
          <NumericField
            label={t('fields.offeredTraffic')}
            unit="Erlang"
            value={trafficInput}
            onChangeText={setTrafficInput}
          />
        ) : null}

        {showCellArea ? (
          <NumericField
            label={t('traffic.cellArea')}
            unit="km²"
            value={cellAreaInput}
            onChangeText={setCellAreaInput}
            helperText={t('traffic.cellAreaHelper')}
          />
        ) : null}

        {showGos ? (
          <NumericField
            label={t('fields.targetGos')}
            value={gosInput}
            onChangeText={setGosInput}
            helperText={t('traffic.gosHelper')}
          />
        ) : null}

        <TrafficResultPanel label={resultLabel} value={resultValue} errorMessage={errorMessage} />
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
