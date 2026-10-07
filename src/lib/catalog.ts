import { and, asc, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/db";
import { categories, type Gender, productImages, products } from "@/db/schema";

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

export const getCategory = cache(async (slug: string) => {
  const [category] = await db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.slug, slug));
  return category;
});

export const getCategorySlugs = cache(async () => {
  const rows = await db.select({ slug: categories.slug }).from(categories);
  return rows.map((row) => row.slug);
});

/** A category's products, newest first. */
export const getProductsByCategory = cache(async (categoryId: number) => {
  const rows = await db.query.products.findMany({
    where: eq(products.categoryId, categoryId),
    orderBy: [desc(products.createdAt), asc(products.id)],
    with: withRelations,
  });
  return rows.map(toProduct);
});

/** Products for women or men, newest first. Unisex pieces are included in both. */
export const getProductsByGender = cache(async (gender: Exclude<Gender, "unisex">) => {
  const rows = await db.query.products.findMany({
    where: inArray(products.gender, [gender, "unisex"]),
    orderBy: [desc(products.createdAt), asc(products.id)],
    with: withRelations,
  });
  return rows.map(toProduct);
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

/** Escapes LIKE wildcards so user input is matched literally. */
function likePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

/**
 * Products where every word of the query appears in the name, color, category or
 * description. Products whose names contain the most query words rank first, then newest.
 */
export const searchProducts = cache(async (query: string, limit = 48) => {
  const terms = query.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (terms.length === 0) return [];

  const matchesTerm = (term: string) => {
    const pattern = likePattern(term);
    return or(
      ilike(products.name, pattern),
      ilike(products.color, pattern),
      ilike(products.description, pattern),
      inArray(
        products.categoryId,
        db.select({ id: categories.id }).from(categories).where(ilike(categories.name, pattern)),
      ),
    );
  };

  const nameMatches = sql.join(
    terms.map((term) => sql`(${ilike(products.name, likePattern(term))})::int`),
    sql` + `,
  );

  const rows = await db.query.products.findMany({
    where: and(...terms.map(matchesTerm)),
    orderBy: [
      desc(nameMatches),
      desc(products.createdAt),
      asc(products.id),
    ],
    limit,
    with: withRelations,
  });
  return rows.map(toProduct);
});
