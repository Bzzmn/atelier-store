import Link from "next/link";

import { formatPrice } from "@/lib/format";

export function BagSummary({ subtotal, count }: { subtotal: number; count: number }) {
  return (
    <section aria-labelledby="bag-summary-title" className="bg-bg-muted p-6 md:p-8">
      <h2 id="bag-summary-title" className="type-label">
        Summary
      </h2>
      <dl className="type-body mt-6 grid grid-cols-[1fr_auto] gap-x-6 gap-y-3">
        <dt>
          Subtotal{" "}
          <span className="text-fg-muted">
            ({count} {count === 1 ? "item" : "items"})
          </span>
        </dt>
        <dd className="text-right font-medium tabular-nums">{formatPrice(subtotal)}</dd>
        <dt className="text-fg-muted">Shipping</dt>
        <dd className="text-right text-fg-muted">Complimentary</dd>
      </dl>
      <p className="type-body-sm mt-4 text-fg-muted">
        Prices reflect current availability. Taxes are calculated at checkout.
      </p>
      {/* Checkout isn't built yet. */}
      <button type="button" disabled className="btn btn-primary mt-6 w-full">
        Checkout coming soon
      </button>
      <div className="mt-4 text-center">
        <Link href="/shop/new" className="btn btn-ghost">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
