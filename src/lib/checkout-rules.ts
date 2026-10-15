import type { OrderStatus } from "@/db/schema/orders";
import type { ReconciledLine } from "@/lib/bag-reconcile";

// Pure checkout rules shared by the checkout action, the Stripe webhook and the sweeper.
// Nothing here trusts the client: lines come from reconcile() over fresh database rows,
// and payment outcomes come from Stripe objects fetched or signed by Stripe.

export const ORDER_CURRENCY = "usd";

/** How long stock stays reserved for an unpaid checkout. Stripe's minimum session lifetime
 * is 30 minutes from creation; the extra minute covers the time before the session exists. */
export const CHECKOUT_TTL_MS = 31 * 60 * 1000;

/** Countries Stripe Checkout collects shipping addresses for. */
export const SHIPPING_COUNTRIES = ["US", "CA"] as const;

export type OrderLine = {
  productId: number;
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: string;
};

type LineProduct = { id: number; slug: string; name: string; price: number; image?: string };

/** The lines an order charges for: buyable quantities at current prices. Sold-out lines
 * (quantity 0) stay in the bag but aren't ordered. */
export function toOrderLines(lines: ReconciledLine<LineProduct>[]): OrderLine[] {
  return lines
    .filter((line) => line.quantity > 0)
    .map(({ product, quantity }) => ({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity,
      image: product.image,
    }));
}

export function orderTotal(lines: Pick<OrderLine, "unitPrice" | "quantity">[]) {
  return lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
}

export type OrderAction = "pay" | "process" | "fail" | "expire" | "cancel" | "review";

/** Every allowed status change. A transition only applies from its `from` statuses, so
 * replayed or out-of-order events are no-ops. `restock` returns the reserved units. */
export const ORDER_TRANSITIONS: Record<
  OrderAction,
  { from: readonly OrderStatus[]; to: OrderStatus; restock: boolean }
> = {
  pay: { from: ["pending", "processing"], to: "paid", restock: false },
  process: { from: ["pending"], to: "processing", restock: false },
  // From pending too: async_payment_failed can arrive before checkout.session.completed.
  fail: { from: ["pending", "processing"], to: "failed", restock: true },
  expire: { from: ["pending"], to: "expired", restock: true },
  cancel: { from: ["pending"], to: "canceled", restock: true },
  review: { from: ["pending", "processing"], to: "needs_review", restock: false },
};

/** The status after `action`, or undefined when the action doesn't apply. */
export function nextStatus(status: OrderStatus, action: OrderAction): OrderStatus | undefined {
  const transition = ORDER_TRANSITIONS[action];
  return transition.from.includes(status) ? transition.to : undefined;
}

/** The fields of a Checkout Session that decide an order's outcome. */
export type SessionFacts = {
  id: string;
  // Stripe's enums are open: "open" | "complete" | "expired" today.
  status: string | null;
  payment_status: string; // "paid" | "unpaid" | "no_payment_required"
  amount_total: number | null;
  currency: string | null;
};

/**
 * What a completed Checkout Session means for its order. Undefined while the session is
 * still open. A total or currency that differs from the order is never treated as paid.
 */
export function completedSessionAction(
  session: SessionFacts,
  order: { stripeCheckoutSessionId: string | null; total: number; currency: string },
): OrderAction | undefined {
  if (session.status !== "complete") return undefined;
  if (session.id !== order.stripeCheckoutSessionId) return undefined;
  if (session.amount_total !== order.total || session.currency !== order.currency) return "review";
  if (session.payment_status === "unpaid") return "process";
  // Anything not known to be settled waits rather than counting as paid.
  return session.payment_status === "paid" || session.payment_status === "no_payment_required"
    ? "pay"
    : undefined;
}

/** A Checkout Session id as Stripe formats them; anything else is never looked up. */
export function isCheckoutSessionId(value: unknown): value is string {
  return typeof value === "string" && /^cs_(test|live)_[A-Za-z0-9]{1,200}$/.test(value);
}

/**
 * Statuses a customer's order history lists: checkouts they completed. Pending, expired and
 * canceled orders are checkouts that never finished, so they aren't orders to the customer.
 */
export const CUSTOMER_ORDER_STATUSES = ["paid", "processing", "needs_review", "failed"] as const satisfies readonly OrderStatus[];

/** The short reference customers see: the first 8 characters of the order id. */
export function orderNumber(orderId: string) {
  return orderId.slice(0, 8).toUpperCase();
}
