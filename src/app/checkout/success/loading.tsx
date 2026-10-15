import { Skeleton } from "@/components/skeleton";

// Mirrors the confirmation page while the order is confirmed with Stripe.
export default function CheckoutSuccessLoading() {
  return (
    <main aria-busy="true" className="flex-1 pt-header pb-section">
      <p role="status" className="sr-only">
        Confirming your order…
      </p>
      <div className="prose-container pt-10 md:pt-14">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="mt-4 h-8 w-3/4 lg:h-12" />
        <Skeleton className="mt-6 h-5 w-2/3" />
        <Skeleton className="mt-10 h-3 w-28" />
        <div className="hairline-t mt-4">
          {Array.from({ length: 2 }, (_, index) => (
            <div key={index} className="hairline-b flex justify-between gap-6 py-4">
              <Skeleton className="h-10 w-1/2" />
              <Skeleton className="h-5 w-16" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
