import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AdminTable, EmptyState, TD, TH } from "@/components/admin/admin-table";
import { StockStatus } from "@/components/product/stock-status";
import { listAdminProducts, listCategories } from "@/lib/admin/catalog";
import { parseId } from "@/lib/admin/product-input";
import { formatDate, formatPrice } from "@/lib/format";
import { requireAdmin } from "@/lib/session";

import { firstParam } from "../params";

export const metadata: Metadata = { title: "Products – Admin" };

const GENDER_LABELS = { women: "Women", men: "Men", unisex: "Unisex" } as const;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdmin("/admin/products");
  const params = await searchParams;
  const q = firstParam(params.q);
  const categoryId = parseId(firstParam(params.category));

  const [products, categories] = await Promise.all([listAdminProducts({ q, categoryId }), listCategories()]);
  const filtered = Boolean(q || categoryId);

  return (
    <>
      <div className="flex flex-wrap items-baseline justify-between gap-6">
        <h1 className="type-headline">Products</h1>
        <Link href="/admin/products/new" className="btn btn-primary btn-sm">
          New product
        </Link>
      </div>

      <form role="search" aria-label="Filter products" className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="products-q" className="type-micro text-fg-muted">
            Name or slug
          </label>
          <input id="products-q" name="q" type="search" defaultValue={q} className="field" />
        </div>
        <div className="sm:w-56">
          <label htmlFor="products-category" className="type-micro text-fg-muted">
            Category
          </label>
          <select id="products-category" name="category" defaultValue={categoryId ?? ""} className="field">
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-secondary btn-sm">
          Filter
        </button>
      </form>

      <p role="status" className="type-body-sm mt-8 text-fg-muted">
        {products.length === 1 ? "1 product" : `${products.length} products`}
        {filtered && (
          <>
            {" · "}
            <Link href="/admin/products" className="link">
              Clear filters
            </Link>
          </>
        )}
      </p>

      {products.length === 0 ? (
        <EmptyState>{filtered ? "No products match these filters." : "No products yet."}</EmptyState>
      ) : (
        <div className="mt-4">
          <AdminTable
            label="Products"
            head={
              <>
                <th className={TH}>
                  <span className="sr-only">Image</span>
                </th>
                <th className={TH}>Name</th>
                <th className={TH}>Category</th>
                <th className={TH}>Shown under</th>
                <th className={`${TH} text-right`}>Price</th>
                <th className={TH}>Stock</th>
                <th className={TH}>Updated</th>
              </>
            }
          >
            {products.map((product) => (
              <tr key={product.id}>
                <td className={`${TD} w-14`}>
                  <div className="media-frame aspect-product w-10">
                    {product.images[0] && <Image src={product.images[0].src} alt="" fill sizes="40px" />}
                  </div>
                </td>
                <td className={TD}>
                  <Link href={`/admin/products/${product.id}`} className="link-quiet font-medium">
                    {product.name}
                  </Link>
                  <span className="block text-fg-subtle">{product.slug}</span>
                </td>
                <td className={TD}>{product.category.name}</td>
                <td className={TD}>{GENDER_LABELS[product.gender]}</td>
                <td className={`${TD} text-right`}>{formatPrice(product.price)}</td>
                <td className={TD}>
                  <span className="tabular-nums">{product.stock}</span>
                  <StockStatus stock={product.stock} />
                </td>
                <td className={TD}>{formatDate(product.updatedAt)}</td>
              </tr>
            ))}
          </AdminTable>
        </div>
      )}
    </>
  );
}
