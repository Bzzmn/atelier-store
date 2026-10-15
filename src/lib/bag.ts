import "server-only";

import { cookies } from "next/headers";

import { BAG_COOKIE, type BagLine, parseBag, serializeBag } from "@/lib/bag-cookie";
import { reconcile } from "@/lib/bag-reconcile";
import { getProductsBySlugs, getStockBySlugs, toSummary } from "@/lib/catalog";
import { CHECKOUT_COOKIE, getHeldStock, isOrderId } from "@/lib/orders";

// Only /bag and the bag server actions read the cookie. Reading it anywhere in the root
// layout, header or catalog pages would make every ISR page dynamic.

const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function readBag() {
  return parseBag((await cookies()).get(BAG_COOKIE)?.value);
}

/** Server actions only: RSCs can't set cookies. */
export async function writeBag(lines: BagLine[]) {
  const store = await cookies();
  if (lines.length === 0) {
    store.delete(BAG_COOKIE);
    return;
  }
  store.set(BAG_COOKIE, serializeBag(lines), {
    path: "/",
    maxAge: MAX_AGE,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    // Readable by the header's count badge. It holds no prices or secrets, and the
    // server re-validates every line against the database.
    httpOnly: false,
  });
}

/**
 * Units the visitor's own unfinished checkout reserved (e.g. they went back from Stripe).
 * They count as available to this visitor: checking out again releases them first.
 */
async function getOwnHeldStock() {
  const orderId = (await cookies()).get(CHECKOUT_COOKIE)?.value;
  if (!isOrderId(orderId)) return new Map<string, number>();
  try {
    return await getHeldStock(orderId);
  } catch (error) {
    console.error("Held stock lookup failed", error);
    return new Map<string, number>();
  }
}

/** Fresh stock per slug as this visitor can buy it, including their own held units. */
export async function getAvailableStock(slugs: string[]) {
  const [stock, held] = await Promise.all([getStockBySlugs(slugs), getOwnHeldStock()]);
  for (const [slug, quantity] of held) {
    const units = stock.get(slug);
    if (units !== undefined) stock.set(slug, units + quantity);
  }
  return stock;
}

/** The bag priced from current catalog rows, with quantities clamped to stock. */
export async function getBag() {
  const lines = await readBag();
  const [products, held] = await Promise.all([
    getProductsBySlugs(lines.map((line) => line.slug)),
    getOwnHeldStock(),
  ]);
  return reconcile(
    lines,
    new Map(
      products.map((product) => [
        product.slug,
        { ...toSummary(product), stock: product.stock + (held.get(product.slug) ?? 0) },
      ]),
    ),
  );
}

export type BagView = Awaited<ReturnType<typeof getBag>>;
