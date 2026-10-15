import type { Metadata } from "next";

import { CategoryRow, NewCategoryForm } from "@/components/admin/category-forms";
import { EmptyState } from "@/components/admin/admin-table";
import { listCategoriesWithCounts } from "@/lib/admin/catalog";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = { title: "Categories – Admin" };

export default async function AdminCategoriesPage() {
  await requireAdmin("/admin/categories");
  const categories = await listCategoriesWithCounts();

  return (
    <div className="max-w-2xl">
      <h1 className="type-headline">Categories</h1>
      <p className="type-body mt-3 text-fg-muted">
        Each category has a shop page at /shop/&lt;slug&gt;. The slug comes from the name when the category is created
        and doesn&apos;t change on rename, so links keep working.
      </p>

      <div className="mt-10">
        <NewCategoryForm />
      </div>

      {categories.length === 0 ? (
        <EmptyState>No categories yet.</EmptyState>
      ) : (
        <ul aria-label="Categories" className="hairline-t mt-10">
          {categories.map((category) => (
            <CategoryRow key={category.id} category={category} />
          ))}
        </ul>
      )}
    </div>
  );
}
