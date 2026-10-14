import { Skeleton } from "@/components/skeleton";

// Mirrors the bag page: breadcrumb and title, then line items beside the summary.
export function BagSkeleton() {
  return (
    <main aria-busy="true" className="flex-1 pt-header pb-section">
      <p role="status" className="sr-only">
        Loading your bag…
      </p>
      <div className="page-container pt-10 md:pt-14">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="mt-8 h-8 w-56 lg:h-12" />

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="hairline-t lg:col-span-7 xl:col-span-8">
            {Array.from({ length: 2 }, (_, index) => (
              <div key={index} className="hairline-b flex gap-4 py-6 md:gap-6">
                <Skeleton className="aspect-product w-24 shrink-0 md:w-32" />
                <div className="flex flex-1 flex-col gap-1">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/5" />
                  <Skeleton className="mt-auto h-10 w-28" />
                </div>
              </div>
            ))}
          </div>
          <Skeleton className="h-72 lg:col-span-5 xl:col-span-4" />
        </div>
      </div>
    </main>
  );
}
