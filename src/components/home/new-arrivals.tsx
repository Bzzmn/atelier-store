import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import { ProductCard } from "@/components/product/product-card";
import { getNewArrivals } from "@/lib/catalog";

export async function NewArrivals() {
  const products = await getNewArrivals();

  return (
    <section aria-labelledby="new-arrivals-title" className="section-y">
      <div className="page-container mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="type-label text-fg-muted">Just In</p>
          <h2 id="new-arrivals-title" className="type-title mt-2">
            New Arrivals
          </h2>
        </div>
        <Link href="/shop/new" className="type-label link-quiet flex shrink-0 items-center gap-2">
          View All
          <ArrowRightIcon width={16} height={16} />
        </Link>
      </div>
      <ul className="product-grid">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}
