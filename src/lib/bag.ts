import "server-only";

import { cookies } from "next/headers";

import { BAG_COOKIE, type BagLine, parseBag, serializeBag } from "@/lib/bag-cookie";
import { reconcile } from "@/lib/bag-reconcile";
import { getProductsBySlugs, toSummary } from "@/lib/catalog";

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

/** The bag priced from current catalog rows, with quantities clamped to stock. */
export async function getBag() {
  const lines = await readBag();
  const products = await getProductsBySlugs(lines.map((line) => line.slug));
  return reconcile(lines, new Map(products.map((product) => [product.slug, toSummary(product)])));
}

export type BagView = Awaited<ReturnType<typeof getBag>>;
