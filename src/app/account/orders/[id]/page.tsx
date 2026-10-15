import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatus } from "@/components/orders/order-status";
import { OrderSummary } from "@/components/orders/order-summary";
import type { OrderStatus as Status } from "@/db/schema";
import { orderNumber } from "@/lib/checkout-rules";
import { formatDate } from "@/lib/format";
import { getCustomerOrder, isOrderId } from "@/lib/orders";
import { requireFreshSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Order Details",
  robots: { index: false, follow: false },
};

// What each status means for the customer. Only completed orders reach this page.
const STATUS_NOTES: Partial<Record<Status, string>> = {
  paid: "Your payment was received.",
  processing: "Your bank is confirming the payment. Your pieces are reserved until it clears.",
  needs_review: "We received your payment and are reviewing a detail of this order. There's no need to order again.",
  failed: "Your bank didn't complete the payment, so you weren't charged.",
};

export default async function AccountOrderPage({ params }: PageProps<"/account/orders/[id]">) {
  const { id } = await params;
  // Checked against the database, not the cookie cache: this page shows an address and email.
  const { user } = await requireFreshSession(`/account/orders/${encodeURIComponent(id)}`);
  // Ownership is part of the query. Someone else's order, an unfinished checkout and an id
  // that doesn't exist all get the same 404 (not-found.tsx), so ids can't be probed.
  const order = isOrderId(id) ? await getCustomerOrder(user.id, id) : undefined;
  if (!order) notFound();

  const address = order.shippingAddress;
  const addressLines = address
    ? [
        address.name,
        address.line1,
        address.line2,
        [address.city, address.state, address.postalCode].filter(Boolean).join(", "),
        address.country,
      ].filter(Boolean)
    : [];

  return (
    <>
      <Link href="/account/orders" className="type-caption link-quiet text-fg-muted">
        ← All orders
      </Link>
      <h1 className="type-headline mt-6">Order {orderNumber(order.id)}</h1>

      <dl className="type-body mt-6 grid grid-cols-[auto_1fr] items-center gap-x-8 gap-y-3">
        <dt className="text-fg-muted">Placed</dt>
        <dd>
          <time dateTime={order.createdAt.toISOString()}>{formatDate(order.createdAt)}</time>
        </dd>
        <dt className="text-fg-muted">Payment</dt>
        <dd>
          <OrderStatus status={order.status} />
        </dd>
        {order.status === "paid" && order.paidAt && (
          <>
            <dt className="text-fg-muted">Paid</dt>
            <dd>
              <time dateTime={order.paidAt.toISOString()}>{formatDate(order.paidAt)}</time>
            </dd>
          </>
        )}
      </dl>
      {STATUS_NOTES[order.status] && (
        <p className="type-body-sm mt-4 text-fg-muted">{STATUS_NOTES[order.status]}</p>
      )}

      <div className="hairline-t mt-10 pt-8">
        <OrderSummary items={order.items} total={order.total} />
      </div>

      {(addressLines.length > 0 || order.email) && (
        <section aria-labelledby="delivery-title" className="hairline-t mt-10 pt-8">
          <h2 id="delivery-title" className="type-label">
            Delivery
          </h2>
          <dl className="type-body mt-6 grid gap-6 sm:grid-cols-2">
            {addressLines.length > 0 && (
              <div>
                <dt className="type-micro text-fg-muted">Shipping address</dt>
                <dd className="mt-2">
                  <address className="not-italic">
                    {addressLines.map((line, index) => (
                      <span key={index} className="block">
                        {line}
                      </span>
                    ))}
                  </address>
                </dd>
              </div>
            )}
            {order.email && (
              <div>
                <dt className="type-micro text-fg-muted">Contact email</dt>
                <dd className="mt-2 break-all">{order.email}</dd>
              </div>
            )}
          </dl>
        </section>
      )}
    </>
  );
}
