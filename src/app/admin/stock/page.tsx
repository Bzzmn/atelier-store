import type { Metadata } from "next";
import Link from "next/link";

import { AdminTable, EmptyState, TD, TH } from "@/components/admin/admin-table";
import { StockForm } from "@/components/admin/stock-form";
import { StockStatus } from "@/components/product/stock-status";
import { getStockOverview, type StockFilter } from "@/lib/admin/catalog";
import { requireAdmin } from "@/lib/session";

import { firstParam } from "../params";

export const metadata: Metadata = { title: "Stock – Admin" };

const FILTERS: { value: StockFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "low", label: "Low stock" },
  { value: "out", label: "Out of stock" },
];

export default async function AdminStockPage({ searchParams }: PageProps<"/admin/stock">) {
  await requireAdmin("/admin/stock");
  const requested = firstParam((await searchParams).filter);
  const filter = FILTERS.find((option) => option.value === requested)?.value ?? "all";
  const rows = await getStockOverview(filter);

  return (
    <>
      <h1 className="type-headline">Stock</h1>
      <p className="type-body mt-3 max-w-2xl text-fg-muted">
        Available units are what customers can buy now. Units in open checkouts are already taken off and come back if
        the checkout isn&apos;t paid.
      </p>

      <nav aria-label="Stock filter" className="mt-8">
        <ul className="flex gap-6">
          {FILTERS.map((option) => (
            <li key={option.value}>
              <Link
                href={option.value === "all" ? "/admin/stock" : `/admin/stock?filter=${option.value}`}
                aria-current={option.value === filter ? "page" : undefined}
                className="type-label link-quiet text-fg-muted aria-[current=page]:text-fg aria-[current=page]:underline"
              >
                {option.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {rows.length === 0 ? (
        <EmptyState>{filter === "all" ? "No products yet." : "No products in this state."}</EmptyState>
      ) : (
        <div className="mt-6">
          <AdminTable
            label="Stock"
            head={
              <>
                <th className={TH}>Product</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Available</th>
                <th className={`${TH} text-right`}>In checkouts</th>
                <th className={TH}>Set available</th>
              </>
            }
          >
            {rows.map((row) => (
              <tr key={row.id}>
                <td className={TD}>
                  <Link href={`/admin/products/${row.id}`} className="link-quiet font-medium">
                    {row.name}
                  </Link>
                </td>
                <td className={TD}>
                  <StockStatus stock={row.stock} />
                </td>
                <td className={`${TD} text-right`}>{row.stock}</td>
                <td className={`${TD} text-right text-fg-muted`}>{row.held}</td>
                <td className={TD}>
                  <StockForm productId={row.id} name={row.name} stock={row.stock} />
                </td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}
    </>
  );
}
