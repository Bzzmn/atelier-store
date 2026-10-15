import type { Gender } from "@/db/schema/catalog";
import { slugify } from "@/lib/format";

// Pure parsing for the admin forms. Isomorphic (no server-only imports) so the forms can share
// the limits and tests can run it in node. Every admin action parses through here; nothing
// from a form reaches the database unchecked.

export const GENDERS = ["women", "men", "unisex"] as const satisfies readonly Gender[];

export const PRODUCT_LIMITS = {
  name: 120,
  slug: 100,
  description: 4000,
  detail: 200,
  details: 12,
  color: 60,
  badge: 40,
  alt: 200,
  images: 8,
  category: 60,
} as const;

/** Highest stock an admin can set; keeps typos like 10000000 out of the catalog. */
export const MAX_STOCK = 100_000;
/** $99,999.99, in cents. */
export const MAX_PRICE = 9_999_999;

/** /shop routes that would shadow a category with the same slug. */
export const RESERVED_CATEGORY_SLUGS = ["new", "women", "men"] as const;

export type FieldErrors = Partial<Record<string, string>>;
export type ParseResult<T> = { ok: true; value: T } | { ok: false; errors: FieldErrors };

export type ImageInput = { src: string; alt: string };

export type ProductInput = {
  name: string;
  description: string;
  details: string[];
  price: number; // cents
  color: string;
  badge: string | null;
  gender: Gender;
  categoryId: number;
  images: ImageInput[];
};

/** Fields only a new product has: the slug is fixed once created, and stock is edited on /admin/stock. */
export type NewProductInput = ProductInput & { slug: string; stock: number };

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function text(formData: FormData, field: string) {
  const value = formData.get(field);
  return typeof value === "string" ? value.normalize("NFC").trim() : "";
}

/** A positive database id from a form field, or undefined. */
export function parseId(value: unknown) {
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value)) return undefined;
  const id = Number(value);
  return id <= 2_147_483_647 ? id : undefined;
}

/** A whole number from 0 to `max`, or undefined. Rejects "", "1.5", "1e3" and "-1". */
export function parseCount(value: unknown, max = MAX_STOCK) {
  if (typeof value !== "string" || !/^\d{1,9}$/.test(value.trim())) return undefined;
  const count = Number(value.trim());
  return count <= max ? count : undefined;
}

/** "1290", "1290.5" or "1290.50" dollars → cents. Undefined for anything else. */
export function parsePrice(value: unknown) {
  if (typeof value !== "string") return undefined;
  const match = /^(\d{1,7})(?:\.(\d{1,2}))?$/.exec(value.trim().replace(/^\$/, ""));
  if (!match) return undefined;
  const cents = Number(match[1]) * 100 + Number((match[2] ?? "").padEnd(2, "0"));
  return cents <= MAX_PRICE ? cents : undefined;
}

/** Cents → the value the price field shows: 129000 → "1290.00". */
export function priceFieldValue(cents: number) {
  return (cents / 100).toFixed(2);
}

/** Only Unsplash photo URLs: next.config.ts allows no other image source. */
export function isAllowedImageUrl(value: string) {
  if (value.length > 2000) return false;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }
  return (
    url.protocol === "https:" &&
    url.hostname === "images.unsplash.com" &&
    url.port === "" &&
    url.username === "" &&
    url.password === "" &&
    url.pathname.startsWith("/photo-")
  );
}

export function isValidSlug(value: string) {
  return value.length <= PRODUCT_LIMITS.slug && SLUG.test(value);
}

/** One detail per non-empty line. */
export function parseDetails(value: string) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function required(errors: FieldErrors, field: string, value: string, label: string, max: number) {
  if (!value) errors[field] = `Enter ${label}.`;
  else if (value.length > max) errors[field] = `Use ${max} characters or fewer.`;
}

/**
 * Image rows arrive as parallel `imageSrc` / `imageAlt` lists, in display order. Fully empty
 * rows are ignored; the first image is the card shot.
 */
function parseImages(formData: FormData, errors: FieldErrors): ImageInput[] {
  const srcs = formData.getAll("imageSrc");
  const alts = formData.getAll("imageAlt");
  const images: ImageInput[] = [];
  for (let index = 0; index < Math.max(srcs.length, alts.length); index++) {
    const src = typeof srcs[index] === "string" ? (srcs[index] as string).trim() : "";
    const alt = typeof alts[index] === "string" ? (alts[index] as string).normalize("NFC").trim() : "";
    if (!src && !alt) continue;
    if (!isAllowedImageUrl(src)) {
      errors[`image.${index}.src`] = "Use an https://images.unsplash.com/photo-… URL.";
    }
    if (!alt) errors[`image.${index}.alt`] = "Describe the image.";
    else if (alt.length > PRODUCT_LIMITS.alt) errors[`image.${index}.alt`] = `Use ${PRODUCT_LIMITS.alt} characters or fewer.`;
    images.push({ src, alt });
  }
  if (images.length === 0) errors.images = "Add at least one image.";
  else if (images.length > PRODUCT_LIMITS.images) errors.images = `Use ${PRODUCT_LIMITS.images} images or fewer.`;
  return images;
}

/** The fields a product edit can change. The category is checked against the database later. */
export function parseProductForm(formData: FormData): ParseResult<ProductInput> {
  const errors: FieldErrors = {};

  const name = text(formData, "name");
  required(errors, "name", name, "a name", PRODUCT_LIMITS.name);

  const description = text(formData, "description");
  required(errors, "description", description, "a description", PRODUCT_LIMITS.description);

  const details = parseDetails(text(formData, "details"));
  if (details.length > PRODUCT_LIMITS.details) errors.details = `Use ${PRODUCT_LIMITS.details} lines or fewer.`;
  else if (details.some((line) => line.length > PRODUCT_LIMITS.detail)) {
    errors.details = `Keep each line to ${PRODUCT_LIMITS.detail} characters or fewer.`;
  }

  const price = parsePrice(formData.get("price"));
  if (price === undefined) errors.price = "Enter a price in dollars, like 1290 or 1290.50.";

  const color = text(formData, "color");
  required(errors, "color", color, "a color", PRODUCT_LIMITS.color);

  const badge = text(formData, "badge");
  if (badge.length > PRODUCT_LIMITS.badge) errors.badge = `Use ${PRODUCT_LIMITS.badge} characters or fewer.`;

  const gender = formData.get("gender");
  if (!GENDERS.includes(gender as Gender)) errors.gender = "Choose who it's for.";

  const categoryId = parseId(formData.get("categoryId"));
  if (categoryId === undefined) errors.categoryId = "Choose a category.";

  const images = parseImages(formData, errors);

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    value: {
      name,
      description,
      details,
      price: price!,
      color,
      badge: badge || null,
      gender: gender as Gender,
      categoryId: categoryId!,
      images,
    },
  };
}

/** A new product: the edit fields plus its slug and opening stock. */
export function parseNewProductForm(formData: FormData): ParseResult<NewProductInput> {
  const product = parseProductForm(formData);
  const errors: FieldErrors = product.ok ? {} : { ...product.errors };

  const slug = text(formData, "slug").toLowerCase();
  if (!slug) errors.slug = "Enter a URL slug.";
  else if (!isValidSlug(slug)) errors.slug = "Use lowercase letters, numbers and single hyphens.";

  const stock = parseCount(formData.get("stock"));
  if (stock === undefined) errors.stock = `Enter a whole number from 0 to ${MAX_STOCK.toLocaleString("en-US")}.`;

  if (!product.ok || Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { ...product.value, slug, stock: stock! } };
}

/** A category name, and the slug a new category would get from it. */
export function parseCategoryForm(formData: FormData): ParseResult<{ name: string; slug: string }> {
  const errors: FieldErrors = {};
  const name = text(formData, "name");
  required(errors, "name", name, "a name", PRODUCT_LIMITS.category);
  const slug = slugify(name);
  if (name && !errors.name) {
    if (!slug) errors.name = "Use at least one letter or number.";
    else if ((RESERVED_CATEGORY_SLUGS as readonly string[]).includes(slug)) {
      errors.name = `"${slug}" is already a shop page. Choose another name.`;
    }
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true, value: { name, slug } };
}

/** A stock change: the new count, and the count the form was showing (to detect a race). */
export function parseStockForm(
  formData: FormData,
): ParseResult<{ productId: number; expected: number; stock: number }> {
  const productId = parseId(formData.get("productId"));
  const expected = parseCount(formData.get("expected"), Number.MAX_SAFE_INTEGER);
  const stock = parseCount(formData.get("stock"));
  if (productId === undefined || expected === undefined) {
    return { ok: false, errors: { form: "Something went wrong. Reload the page and try again." } };
  }
  if (stock === undefined) {
    return { ok: false, errors: { stock: `Enter a whole number from 0 to ${MAX_STOCK.toLocaleString("en-US")}.` } };
  }
  return { ok: true, value: { productId, expected, stock } };
}
