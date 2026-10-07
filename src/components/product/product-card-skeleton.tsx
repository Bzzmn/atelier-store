import { Skeleton } from "@/components/skeleton";

// Mirrors ProductCard: square image, then name / category / price lines.
export function ProductCardSkeleton() {
  return (
    <div className="bg-bg">
      <Skeleton className="aspect-product" />
      <div className="flex flex-col gap-1 px-3 pt-3 pb-8 md:pb-10">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="mt-2 h-4 w-1/4" />
      </div>
    </div>
  );
}
