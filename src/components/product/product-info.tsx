import Link from "next/link";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { Disclosure } from "@/components/product/disclosure";
import { StockStatus } from "@/components/product/stock-status";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/catalog";

export function ProductInfo({ product }: { product: Product }) {
  const soldOut = product.stock <= 0;
  const categoryHref = `/shop/${product.category.slug}`;

  return (
    <div className="flex flex-col">
      <Breadcrumbs
        items={[{ label: product.category.name, href: categoryHref }, { label: product.name }]}
      />

      <div className="mt-8 flex flex-col gap-3">
        {product.badge && <p className="type-micro">{product.badge}</p>}
        <h1 className="type-headline">{product.name}</h1>
        <p className="type-body font-medium">{formatPrice(product.price)}</p>
      </div>

      <dl className="type-caption mt-8 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
        <dt className="text-fg-muted">Category</dt>
        <dd>
          <Link href={categoryHref} className="link">
            {product.category.name}
          </Link>
        </dd>
        <dt className="text-fg-muted">Colour</dt>
        <dd>{product.color}</dd>
        <dt className="text-fg-muted">Availability</dt>
        <dd>
          <StockStatus stock={product.stock} />
        </dd>
      </dl>

      <div className="mt-8 flex flex-col gap-3">
        {/* Cart isn't built yet: the button renders its final state only. */}
        <button type="button" disabled={soldOut} className="btn btn-primary w-full">
          {soldOut ? "Sold Out" : "Add to Shopping Bag"}
        </button>
        {soldOut && (
          <p className="type-body-sm text-center text-fg-muted">
            This piece is currently unavailable. Contact Client Services for alternatives.
          </p>
        )}
      </div>

      <div className="hairline-t mt-10">
        <Disclosure title="Description" defaultOpen>
          <p>{product.description}</p>
        </Disclosure>
        <Disclosure title="Details & Composition">
          <ul className="flex list-disc flex-col gap-1 pl-4">
            {product.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        </Disclosure>
        <Disclosure title="Shipping & Returns">
          <p>
            Complimentary express shipping on every order, delivered in signature packaging.
            Returns and exchanges are accepted within 30 days of delivery.
          </p>
        </Disclosure>
      </div>
    </div>
  );
}
