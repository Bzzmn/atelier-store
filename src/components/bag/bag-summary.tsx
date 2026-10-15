import Link from "next/link";

import { CheckoutForm } from "@/components/bag/checkout-form";
import { formatPrice } from "@/lib/format";

const items = (count: number) => `${count} ${count === 1 ? "item" : "items"}`;

type BagSummaryProps = {
  subtotal: number;
  /** Units included in the subtotal. */
  count: number;
  /** Sold-out units still in the bag, left out of the subtotal. */
  soldOutCount: number;
};

export function BagSummary({ subtotal, count, soldOutCount }: BagSummaryProps) {
  return (
    <section aria-labelledby="bag-summary-title" className="bg-bg-muted p-6 md:p-8">
      <h2 id="bag-summary-title" className="type-label">
        Summary
      </h2>
      <dl className="type-body mt-6 grid grid-cols-[1fr_auto] gap-x-6 gap-y-3">
        <dt>
          Subtotal{" "}
          <span className="text-fg-muted">({items(count)})</span>
        </dt>
        <dd className="text-right tabular-nums">{formatPrice(subtotal)}</dd>
        {soldOutCount > 0 && (
          <>
            <dt className="text-fg-muted">Sold out ({items(soldOutCount)})</dt>
            <dd className="text-right text-fg-muted">Not included</dd>
          </>
        )}
        <dt className="text-fg-muted">Shipping</dt>
        <dd className="text-right text-fg-muted">Complimentary</dd>
        {/* Shipping is free and no tax is collected, so the total is what Stripe charges. */}
        <div className="hairline-t col-span-2 mt-1 grid grid-cols-subgrid pt-4 font-medium">
          <dt>Total</dt>
          <dd className="text-right tabular-nums">{formatPrice(subtotal)}</dd>
        </div>
      </dl>
      <p className="type-body-sm mt-4 text-fg-muted">
        Prices reflect current availability. You&apos;ll enter shipping and payment details on our
        secure checkout, powered by Stripe.
      </p>
      <CheckoutForm subtotal={subtotal} count={count} />
      <div className="mt-4 text-center">
        <Link href="/shop/new" className="btn btn-ghost">
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
