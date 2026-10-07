import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductListing } from "@/components/product/product-listing";
import { getCategory, getCategorySlugs, getProductsByCategory } from "@/lib/catalog";

// Products come from the database; re-render at most once a minute.
export const revalidate = 60;

export async function generateStaticParams() {
  return (await getCategorySlugs()).map((category) => ({ category }));
}

export async function generateMetadata(props: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category: slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) return {};

  const description = `Shop ${category.name.toLowerCase()} from the atelier, newest pieces first.`;
  return {
    title: category.name,
    description,
    openGraph: { title: category.name, description },
  };
}

export default async function CategoryPage(props: PageProps<"/shop/[category]">) {
  const { category: slug } = await props.params;
  const category = await getCategory(slug);
  if (!category) notFound();

  const products = await getProductsByCategory(category.id);

  return (
    <ProductListing
      breadcrumbs={[{ label: category.name }]}
      eyebrow="Shop"
      title={category.name}
      products={products}
    />
  );
}
