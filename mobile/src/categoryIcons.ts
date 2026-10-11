import { MaterialCommunityIcons } from "@expo/vector-icons";

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * Pick an icon from a category's name.
 *
 * Keyword-matched rather than stored on the record, so categories you invent
 * later ("Coffee", "Car insurance") still get a sensible glyph without needing
 * a database column. First match wins, so order matters: more specific
 * keywords go above general ones.
 */
const ICON_RULES: ReadonlyArray<readonly [readonly string[], IconName]> = [
  [["grocer", "supermarket"], "cart-outline"],
  [["coffee", "cafe", "café"], "coffee-outline"],
  [["food", "drink", "eat", "restaurant", "lunch", "dinner", "snack"], "silverware-fork-knife"],
  [["fuel", "petrol", "gas station"], "gas-station-outline"],
  [["transport", "travel", "car", "bus", "train", "taxi", "flight", "commute"], "bus"],
  [["cloth", "fashion", "shoe"], "tshirt-crew-outline"],
  [["shop", "store", "retail"], "shopping-outline"],
  [["movie", "cinema", "film"], "movie-open-outline"],
  [["game", "gaming"], "gamepad-variant-outline"],
  [["music", "concert"], "music-note-outline"],
  [["entertain", "fun", "leisure", "hobby"], "party-popper"],
  [["gym", "fitness", "sport"], "dumbbell"],
  [["pharmacy", "medicine", "medical", "doctor", "dental", "health"], "heart-pulse"],
  [["rent", "mortgage"], "home-city-outline"],
  [["electric", "water", "utility", "internet", "phone"], "flash-outline"],
  [["subscription", "insurance"], "autorenew"],
  [["bill", "invoice", "tax"], "file-document-outline"],
  [["home", "house", "furniture"], "home-outline"],
  [["school", "course", "education", "book", "tuition"], "school-outline"],
  [["pet", "dog", "cat"], "paw-outline"],
  [["gift", "present", "donation", "charity"], "gift-outline"],
  [["baby", "child", "kid"], "baby-carriage"],
  [["beauty", "salon", "haircut"], "content-cut"],
  [["saving", "invest"], "piggy-bank-outline"],
  [["salary", "income", "bonus", "cash"], "cash"],
];

const FALLBACK_ICON: IconName = "tag-outline";

export function iconForCategory(name: string): IconName {
  const haystack = name.toLowerCase();
  for (const [keywords, icon] of ICON_RULES) {
    if (keywords.some((word) => haystack.includes(word))) {
      return icon;
    }
  }
  return FALLBACK_ICON;
}

/** The glyphs offered in the Settings preview, in a sensible browsing order. */
export const ICON_CHOICES: readonly IconName[] = [
  "silverware-fork-knife",
  "cart-outline",
  "coffee-outline",
  "bus",
  "gas-station-outline",
  "shopping-outline",
  "tshirt-crew-outline",
  "movie-open-outline",
  "gamepad-variant-outline",
  "party-popper",
  "dumbbell",
  "heart-pulse",
  "home-outline",
  "home-city-outline",
  "flash-outline",
  "file-document-outline",
  "school-outline",
  "paw-outline",
  "gift-outline",
  "piggy-bank-outline",
  "tag-outline",
];
