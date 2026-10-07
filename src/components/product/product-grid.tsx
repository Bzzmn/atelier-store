import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import type { ProductSummary } from "@/lib/catalog";

// Full-bleed hairline grid of product cards (2 → 3 → 4 columns).
export function ProductGrid({ products }: { products: ProductSummary[] }) {
  return (
    <ul className="product-grid hairline-t">
      {products.map((product, index) => (
        <li key={product.slug}>
          {/* The first row (four cards on desktop) sits above the fold. */}
          <ProductCard product={product} preload={index < 4} />
        </li>
      ))}
    </ul>
  );
}

// Decorative stand-in for ProductGrid; pair it with a role="status" loading message.
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ul aria-hidden="true" className="product-grid hairline-t">
      {Array.from({ length: count }, (_, index) => (
        <li key={index}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  );
}
