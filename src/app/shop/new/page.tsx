import type { Metadata } from "next";

import { ProductListing } from "@/components/product/product-listing";
import { getNewArrivals } from "@/lib/catalog";

// Products come from the database; re-render at most once a minute.
export const revalidate = 60;

const description =
  "The latest pieces from the atelier, from sculpted leather to soft tailoring, newest first.";

export const metadata: Metadata = {
  title: "New Arrivals",
  description,
};

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(48);

  return (
    <ProductListing
      breadcrumbs={[{ label: "New Arrivals" }]}
      eyebrow="Just In"
      title="New Arrivals"
      description={description}
      products={products}
    />
  );
}
