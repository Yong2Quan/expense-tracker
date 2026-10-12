import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { IconName } from "../categoryIcons";
import { radius as radii } from "../theme";

interface Props {
  /** Two stops, dark → light. Use `gradientFrom()` to derive these safely. */
  colours: readonly [string, string];
  /** Watermarked in the corner — the icon of whatever the gradient represents. */
  icon?: IconName;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * The decorated gradient panel used for the big headline figures.
 *
 * Decoration is deliberately low-contrast — translucent white blobs and a
 * faint icon watermark. The point is texture, not a second thing competing
 * with the number on top of it.
 */
export default function GradientHero({
  colours,
  icon,
  borderRadius = radii.xl,
  style,
  children,
}: Props): React.JSX.Element {
  return (
    <View style={[{ borderRadius, overflow: "hidden" }, style]}>
      <LinearGradient
        colors={colours}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Plain rounded Views rather than SVG — cheaper, and enough for blobs. */}
      <View pointerEvents="none" style={[styles.blob, styles.blobTop]} />
      <View pointerEvents="none" style={[styles.blob, styles.blobBottom]} />

      {icon ? (
        <MaterialCommunityIcons
          name={icon}
          size={132}
          color="rgba(255,255,255,0.13)"
          style={styles.watermark}
          pointerEvents="none"
        />
      ) : null}

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.09)",
    borderRadius: 999,
  },
  blobTop: { width: 180, height: 180, top: -86, right: -54 },
  blobBottom: { width: 130, height: 130, bottom: -62, left: -38 },
  watermark: {
    position: "absolute",
    right: -14,
    bottom: -26,
    transform: [{ rotate: "-12deg" }],
  },
});
