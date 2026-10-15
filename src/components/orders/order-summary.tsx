import Image from "next/image";
import Link from "next/link";

import { formatPrice } from "@/lib/format";

type OrderSummaryItem = {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  image?: { src: string; alt: string };
};

// The pieces of an order, priced as they were bought (snapshots, not current prices).
// Thumbnails are optional: the confirmation page lists items without them.
export function OrderSummary({ items, total }: { items: OrderSummaryItem[]; total: number }) {
  return (
    <section aria-labelledby="order-summary-title">
      <h2 id="order-summary-title" className="type-label">
        Order summary
      </h2>
      <ul className="hairline-t mt-4">
        {items.map((item) => {
          const href = `/products/${item.slug}`;
          return (
            <li key={item.slug} className="hairline-b type-body flex gap-4 py-4 md:gap-6">
              {item.image && (
                // The name link is the accessible one; the image link is a mouse shortcut.
                <Link href={href} tabIndex={-1} aria-hidden="true" className="media-frame aspect-product w-16 shrink-0 md:w-20">
                  <Image src={item.image.src} alt="" fill sizes="(min-width: 768px) 80px, 64px" />
                </Link>
              )}
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-6">
                <div>
                  <Link href={href} className="link-quiet">
                    {item.name}
                  </Link>
                  <p className="type-body-sm text-fg-muted tabular-nums">
                    Qty {item.quantity} · {formatPrice(item.unitPrice)}
                    {item.quantity > 1 && " each"}
                  </p>
                </div>
                <p className="tabular-nums">
                  <span className="sr-only">Line total </span>
                  {formatPrice(item.unitPrice * item.quantity)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
      <dl className="type-body mt-4 grid grid-cols-[1fr_auto] gap-x-6 gap-y-2">
        <dt className="text-fg-muted">Shipping</dt>
        <dd className="text-right text-fg-muted">Complimentary</dd>
        <dt className="font-medium">Total</dt>
        <dd className="text-right font-medium tabular-nums">{formatPrice(total)}</dd>
      </dl>
    </section>
  );
}
