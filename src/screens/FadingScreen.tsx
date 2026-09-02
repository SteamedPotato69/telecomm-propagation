import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FadingResultPanel } from '../components/FadingResultPanel';
import { FadingZoneChart } from '../components/FadingZoneChart';
import { NumericField } from '../components/NumericField';
import { DELAY_SPREAD_PRESETS, calculateFading } from '../models/fading';
import type { FadingResult } from '../models/fading';
import { parseDecimal } from '../utils/validation';

type SymbolInputMode = 'duration' | 'rate';

interface FadingScreenProps {
  onBack: () => void;
}

export function FadingScreen({ onBack }: FadingScreenProps) {
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
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Inicio</Text>
        </Pressable>

        <Text style={styles.title}>Simulador de desvanecimiento</Text>
        <Text style={styles.citation}>
          Dispersión de retardo, ancho de banda de coherencia, Doppler y tiempo de coherencia —
          docs/curso-referencia.md §8.
        </Text>

        <NumericField
          label="Frecuencia portadora"
          unit="MHz"
          value={frequencyMHz}
          onChangeText={setFrequencyMHz}
        />

        <Text style={styles.sectionLabel}>Dispersión de retardo (D)</Text>
        <View style={styles.chipRow}>
          {DELAY_SPREAD_PRESETS.map((preset) => (
            <Pressable
              key={preset.id}
              onPress={() => setDelaySpreadUs(String(preset.delaySpreadUs))}
              style={[
                styles.chip,
                Number(delaySpreadUs) === preset.delaySpreadUs && styles.chipSelected,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  Number(delaySpreadUs) === preset.delaySpreadUs && styles.chipTextSelected,
                ]}
              >
                {preset.label} ({preset.delaySpreadUs} µs)
              </Text>
            </Pressable>
          ))}
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

        <Text style={styles.sectionLabel}>Duración de símbolo</Text>
        <View style={styles.chipRow}>
          <Pressable
            onPress={() => setSymbolInputMode('duration')}
            style={[styles.chip, symbolInputMode === 'duration' && styles.chipSelected]}
          >
            <Text style={[styles.chipText, symbolInputMode === 'duration' && styles.chipTextSelected]}>
              Ts directo
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setSymbolInputMode('rate')}
            style={[styles.chip, symbolInputMode === 'rate' && styles.chipSelected]}
          >
            <Text style={[styles.chipText, symbolInputMode === 'rate' && styles.chipTextSelected]}>
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
            zone={result.zone}
          />
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  backButton: { marginBottom: 12 },
  backButtonText: { fontSize: 14, color: '#1f6feb', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#102a43' },
  citation: { fontSize: 11, color: '#7b8794', marginTop: 4, marginBottom: 16 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#1f2933', marginBottom: 8, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  chip: {
    borderWidth: 1,
    borderColor: '#c7ccd1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#6b21a8', borderColor: '#6b21a8' },
  chipText: { fontSize: 13, color: '#1f2933' },
  chipTextSelected: { color: '#fff' },
});
