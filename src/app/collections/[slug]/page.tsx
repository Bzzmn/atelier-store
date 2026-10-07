import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/product/product-listing";
import { getProductsBySlugs } from "@/lib/catalog";
import { collectionPages } from "@/lib/sample-data";

// Products come from the database; re-render at most once a minute.
export const revalidate = 60;
// Only the editorial collections in `collectionPages` have a page.
export const dynamicParams = false;

export function generateStaticParams() {
  return collectionPages.map(({ slug }) => ({ slug }));
}

function getCollection(slug: string) {
  return collectionPages.find((collection) => collection.slug === slug);
}

export async function generateMetadata(props: PageProps<"/collections/[slug]">): Promise<Metadata> {
  const collection = getCollection((await props.params).slug);
  if (!collection) return {};

  const { title, description, image } = collection;
  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image.src, alt: image.alt }] },
  };
}

export default async function CollectionPage(props: PageProps<"/collections/[slug]">) {
  const collection = getCollection((await props.params).slug);
  if (!collection) notFound();

  const products = await getProductsBySlugs(collection.productSlugs);

  return (
    <ProductListing
      breadcrumbs={[{ label: collection.title }]}
      eyebrow={collection.eyebrow ?? "Collection"}
      title={collection.title}
      description={collection.description}
      products={products}
    />
  );
}
