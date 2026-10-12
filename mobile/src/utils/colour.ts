/**
 * Colour maths for the dynamic hero background.
 *
 * The hero gradient is derived from your top-spending category, so the
 * dashboard changes colour as your habits change. The catch: three of the
 * eight category colours (yellow, aqua, magenta) are far too light to put
 * white text on. So rather than trusting a hand-picked shade, every derived
 * stop is darkened until it provably clears a contrast ratio against white.
 */

type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

const toHex = (n: number): string =>
  Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0");

export function rgbToHex({ r, g, b }: RGB): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function hexToHsl(hex: string): HSL {
  const { r, g, b } = hexToRgb(hex);
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const l = (max + min) / 2;
  const d = max - min;

  if (d === 0) return { h: 0, s: 0, l };

  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rr) h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6;
  else if (max === gg) h = ((bb - rr) / d + 2) / 6;
  else h = ((rr - gg) / d + 4) / 6;

  return { h, s, l };
}

export function hslToHex({ h, s, l }: HSL): string {
  if (s === 0) {
    const v = l * 255;
    return rgbToHex({ r: v, g: v, b: v });
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const channel = (t: number): number => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return rgbToHex({
    r: channel(h + 1 / 3) * 255,
    g: channel(h) * 255,
    b: channel(h - 1 / 3) * 255,
  });
}

/** WCAG relative luminance. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number): number => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** WCAG contrast ratio between two colours, 1–21. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/**
 * Darken a colour step by step until white text on it clears `target`.
 * Hue-independent, so it works for yellow just as well as for violet.
 */
export function darkenUntilReadable(hex: string, target: number): string {
  const { h } = hexToHsl(hex);
  // Keep it vivid — a desaturated dark reads as muddy grey.
  const s = Math.max(hexToHsl(hex).s, 0.52);
  let { l } = hexToHsl(hex);

  for (let i = 0; i < 120; i += 1) {
    const candidate = hslToHex({ h, s, l });
    if (contrast(candidate, "#FFFFFF") >= target) return candidate;
    l -= 0.01;
    if (l <= 0.04) break;
  }
  return hslToHex({ h, s, l: Math.max(l, 0.04) });
}

/**
 * Two gradient stops derived from a category colour, both guaranteed readable
 * with white text. The darker stop anchors the top-left, the lighter one the
 * bottom-right, matching the app's other gradients.
 */
export function gradientFrom(hex: string): readonly [string, string] {
  const dark = darkenUntilReadable(hex, 7);
  const { h, s, l } = hexToHsl(dark);
  const lifted = hslToHex({ h, s, l: Math.min(l + 0.1, 0.72) });
  return [dark, darkenUntilReadable(lifted, 4.6)] as const;
}
