import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/product/product-card";
import { getProductsBySlugs } from "@/lib/catalog";
import { featuredCollection } from "@/lib/sample-data";

// A 2×2 preview; the full edit is on the collection page.
const PREVIEW_COUNT = 4;

export async function FeaturedCollection() {
  const { image, productSlugs } = featuredCollection;
  // Slice after the lookup, so a missing product is replaced by the next one rather than leaving a gap.
  const products = (await getProductsBySlugs(productSlugs)).slice(0, PREVIEW_COUNT);

  return (
    <section aria-labelledby="featured-title" className="section-y">
      <div className="grid lg:grid-cols-2">
        <Link
          href={featuredCollection.href}
          className="media-frame aspect-portrait md:aspect-landscape lg:aspect-auto lg:min-h-full"
        >
          <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" />
        </Link>

        <div className="flex flex-col">
          <div className="flex flex-col items-start px-gutter py-10 md:py-14 lg:px-12">
            <p className="type-label text-fg-muted">{featuredCollection.eyebrow}</p>
            <h2 id="featured-title" className="type-headline mt-3">
              {featuredCollection.title}
            </h2>
            <p className="type-body mt-4 max-w-md text-fg-muted">{featuredCollection.description}</p>
            <Link href={featuredCollection.href} className="btn btn-secondary mt-8">
              Explore the Collection
            </Link>
          </div>
          <ul className="mt-auto grid grid-cols-2 gap-px">
            {products.map((product) => (
              <li key={product.slug}>
                <ProductCard product={product} sizes="(min-width: 1024px) 25vw, 50vw" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
