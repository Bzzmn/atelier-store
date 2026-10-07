import type { Metadata } from "next";

import { ProductListing } from "@/components/product/product-listing";
import { getProductsByGender } from "@/lib/catalog";

// Shared by /shop/women and /shop/men. Unisex pieces appear on both.
const genderPages = {
  women: {
    title: "Women",
    description: "Ready-to-wear, leather goods and jewelry for women, newest pieces first.",
  },
  men: {
    title: "Men",
    description: "Tailoring, footwear and accessories for men, newest pieces first.",
  },
};

type GenderPageKey = keyof typeof genderPages;

export function genderMetadata(gender: GenderPageKey): Metadata {
  const { title, description } = genderPages[gender];
  return { title, description, openGraph: { title, description } };
}

export async function GenderPage({ gender }: { gender: GenderPageKey }) {
  const { title, description } = genderPages[gender];
  const products = await getProductsByGender(gender);

  return (
    <ProductListing
      breadcrumbs={[{ label: title }]}
      eyebrow="Shop"
      title={title}
      description={description}
      products={products}
    />
  );
}
