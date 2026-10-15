import type { Metadata } from "next";
import Link from "next/link";

import { OrderStatus } from "@/components/orders/order-status";
import { orderNumber } from "@/lib/checkout-rules";
import { formatDate, formatPrice } from "@/lib/format";
import { getCustomerOrders } from "@/lib/orders";
import { requireFreshSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Orders",
  robots: { index: false, follow: false },
};

/** "Belted wool wrap coat" or "Belted wool wrap coat and 2 more". */
function describeItems(items: { name: string; quantity: number }[]) {
  const [first, ...rest] = items;
  if (!first) return "";
  return rest.length === 0 ? first.name : `${first.name} and ${rest.length} more`;
}

export default async function AccountOrdersPage() {
  const { user } = await requireFreshSession("/account/orders");
  // Scoped to this account's id; never by email.
  const orders = await getCustomerOrders(user.id);

  return (
    <>
      <h1 className="type-headline">Orders</h1>
      <p className="type-body mt-3 text-fg-muted">
        Orders placed while signed in to this account.
      </p>

      {orders.length === 0 ? (
        <div className="hairline-t mt-10 flex flex-col items-start gap-6 pt-8">
          <p className="type-body text-fg-muted">You haven&apos;t placed any orders yet.</p>
          <Link href="/shop/new" className="btn btn-secondary">
            Shop new arrivals
          </Link>
        </div>
      ) : (
        <ul aria-label="Your orders" className="hairline-t mt-10">
          {orders.map((order) => {
            const pieces = order.items.reduce((total, item) => total + item.quantity, 0);
            return (
              <li key={order.id} className="hairline-b py-6">
                <div className="flex items-baseline justify-between gap-6">
                  <h2 className="type-caption">
                    <Link href={`/account/orders/${order.id}`} className="link">
                      Order {orderNumber(order.id)}
                    </Link>
                  </h2>
                  <p className="type-body font-medium tabular-nums">
                    <span className="sr-only">Total </span>
                    {formatPrice(order.total)}
                  </p>
                </div>
                <p className="type-body-sm mt-2 text-fg-muted">
                  {describeItems(order.items)} · {pieces} {pieces === 1 ? "piece" : "pieces"}
                </p>
                <dl className="type-body-sm mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                  <div className="flex gap-2">
                    <dt className="text-fg-muted">Placed</dt>
                    <dd>
                      <time dateTime={order.createdAt.toISOString()}>{formatDate(order.createdAt)}</time>
                    </dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="sr-only">Payment status</dt>
                    <dd>
                      <OrderStatus status={order.status} />
                    </dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
