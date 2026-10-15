import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CreatedNotice } from "@/components/admin/created-notice";
import { ProductForm } from "@/components/admin/product-form";
import { StockForm } from "@/components/admin/stock-form";
import { StockStatus } from "@/components/product/stock-status";
import { getAdminProduct, getHeldUnits, listCategories } from "@/lib/admin/catalog";
import { parseId } from "@/lib/admin/product-input";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Edit product – Admin" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdmin("/admin/products");
  const [{ id }, { created }] = await Promise.all([params, searchParams]);
  const productId = parseId(id);
  const [product, categories, held] = await Promise.all([
    productId ? getAdminProduct(productId) : undefined,
    listCategories(),
    productId ? getHeldUnits(productId) : 0,
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="type-headline">{product.name}</h1>
      <p className="type-body mt-3 text-fg-muted">
        {product.category.name} · Changes go live in the store when you save.
      </p>
      {created === "1" && <CreatedNotice />}

      {/* Its own form: stock saves on its own, guarded against concurrent checkouts. */}
      <section aria-labelledby="availability-title" className="hairline-t mt-10 flex flex-col gap-4 pt-8">
        <h2 id="availability-title" className="type-label">
          Availability
        </h2>
        <StockStatus stock={product.stock} />
        <p className="type-body-sm text-fg-muted">
          Units customers can buy now. Set 0 to mark it out of stock; the product page then shows it as sold out.
          {held > 0 && ` ${held} more ${held === 1 ? "is" : "are"} held by open checkouts and return if they aren't paid.`}
        </p>
        <StockForm productId={product.id} name={product.name} stock={product.stock} label="Available units" />
      </section>

      <div className="mt-10">
        <ProductForm
          key={product.id}
          categories={categories}
          product={{
            id: product.id,
            slug: product.slug,
            name: product.name,
            description: product.description,
            details: product.details,
            price: product.price,
            color: product.color,
            badge: product.badge,
            gender: product.gender,
            categoryId: product.categoryId,
            images: product.images,
          }}
        />
      </div>
    </div>
  );
}
