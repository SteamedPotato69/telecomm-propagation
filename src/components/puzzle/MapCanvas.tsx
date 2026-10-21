import { ReactNode, useMemo, useRef, useState } from 'react';
import { PanResponder, Platform, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import Svg from 'react-native-svg';
import type { Point } from '../../models/layout';
import { useTheme } from '../../theme';
import type { MapSurface } from './imageSource';

/** Tall photos are shown no taller than this so the controls stay on screen. */
const MAX_DISPLAY_HEIGHT = 480;

export interface MapCanvasProps {
  image: MapSurface;
  accessibilityLabel: string;
  /** Drawing in IMAGE pixels; `unit` is image pixels per screen pixel, so a stroke of `2 * unit` looks 2 px wide. */
  children?: (context: { unit: number; scale: number }) => ReactNode;
  /** Pointer events, in image pixels, clamped to the image. `start` is where the gesture began. */
  onPointerStart?: (point: Point) => void;
  onPointerMove?: (point: Point, start: Point) => void;
  onPointerEnd?: (point: Point, start: Point) => void;
  /** true while a finger/cursor is down, so the page can stop scrolling under it. */
  onInteraction?: (active: boolean) => void;
}

const webOnly = (style: object): ViewStyle | undefined => (Platform.OS === 'web' ? (style as ViewStyle) : undefined);

/**
 * The map: the image at a fitted size with an SVG layer on top that is drawn in
 * the image's own pixel units (so km -> px -> screen is one multiplication, and
 * nothing depends on how big the screen happens to be) and a transparent layer
 * that turns touches/clicks into image coordinates.
 *
 * Positions are computed as "where the gesture started + how far it moved", not
 * from each event's own offset, because the offset of a move event is relative to
 * whichever element it happens to land on.
 */
export function MapCanvas({ image, accessibilityLabel, children, onPointerStart, onPointerMove, onPointerEnd, onInteraction }: MapCanvasProps) {
  const { colors } = useTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const scale = containerWidth > 0 ? Math.min(containerWidth / image.width, MAX_DISPLAY_HEIGHT / image.height) : 0;
  const displayWidth = image.width * scale;
  const displayHeight = image.height * scale;

  // The responder is built once; it reads the newest props and size through this ref.
  const live = useRef({ scale, image, onPointerStart, onPointerMove, onPointerEnd, onInteraction });
  live.current = { scale, image, onPointerStart, onPointerMove, onPointerEnd, onInteraction };

  const responder = useMemo(() => {
    let origin: Point = { x: 0, y: 0 }; // screen px inside the layer, where the gesture began
    let start: Point = { x: 0, y: 0 }; // the same point in image px
    const toImage = (x: number, y: number): Point => {
      const { scale: s, image: img } = live.current;
      if (s <= 0) return { x: 0, y: 0 };
      return { x: Math.min(Math.max(x / s, 0), img.width), y: Math.min(Math.max(y / s, 0), img.height) };
    };
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      // A map drag must not be stolen by the page scroll halfway through.
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (event) => {
        origin = { x: event.nativeEvent.locationX, y: event.nativeEvent.locationY };
        start = toImage(origin.x, origin.y);
        live.current.onInteraction?.(true);
        live.current.onPointerStart?.(start);
      },
      onPanResponderMove: (_event, gesture) => {
        live.current.onPointerMove?.(toImage(origin.x + gesture.dx, origin.y + gesture.dy), start);
      },
      onPanResponderRelease: (_event, gesture) => {
        live.current.onInteraction?.(false);
        live.current.onPointerEnd?.(toImage(origin.x + gesture.dx, origin.y + gesture.dy), start);
      },
      onPanResponderTerminate: () => live.current.onInteraction?.(false),
    });
  }, []);

  const onLayout = (event: LayoutChangeEvent) => setContainerWidth(event.nativeEvent.layout.width);

  return (
    <View onLayout={onLayout} style={styles.container}>
      {scale > 0 ? (
        <View style={[styles.map, { width: displayWidth, height: displayHeight, borderColor: colors.borderMuted }]}>
          {image.uri ? (
            <Image source={{ uri: image.uri }} style={StyleSheet.absoluteFill} contentFit="fill" />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceMuted }]} />
          )}
          <Svg
            width={displayWidth}
            height={displayHeight}
            viewBox={`0 0 ${image.width} ${image.height}`}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          >
            {children?.({ unit: 1 / scale, scale })}
          </Svg>
          <View
            {...responder.panHandlers}
            accessible
            accessibilityLabel={accessibilityLabel}
            style={[StyleSheet.absoluteFill, webOnly({ touchAction: 'none', userSelect: 'none', cursor: 'crosshair' })]}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center' },
  map: { borderWidth: 1, overflow: 'hidden' },
});
