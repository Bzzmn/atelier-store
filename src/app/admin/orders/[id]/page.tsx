import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OrderStatus } from "@/components/orders/order-status";
import { OrderSummary } from "@/components/orders/order-summary";
import { orderNumber } from "@/lib/checkout-rules";
import { addressLines } from "@/lib/format";
import { getAdminOrder } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Order – Admin" };

// "Oct 15, 2026, 14:05 UTC": admins need the time too, in one zone for everyone.
const dateTime = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  hourCycle: "h23",
  timeZone: "UTC",
});

function When({ date }: { date: Date }) {
  return <time dateTime={date.toISOString()}>{dateTime.format(date)} UTC</time>;
}

export default async function AdminOrderPage({ params }: PageProps<"/admin/orders/[id]">) {
  await requireAdmin("/admin/orders");
  const { id } = await params;
  // Malformed and unknown ids both 404.
  const order = await getAdminOrder(id);
  if (!order) notFound();

  const address = addressLines(order.shippingAddress);
  const facts: { label: string; value: React.ReactNode }[] = [
    { label: "Status", value: <OrderStatus status={order.status} /> },
    { label: "Created", value: <When date={order.createdAt} /> },
    ...(order.paidAt ? [{ label: "Paid", value: <When date={order.paidAt} /> }] : []),
    ...(order.status === "pending" ? [{ label: "Checkout expires", value: <When date={order.expiresAt} /> }] : []),
    { label: "Updated", value: <When date={order.updatedAt} /> },
    { label: "Stock returned", value: order.stockReleased ? "Yes" : "No" },
    { label: "Account", value: order.userId ? "Signed-in customer" : "Guest checkout" },
  ];

  return (
    <div className="max-w-3xl">
      <Link href="/admin/orders" className="type-caption link-quiet text-fg-muted">
        ← All orders
      </Link>
      <h1 className="type-headline mt-6">Order {orderNumber(order.id)}</h1>
      <p className="type-body-sm mt-2 break-all text-fg-subtle">{order.id}</p>

      <dl className="type-body mt-8 grid grid-cols-[auto_1fr] items-center gap-x-8 gap-y-3">
        {facts.map((fact) => (
          <div key={fact.label} className="contents">
            <dt className="text-fg-muted">{fact.label}</dt>
            <dd>{fact.value}</dd>
          </div>
        ))}
      </dl>

      <div className="hairline-t mt-10 pt-8">
        <OrderSummary items={order.items} total={order.total} />
      </div>

      <section aria-labelledby="customer-title" className="hairline-t mt-10 pt-8">
        <h2 id="customer-title" className="type-label">
          Customer
        </h2>
        <dl className="type-body mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="type-micro text-fg-muted">Email</dt>
            <dd className="mt-2 break-all">{order.email ?? <span className="text-fg-subtle">Not collected</span>}</dd>
          </div>
          <div>
            <dt className="type-micro text-fg-muted">Shipping address</dt>
            <dd className="mt-2">
              {address.length > 0 ? (
                <address className="not-italic">
                  {address.map((line, index) => (
                    <span key={index} className="block">
                      {line}
                    </span>
                  ))}
                </address>
              ) : (
                <span className="text-fg-subtle">Not collected</span>
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="payment-title" className="hairline-t mt-10 pt-8">
        <h2 id="payment-title" className="type-label">
          Stripe
        </h2>
        <dl className="type-body-sm mt-6 grid gap-6 sm:grid-cols-2">
          <div>
            <dt className="type-micro text-fg-muted">Checkout Session</dt>
            <dd className="mt-2 break-all font-mono">{order.stripeCheckoutSessionId ?? "—"}</dd>
          </div>
          <div>
            <dt className="type-micro text-fg-muted">Payment Intent</dt>
            <dd className="mt-2 break-all font-mono">{order.stripePaymentIntentId ?? "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
