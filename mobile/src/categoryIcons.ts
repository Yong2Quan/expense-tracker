import { MaterialCommunityIcons } from "@expo/vector-icons";

export type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

/**
 * Pick an icon from a category's name.
 *
 * Keyword-matched rather than stored on the record, so categories you invent
 * later ("Coffee", "Car insurance", "Dog food") still get a sensible glyph
 * without needing a database column.
 *
 * These are the FILLED icon variants on purpose — they sit on a saturated
 * colour tile, where outline glyphs look thin and washed out.
 *
 * Matching rules:
 *   "card"   — whole word only. Stops "car" matching "credit card", and
 *              "cat" matching "category".
 *   "grocer*" — prefix, so it also catches "groceries", "grocery".
 *
 * First match wins, so specific rules sit above general ones.
 */
const ICON_RULES: ReadonlyArray<readonly [readonly string[], IconName]> = [
  // ── pets first: "Dog food" is a pet expense, not a meal ───────
  [["pet*", "dog*", "puppy"], "dog"],
  [["cat", "cats", "kitten"], "cat"],

  // ── food & drink ──────────────────────────────────────────────
  [["grocer*", "supermarket*"], "cart"],
  [["coffee*", "cafe", "café", "espresso", "latte"], "coffee"],
  [["beer", "pub", "bar", "alcohol"], "beer"],
  [["wine"], "glass-wine"],
  [["pizza"], "pizza"],
  [["noodle*", "ramen", "pasta"], "noodles"],
  [["rice"], "rice"],
  [["cake", "dessert*", "baker*", "sweets"], "cake-variant"],
  [["fruit*", "veg", "vegetable*"], "fruit-cherries"],
  [["food*", "eat*", "restaurant*", "lunch", "dinner", "breakfast", "snack*", "takeaway", "dining"], "silverware-fork-knife"],
  [["soda", "juice", "bubble tea", "boba", "drink*"], "bottle-soda"],

  // ── getting around ────────────────────────────────────────────
  [["fuel", "petrol", "diesel", "gas station"], "gas-station"],
  [["flight*", "plane", "airline*", "airport", "airfare"], "airplane"],
  [["train*", "metro", "subway", "mrt", "rail*"], "train"],
  [["taxi", "grab", "uber", "ride*"], "taxi"],
  [["bike", "bicycle", "cycling"], "bicycle"],
  [["motorbike", "scooter", "moped"], "motorbike"],
  [["ferry", "boat"], "ferry"],
  [["parking"], "parking"],
  [["car wash", "mechanic", "servicing", "car repair"], "car-wrench"],
  [["car", "cars", "vehicle*", "driving"], "car"],
  [["bus", "transport*", "travel*", "commut*", "transit"], "bus"],

  // ── shopping ──────────────────────────────────────────────────
  [["cloth*", "fashion", "apparel", "shoes", "shoe"], "tshirt-crew"],
  [["electronic*", "laptop", "computer*", "gadget*", "tech"], "laptop"],
  [["furniture", "appliance*", "homeware"], "washing-machine"],
  [["shop*", "store", "retail", "mall", "amazon"], "shopping"],

  // ── fun ───────────────────────────────────────────────────────
  [["movie*", "cinema", "film*"], "movie-open"],
  [["game*", "gaming", "steam", "console"], "gamepad-variant"],
  [["music", "concert*", "gig", "spotify"], "music"],
  [["sport*", "football", "basketball", "tennis", "swim*"], "basketball"],
  [["ticket*", "event*", "show"], "ticket"],
  [["entertain*", "fun", "leisure", "hobb*", "party"], "party-popper"],

  // ── health & self-care ────────────────────────────────────────
  [["gym", "fitness", "workout*"], "dumbbell"],
  [["pharmac*", "medicine", "pills", "pill", "prescription*"], "pill"],
  [["doctor*", "dental", "dentist*", "clinic*", "hospital*", "medical"], "medical-bag"],
  [["spa", "massage", "wellness"], "spa"],
  [["haircut*", "salon", "barber*", "beauty"], "content-cut"],
  [["health*"], "heart-pulse"],

  // ── home & bills ──────────────────────────────────────────────
  [["rent", "mortgage", "housing"], "home-city"],
  [["electric*", "power", "energy"], "lightning-bolt"],
  [["water", "sewage"], "water"],
  [["heating", "gas bill"], "fire"],
  [["internet", "wifi", "broadband", "fibre", "fiber"], "wifi"],
  [["phone*", "mobile", "telco", "sim"], "cellphone"],
  [["tv", "streaming", "netflix", "cable"], "television-classic"],
  [["cleaning", "housekeeping", "laundry"], "broom"],
  [["repair*", "maintenance", "tools", "tool", "diy"], "tools"],
  [["subscription*", "renewal*", "membership*"], "autorenew"],
  [["insurance", "insur*"], "shield-check"],
  [["bill*", "invoice*", "tax", "taxes", "utilit*"], "receipt-text"],
  [["home", "house", "household"], "home-variant"],

  // ── people & money ────────────────────────────────────────────
  [["baby", "child*", "kids", "kid", "nursery"], "baby-carriage"],
  [["school*", "course*", "tuition", "educat*", "class*", "uni", "college"], "school"],
  [["book*", "magazine*", "stationer*"], "book-open-page-variant"],
  [["gift*", "present*", "donat*", "charit*"], "gift"],
  [["hotel*", "accommodation", "airbnb", "hostel*"], "bed"],
  [["saving*", "invest*", "deposit*"], "piggy-bank"],
  [["loan*", "debt*", "repayment*"], "hand-coin"],
  [["bank*", "fees", "fee", "transfer*"], "bank"],
  [["card", "cards", "credit"], "credit-card-outline"],
  [["salary", "income", "bonus", "refund*", "cash"], "cash-multiple"],
  [["friend*", "famil*", "shared", "group"], "account-group"],
];

/** Shown when nothing matches — neutral rather than confidently wrong. */
const FALLBACK_ICON: IconName = "tag";

const escapeRegExp = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * `keyword*` matches as a prefix ("grocer*" catches "groceries").
 * Anything else must match as a whole word.
 */
function keywordMatches(haystack: string, keyword: string): boolean {
  if (keyword.endsWith("*")) {
    const stem = escapeRegExp(keyword.slice(0, -1));
    return new RegExp(`\\b${stem}`).test(haystack);
  }
  return new RegExp(`\\b${escapeRegExp(keyword)}\\b`).test(haystack);
}

export function iconForCategory(name: string): IconName {
  const haystack = name.toLowerCase();
  for (const [keywords, icon] of ICON_RULES) {
    if (keywords.some((word) => keywordMatches(haystack, word))) {
      return icon;
    }
  }
  return FALLBACK_ICON;
}
