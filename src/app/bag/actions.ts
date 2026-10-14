"use server";

import { isSlug, MAX_BAG_LINES } from "@/lib/bag-cookie";
import { applyAdd, applyUpdate, type BagChange, normalizeBag } from "@/lib/bag-reconcile";
import { readBag, writeBag } from "@/lib/bag";
import { getStockBySlugs } from "@/lib/catalog";

import type { BagActionState } from "./state";

// The bag is a guest feature, so these don't require a session. Stock is read fresh from
// the database on every call: product pages are ISR and may show stock up to a minute old.

const INVALID = "Something went wrong. Please try again.";

function parseQuantity(value: FormDataEntryValue | null, fallback?: number) {
  if (value === null && fallback !== undefined) return fallback;
  // Number("") is 0, which would remove the line.
  if (typeof value !== "string" || !/^-?\d+$/.test(value)) return undefined;
  const quantity = Number(value);
  return Number.isInteger(quantity) && Math.abs(quantity) <= 1000 ? quantity : undefined;
}

async function mutateBag(
  slug: string,
  apply: typeof applyAdd,
  quantity: number,
): Promise<BagChange> {
  const lines = await readBag();
  const stock = await getStockBySlugs([...new Set([...lines.map((line) => line.slug), slug])]);
  const result = apply(lines, slug, quantity, stock);
  // Write back the whole bag normalized, which also fixes lines the page showed as adjusted.
  await writeBag(normalizeBag(result.lines, stock));
  return result.change;
}

function respond(prev: BagActionState, status: BagActionState["status"], message: string) {
  return { status, message, id: prev.id + 1 };
}

export async function addToBag(prev: BagActionState, formData: FormData): Promise<BagActionState> {
  const slug = formData.get("slug");
  const quantity = parseQuantity(formData.get("quantity"), 1);
  if (!isSlug(slug) || quantity === undefined || quantity < 1) return respond(prev, "error", INVALID);

  const change = await mutateBag(slug, applyAdd, quantity);
  switch (change.status) {
    case "added":
      return respond(prev, "success", "Added to your bag.");
    case "limited":
      return respond(prev, "notice", `Only ${change.quantity} available. Your bag now has ${change.quantity}.`);
    case "at_limit":
      return respond(
        prev,
        "notice",
        change.quantity === 1
          ? "The last piece available is already in your bag."
          : `All ${change.quantity} available are already in your bag.`,
      );
    case "sold_out":
      return respond(prev, "error", "This piece is sold out.");
    case "bag_full":
      return respond(prev, "error", `Your bag holds up to ${MAX_BAG_LINES} pieces. Remove one to add this.`);
    default:
      return respond(prev, "error", "This piece is no longer available.");
  }
}

/** Sets a line's quantity; 0 removes it. */
export async function updateBagQuantity(
  prev: BagActionState,
  formData: FormData,
): Promise<BagActionState> {
  const slug = formData.get("slug");
  const quantity = parseQuantity(formData.get("quantity"));
  if (!isSlug(slug) || quantity === undefined) return respond(prev, "error", INVALID);

  const change = await mutateBag(slug, applyUpdate, quantity);
  switch (change.status) {
    case "updated":
      return respond(prev, "success", `Quantity updated to ${change.quantity}.`);
    case "removed":
      return respond(prev, "success", "Removed from your bag.");
    case "limited":
      return respond(prev, "notice", `Only ${change.quantity} available.`);
    case "sold_out":
      return respond(prev, "error", "This piece sold out and was removed from your bag.");
    case "unavailable":
      return respond(prev, "error", "This piece is no longer available and was removed from your bag.");
    default:
      return respond(prev, "error", "This piece is no longer in your bag.");
  }
}
