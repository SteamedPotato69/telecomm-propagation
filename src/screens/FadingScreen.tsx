import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { BackButton } from '../components/BackButton';
import { FadingResultPanel } from '../components/FadingResultPanel';
import { FadingZoneChart } from '../components/FadingZoneChart';
import { NumericField } from '../components/NumericField';
import { DELAY_SPREAD_PRESETS, calculateFading } from '../models/fading';
import type { FadingResult } from '../models/fading';
import { translateError } from '../i18n';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

type SymbolInputMode = 'duration' | 'rate';

interface FadingScreenProps {
  onBack: () => void;
}

export function FadingScreen({ onBack }: FadingScreenProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [frequencyMHz, setFrequencyMHz] = useState('900');
  const [delaySpreadUs, setDelaySpreadUs] = useState('2');
  const [speedKmh, setSpeedKmh] = useState('36');
  const [bandwidthKHz, setBandwidthKHz] = useState('25');

  const [symbolInputMode, setSymbolInputMode] = useState<SymbolInputMode>('duration');
  const [symbolDurationUs, setSymbolDurationUs] = useState('50');
  const [symbolRateKbps, setSymbolRateKbps] = useState('19.5');

  const effectiveSymbolDurationUs = useMemo(() => {
    if (symbolInputMode === 'duration') {
      return parseDecimal(symbolDurationUs);
    }
    // Ts = 1/R, R in symbols/s. Treated here as 1 bit = 1 symbol (no
    // modulation order factored in) -- the course's own worked example
    // (§8.8, R = 19.5 kbps -> Tb = 0.05 ms) uses this same simplification.
    const rateKbps = parseDecimal(symbolRateKbps);
    return rateKbps > 0 ? 1000 / rateKbps : NaN;
  }, [symbolInputMode, symbolDurationUs, symbolRateKbps]);

  const { result, errorMessage } = useMemo<{ result: FadingResult | null; errorMessage: string | null }>(() => {
    const parsedFrequency = parseDecimal(frequencyMHz);
    const parsedDelaySpread = parseDecimal(delaySpreadUs);
    const parsedSpeed = parseDecimal(speedKmh);
    const parsedBandwidth = parseDecimal(bandwidthKHz);

    if (
      [parsedFrequency, parsedDelaySpread, parsedSpeed, parsedBandwidth, effectiveSymbolDurationUs].some(
        Number.isNaN
      )
    ) {
      return { result: null, errorMessage: t('common.missingValues') };
    }

    try {
      const calculated = calculateFading({
        frequencyMHz: parsedFrequency,
        delaySpreadUs: parsedDelaySpread,
        speedKmh: parsedSpeed,
        bandwidthKHz: parsedBandwidth,
        symbolDurationUs: effectiveSymbolDurationUs,
      });
      return { result: calculated, errorMessage: null };
    } catch (error) {
      return { result: null, errorMessage: translateError(t, error) };
    }
  }, [frequencyMHz, delaySpreadUs, speedKmh, bandwidthKHz, effectiveSymbolDurationUs, t]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>{t('fading.title')}</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          {t('fading.subtitle')}
        </Text>

        <NumericField
          label={t('fading.carrierFrequency')}
          unit="MHz"
          value={frequencyMHz}
          onChangeText={setFrequencyMHz}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('fields.delaySpread')}</Text>
        <View style={styles.chipRow}>
          {DELAY_SPREAD_PRESETS.map((preset) => {
            const isSelected = Number(delaySpreadUs) === preset.delaySpreadUs;
            return (
              <Pressable
                key={preset.id}
                onPress={() => setDelaySpreadUs(String(preset.delaySpreadUs))}
                accessibilityRole="radio"
                accessibilityState={{ selected: isSelected }}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {t(`fading.presets.${preset.id}`)} ({preset.delaySpreadUs} µs)
                </Text>
              </Pressable>
            );
          })}
        </View>
        <NumericField
          label={t('fields.delaySpread')}
          unit="µs"
          value={delaySpreadUs}
          onChangeText={setDelaySpreadUs}
          helperText={t('fading.delaySpreadHelper')}
        />

        <NumericField
          label={t('fields.mobileSpeed')}
          unit="km/h"
          value={speedKmh}
          onChangeText={setSpeedKmh}
          helperText={t('fading.speedHelper')}
        />

        <NumericField
          label={t('fields.signalBandwidth')}
          unit="kHz"
          value={bandwidthKHz}
          onChangeText={setBandwidthKHz}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>{t('fading.symbolHeading')}</Text>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setSymbolInputMode('duration')}
            accessibilityRole="radio"
            accessibilityState={{ selected: symbolInputMode === 'duration' }}
            style={[
              styles.chip,
              { borderColor: colors.border },
              symbolInputMode === 'duration' && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
            ]}
          >
            <Text style={[styles.chipText, { color: symbolInputMode === 'duration' ? '#ffffff' : colors.textPrimary }]}>
              {t('fading.tsDirect')}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSymbolInputMode('rate')}
            accessibilityRole="radio"
            accessibilityState={{ selected: symbolInputMode === 'rate' }}
            style={[
              styles.chip,
              { borderColor: colors.border },
              symbolInputMode === 'rate' && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
            ]}
          >
            <Text style={[styles.chipText, { color: symbolInputMode === 'rate' ? '#ffffff' : colors.textPrimary }]}>
              {t('fading.symbolRate')}
            </Text>
          </Pressable>
        </View>
        {symbolInputMode === 'duration' ? (
          <NumericField
            label={t('fields.symbolDuration')}
            unit="µs"
            value={symbolDurationUs}
            onChangeText={setSymbolDurationUs}
          />
        ) : (
          <NumericField
            label={t('fading.symbolRate')}
            unit="kbps"
            value={symbolRateKbps}
            onChangeText={setSymbolRateKbps}
            helperText={t('fading.symbolRateHelper')}
          />
        )}

        <FadingResultPanel result={result} errorMessage={errorMessage} />

        {result ? (
          <FadingZoneChart
            bandwidthRatio={result.bandwidthRatio}
            symbolRatio={result.symbolRatio}
            coherenceBandwidthHz={result.coherenceBandwidthHz}
            coherenceTimeS={result.coherenceTimeS}
            zone={result.zone}
          />
        ) : null}
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
