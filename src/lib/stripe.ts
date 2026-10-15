import "server-only";

import Stripe from "stripe";

// One client per server instance, created on first use so builds don't need the key. It uses
// the API version the SDK is pinned to. Use a restricted key (rk_…) with write access to
// Checkout Sessions only.
let client: Stripe | undefined;

export function getStripe() {
  if (!client) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    client = new Stripe(key, { appInfo: { name: "Atelier" } });
  }
  return client;
}

export type { Stripe };
