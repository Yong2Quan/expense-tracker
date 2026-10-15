import { MD3LightTheme, type MD3Theme } from "react-native-paper";

/**
 * Category colours — the DATA palette.
 *
 * These eight are a validated categorical set: every adjacent pair stays
 * distinguishable under protanopia/deuteranopia/tritanopia, and none reads as
 * grey. Assign them in order and never generate a ninth — the original palette
 * failed on exactly that, with orange and red too close to tell apart.
 *
 * Three (aqua, yellow, magenta) sit under 3:1 contrast on white, so wherever
 * they're used as a chart mark the value is also written out as text.
 */
export const CATEGORY_COLOURS = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#1baf7a", // aqua
  "#eda100", // yellow
  "#e87ba4", // magenta
  "#008300", // green
  "#6250d6", // violet
  "#e34948", // red
] as const;

export const DEFAULT_CATEGORY_COLOUR = CATEGORY_COLOURS[0];

/**
 * Chrome gradients — the BRAND, not data.
 *
 * Kept deliberately separate from CATEGORY_COLOURS: these decorate surfaces and
 * never encode a value, so they're free to be vivid without muddling which
 * colour means which category.
 */
export const gradients = {
  /** Headline cards. Dark enough at both stops for white text. */
  hero: ["#4F46E5", "#7C3AED"] as const,
  /** Primary action. */
  action: ["#4F46E5", "#6D28D9"] as const,
  /** Month-detail header, a touch warmer to read as a different place. */
  detail: ["#5B21B6", "#9333EA"] as const,
} as const;

export const palette = {
  background: "#F5F6FA",
  surface: "#FFFFFF",
  outline: "#E6E8EF",
  track: "#EDEFF5",

  textPrimary: "#15171C",
  textSecondary: "#5A6071",
  textMuted: "#8A91A3",
  /** Ink for use on top of a gradient. */
  onBrand: "#FFFFFF",
  onBrandMuted: "rgba(255,255,255,0.78)",

  brand: "#5B4BE1",
  danger: "#D64545",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

/** Soft elevation that works on both platforms. */
export const shadow = {
  shadowColor: "#0B1020",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
} as const;

/**
 * Nominal tab-bar height, before the device's bottom inset is added.
 *
 * 64 rather than 58: the inset is added to both the height and the bottom
 * padding, so it buys no room for content — the icon (24) plus the label's
 * line box needs the nominal height to be generous on its own, or the labels
 * render clipped along the bottom edge.
 */
export const TAB_BAR_HEIGHT = 64;

export const theme: MD3Theme = {
  ...MD3LightTheme,
  roundness: radius.md,
  colors: {
    ...MD3LightTheme.colors,
    primary: palette.brand,
    background: palette.background,
    surface: palette.surface,
    surfaceVariant: palette.track,
    outline: palette.outline,
    outlineVariant: palette.outline,
    onSurface: palette.textPrimary,
    onSurfaceVariant: palette.textSecondary,
    error: palette.danger,
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level0: "transparent",
      level1: palette.surface,
      level2: palette.surface,
      level3: palette.surface,
    },
  },
};
