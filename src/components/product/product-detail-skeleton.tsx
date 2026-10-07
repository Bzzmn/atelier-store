import { Skeleton } from "@/components/skeleton";

// Loading state for the product detail page: mirrors ProductGallery + ProductInfo.
export function ProductDetailSkeleton() {
  return (
    <main aria-busy="true" className="flex-1 pt-header">
      <p role="status" className="sr-only">
        Loading product…
      </p>

      <div className="grid lg:grid-cols-12">
        {/* Gallery: one portrait image on mobile; lead image + two-up grid on desktop. */}
        <div className="lg:col-span-7 lg:grid lg:grid-cols-2 lg:gap-px">
          <Skeleton className="aspect-portrait w-full lg:col-span-2 lg:aspect-[4/5]" />
          <Skeleton className="hidden aspect-portrait lg:block" />
          <Skeleton className="hidden aspect-portrait lg:block" />
        </div>

        <div className="px-gutter py-10 lg:col-span-5 lg:px-12 xl:px-16">
          <div className="flex flex-col lg:mx-auto lg:max-w-md">
            <Skeleton className="h-3 w-48" />

            <div className="mt-8 flex flex-col gap-3">
              <Skeleton className="h-8 w-3/4 lg:h-12" />
              <Skeleton className="h-6 w-24" />
            </div>

            <div className="mt-8 flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-36" />
            </div>

            <Skeleton className="mt-8 h-12 w-full" />

            <div className="hairline-t mt-10">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="hairline-b py-5">
                  <Skeleton className="h-4 w-40" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
