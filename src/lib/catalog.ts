import { asc, desc, eq, inArray, ne } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { categories, productImages, products } from "@/db/schema";

export type ImageAsset = {
  src: string;
  alt: string;
};

export type Product = {
  slug: string;
  name: string;
  category: { slug: string; name: string };
  price: number; // minor units (cents)
  image: ImageAsset; // primary shot, used on cards
  gallery: ImageAsset[]; // additional shots for the detail page
  badge?: string;
  color: string;
  description: string;
  details: string[];
  stock: number; // units available
};

type ProductRow = typeof products.$inferSelect & {
  category: typeof categories.$inferSelect;
  images: (typeof productImages.$inferSelect)[];
};

// Relations every storefront query loads, with images in display order.
const withRelations = {
  category: true as const,
  images: { orderBy: [asc(productImages.position)] },
};

function toProduct(row: ProductRow): Product {
  const [image, ...gallery] = row.images.map(({ src, alt }) => ({ src, alt }));
  if (!image) throw new Error(`Product "${row.slug}" has no images`);

  return {
    slug: row.slug,
    name: row.name,
    category: { slug: row.category.slug, name: row.category.name },
    price: row.price,
    image,
    gallery,
    badge: row.badge ?? undefined,
    color: row.color,
    description: row.description,
    details: row.details,
    stock: row.stock,
  };
}

export const getProduct = cache(async (slug: string) => {
  const row = await db.query.products.findFirst({
    where: eq(products.slug, slug),
    with: withRelations,
  });
  return row ? toProduct(row) : undefined;
});

export const getProductSlugs = cache(async () => {
  const rows = await db.select({ slug: products.slug }).from(products);
  return rows.map((row) => row.slug);
});

export const getNewArrivals = cache(async (limit = 8) => {
  const rows = await db.query.products.findMany({
    orderBy: [desc(products.createdAt), asc(products.id)],
    limit,
    with: withRelations,
  });
  return rows.map(toProduct);
});

/** Products for the given slugs, in the order the slugs were listed. Unknown slugs are skipped. */
export const getProductsBySlugs = cache(async (slugs: string[]) => {
  if (slugs.length === 0) return [];
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    with: withRelations,
  });
  const bySlug = new Map(rows.map((row) => [row.slug, toProduct(row)]));
  return slugs.flatMap((slug) => bySlug.get(slug) ?? []);
});

/** Same-category products first, topped up with the rest of the catalog. */
export async function getRelatedProducts(product: Product, limit = 4) {
  const categoryId = db
    .select({ id: categories.id })
    .from(categories)
    .where(eq(categories.slug, product.category.slug));

  const rows = await db.query.products.findMany({
    where: ne(products.slug, product.slug),
    orderBy: [desc(eq(products.categoryId, categoryId)), desc(products.createdAt), asc(products.id)],
    limit,
    with: withRelations,
  });
  return rows.map(toProduct);
}
