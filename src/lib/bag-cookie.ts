// The shopping bag lives in a cookie of [slug, quantity] pairs. It never holds prices or
// stock: the server looks both up on every read, so editing the cookie gains nothing.
// Isomorphic: the server actions and the header's count badge share this parser.

export const BAG_COOKIE = "bag";
export const MAX_BAG_LINES = 50;
export const MAX_LINE_QUANTITY = 99;

const SLUG_PATTERN = /^[a-z0-9-]{1,100}$/;

export type BagLine = { slug: string; quantity: number };

export function isSlug(value: unknown): value is string {
  return typeof value === "string" && SLUG_PATTERN.test(value);
}

/** Lines from the cookie value. Anything malformed is skipped; garbage is an empty bag. */
export function parseBag(raw: string | undefined): BagLine[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const lines = new Map<string, number>();
  for (const entry of data) {
    if (lines.size >= MAX_BAG_LINES) break;
    if (!Array.isArray(entry)) continue;
    const [slug, quantity] = entry;
    if (!isSlug(slug) || lines.has(slug)) continue;
    if (!Number.isInteger(quantity) || quantity < 1) continue;
    lines.set(slug, Math.min(quantity, MAX_LINE_QUANTITY));
  }
  return [...lines].map(([slug, quantity]) => ({ slug, quantity }));
}

export function serializeBag(lines: BagLine[]) {
  return JSON.stringify(lines.map(({ slug, quantity }) => [slug, quantity]));
}

export function bagCount(lines: BagLine[]) {
  return lines.reduce((total, line) => total + line.quantity, 0);
}
