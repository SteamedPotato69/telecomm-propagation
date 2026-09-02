import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { FADING_ZONE_LABELS } from '../models/fading';
import type { FadingZone } from '../models/fading';
import { useTheme } from '../theme';

interface FadingZoneChartProps {
  /** BT/Bc, x-axis. */
  bandwidthRatio: number;
  /** Ts/Tc, y-axis. 0 when Tc = +Infinity (stationary mobile) -- see MIN_PLOTTABLE_RATIO below. */
  symbolRatio: number;
  zone: FadingZone;
  height?: number;
}

const NEON_LILAC = '#c084fc';
const MARGIN = { top: 16, right: 16, bottom: 32, left: 40 };
const TICKS = [0.001, 0.01, 0.1, 1, 10, 100, 1000];

/**
 * Smallest ratio a log axis can place. symbolRatio is exactly 0 for a
 * stationary mobile (Tc = +Infinity), which has no position on a log
 * scale -- clamping it here draws the marker at the axis floor instead
 * of silently dropping the point.
 */
const MIN_PLOTTABLE_RATIO = 0.001;

function domainFor(ratio: number): [number, number] {
  const safeRatio = Math.max(ratio, MIN_PLOTTABLE_RATIO);
  return [Math.min(0.01, safeRatio / 5), Math.max(100, safeRatio * 5)];
}

function logPosition(value: number, domainMin: number, domainMax: number, rangeMin: number, rangeMax: number): number {
  const t = (Math.log10(value) - Math.log10(domainMin)) / (Math.log10(domainMax) - Math.log10(domainMin));
  return rangeMin + t * (rangeMax - rangeMin);
}

function formatTick(value: number): string {
  return value < 1 ? value.toString() : value.toFixed(0);
}

/**
 * 2D point plot of the operating point on the BT/Bc vs Ts/Tc plane
 * (docs/curso-referencia.md §8.7), not a good fit for LineChart.tsx
 * (built for line series over a single numeric axis). Reference lines at
 * ratio = 1 split the plane into the 4 real quadrants (zones 2-5); zone 1
 * ("zona rayada") is a Nyquist check independent of this plane (see
 * classifyZone in models/fading/fading.ts) so it isn't a quadrant here --
 * when it applies, the marker turns red and the summary text overrides
 * whichever quadrant the point geometrically falls in.
 */
export function FadingZoneChart({ bandwidthRatio, symbolRatio, zone, height = 260 }: FadingZoneChartProps) {
  const { colors } = useTheme();
  const [width, setWidth] = useState(0);
  const onLayout = (event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width);

  const zoneInfo = FADING_ZONE_LABELS[zone];

  if (width === 0) {
    return <View style={styles.container} onLayout={onLayout} />;
  }

  const plottedX = Math.max(bandwidthRatio, MIN_PLOTTABLE_RATIO);
  const plottedY = Math.max(symbolRatio, MIN_PLOTTABLE_RATIO);

  const [xMin, xMax] = domainFor(plottedX);
  const [yMin, yMax] = domainFor(plottedY);

  const plotLeft = MARGIN.left;
  const plotRight = width - MARGIN.right;
  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom;

  const px = (v: number) => logPosition(v, xMin, xMax, plotLeft, plotRight);
  const py = (v: number) => logPosition(v, yMin, yMax, plotBottom, plotTop);

  const xTicks = TICKS.filter((t) => t >= xMin && t <= xMax);
  const yTicks = TICKS.filter((t) => t >= yMin && t <= yMax);

  const refX = px(1);
  const refY = py(1);
  const markerColor = zone === 1 ? colors.error : colors.accentSolid;

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Zona de desvanecimiento (§8.7)</Text>
      <Text style={[styles.axisLabelY, { color: colors.textMuted }]}>Ts / Tc</Text>
      <Svg width={width} height={height}>
        {/*
          Quadrant tints: zone 2 (flat/flat) lilac, zone 5 (both selective)
          faint red, 3/4 neutral. py() maps high Ts/Tc to plotTop (log
          scale, inverted range) -- so "low ratio" is the BOTTOM half of
          the chart, not the top; zone 2 (Ts < Tc) is bottom-left, zone 5
          (Ts > Tc) is top-right.
        */}
        <Rect x={plotLeft} y={refY} width={refX - plotLeft} height={plotBottom - refY} fill={colors.accentSurface} />
        <Rect x={refX} y={plotTop} width={plotRight - refX} height={refY - plotTop} fill={colors.errorSurface} opacity={0.4} />

        {xTicks.map((t) => (
          <Line key={`gx-${t}`} x1={px(t)} y1={plotTop} x2={px(t)} y2={plotBottom} stroke={colors.borderMuted} strokeWidth={1} />
        ))}
        {yTicks.map((t) => (
          <Line key={`gy-${t}`} x1={plotLeft} y1={py(t)} x2={plotRight} y2={py(t)} stroke={colors.borderMuted} strokeWidth={1} />
        ))}

        {/* Reference lines at ratio = 1 -- the boundary between flat and selective on each axis. */}
        <Line x1={refX} y1={plotTop} x2={refX} y2={plotBottom} stroke={colors.textDisabled} strokeWidth={1.5} strokeDasharray="4,4" />
        <Line x1={plotLeft} y1={refY} x2={plotRight} y2={refY} stroke={colors.textDisabled} strokeWidth={1.5} strokeDasharray="4,4" />

        <Line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke={colors.textDisabled} strokeWidth={1} />
        <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke={colors.textDisabled} strokeWidth={1} />

        {xTicks.map((t) => (
          <SvgText key={`lx-${t}`} x={px(t)} y={plotBottom + 14} fontSize={9} fill={colors.textMuted} textAnchor="middle">
            {formatTick(t)}
          </SvgText>
        ))}
        {yTicks.map((t) => (
          <SvgText key={`ly-${t}`} x={plotLeft - 6} y={py(t) + 3} fontSize={9} fill={colors.textMuted} textAnchor="end">
            {formatTick(t)}
          </SvgText>
        ))}

        <SvgText x={(plotLeft + refX) / 2} y={plotBottom - 6} fontSize={10} fill={colors.accentText} textAnchor="middle">
          Zona 2
        </SvgText>
        <SvgText x={(plotRight + refX) / 2} y={plotBottom - 6} fontSize={10} fill={colors.textSecondary} textAnchor="middle">
          Zona 4
        </SvgText>
        <SvgText x={(plotLeft + refX) / 2} y={plotTop + 14} fontSize={10} fill={colors.textSecondary} textAnchor="middle">
          Zona 3
        </SvgText>
        <SvgText x={(plotRight + refX) / 2} y={plotTop + 14} fontSize={10} fill={colors.error} textAnchor="middle">
          Zona 5
        </SvgText>

        <Circle cx={px(plottedX)} cy={py(plottedY)} r={7} fill={markerColor} stroke={colors.surface} strokeWidth={2} />
      </Svg>
      <Text style={[styles.axisLabelX, { color: colors.textMuted }]}>BT / Bc</Text>

      <View style={[styles.summary, { backgroundColor: colors.accentSurface, borderColor: NEON_LILAC }]}>
        <Text style={[styles.zoneTitle, { color: zone === 1 ? colors.error : colors.accentText }]}>
          Zona {zone}: {zoneInfo.title}
        </Text>
        <Text style={[styles.zoneDescription, { color: colors.textSecondary }]}>{zoneInfo.description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  axisLabelY: { fontSize: 10, marginBottom: 4 },
  axisLabelX: { fontSize: 10, textAlign: 'center', marginTop: 2 },
  summary: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  zoneTitle: { fontSize: 14, fontWeight: '700' },
  zoneDescription: { fontSize: 12, marginTop: 4, lineHeight: 16 },
});
