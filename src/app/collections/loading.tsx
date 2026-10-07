import { ProductListingSkeleton } from "@/components/product/product-listing-skeleton";

// Shown while a collection page loads its products.
export default function Loading() {
  return <ProductListingSkeleton />;
}
