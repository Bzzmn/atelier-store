import type { Metadata } from "next";
import Link from "next/link";

import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/admin/catalog";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "New product – Admin" };

export default async function NewProductPage() {
  await requireAdmin("/admin/products/new");
  const categories = await listCategories();

  return (
    <div className="max-w-2xl">
      <h1 className="type-headline">New product</h1>
      <p className="type-body mt-3 text-fg-muted">The product goes live in the store as soon as it&apos;s created.</p>
      {categories.length === 0 ? (
        <p className="type-body mt-10">
          Products need a category.{" "}
          <Link href="/admin/categories" className="link">
            Add a category
          </Link>{" "}
          first.
        </p>
      ) : (
        <div className="mt-10">
          <ProductForm categories={categories} />
        </div>
      )}
    </div>
  );
}
