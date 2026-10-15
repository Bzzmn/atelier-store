import "server-only";

import { and, asc, count, desc, eq, ilike, lte, or, type SQL, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { categories, orderItems, orders, productImages, products } from "@/db/schema";
import type { NewProductInput, ProductInput } from "@/lib/admin/product-input";
import { LOW_STOCK_THRESHOLD } from "@/lib/stock";

// Admin reads and writes for the catalog. Nothing here is `cache`d: admins must see and
// change rows as they are now. Callers (admin pages and actions) check requireAdmin() first.
// The storefront keeps reading through src/lib/catalog.ts.

export class SlugTakenError extends Error {}
export class CategoryInUseError extends Error {}
export class MissingRowError extends Error {}

/** The Postgres SQLSTATE of a failed query, however the driver wraps it. */
function pgErrorCode(error: unknown): string | undefined {
  for (let e = error; e && typeof e === "object"; e = (e as { cause?: unknown }).cause) {
    const code = (e as { code?: unknown }).code;
    if (typeof code === "string" && /^[0-9A-Z]{5}$/.test(code)) return code;
  }
  return undefined;
}

const UNIQUE_VIOLATION = "23505";
const FOREIGN_KEY_VIOLATION = "23503";
// What ON DELETE RESTRICT raises (not 23503) when a referenced row is deleted.
const RESTRICT_VIOLATION = "23001";

/** `%` and `_` typed by the admin match themselves, not any characters. */
function likePattern(value: string) {
  return `%${value.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/**
 * Storefront pages are ISR. Product and category changes show up on the homepage, listings,
 * collections and product pages, so the whole tree is refreshed; the catalog is small.
 */
export function revalidateCatalog() {
  revalidatePath("/", "layout");
}

// --- Products ---------------------------------------------------------------------------

export async function listAdminProducts({ q, categoryId }: { q?: string; categoryId?: number }) {
  const filters: SQL[] = [];
  if (q) filters.push(or(ilike(products.name, likePattern(q)), ilike(products.slug, likePattern(q)))!);
  if (categoryId) filters.push(eq(products.categoryId, categoryId));

  return db.query.products.findMany({
    where: filters.length > 0 ? and(...filters) : undefined,
    columns: {
      id: true,
      slug: true,
      name: true,
      price: true,
      stock: true,
      gender: true,
      updatedAt: true,
    },
    with: {
      category: { columns: { name: true } },
      images: { columns: { src: true }, where: eq(productImages.position, 0) },
    },
    orderBy: [desc(products.createdAt), asc(products.id)],
  });
}

export async function getAdminProduct(id: number) {
  return db.query.products.findFirst({
    where: eq(products.id, id),
    columns: { searchVector: false },
    with: {
      category: { columns: { slug: true, name: true } },
      images: { columns: { src: true, alt: true }, orderBy: [asc(productImages.position)] },
    },
  });
}

export type AdminProduct = NonNullable<Awaited<ReturnType<typeof getAdminProduct>>>;

function productColumns(input: ProductInput) {
  return {
    name: input.name,
    description: input.description,
    details: input.details,
    price: input.price,
    color: input.color,
    badge: input.badge,
    gender: input.gender,
    categoryId: input.categoryId,
  };
}

/** Maps constraint failures to errors the forms can explain. */
function rethrowProductError(error: unknown): never {
  const code = pgErrorCode(error);
  if (code === UNIQUE_VIOLATION) throw new SlugTakenError("Slug taken", { cause: error });
  // The category (or, on update, the product) was deleted meanwhile.
  if (code === FOREIGN_KEY_VIOLATION) throw new MissingRowError("Missing row", { cause: error });
  throw error;
}

/**
 * Inserts a product and its images in one transaction, so the storefront never sees a
 * product without its card shot. Returns the new id.
 */
export async function createProduct(input: NewProductInput) {
  // The images can't know the generated id yet; they find the product by its unique slug
  // inside the same transaction.
  const productId = sql<number>`(select ${products.id} from ${products} where ${products.slug} = ${input.slug})`;
  try {
    const [[product]] = await db.batch([
      db
        .insert(products)
        .values({ ...productColumns(input), slug: input.slug, stock: input.stock })
        .returning({ id: products.id }),
      db.insert(productImages).values(
        input.images.map((image, position) => ({ productId, src: image.src, alt: image.alt, position })),
      ),
    ]);
    return product.id;
  } catch (error) {
    rethrowProductError(error);
  }
}

/**
 * Updates a product's copy, price, category and images (replaced as a set, like the seed does).
 * The slug and stock aren't touched here. Throws MissingRowError if the product is gone.
 */
export async function updateProduct(id: number, input: ProductInput) {
  try {
    const [updated] = await db.batch([
      db.update(products).set(productColumns(input)).where(eq(products.id, id)).returning({ id: products.id }),
      db.delete(productImages).where(eq(productImages.productId, id)),
      db.insert(productImages).values(
        input.images.map((image, position) => ({ productId: id, src: image.src, alt: image.alt, position })),
      ),
    ]);
    if (updated.length === 0) throw new MissingRowError("Product not found");
  } catch (error) {
    if (error instanceof MissingRowError) throw error;
    rethrowProductError(error);
  }
}

// --- Categories -------------------------------------------------------------------------

export async function listCategories() {
  return db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .orderBy(asc(categories.name));
}

export async function listCategoriesWithCounts() {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.name));
}

export async function createCategory({ name, slug }: { name: string; slug: string }) {
  try {
    const [category] = await db.insert(categories).values({ name, slug }).returning({ id: categories.id });
    return category.id;
  } catch (error) {
    if (pgErrorCode(error) === UNIQUE_VIOLATION) throw new SlugTakenError("Slug taken", { cause: error });
    throw error;
  }
}

/** Renames a category. Its slug (the /shop URL) stays as it was created. */
export async function renameCategory(id: number, name: string) {
  const rows = await db.update(categories).set({ name }).where(eq(categories.id, id)).returning({ id: categories.id });
  if (rows.length === 0) throw new MissingRowError("Category not found");
}

/** Deletes an empty category. Throws CategoryInUseError while any product uses it. */
export async function deleteCategory(id: number) {
  try {
    await db.delete(categories).where(eq(categories.id, id));
  } catch (error) {
    const code = pgErrorCode(error);
    if (code === RESTRICT_VIOLATION || code === FOREIGN_KEY_VIOLATION) {
      throw new CategoryInUseError("In use", { cause: error });
    }
    throw error;
  }
}

// --- Stock ------------------------------------------------------------------------------

export type StockFilter = "all" | "low" | "out";

/** Units each product has reserved by pending checkouts that haven't been released. */
function heldUnits(productId?: number) {
  return db
    .select({
      productId: orderItems.productId,
      units: sql<number>`sum(${orderItems.quantity})::int`.as("units"),
    })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orders.status, "pending"),
        eq(orders.stockReleased, false),
        productId === undefined ? undefined : eq(orderItems.productId, productId),
      ),
    )
    .groupBy(orderItems.productId);
}

/** Units of one product held by pending checkouts. */
export async function getHeldUnits(productId: number) {
  const [row] = await heldUnits(productId);
  return row?.units ?? 0;
}

/**
 * Every product's available stock, with the units pending checkouts hold. Those units were
 * already taken off `stock` and go back if the checkout expires or fails.
 */
export async function getStockOverview(filter: StockFilter = "all") {
  const held = heldUnits().as("held");

  const where =
    filter === "out"
      ? lte(products.stock, 0)
      : filter === "low"
        ? and(sql`${products.stock} > 0`, lte(products.stock, LOW_STOCK_THRESHOLD))
        : undefined;

  return db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      stock: products.stock,
      held: sql<number>`coalesce(${held.units}, 0)`.mapWith(Number),
      updatedAt: products.updatedAt,
    })
    .from(products)
    .leftJoin(held, eq(held.productId, products.id))
    .where(where)
    .orderBy(asc(products.stock), asc(products.name));
}

/** How many products are sold out and how many are running low, for the overview. */
export async function getStockCounts() {
  const [row] = await db
    .select({
      out: sql<number>`count(*) filter (where ${products.stock} <= 0)`.mapWith(Number),
      low: sql<number>`count(*) filter (where ${products.stock} > 0 and ${products.stock} <= ${LOW_STOCK_THRESHOLD})`.mapWith(Number),
      total: count(),
    })
    .from(products);
  return row;
}

export type SetStockResult = { ok: true; stock: number } | { ok: false; current: number | undefined };

/**
 * Sets a product's stock only if it still has the value the admin was looking at. Checkouts
 * reserve and return units concurrently; a blind write could undo a reservation made after
 * the page loaded. On a mismatch nothing changes and the current value comes back
 * (undefined if the product no longer exists).
 */
export async function setStock(productId: number, expected: number, stock: number): Promise<SetStockResult> {
  const [updated] = await db
    .update(products)
    .set({ stock })
    .where(and(eq(products.id, productId), eq(products.stock, expected)))
    .returning({ stock: products.stock });
  if (updated) return { ok: true, stock: updated.stock };

  const [current] = await db.select({ stock: products.stock }).from(products).where(eq(products.id, productId));
  return { ok: false, current: current?.stock };
}
