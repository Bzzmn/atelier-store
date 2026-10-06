const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Formats a price stored in minor units (cents). */
export function formatPrice(cents: number) {
  return priceFormatter.format(cents / 100);
}

/** "Ready-to-wear" → "ready-to-wear", "Gold / Green" → "gold-green". */
export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
