import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../components/BackButton';
import { FadingResultPanel } from '../components/FadingResultPanel';
import { FadingZoneChart } from '../components/FadingZoneChart';
import { NumericField } from '../components/NumericField';
import { DELAY_SPREAD_PRESETS, calculateFading } from '../models/fading';
import type { FadingResult } from '../models/fading';
import { useTheme } from '../theme';
import { parseDecimal } from '../utils/validation';

type SymbolInputMode = 'duration' | 'rate';

interface FadingScreenProps {
  onBack: () => void;
}

export function FadingScreen({ onBack }: FadingScreenProps) {
  const { colors } = useTheme();
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
      return { result: null, errorMessage: 'Todos los campos numéricos deben tener un valor.' };
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
      return { result: null, errorMessage: error instanceof Error ? error.message : 'Error desconocido.' };
    }
  }, [frequencyMHz, delaySpreadUs, speedKmh, bandwidthKHz, effectiveSymbolDurationUs]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content}>
        <BackButton onPress={onBack} />

        <Text style={[styles.title, { color: colors.textPrimary }]}>Simulador de desvanecimiento</Text>
        <Text style={[styles.citation, { color: colors.textMuted }]}>
          Dispersión de retardo, ancho de banda de coherencia, Doppler y tiempo de coherencia —
          docs/curso-referencia.md §8.
        </Text>

        <NumericField
          label="Frecuencia portadora"
          unit="MHz"
          value={frequencyMHz}
          onChangeText={setFrequencyMHz}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Dispersión de retardo (D)</Text>
        <View style={styles.chipRow}>
          {DELAY_SPREAD_PRESETS.map((preset) => {
            const isSelected = Number(delaySpreadUs) === preset.delaySpreadUs;
            return (
              <Pressable
                key={preset.id}
                onPress={() => setDelaySpreadUs(String(preset.delaySpreadUs))}
                style={[
                  styles.chip,
                  { borderColor: colors.border },
                  isSelected && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
                ]}
              >
                <Text style={[styles.chipText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                  {preset.label} ({preset.delaySpreadUs} µs)
                </Text>
              </Pressable>
            );
          })}
        </View>
        <NumericField
          label="Dispersión de retardo (D)"
          unit="µs"
          value={delaySpreadUs}
          onChangeText={setDelaySpreadUs}
          helperText="Regla práctica del curso: 1 µs ≈ 300 m de diferencia de recorrido."
        />

        <NumericField
          label="Velocidad del móvil"
          unit="km/h"
          value={speedKmh}
          onChangeText={setSpeedKmh}
          helperText="v = 0 es un móvil estático: fd = 0, Tc → ∞ (canal invariante en el tiempo)."
        />

        <NumericField
          label="Ancho de banda de la señal (BT)"
          unit="kHz"
          value={bandwidthKHz}
          onChangeText={setBandwidthKHz}
        />

        <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>Duración de símbolo</Text>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setSymbolInputMode('duration')}
            style={[
              styles.chip,
              { borderColor: colors.border },
              symbolInputMode === 'duration' && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
            ]}
          >
            <Text style={[styles.chipText, { color: symbolInputMode === 'duration' ? '#ffffff' : colors.textPrimary }]}>
              Ts directo
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSymbolInputMode('rate')}
            style={[
              styles.chip,
              { borderColor: colors.border },
              symbolInputMode === 'rate' && { backgroundColor: colors.accentSolid, borderColor: colors.accentSolid },
            ]}
          >
            <Text style={[styles.chipText, { color: symbolInputMode === 'rate' ? '#ffffff' : colors.textPrimary }]}>
              Tasa de símbolo (R)
            </Text>
          </Pressable>
        </View>
        {symbolInputMode === 'duration' ? (
          <NumericField
            label="Duración de símbolo (Ts)"
            unit="µs"
            value={symbolDurationUs}
            onChangeText={setSymbolDurationUs}
          />
        ) : (
          <NumericField
            label="Tasa de símbolo (R)"
            unit="kbps"
            value={symbolRateKbps}
            onChangeText={setSymbolRateKbps}
            helperText="Se asume Ts = 1/R (1 símbolo por bit), igual que el ejemplo del curso (§8.8)."
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
