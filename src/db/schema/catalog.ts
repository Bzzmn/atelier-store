import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

// Unisex products are listed under both women and men.
export const genderEnum = pgEnum("gender", ["women", "men", "unisex"]);

export type Gender = (typeof genderEnum.enumValues)[number];

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    details: text("details").array().notNull().default(sql`'{}'::text[]`),
    price: integer("price").notNull(), // minor units (cents)
    color: text("color").notNull(),
    badge: text("badge"),
    stock: integer("stock").notNull().default(0), // units available
    gender: genderEnum("gender").notNull().default("unisex"),
    categoryId: integer("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("products_category_id_idx").on(table.categoryId),
    index("products_created_at_idx").on(table.createdAt),
    index("products_gender_idx").on(table.gender),
    check("products_price_nonnegative", sql`${table.price} >= 0`),
    check("products_stock_nonnegative", sql`${table.stock} >= 0`),
  ],
);

// Position 0 is the primary shot used on cards; the rest form the detail-page gallery.
export const productImages = pgTable(
  "product_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    src: text("src").notNull(),
    alt: text("alt").notNull(),
    position: integer("position").notNull(),
  },
  (table) => [unique("product_images_product_position_key").on(table.productId, table.position)],
);

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));
