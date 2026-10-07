import Link from "next/link";

import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { ProductGrid } from "@/components/product/product-grid";
import type { Product } from "@/lib/catalog";

type ProductListingProps = {
  /** Breadcrumb trail after "Home"; the last entry is the current page. */
  breadcrumbs: Crumb[];
  eyebrow: string;
  title: string;
  description?: string;
  products: Product[];
};

// Full-page product listing: breadcrumb + heading block over a full-bleed product grid.
export function ProductListing({
  breadcrumbs,
  eyebrow,
  title,
  description,
  products,
}: ProductListingProps) {
  return (
    <main className="flex-1 pt-header pb-section">
      <div className="page-container pt-10 pb-8 md:pt-14 md:pb-10">
        <Breadcrumbs items={breadcrumbs} />

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="type-label text-fg-muted">{eyebrow}</p>
            <h1 className="type-headline mt-3">{title}</h1>
            {description && (
              <p className="type-body mt-4 max-w-md text-fg-muted">{description}</p>
            )}
          </div>
          {products.length > 0 && (
            <p className="type-caption shrink-0 text-fg-muted">
              {products.length} {products.length === 1 ? "piece" : "pieces"}
            </p>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <section aria-labelledby="listing-products-title">
          <h2 id="listing-products-title" className="sr-only">
            Products
          </h2>
          <ProductGrid products={products} />
        </section>
      ) : (
        <div className="prose-container section-y hairline-t flex flex-col items-center text-center">
          <p className="type-body text-fg-muted">New pieces are on their way. Check back soon.</p>
          <Link href="/" className="btn btn-secondary mt-8">
            Return Home
          </Link>
        </div>
      )}
    </main>
  );
}
