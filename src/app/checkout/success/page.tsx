import type { Metadata } from "next";
import Link from "next/link";

import { BagClear } from "@/components/bag/bag-clear";
import { OrderStatusPoller } from "@/components/checkout/order-status-poller";
import { OrderSummary } from "@/components/orders/order-summary";
import type { OrderStatus } from "@/db/schema";
import { isCheckoutSessionId, orderNumber } from "@/lib/checkout-rules";
import { formatPrice } from "@/lib/format";
import { getOrderBySessionId, getOrderItems } from "@/lib/orders";

// Dynamic. Stripe redirects here with the session id after checkout. The page only reads the
// order as the Stripe webhook last confirmed it; it never confirms a payment itself, and the
// URL is only a lookup key. Until the webhook arrives the order is pending, and the page
// polls until it moves on. It shows no email or address: anyone holding the URL can load it.
export const metadata: Metadata = {
  title: "Order Confirmation",
  robots: { index: false, follow: false },
};

type View = {
  title: string;
  body: (total: string) => string;
  /** The customer paid (or their bank is confirming): empty the bag. */
  placed: boolean;
  /** List the order's pieces and total. */
  summary: boolean;
};

const NOT_FOUND: View = {
  title: "We couldn't find this order",
  body: () => "This confirmation link isn't valid. You haven't been charged through it, and your bag is unchanged.",
  placed: false,
  summary: false,
};

const VIEWS: Record<OrderStatus, View> = {
  // Checkout finished on Stripe's side, but the webhook hasn't confirmed the payment yet.
  pending: {
    title: "Confirming your payment",
    body: (total) =>
      `We're confirming your payment of ${total} with our payment provider. This usually takes a few seconds, and this page will update on its own.`,
    placed: false,
    summary: true,
  },
  paid: {
    title: "Thank you for your order",
    body: (total) => `We've received your payment of ${total}.`,
    placed: true,
    summary: true,
  },
  processing: {
    title: "Your payment is processing",
    body: (total) =>
      `Your bank is confirming your payment of ${total}. Your pieces are reserved until it clears.`,
    placed: true,
    summary: true,
  },
  needs_review: {
    title: "We're confirming your order",
    body: () =>
      "We received your payment and are reviewing a detail of your order. There's no need to order again.",
    placed: true,
    summary: true,
  },
  failed: {
    title: "Your payment didn't go through",
    body: () => "Your bank didn't complete the payment, so you haven't been charged. Your pieces are still in your bag.",
    placed: false,
    summary: false,
  },
  expired: {
    title: "This checkout has ended",
    body: () => "It closed before payment was completed, so you haven't been charged. Your pieces are still in your bag.",
    placed: false,
    summary: false,
  },
  canceled: {
    title: "This checkout has ended",
    body: () => "Payment wasn't completed, so you haven't been charged. Your pieces are still in your bag.",
    placed: false,
    summary: false,
  },
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps<"/checkout/success">) {
  const sessionId = (await searchParams).session_id;
  const order = isCheckoutSessionId(sessionId) ? await getOrderBySessionId(sessionId) : undefined;
  const view = order ? VIEWS[order.status] : NOT_FOUND;
  const items = order && view.summary ? await getOrderItems(order.id) : [];
  const pending = order?.status === "pending";

  return (
    <main className="flex-1 pt-header pb-section">
      {view.placed && <BagClear />}
      <div className="prose-container pt-10 md:pt-14">
        {order && view.summary && (
          <p className="type-label text-fg-muted">Order {orderNumber(order.id)}</p>
        )}
        {/* A live region that stays mounted, so the change from pending to confirmed is announced. */}
        <div role="status" className={order && view.summary ? "mt-4" : undefined}>
          <h1 className="type-headline">{view.title}</h1>
          <p className="type-body mt-6 text-fg-muted">{view.body(order ? formatPrice(order.total) : "")}</p>
        </div>

        {pending && isCheckoutSessionId(sessionId) && (
          <>
            <OrderStatusPoller sessionId={sessionId} />
            <noscript>
              <a href={`/checkout/success?session_id=${sessionId}`} className="btn btn-secondary mt-6">
                Check again
              </a>
            </noscript>
          </>
        )}

        {order && items.length > 0 && (
          <div className="mt-10">
            <OrderSummary items={items} total={order.total} />
          </div>
        )}

        {/* While pending the outcome isn't known yet, so there's nowhere obvious to send them. */}
        {!pending && (
          <div className="hairline-t mt-10 flex flex-wrap gap-4 pt-8">
            <Link href={view.placed ? "/shop/new" : "/bag"} className="btn btn-secondary">
              {view.placed ? "Continue shopping" : "Return to your bag"}
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
