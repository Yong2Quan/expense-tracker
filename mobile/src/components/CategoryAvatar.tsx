import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { iconForCategory } from "../categoryIcons";
import { radius } from "../theme";

interface Props {
  name: string;
  colour: string;
  size?: number;
}

/**
 * The rounded colour tile with a white glyph that identifies a category —
 * the main piece of visual texture in the app's lists.
 */
export default function CategoryAvatar({
  name,
  colour,
  size = 40,
}: Props): React.JSX.Element {
  return (
    <View
      style={[
        styles.tile,
        {
          width: size,
          height: size,
          borderRadius: radius.md,
          backgroundColor: colour,
        },
      ]}
    >
      <MaterialCommunityIcons
        name={iconForCategory(name)}
        size={Math.round(size * 0.55)}
        color="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { alignItems: "center", justifyContent: "center" },
});
