import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Polyline, Text as SvgText } from 'react-native-svg';

export interface ChartSeriesPoint {
  x: number;
  y: number | null;
}

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  points: ChartSeriesPoint[];
  strokeWidth?: number;
  dashed?: boolean;
}

interface LineChartProps {
  title: string;
  series: ChartSeries[];
  xScale: 'linear' | 'log';
  xLabel: string;
  yLabel: string;
  height?: number;
}

const MARGIN = { top: 12, right: 16, bottom: 32, left: 48 };

function scalePosition(value: number, domainMin: number, domainMax: number, rangeMin: number, rangeMax: number, log: boolean) {
  const v = log ? Math.log10(value) : value;
  const dMin = log ? Math.log10(domainMin) : domainMin;
  const dMax = log ? Math.log10(domainMax) : domainMax;
  if (dMax === dMin) return rangeMin;
  const t = (v - dMin) / (dMax - dMin);
  return rangeMin + t * (rangeMax - rangeMin);
}

/** Splits a series into contiguous runs of non-null points, so a gap (unavailable model at that x) breaks the line instead of connecting across it. */
function toSegments(points: ChartSeriesPoint[]): { x: number; y: number }[][] {
  const segments: { x: number; y: number }[][] = [];
  let current: { x: number; y: number }[] = [];
  for (const point of points) {
    if (point.y === null) {
      if (current.length > 0) segments.push(current);
      current = [];
    } else {
      current.push({ x: point.x, y: point.y });
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

function niceLinearTicks(min: number, max: number, count: number): number[] {
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}

const LOG_CANDIDATE_TICKS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100];

function logTicksInDomain(min: number, max: number): number[] {
  return LOG_CANDIDATE_TICKS.filter((tick) => tick >= min && tick <= max);
}

export function LineChart({ title, series, xScale, xLabel, yLabel, height = 220 }: LineChartProps) {
  const [width, setWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const allY = series.flatMap((s) => s.points.filter((p) => p.y !== null).map((p) => p.y as number));

  if (allX.length === 0 || allY.length === 0 || width === 0) {
    return <View style={styles.container} onLayout={onLayout} />;
  }

  const xMin = Math.min(...allX);
  const xMax = Math.max(...allX);
  const yMinRaw = Math.min(...allY);
  const yMaxRaw = Math.max(...allY);
  const yPad = Math.max((yMaxRaw - yMinRaw) * 0.1, 1);
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const plotLeft = MARGIN.left;
  const plotRight = width - MARGIN.right;
  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom;

  const isLog = xScale === 'log';
  const px = (x: number) => scalePosition(x, xMin, xMax, plotLeft, plotRight, isLog);
  const py = (y: number) => scalePosition(y, yMin, yMax, plotBottom, plotTop, false);

  const xTicks = isLog ? logTicksInDomain(xMin, xMax) : niceLinearTicks(xMin, xMax, 5);
  const yTicks = niceLinearTicks(yMin, yMax, 5);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.axisLabelY}>{yLabel}</Text>
      <Svg width={width} height={height}>
        {/* Gridlines + Y ticks */}
        {yTicks.map((tick) => (
          <Line key={`gy-${tick}`} x1={plotLeft} y1={py(tick)} x2={plotRight} y2={py(tick)} stroke="#e4e9ee" strokeWidth={1} />
        ))}
        {yTicks.map((tick) => (
          <SvgText key={`ly-${tick}`} x={plotLeft - 6} y={py(tick) + 3} fontSize={9} fill="#7b8794" textAnchor="end">
            {tick.toFixed(0)}
          </SvgText>
        ))}

        {/* X ticks */}
        {xTicks.map((tick) => (
          <Line key={`gx-${tick}`} x1={px(tick)} y1={plotTop} x2={px(tick)} y2={plotBottom} stroke="#f0f3f6" strokeWidth={1} />
        ))}
        {xTicks.map((tick) => (
          <SvgText key={`lx-${tick}`} x={px(tick)} y={plotBottom + 14} fontSize={9} fill="#7b8794" textAnchor="middle">
            {tick < 1 ? tick.toFixed(1) : tick.toFixed(0)}
          </SvgText>
        ))}

        {/* Axes */}
        <Line x1={plotLeft} y1={plotTop} x2={plotLeft} y2={plotBottom} stroke="#9aa5b1" strokeWidth={1} />
        <Line x1={plotLeft} y1={plotBottom} x2={plotRight} y2={plotBottom} stroke="#9aa5b1" strokeWidth={1} />

        {/* Series */}
        {series.map((s) =>
          toSegments(s.points).map((segment, segmentIndex) => (
            <Polyline
              key={`${s.id}-${segmentIndex}`}
              points={segment.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth={s.strokeWidth ?? 2}
              strokeDasharray={s.dashed ? '4,4' : undefined}
            />
          ))
        )}
      </Svg>

      <Text style={styles.axisLabelX}>{xLabel}</Text>

      <View style={styles.legend}>
        {series.map((s) => (
          <View key={s.id} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: s.color }]} />
            <Text style={styles.legendText}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  title: { fontSize: 13, fontWeight: '700', color: '#1f2933', marginBottom: 2 },
  axisLabelY: { fontSize: 10, color: '#7b8794', marginBottom: 4 },
  axisLabelX: { fontSize: 10, color: '#7b8794', textAlign: 'center', marginTop: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 12, marginBottom: 4 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2, marginRight: 6 },
  legendText: { fontSize: 11, color: '#52606d' },
});
