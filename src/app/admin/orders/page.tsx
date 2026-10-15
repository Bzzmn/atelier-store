import type { Metadata } from "next";
import Link from "next/link";

import { AdminTable, EmptyState, TD, TH } from "@/components/admin/admin-table";
import { OrderStatus } from "@/components/orders/order-status";
import { type OrderStatus as Status, orderStatusEnum } from "@/db/schema";
import { orderNumber } from "@/lib/checkout-rules";
import { formatDate, formatPrice } from "@/lib/format";
import { ADMIN_ORDERS_PAGE_SIZE, getAdminOrders, MAX_ADMIN_ORDERS_PAGE } from "@/lib/orders";
import { requireAdmin } from "@/lib/session";

import { firstParam } from "../params";

export const metadata: Metadata = { title: "Orders – Admin" };

const STATUS_LABELS: Record<Status, string> = {
  pending: "Awaiting payment",
  processing: "Processing",
  paid: "Paid",
  needs_review: "Under review",
  failed: "Failed",
  expired: "Expired",
  canceled: "Canceled",
};

function ordersHref(status: Status | undefined, page = 1) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/orders?${query}` : "/admin/orders";
}

export default async function AdminOrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  await requireAdmin("/admin/orders");
  const params = await searchParams;
  const requested = firstParam(params.status);
  const status = orderStatusEnum.enumValues.find((value) => value === requested);
  const pageParam = Number(firstParam(params.page));
  const page = Number.isInteger(pageParam) && pageParam >= 1 ? Math.min(pageParam, MAX_ADMIN_ORDERS_PAGE) : 1;

  const { orders, total } = await getAdminOrders({ status, page });
  const pages = Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE));

  return (
    <>
      <h1 className="type-headline">Orders</h1>
      <p className="type-body mt-3 max-w-2xl text-fg-muted">
        Every checkout, newest first. Statuses come from Stripe and can&apos;t be edited here.
      </p>

      <form aria-label="Filter orders" className="mt-8 flex items-end gap-4">
        <div className="w-56">
          <label htmlFor="orders-status" className="type-micro text-fg-muted">
            Status
          </label>
          <select id="orders-status" name="status" defaultValue={status ?? ""} className="field">
            <option value="">All statuses</option>
            {orderStatusEnum.enumValues.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary btn-sm">
          Filter
        </button>
      </form>

      <p role="status" className="type-body-sm mt-8 text-fg-muted">
        {total === 1 ? "1 order" : `${total} orders`}
        {pages > 1 && ` · Page ${page} of ${pages}`}
      </p>

      {orders.length === 0 ? (
        <EmptyState>{status ? "No orders with this status." : "No orders yet."}</EmptyState>
      ) : (
        <div className="mt-4">
          <AdminTable
            label="Orders"
            head={
              <>
                <th className={TH}>Order</th>
                <th className={TH}>Placed</th>
                <th className={TH}>Customer</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Pieces</th>
                <th className={`${TH} text-right`}>Total</th>
              </>
            }
          >
            {orders.map((order) => (
              <tr key={order.id}>
                <td className={TD}>
                  <Link href={`/admin/orders/${order.id}`} className="link">
                    {orderNumber(order.id)}
                  </Link>
                </td>
                <td className={TD}>
                  <time dateTime={order.createdAt.toISOString()}>{formatDate(order.createdAt)}</time>
                </td>
                <td className={`${TD} break-all`}>{order.email ?? <span className="text-fg-subtle">—</span>}</td>
                <td className={TD}>
                  <OrderStatus status={order.status} />
                </td>
                <td className={`${TD} text-right`}>{order.pieces}</td>
                <td className={`${TD} text-right`}>{formatPrice(order.total)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}

      {pages > 1 && (
        <nav aria-label="Pages" className="type-caption mt-8 flex justify-between">
          {page > 1 ? (
            <Link href={ordersHref(status, page - 1)} className="link">
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          {page < pages && (
            <Link href={ordersHref(status, page + 1)} className="link">
              Older →
            </Link>
          )}
        </nav>
      )}
    </>
  );
}
