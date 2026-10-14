import { readBag, writeBag } from "@/lib/bag";
import { normalizeBag } from "@/lib/bag-reconcile";
import { getStockBySlugs } from "@/lib/catalog";

// POST /api/bag/sync: writes the bag back clamped to stock and without discontinued pieces.
// The bag page calls it (BagSync) after showing such corrections: RSCs can't set cookies, and
// a server action would re-render the page and wipe the notices that explain them.
export async function POST() {
  const lines = await readBag();
  if (lines.length > 0) {
    await writeBag(normalizeBag(lines, await getStockBySlugs(lines.map((line) => line.slug))));
  }
  return new Response(null, { status: 204 });
}
