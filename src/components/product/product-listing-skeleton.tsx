import { ProductGridSkeleton } from "@/components/product/product-grid";
import { Skeleton } from "@/components/skeleton";

// Loading state for ProductListing pages; keeps the same container and spacing.
export function ProductListingSkeleton() {
  return (
    <main aria-busy="true" className="flex-1 pt-header pb-section">
      <p role="status" className="sr-only">
        Loading products…
      </p>

      <div className="page-container pt-10 pb-8 md:pt-14 md:pb-10">
        <Skeleton className="h-3 w-32" />
        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <Skeleton className="h-4 w-16" />
            <Skeleton className="mt-3 h-8 w-48 lg:h-12 lg:w-64" />
            <Skeleton className="mt-4 h-6 w-72 max-w-full" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      </div>

      <ProductGridSkeleton />
    </main>
  );
}
