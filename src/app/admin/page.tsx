import type { Metadata } from "next";
import Link from "next/link";

import { AdminTable, EmptyState, TD, TH } from "@/components/admin/admin-table";
import { OrderStatus } from "@/components/orders/order-status";
import { getStockCounts } from "@/lib/admin/catalog";
import { orderNumber } from "@/lib/checkout-rules";
import { formatDate, formatPrice } from "@/lib/format";
import { getAdminOrders } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Admin" };

export default async function AdminPage() {
  const { user } = await requireAdmin("/admin");
  const [stock, recent] = await Promise.all([getStockCounts(), getAdminOrders({ limit: 5 })]);

  const counts = [
    { label: "Products", value: stock.total, href: "/admin/products" },
    { label: "Low stock", value: stock.low, href: "/admin/stock?filter=low" },
    { label: "Out of stock", value: stock.out, href: "/admin/stock?filter=out" },
  ];

  return (
    <>
      <h1 className="type-headline">Overview</h1>
      <p className="type-body mt-3 text-fg-muted">Signed in as {user.email}.</p>

      <ul className="mt-10 grid gap-px bg-border sm:grid-cols-3" aria-label="Catalog">
        {counts.map((count) => (
          <li key={count.label} className="bg-bg">
            <Link href={count.href} className="group block py-6 sm:px-6 sm:first:pl-0">
              <span className="type-micro block text-fg-muted">{count.label}</span>
              <span className="type-title mt-2 block tabular-nums group-hover:underline">{count.value}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section aria-labelledby="recent-orders" className="mt-14">
        <div className="flex items-baseline justify-between gap-6">
          <h2 id="recent-orders" className="type-label">
            Recent orders
          </h2>
          <Link href="/admin/orders" className="type-caption link">
            All orders
          </Link>
        </div>
        {recent.orders.length === 0 ? (
          <EmptyState>No orders yet.</EmptyState>
        ) : (
          <div className="mt-4">
            <AdminTable
              label="Recent orders"
              head={
                <>
                  <th className={TH}>Order</th>
                  <th className={TH}>Placed</th>
                  <th className={TH}>Status</th>
                  <th className={`${TH} text-right`}>Total</th>
                </>
              }
            >
              {recent.orders.map((order) => (
                <tr key={order.id}>
                  <td className={TD}>
                    <Link href={`/admin/orders/${order.id}`} className="link">
                      {orderNumber(order.id)}
                    </Link>
                  </td>
                  <td className={TD}>{formatDate(order.createdAt)}</td>
                  <td className={TD}>
                    <OrderStatus status={order.status} />
                  </td>
                  <td className={`${TD} text-right`}>{formatPrice(order.total)}</td>
                </tr>
              ))}
            </AdminTable>
          </div>
        )}
      </section>
    </>
  );
}
