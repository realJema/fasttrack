import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

import { colors } from '../constants/theme';

const MARKERS = [
  { angle: -90, emoji: '💧' },
  { angle: -18, emoji: '🍅' },
  { angle: 54, emoji: '⚡' },
  { angle: 126, emoji: '🧠' },
  { angle: 198, emoji: '🔥' },
];

interface TimerRingProps {
  size: number;
  /** 0..1 */
  progress: number;
  showMarkers?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function TimerRing({ size, progress, showMarkers = true, children, style }: TimerRingProps) {
  const strokeWidth = Math.round(size * 0.055);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, progress));

  const center = size / 2;
  const markerRadius = radius + strokeWidth / 2;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={colors.track}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <G rotation={-90} originX={center} originY={center}>
          <Circle
            cx={center}
            cy={center}
            r={radius}
            stroke={colors.primary}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            fill="transparent"
          />
        </G>
        {showMarkers &&
          MARKERS.map((marker, i) => {
            const rad = (marker.angle * Math.PI) / 180;
            const x = center + markerRadius * Math.cos(rad);
            const y = center + markerRadius * Math.sin(rad);
            const reached = clamped >= i / MARKERS.length;
            return (
              <G key={i}>
                <Circle
                  cx={x}
                  cy={y}
                  r={size * 0.052}
                  fill={reached ? colors.amberSoft : '#FFFFFF'}
                  stroke={colors.border}
                  strokeWidth={1.5}
                />
                <SvgText
                  x={x}
                  y={y}
                  fontSize={size * 0.05}
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {marker.emoji}
                </SvgText>
              </G>
            );
          })}
      </Svg>
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        <View style={styles.centerContent}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
