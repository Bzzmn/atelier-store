import type { ShippingAddress } from "@/db/schema/orders";

const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Formats a price stored in minor units (cents). */
export function formatPrice(cents: number) {
  return priceFormatter.format(cents / 100);
}

// A fixed time zone so the server and every visitor see the same day.
const dateFormatter = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "UTC" });

/** "Oct 15, 2026". */
export function formatDate(date: Date) {
  return dateFormatter.format(date);
}

/** "Ready-to-wear" → "ready-to-wear", "Gold / Green" → "gold-green". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** A shipping address as display lines, skipping empty parts. */
export function addressLines(address: ShippingAddress | null) {
  if (!address) return [];
  return [
    address.name,
    address.line1,
    address.line2,
    [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
    address.country,
  ].filter((line): line is string => Boolean(line));
}
