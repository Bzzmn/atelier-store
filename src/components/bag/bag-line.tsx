import Image from "next/image";
import Link from "next/link";

import { BagLineControls } from "@/components/bag/bag-line-controls";
import { StockStatus } from "@/components/product/stock-status";
import type { ReconciledLine } from "@/lib/bag-reconcile";
import type { ProductSummary } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export function BagLine({ line }: { line: ReconciledLine<ProductSummary> }) {
  const { product, quantity, requested, max, soldOut, adjusted, lineTotal } = line;
  const href = `/products/${product.slug}`;

  return (
    <li className="hairline-b flex gap-4 py-6 md:gap-6">
      {/* The name link below is the accessible one; the image link is a mouse shortcut. */}
      <Link href={href} tabIndex={-1} aria-hidden="true" className="media-frame aspect-product w-24 shrink-0 md:w-32">
        <Image src={product.image.src} alt="" fill sizes="(min-width: 768px) 128px, 96px" />
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <h2 className="type-caption">
            <Link href={href} className="link-quiet">
              {product.name}
            </Link>
          </h2>
          <p className="type-caption tabular-nums">
            {soldOut ? <span className="text-fg-subtle">—</span> : formatPrice(lineTotal)}
          </p>
        </div>
        <p className="type-body-sm mt-1 text-fg-muted">{product.category.name}</p>
        <p className="type-body-sm text-fg-muted tabular-nums">
          {formatPrice(product.price)}
          {quantity > 1 && " each"}
        </p>
        <div className="mt-3">
          <StockStatus stock={product.stock} />
        </div>
        {adjusted && (
          <p className="type-body-sm mt-2 text-error">
            Only {product.stock} available. Quantity reduced from {requested} to {quantity}.
          </p>
        )}
        {/* Says why "+" is disabled; the adjusted notice above already covers it. */}
        {!soldOut && !adjusted && quantity >= max && (
          <p className="type-body-sm mt-2 text-fg-muted">
            {max < product.stock
              ? `Limit of ${max} per piece.`
              : max === 1
                ? "The last piece available is in your bag."
                : `All ${max} available are in your bag.`}
          </p>
        )}
        {soldOut && (
          <p className="type-body-sm mt-2 text-fg-muted">
            This piece has sold out and isn&apos;t included in your subtotal.
          </p>
        )}

        <div className="mt-auto pt-4">
          <BagLineControls
            slug={product.slug}
            name={product.name}
            quantity={quantity}
            max={max}
            soldOut={soldOut}
          />
        </div>
      </div>
    </li>
  );
}
