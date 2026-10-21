import { memo } from 'react';
import { Circle, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { axialToPoint, clusterTools, hexVertices } from '../../models/layout';
import type { ClusterTranslation, HexFrame, Point } from '../../models/layout';

const LILAC = '#c084fc';

const toPoints = (points: Point[], pxPerKm: number) => points.map((p) => `${p.x * pxPerKm},${p.y * pxPerKm}`).join(' ');

/** The line the player traces, with a label saying how long it is in reality. */
export function ReferenceLayer({ a, b, label, unit }: { a: Point; b: Point; label: string; unit: number }) {
  const middle = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  return (
    <>
      <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#000000" strokeOpacity={0.55} strokeWidth={6 * unit} strokeLinecap="round" />
      <Line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={LILAC} strokeWidth={3 * unit} strokeLinecap="round" />
      <Circle cx={a.x} cy={a.y} r={6 * unit} fill={LILAC} stroke="#ffffff" strokeWidth={2 * unit} />
      <Circle cx={b.x} cy={b.y} r={6 * unit} fill={LILAC} stroke="#ffffff" strokeWidth={2 * unit} />
      {/* A dark halo (stroked copy) under the white text keeps the label readable over any map. */}
      <SvgText
        x={middle.x}
        y={middle.y - 10 * unit}
        fontSize={14 * unit}
        fontWeight="bold"
        fill="#000000"
        stroke="#000000"
        strokeWidth={3 * unit}
        strokeOpacity={0.6}
        strokeLinejoin="round"
        textAnchor="middle"
      >
        {label}
      </SvgText>
      <SvgText x={middle.x} y={middle.y - 10 * unit} fontSize={14 * unit} fontWeight="bold" fill="#ffffff" textAnchor="middle">
        {label}
      </SvgText>
    </>
  );
}

/** The area to cover, as a tinted shape with a dashed outline. `polygonKm` is in km, so it is scaled to image pixels here. */
export function AreaLayer({ polygonKm, pxPerKm, unit }: { polygonKm: Point[]; pxPerKm: number; unit: number }) {
  return (
    <Polygon
      points={toPoints(polygonKm, pxPerKm)}
      fill={LILAC}
      fillOpacity={0.16}
      stroke="#ffffff"
      strokeWidth={3 * unit}
      strokeDasharray={`${10 * unit},${6 * unit}`}
      strokeLinejoin="round"
    />
  );
}

interface ClustersLayerProps {
  clusterSize: number;
  frame: HexFrame;
  translations: ClusterTranslation[];
  pxPerKm: number;
  colors: string[];
  unit: number;
  /** 0-1: ghosts (the preview of the piece under the finger) are drawn fainter. */
  opacity?: number;
  /** Number each cell with its frequency group when the cells are big enough to read it. */
  labels?: boolean;
  outline?: string;
}

/** Hexagons of the placed clusters, coloured by frequency group (km -> image px here). */
export const ClustersLayer = memo(function ClustersLayer({
  clusterSize,
  frame,
  translations,
  pxPerKm,
  colors,
  unit,
  opacity = 0.62,
  labels = true,
  outline = '#ffffff',
}: ClustersLayerProps) {
  const tools = clusterTools(clusterSize);
  const radiusPx = frame.radius * pxPerKm;
  const showLabels = labels && clusterSize > 1 && radiusPx / unit >= 16;
  return (
    <>
      {translations.flatMap((translation) =>
        tools.cellsAt(translation).map((cell) => {
          const center = axialToPoint(cell, frame);
          const color = tools.colorOf(cell);
          return (
            <Polygon
              key={`${translation.a},${translation.b}:${cell.q},${cell.r}`}
              points={toPoints(hexVertices(center, frame.radius, frame.rotationRad), pxPerKm)}
              fill={colors[color]}
              fillOpacity={opacity}
              stroke={outline}
              strokeOpacity={0.9}
              strokeWidth={1.5 * unit}
              strokeLinejoin="round"
            />
          );
        })
      )}
      {showLabels
        ? translations.flatMap((translation) =>
            tools.cellsAt(translation).map((cell) => {
              const center = axialToPoint(cell, frame);
              return (
                <SvgText
                  key={`t${translation.a},${translation.b}:${cell.q},${cell.r}`}
                  x={center.x * pxPerKm}
                  y={center.y * pxPerKm + 5 * unit}
                  fontSize={14 * unit}
                  fontWeight="bold"
                  fill="#ffffff"
                  textAnchor="middle"
                >
                  {tools.colorOf(cell) + 1}
                </SvgText>
              );
            })
          )
        : null}
    </>
  );
});
