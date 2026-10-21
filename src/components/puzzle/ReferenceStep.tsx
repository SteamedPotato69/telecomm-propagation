import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { MIN_REFERENCE_LINE_PX, pixelsPerKm } from '../../models/layout';
import type { Point } from '../../models/layout';
import { useTheme } from '../../theme';
import { ChoiceChips } from '../plan/ChoiceChips';
import { Intro, Panel } from '../plan/parts';
import { SmallButton } from './controls';
import type { SourceImage } from './imageSource';
import { ReferenceLayer } from './layers';
import { MapCanvas } from './MapCanvas';

export interface LineEnds {
  a: Point;
  b: Point;
}

/** Real lengths the traced line can stand for. 1 km is the default and what the course exercises use. */
export const REFERENCE_KM_OPTIONS = [0.5, 1, 2, 5];

interface ReferenceStepProps {
  image: SourceImage;
  ends: LineEnds | null;
  realKm: number;
  onEnds: (ends: LineEnds | null) => void;
  onRealKm: (km: number) => void;
  onInteraction: (active: boolean) => void;
}

/** Second screen: drag over the map to say how long a kilometre is. Everything else is sized from this. */
export function ReferenceStep({ image, ends, realKm, onEnds, onRealKm, onInteraction }: ReferenceStepProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [draft, setDraft] = useState<LineEnds | null>(null);
  const [tooShort, setTooShort] = useState(false);

  const shown = draft ?? ends;
  const lengthPx = shown ? Math.hypot(shown.b.x - shown.a.x, shown.b.y - shown.a.y) : 0;

  return (
    <View>
      <Intro>{t('puzzle.steps.reference.intro', { km: realKm })}</Intro>

      <Text style={[styles.label, { color: colors.textSecondary }]}>{t('puzzle.reference.lengthLabel')}</Text>
      <ChoiceChips
        options={REFERENCE_KM_OPTIONS.map((value) => ({ value, label: `${value} km` }))}
        selected={realKm}
        onSelect={onRealKm}
        accessibilityLabel={t('puzzle.reference.lengthLabel')}
      />

      <MapCanvas
        image={image}
        accessibilityLabel={t('puzzle.a11y.mapReference')}
        onInteraction={onInteraction}
        onPointerStart={(point) => {
          setTooShort(false);
          setDraft({ a: point, b: point });
        }}
        onPointerMove={(point, start) => setDraft({ a: start, b: point })}
        onPointerEnd={(point, start) => {
          setDraft(null);
          if (Math.hypot(point.x - start.x, point.y - start.y) < MIN_REFERENCE_LINE_PX) {
            setTooShort(true);
            return;
          }
          onEnds({ a: start, b: point });
        }}
      >
        {({ unit }) =>
          shown && lengthPx > 0 ? <ReferenceLayer a={shown.a} b={shown.b} label={`${realKm} km`} unit={unit} /> : null
        }
      </MapCanvas>

      <Panel>
        {tooShort ? (
          <Text style={{ color: colors.error }}>{t('errors.referenceLineTooShort', { min: MIN_REFERENCE_LINE_PX })}</Text>
        ) : ends ? (
          <Text style={{ color: colors.textPrimary }}>
            {t('puzzle.reference.measured', {
              px: Math.round(Math.hypot(ends.b.x - ends.a.x, ends.b.y - ends.a.y)),
              km: realKm,
              scale: pixelsPerKm({ a: ends.a, b: ends.b, realKm }).toFixed(1),
            })}
          </Text>
        ) : (
          <Text style={{ color: colors.textMuted }}>{t('puzzle.reference.none')}</Text>
        )}
      </Panel>

      <View style={styles.row}>
        <SmallButton label={t('puzzle.reference.clear')} onPress={() => onEnds(null)} disabled={ends === null} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
});
