// Minimal, dependency-free helper: pull the average color out of a blurhash and
// turn it into a tiny SVG data URL usable as next/image's `blurDataURL`.
//
// A blurhash's first 6 chars encode size + the DC (average) color. Decoding just
// the DC gives us a smooth solid placeholder for near-zero cost — combined with
// real width/height on the <Image>, that's the CLS win without decoding pixels.

const DIGITS =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

function decode83(str: string): number {
  let value = 0;
  for (const char of str) {
    const index = DIGITS.indexOf(char);
    if (index === -1) return 0;
    value = value * 83 + index;
  }
  return value;
}

/** [r, g, b] average color (0-255) from a blurhash, or null if invalid. */
export function averageColor(hash: string): [number, number, number] | null {
  if (!hash || hash.length < 6) return null;
  const dc = decode83(hash.slice(2, 6));
  return [dc >> 16, (dc >> 8) & 255, dc & 255];
}

export function blurDataURL(hash: string): string | undefined {
  const rgb = averageColor(hash);
  if (!rgb) return undefined;
  const [r, g, b] = rgb;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="rgb(${r},${g},${b})"/></svg>`;
  const base64 =
    typeof window === "undefined"
      ? Buffer.from(svg).toString("base64")
      : btoa(svg);
  return `data:image/svg+xml;base64,${base64}`;
}
