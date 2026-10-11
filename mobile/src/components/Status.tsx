import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Button, Text } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import type { IconName } from "../categoryIcons";
import { palette, spacing } from "../theme";

export const Loading = (): React.JSX.Element => (
  <View style={styles.centre}>
    <ActivityIndicator size="large" color={palette.brand} />
  </View>
);

export const ErrorNotice = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}): React.JSX.Element => (
  <View style={styles.centre}>
    <MaterialCommunityIcons name="wifi-off" size={48} color={palette.textMuted} />
    <Text variant="titleMedium" style={styles.errorTitle}>
      Can&apos;t reach the server
    </Text>
    <Text style={styles.errorBody}>{message}</Text>
    <Button mode="contained" onPress={onRetry} style={styles.retry}>
      Try again
    </Button>
  </View>
);

/** Friendly placeholder with a glyph, instead of a bare line of grey text. */
export const EmptyState = ({
  icon,
  title,
  hint,
}: {
  icon: IconName;
  title: string;
  hint?: string;
}): React.JSX.Element => (
  <View style={styles.centre}>
    <View style={styles.emptyCircle}>
      <MaterialCommunityIcons name={icon} size={36} color={palette.textMuted} />
    </View>
    <Text variant="titleMedium" style={styles.emptyTitle}>
      {title}
    </Text>
    {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  centre: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.xl,
    gap: spacing.md,
  },
  errorTitle: { color: palette.textPrimary },
  errorBody: { color: palette.textSecondary, textAlign: "center" },
  retry: { marginTop: spacing.sm },
  emptyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: palette.track,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { color: palette.textPrimary },
  emptyHint: {
    color: palette.textMuted,
    textAlign: "center",
    marginTop: -spacing.xs,
  },
});
