import { type BagLine, MAX_BAG_LINES, MAX_LINE_QUANTITY } from "@/lib/bag-cookie";

// Pure bag rules shared by the bag page and the server actions. Stock always comes from the
// database at call time; nothing here trusts a quantity the cookie or a form supplied.

/** Units available per slug. Slugs missing from the map are no longer in the catalog. */
export type StockBySlug = Map<string, number>;

/** Drops products that no longer exist and clamps quantities to stock. Sold-out lines are
 * kept as they are, so they come back if the piece is restocked. */
export function normalizeBag(lines: BagLine[], stock: StockBySlug): BagLine[] {
  return lines.flatMap((line) => {
    const available = stock.get(line.slug);
    if (available === undefined) return [];
    if (available <= 0) return [line];
    return [{ slug: line.slug, quantity: Math.min(line.quantity, available) }];
  });
}

export type BagChange =
  | { status: "added" | "updated"; quantity: number }
  | { status: "limited"; quantity: number }
  | { status: "removed" }
  | { status: "at_limit"; quantity: number }
  | { status: "unavailable" | "sold_out" | "bag_full" | "not_in_bag" };

type Applied = { lines: BagLine[]; change: BagChange };

function setQuantity(lines: BagLine[], slug: string, quantity: number) {
  return lines.some((line) => line.slug === slug)
    ? lines.map((line) => (line.slug === slug ? { slug, quantity } : line))
    : [...lines, { slug, quantity }];
}

/** Adds `quantity` units, up to the stock (and the per-line cap). */
export function applyAdd(lines: BagLine[], slug: string, quantity: number, stock: StockBySlug): Applied {
  const available = stock.get(slug);
  if (available === undefined) return { lines, change: { status: "unavailable" } };
  if (available <= 0) return { lines, change: { status: "sold_out" } };

  const existing = lines.find((line) => line.slug === slug);
  if (!existing && lines.length >= MAX_BAG_LINES) return { lines, change: { status: "bag_full" } };

  const limit = Math.min(available, MAX_LINE_QUANTITY);
  // The bag may hold more than is now in stock; count only what can still be bought.
  const current = Math.min(existing?.quantity ?? 0, limit);
  if (current >= limit) {
    return { lines: setQuantity(lines, slug, limit), change: { status: "at_limit", quantity: limit } };
  }

  const wanted = current + quantity;
  const next = Math.min(wanted, limit);
  return {
    lines: setQuantity(lines, slug, next),
    change: { status: next < wanted ? "limited" : "added", quantity: next },
  };
}

/** Sets a line to `quantity` units, clamped to stock. Zero or less removes it. */
export function applyUpdate(lines: BagLine[], slug: string, quantity: number, stock: StockBySlug): Applied {
  if (!lines.some((line) => line.slug === slug)) return { lines, change: { status: "not_in_bag" } };
  const without = lines.filter((line) => line.slug !== slug);
  if (quantity <= 0) return { lines: without, change: { status: "removed" } };

  const available = stock.get(slug);
  if (available === undefined) return { lines: without, change: { status: "unavailable" } };
  if (available <= 0) return { lines: without, change: { status: "sold_out" } };

  const next = Math.min(quantity, available, MAX_LINE_QUANTITY);
  return {
    lines: setQuantity(lines, slug, next),
    change: { status: next < quantity ? "limited" : "updated", quantity: next },
  };
}

export type ReconciledLine<P> = {
  product: P;
  /** Units in the cookie. */
  requested: number;
  /** Units that can be bought now: the request clamped to stock, 0 when sold out. */
  quantity: number;
  /** The most this line can be raised to. */
  max: number;
  soldOut: boolean;
  /** Stock fell below the request, so the quantity was reduced. */
  adjusted: boolean;
  lineTotal: number;
};

/** The bag as the page shows it, priced from current product rows. */
export function reconcile<P extends { slug: string; price: number; stock: number }>(
  lines: BagLine[],
  products: Map<string, P>,
) {
  let removedCount = 0;
  const reconciled: ReconciledLine<P>[] = [];
  for (const line of lines) {
    const product = products.get(line.slug);
    if (!product) {
      removedCount++;
      continue;
    }
    const available = Math.max(product.stock, 0);
    const quantity = Math.min(line.quantity, available);
    reconciled.push({
      product,
      requested: line.quantity,
      quantity,
      max: Math.min(available, MAX_LINE_QUANTITY),
      soldOut: available === 0,
      adjusted: available > 0 && quantity < line.quantity,
      lineTotal: product.price * quantity,
    });
  }
  return {
    lines: reconciled,
    removedCount,
    subtotal: reconciled.reduce((total, line) => total + line.lineTotal, 0),
    count: reconciled.reduce((total, line) => total + line.quantity, 0),
  };
}
