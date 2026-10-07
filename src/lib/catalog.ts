import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
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

/** The fields a ProductCard shows; what search sends to the client. */
export type ProductSummary = Pick<
  Product,
  "slug" | "name" | "category" | "price" | "image" | "badge" | "stock"
>;

function toSummary({ slug, name, category, price, image, badge, stock }: Product): ProductSummary {
  return { slug, name, category, price, image, badge, stock };
}

type ProductRow = Omit<typeof products.$inferSelect, "searchVector"> & {
  category: typeof categories.$inferSelect;
  images: (typeof productImages.$inferSelect)[];
};

// Columns and relations every storefront query loads, with images in display order.
// The search vector is only used for filtering, so it never leaves the database.
const productQuery = {
  columns: { searchVector: false as const },
  with: {
    category: true as const,
    images: { orderBy: [asc(productImages.position)] },
  },
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
    ...productQuery,
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
    ...productQuery,
  });
  return rows.map(toProduct);
});

/** Products for the given slugs, in the order the slugs were listed. Unknown slugs are skipped. */
export const getProductsBySlugs = cache(async (slugs: string[]) => {
  if (slugs.length === 0) return [];
  const rows = await db.query.products.findMany({
    where: inArray(products.slug, slugs),
    ...productQuery,
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
    ...productQuery,
  });
  return rows.map(toProduct);
});

/** Products for women or men, newest first. Unisex pieces are included in both. */
export const getProductsByGender = cache(async (gender: Exclude<Gender, "unisex">) => {
  const rows = await db.query.products.findMany({
    where: inArray(products.gender, [gender, "unisex"]),
    orderBy: [desc(products.createdAt), asc(products.id)],
    ...productQuery,
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
    ...productQuery,
  });
  return rows.map(toProduct);
}

export const SEARCH_PAGE_SIZE = 24;
/** Deepest "Show more" offset the API serves; also keeps OFFSET within Postgres's range. */
export const MAX_SEARCH_OFFSET = 10_000;

const MAX_QUERY_LENGTH = 100;
const MIN_TERM_LENGTH = 2;
const MAX_TERMS = 6;

/**
 * The words a raw query searches for: runs of letters (with their accents) and decimal digits,
 * 2+ characters, at most 6, from the first 100 characters. Every caller goes through this.
 */
export function searchTerms(query: string) {
  // NFC: keyboards may type "é" as "e" + a combining accent. Case is left to Postgres, whose
  // `simple` config lowercases both sides; lowercasing here can add marks ("İ" → "i̇").
  // \p{Nd} rather than \p{N}: Postgres doesn't index superscripts or Roman numerals, and
  // one unmatchable term would empty the whole search.
  const words = query.normalize("NFC").slice(0, MAX_QUERY_LENGTH).match(/[\p{L}\p{M}\p{Nd}]+/gu) ?? [];
  const terms = new Map<string, string>(); // lowercase → first spelling typed
  for (const word of words) {
    const key = word.toLowerCase();
    if (word.length >= MIN_TERM_LENGTH && !terms.has(key)) terms.set(key, word);
  }
  return [...terms.values()].slice(0, MAX_TERMS);
}

/**
 * Full-text product search. Each term matches the start of a word (prefix search, so "bag"
 * finds "bags" but "men" doesn't find "women") in the name, color, description or category,
 * and every term must match. Products whose names match the most terms rank first, then
 * newest. Returns one page of SEARCH_PAGE_SIZE card summaries starting at `offset`, the total
 * match count, and the terms actually searched, so callers can show them.
 */
export const searchProducts = cache(async (query: string, offset = 0) => {
  const terms = searchTerms(query);
  if (terms.length === 0) return { terms, products: [] as ProductSummary[], total: 0 };

  // Terms are letters, marks and digits only, so they can't inject tsquery syntax.
  const prefix = (term: string, weight = "") => sql`to_tsquery('simple', ${`${term}:*${weight}`})`;

  const matchesTerm = (term: string) => {
    // A query builder, not raw SQL: the relational query maps every column in raw `where`
    // SQL onto the products alias, which would turn categories.name into products.name.
    const categoryIds = db
      .select({ id: categories.id })
      .from(categories)
      .where(sql`to_tsvector('simple', ${categories.name}) @@ ${prefix(term)}`);
    // ANY(ARRAY(...)) runs the tiny categories lookup once, so both sides stay index scans.
    return sql`(${products.searchVector} @@ ${prefix(term)} or ${products.categoryId} = any(array(${categoryIds})))`;
  };

  // Weight A is the name (see the search_vector column).
  const nameMatches = sql.join(
    terms.map((term) => sql`(${products.searchVector} @@ ${prefix(term, "A")})::int`),
    sql` + `,
  );

  const rows = await db.query.products.findMany({
    ...productQuery,
    where: and(...terms.map(matchesTerm)),
    extras: { total: sql<string>`count(*) over ()`.as("total") },
    orderBy: [desc(nameMatches), desc(products.createdAt), asc(products.id)],
    limit: SEARCH_PAGE_SIZE,
    offset,
  });
  return {
    terms,
    products: rows.map((row) => toSummary(toProduct(row))),
    total: Number(rows[0]?.total ?? 0),
  };
});
