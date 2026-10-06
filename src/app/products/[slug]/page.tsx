import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/product/product-card";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductInfo } from "@/components/product/product-info";
import { getProduct, getProductSlugs, getRelatedProducts } from "@/lib/catalog";

// Stock and prices come from the database; re-render at most once a minute.
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getProductSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.image.src, alt: product.image.alt }],
    },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: [product.image, ...product.gallery].map((image) => image.src),
    category: product.category.name,
    color: product.color,
    offers: {
      "@type": "Offer",
      price: (product.price / 100).toFixed(2),
      priceCurrency: "USD",
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="flex-1 pt-header">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="grid lg:grid-cols-12">
        <div className="lg:col-span-7">
          <ProductGallery images={[product.image, ...product.gallery]} name={product.name} />
        </div>
        <div className="px-gutter py-10 lg:col-span-5 lg:px-12 xl:px-16">
          <div className="lg:sticky lg:top-[calc(var(--header-height)+2.5rem)] lg:mx-auto lg:max-w-md">
            <ProductInfo product={product} />
          </div>
        </div>
      </div>

      <section aria-labelledby="related-title" className="section-y hairline-t">
        <div className="page-container mb-8">
          <h2 id="related-title" className="type-title">
            You May Also Like
          </h2>
        </div>
        <ul className="product-grid">
          {related.map((item) => (
            <li key={item.slug}>
              <ProductCard product={item} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
