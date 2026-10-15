import type { Metadata } from "next";
import Link from "next/link";

import { BagAnnouncer } from "@/components/bag/bag-announcer";
import { BagLine } from "@/components/bag/bag-line";
import { BagSummary } from "@/components/bag/bag-summary";
import { BagSync } from "@/components/bag/bag-sync";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getBag } from "@/lib/bag";

// Dynamic: it reads the bag cookie. Prices and stock come from the database on every request.
export const metadata: Metadata = {
  title: "Shopping Bag",
  robots: { index: false, follow: false },
};

// Set by checkout when it sends the customer back here. Changes they must review are
// errors; a canceled checkout is just a note.
const NOTICES = {
  changed: { text: "Your bag changed since you last saw it. Please review it before checking out.", error: true },
  stock: { text: "Some pieces sold out while you were checking out. Your bag has been updated.", error: true },
  canceled: { text: "Checkout canceled. You haven't been charged, and your bag is as you left it.", error: false },
};

export default async function BagPage({ searchParams }: PageProps<"/bag">) {
  const { notice: key } = await searchParams;
  const notice = typeof key === "string" && Object.hasOwn(NOTICES, key)
    ? NOTICES[key as keyof typeof NOTICES]
    : undefined;
  const { lines, removedCount, subtotal, count } = await getBag();
  // Units kept in the bag (and the header count) but left out of the subtotal.
  const soldOutCount = lines.reduce((total, line) => total + (line.soldOut ? line.requested : 0), 0);
  const corrected = removedCount > 0 || lines.some((line) => line.adjusted);

  return (
    <main className="flex-1 pt-header pb-section">
      {corrected && <BagSync />}
      <BagAnnouncer />
      <div className="page-container pt-10 md:pt-14">
        <Breadcrumbs items={[{ label: "Shopping Bag" }]} />
        <h1 id="bag-title" tabIndex={-1} className="type-headline mt-8 outline-none">
          Shopping Bag
        </h1>

        {notice && (
          <p role="status" className={`type-body-sm mt-6 ${notice.error ? "text-error" : "text-fg-muted"}`}>
            {notice.text}
          </p>
        )}

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
                <BagSummary subtotal={subtotal} count={count} soldOutCount={soldOutCount} />
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
