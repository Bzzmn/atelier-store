import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

// Shown while any /shop listing (new, women, men, categories) loads its products.
export default function Loading() {
  return <ProductListingSkeleton />;
}
