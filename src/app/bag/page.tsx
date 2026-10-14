import type { Metadata } from "next";
import Link from "next/link";

import { BagLine } from "@/components/bag/bag-line";
import { BagSummary } from "@/components/bag/bag-summary";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBag } from "@/lib/bag";

// Dynamic: it reads the bag cookie. Prices and stock come from the database on every request.
export const metadata: Metadata = {
  title: "Shopping Bag",
  robots: { index: false, follow: false },
};

export default async function BagPage() {
  const { lines, removedCount, subtotal, count } = await getBag();

  return (
    <main className="flex-1 pt-header pb-section">
      <div className="page-container pt-10 md:pt-14">
        <Breadcrumbs items={[{ label: "Shopping Bag" }]} />
        <h1 id="bag-title" tabIndex={-1} className="type-headline mt-8 outline-none">
          Shopping Bag
        </h1>

        {removedCount > 0 && (
          <p role="status" className="type-body-sm mt-6 text-error">
            {removedCount === 1
              ? "1 piece in your bag is no longer available and has been removed."
              : `${removedCount} pieces in your bag are no longer available and have been removed.`}
          </p>
        )}

        {lines.length === 0 ? (
          <div className="hairline-t mt-10 flex flex-col items-start gap-6 pt-8">
            <p className="type-body text-fg-muted">Your shopping bag is empty.</p>
            <Link href="/shop/new" className="btn btn-secondary">
              Shop new arrivals
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
            <ul aria-label="Items in your bag" className="hairline-t lg:col-span-7 xl:col-span-8">
              {lines.map((line) => (
                <BagLine key={line.product.slug} line={line} />
              ))}
            </ul>
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="lg:sticky lg:top-[calc(var(--header-height)+2.5rem)]">
                <BagSummary subtotal={subtotal} count={count} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
