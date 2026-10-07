// Idempotent: upserts categories and products by slug and replaces their images.
// Run with `pnpm db:seed` after `pnpm db:migrate`.

import { inArray, sql } from "drizzle-orm";

import { slugify } from "@/lib/format";
import { collectionPages } from "@/lib/sample-data";

import { db } from "./index";
import { categories, productImages, products } from "./schema";
import {
  leatherEdit,
  newArrivals,
  outerwearEdit,
  type SeedProduct,
  seedCategories,
  tailoringEdit,
} from "./seed-data";

// Fixed timestamps keep the homepage order stable across re-seeds: New Arrivals
// are newest (in listed order), then the tailoring, outerwear and leather edits.
const BASE_DATE = Date.UTC(2026, 8, 1);
const MINUTE = 60_000;

function withCreatedAt(list: SeedProduct[], offsetMinutes: number) {
  return list.map((product, index) => ({
    product,
    createdAt: new Date(BASE_DATE - (offsetMinutes + index) * MINUTE),
  }));
}

// Collection pages silently skip unknown slugs, so a typo would just shrink the page.
function assertCollectionsResolve(seededSlugs: Set<string>) {
  const missing = collectionPages.flatMap(({ slug, productSlugs }) =>
    productSlugs.filter((productSlug) => !seededSlugs.has(productSlug)).map((s) => `${slug}: ${s}`),
  );
  if (missing.length > 0) throw new Error(`Collections reference unknown products:\n${missing.join("\n")}`);
}

async function main() {
  const seeded = [
    ...withCreatedAt(newArrivals, 0),
    ...withCreatedAt(tailoringEdit, 24 * 60),
    ...withCreatedAt(outerwearEdit, 48 * 60),
    ...withCreatedAt(leatherEdit, 72 * 60),
  ];
  assertCollectionsResolve(new Set(seeded.map(({ product }) => product.slug)));

  const categoryRows = await db
    .insert(categories)
    .values(seedCategories.map((name) => ({ slug: slugify(name), name })))
    .onConflictDoUpdate({ target: categories.slug, set: { name: sql`excluded.name` } })
    .returning({ id: categories.id, name: categories.name });
  const categoryIds = new Map(categoryRows.map((row) => [row.name, row.id]));

  const productRows = await db
    .insert(products)
    .values(
      seeded.map(({ product, createdAt }) => {
        const categoryId = categoryIds.get(product.category);
        if (!categoryId) throw new Error(`Unknown category "${product.category}" on ${product.slug}`);
        return {
          slug: product.slug,
          name: product.name,
          description: product.description,
          details: product.details,
          price: product.price,
          color: product.color,
          badge: product.badge ?? null,
          stock: product.stock,
          gender: product.gender,
          categoryId,
          createdAt,
        };
      }),
    )
    .onConflictDoUpdate({
      target: products.slug,
      set: {
        name: sql`excluded.name`,
        description: sql`excluded.description`,
        details: sql`excluded.details`,
        price: sql`excluded.price`,
        color: sql`excluded.color`,
        badge: sql`excluded.badge`,
        stock: sql`excluded.stock`,
        gender: sql`excluded.gender`,
        categoryId: sql`excluded.category_id`,
        createdAt: sql`excluded.created_at`,
        updatedAt: sql`now()`,
      },
    })
    .returning({ id: products.id, slug: products.slug });
  const productIds = new Map(productRows.map((row) => [row.slug, row.id]));

  await db.delete(productImages).where(inArray(productImages.productId, [...productIds.values()]));
  await db.insert(productImages).values(
    seeded.flatMap(({ product }) =>
      [product.image, ...product.gallery].map((image, position) => ({
        productId: productIds.get(product.slug)!,
        src: image.src,
        alt: image.alt,
        position,
      })),
    ),
  );

  console.log(
    `Seeded ${categoryRows.length} categories, ${productRows.length} products and their images.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
