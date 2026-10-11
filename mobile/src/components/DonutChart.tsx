import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Svg, { Circle, G } from "react-native-svg";

import { palette, spacing } from "../theme";
import { formatMoney } from "../utils/format";

export interface DonutSlice {
  name: string;
  colour: string;
  total: number;
  percentage: number;
}

interface Props {
  slices: DonutSlice[];
  total: number;
  size?: number;
  thickness?: number;
}

/**
 * Part-to-whole donut.
 *
 * A donut answers "roughly what share?" at a glance; it is poor at comparing
 * two close values, so the ranked bar list underneath carries the precise
 * comparison. Slices are capped at six (plus "Other") because adjacent wedges
 * blur together past that.
 */
export default function DonutChart({
  slices,
  total,
  size = 200,
  thickness = 30,
}: Props): React.JSX.Element {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  // A 2px gap in the surface colour keeps neighbouring wedges from merging.
  const gap = slices.length > 1 ? 2 : 0;

  let offset = 0;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* -90° so the first slice starts at twelve o'clock. */}
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={palette.track}
            strokeWidth={thickness}
            fill="none"
          />
          {slices.map((slice) => {
            const arc = (slice.percentage / 100) * circumference;
            const visible = Math.max(arc - gap, 0.5);
            const dash = `${visible} ${circumference - visible}`;
            const element = (
              <Circle
                key={slice.name}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={slice.colour}
                strokeWidth={thickness}
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                fill="none"
              />
            );
            offset += arc;
            return element;
          })}
        </G>
      </Svg>

      {/* Total in the hole — the figure the donut is a breakdown of. */}
      <View style={styles.centre} pointerEvents="none">
        <Text style={styles.centreLabel}>Total</Text>
        <Text style={styles.centreValue} numberOfLines={1} adjustsFontSizeToFit>
          {formatMoney(total)}
        </Text>
      </View>
    </View>
  );
}

/**
 * Cap the slice count. Everything past `max` folds into a single "Other"
 * wedge rather than inventing new colours.
 */
export function capSlices(
  rows: DonutSlice[],
  max = 6,
  otherColour = "#8A91A3",
): DonutSlice[] {
  if (rows.length <= max) return rows;

  const head = rows.slice(0, max);
  const tail = rows.slice(max);
  const otherTotal = tail.reduce((sum, r) => sum + r.total, 0);
  const otherPct = tail.reduce((sum, r) => sum + r.percentage, 0);

  return [
    ...head,
    { name: `Other (${tail.length})`, colour: otherColour, total: otherTotal, percentage: otherPct },
  ];
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
  centre: { position: "absolute", alignItems: "center", paddingHorizontal: spacing.xl },
  centreLabel: {
    color: palette.textMuted,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  centreValue: { color: palette.textPrimary, fontSize: 24, fontWeight: "700" },
});
