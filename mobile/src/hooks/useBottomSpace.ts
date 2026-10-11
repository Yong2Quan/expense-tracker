import { useSafeAreaInsets } from "react-native-safe-area-context";

import { spacing, TAB_BAR_HEIGHT } from "../theme";

/**
 * Bottom padding for a scrollable TAB screen.
 *
 * Android's gesture pill / 3-button bar and the iPhone home indicator both eat
 * space at the bottom of the window, and the tab bar sits on top of that again.
 * Without this, the last row of a list ends up underneath the nav buttons and
 * can't be tapped.
 */
export function useTabContentPadding(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom + spacing.xl;
}

/** Bottom padding for a scrollable STACK screen (no tab bar underneath). */
export function useStackContentPadding(): number {
  const insets = useSafeAreaInsets();
  return insets.bottom + spacing.xl;
}
