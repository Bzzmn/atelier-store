"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getAvailableStock, readBag, writeBag } from "@/lib/bag";
import { normalizeBag, reconcile } from "@/lib/bag-reconcile";
import { getCheckoutProducts } from "@/lib/catalog";
import { SHIPPING_COUNTRIES, toOrderLines } from "@/lib/checkout-rules";
import {
  abandonCheckout,
  attachCheckoutSession,
  CHECKOUT_COOKIE,
  createPendingOrder,
  isOrderId,
  OutOfStockError,
  transition,
} from "@/lib/orders";
import { getSession } from "@/lib/session";
import { getStripe } from "@/lib/stripe";

import type { CheckoutState } from "./state";

// Guest checkout: the bag is a guest feature too, so no session is required. A signed-in
// customer's order is linked to their account. Prices, quantities and the total all come
// from the database here; the form only says what the page showed, to detect changes.

const FAILED = "We couldn't start checkout. Please try again.";

function siteUrl() {
  const url = process.env.BETTER_AUTH_URL;
  if (!url) throw new Error("BETTER_AUTH_URL is not set");
  return url.replace(/\/$/, "");
}

function randomLetters(length: number) {
  return Array.from(crypto.getRandomValues(new Uint8Array(length)), (byte) =>
    String.fromCharCode(97 + (byte % 26)),
  ).join("");
}

/** Writes the bag back against fresh stock, then shows it with `notice`. */
async function backToBag(slugs: string[], notice: "changed" | "stock"): Promise<never> {
  const lines = await readBag();
  try {
    await writeBag(normalizeBag(lines, await getAvailableStock(slugs)));
  } catch (error) {
    console.error("Bag refresh failed", error);
  }
  redirect(`/bag?notice=${notice}`);
}

export async function startCheckout(prev: CheckoutState, formData: FormData): Promise<CheckoutState> {
  const fail = (error = FAILED) => ({ error, id: prev.id + 1 });

  const lines = await readBag();
  if (lines.length === 0) redirect("/bag");
  const slugs = lines.map((line) => line.slug);

  const store = await cookies();
  const previousOrder = store.get(CHECKOUT_COOKIE)?.value;
  // The visitor's previous checkout, so a second one releases the first one's stock.
  if (isOrderId(previousOrder)) {
    try {
      await abandonCheckout(previousOrder);
    } catch (error) {
      // Its session still expires on its own; the sweeper returns the stock.
      console.error("Couldn't release the previous checkout", error);
    }
  }

  let products;
  try {
    products = await getCheckoutProducts(slugs);
  } catch (error) {
    console.error("Checkout product lookup failed", error);
    return fail();
  }
  const bag = reconcile(lines, new Map(products.map((product) => [product.slug, product])));
  const orderLines = toOrderLines(bag.lines);

  // Anything other than what the customer just saw (a price, stock or removal changed since
  // the page rendered) goes back to the bag first, so they never pay an amount they didn't see.
  const shown = { subtotal: Number(formData.get("subtotal")), count: Number(formData.get("count")) };
  if (bag.subtotal !== shown.subtotal || bag.count !== shown.count || bag.removedCount > 0) {
    await backToBag(slugs, "changed");
  }
  if (orderLines.length === 0) return fail("Nothing in your bag is available right now.");

  const user = (await getSession().catch(() => null))?.user;

  let order;
  try {
    order = await createPendingOrder(orderLines, user?.id ?? null);
  } catch (error) {
    if (error instanceof OutOfStockError) await backToBag(slugs, "stock");
    console.error("Order creation failed", error);
    return fail();
  }

  let url;
  try {
    const session = await getStripe().checkout.sessions.create(
      {
        mode: "payment",
        line_items: orderLines.map((line) => ({
          quantity: line.quantity,
          price_data: {
            currency: order.currency,
            unit_amount: line.unitPrice,
            product_data: { name: line.name, ...(line.image && { images: [line.image] }) },
          },
        })),
        client_reference_id: order.id,
        metadata: { order_id: order.id },
        payment_intent_data: { metadata: { order_id: order.id } },
        expires_at: Math.floor(order.expiresAt.getTime() / 1000),
        shipping_address_collection: { allowed_countries: [...SHIPPING_COUNTRIES] },
        ...(user?.email && { customer_email: user.email }),
        success_url: `${siteUrl()}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/checkout/cancel`,
        integration_identifier: `atelier-bag-${randomLetters(8)}`,
      },
      { idempotencyKey: `checkout:${order.id}` },
    );
    if (!session.url) throw new Error("Checkout Session has no URL");
    await attachCheckoutSession(order.id, session.id);
    url = session.url;
  } catch (error) {
    console.error("Checkout Session creation failed", { orderId: order.id, error });
    // Releases the reserved stock. If the session was created but not attached, it can't be
    // completed for this order: the webhook ignores sessions that don't match.
    await transition(order.id, "cancel").catch((cancelError) =>
      console.error("Couldn't cancel the order", { orderId: order.id, cancelError }),
    );
    return fail();
  }

  store.set(CHECKOUT_COOKIE, order.id, {
    path: "/",
    maxAge: 60 * 60 * 24,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  });
  redirect(url);
}
