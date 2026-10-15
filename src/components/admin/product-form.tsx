"use client";

import Link from "next/link";
import { type ReactNode, useRef, useState } from "react";

import { createProductAction, updateProductAction } from "@/app/admin/products/actions";
import { FieldError, FormStatus, invalidProps } from "@/components/admin/form-status";
import { useAdminForm } from "@/components/admin/use-admin-form";
import type { Gender } from "@/db/schema/catalog";
import { GENDERS, MAX_STOCK, PRODUCT_LIMITS, priceFieldValue } from "@/lib/admin/product-input";
import { slugify } from "@/lib/format";

export type ProductFormValues = {
  id: number;
  slug: string;
  name: string;
  description: string;
  details: string[];
  price: number; // cents
  color: string;
  badge: string | null;
  gender: Gender;
  categoryId: number;
  images: { src: string; alt: string }[];
};

const GENDER_LABELS: Record<Gender, string> = { women: "Women", men: "Men", unisex: "Unisex (both)" };

type ImageRow = { key: number; src: string; alt: string };

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="type-micro text-fg-muted">
        {label}
      </label>
      {children}
      {hint && !error && <p className="type-body-sm mt-2 text-fg-subtle">{hint}</p>}
      <FieldError id={id} message={error} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="hairline-t flex flex-col gap-6 pt-8">
      <legend className="type-label float-left mb-2 w-full">{title}</legend>
      {children}
    </fieldset>
  );
}

// Create and edit share this form. The slug can only be set on create (URLs, bags and
// collections reference it). After creation, stock has its own compare-and-set form
// (StockForm, beside this one on the edit page), so saving a stale edit form can't
// overwrite units a checkout just reserved.
export function ProductForm({
  product,
  categories,
}: {
  product?: ProductFormValues;
  categories: { id: number; name: string }[];
}) {
  const creating = !product;
  const { state, onSubmit, pending } = useAdminForm(creating ? createProductAction : updateProductAction);
  const errors = state.errors;

  const [slug, setSlug] = useState(product?.slug ?? "");
  // Follows the name until the admin edits the slug themselves.
  const slugEdited = useRef(false);

  const [images, setImages] = useState<ImageRow[]>(() =>
    (product?.images.length ? product.images : [{ src: "", alt: "" }]).map((image, key) => ({ key, ...image })),
  );

  function addImage() {
    // Keys only need to be unique within the list, for React and the input ids.
    setImages((rows) => [...rows, { key: Math.max(-1, ...rows.map((row) => row.key)) + 1, src: "", alt: "" }]);
  }

  function updateImage(key: number, field: "src" | "alt", value: string) {
    setImages((rows) => rows.map((row) => (row.key === key ? { ...row, [field]: value } : row)));
  }

  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-busy={pending || undefined} className="flex flex-col gap-10">
      {product && <input type="hidden" name="id" value={product.id} />}

      <Section title="Basics">
        <Field id="product-name" label="Name" error={errors.name}>
          <input
            id="product-name"
            name="name"
            type="text"
            required
            maxLength={PRODUCT_LIMITS.name}
            defaultValue={product?.name}
            onChange={(event) => {
              if (creating && !slugEdited.current) setSlug(slugify(event.target.value));
            }}
            className="field"
            {...invalidProps("product-name", errors.name)}
          />
        </Field>

        {creating ? (
          <Field
            id="product-slug"
            label="URL slug"
            hint={
              <>
                The page will be /products/{slug || "…"}. It can&apos;t be changed after the product is created.
              </>
            }
            error={errors.slug}
          >
            <input
              id="product-slug"
              name="slug"
              type="text"
              required
              maxLength={PRODUCT_LIMITS.slug}
              value={slug}
              onChange={(event) => {
                slugEdited.current = true;
                setSlug(event.target.value);
              }}
              autoCapitalize="none"
              spellCheck={false}
              className="field"
              {...invalidProps("product-slug", errors.slug)}
            />
          </Field>
        ) : (
          <div>
            <p className="type-micro text-fg-muted">URL</p>
            <p className="type-body mt-2">
              <Link href={`/products/${product.slug}`} className="link" target="_blank">
                /products/{product.slug}
              </Link>
            </p>
          </div>
        )}

        <Field id="product-description" label="Description" error={errors.description}>
          <textarea
            id="product-description"
            name="description"
            required
            rows={5}
            maxLength={PRODUCT_LIMITS.description}
            defaultValue={product?.description}
            className="field resize-y"
            {...invalidProps("product-description", errors.description)}
          />
        </Field>

        <Field
          id="product-details"
          label="Details (optional)"
          hint={`One per line, up to ${PRODUCT_LIMITS.details}. Shown as a list on the product page.`}
          error={errors.details}
        >
          <textarea
            id="product-details"
            name="details"
            rows={4}
            defaultValue={product?.details.join("\n")}
            className="field resize-y"
            {...invalidProps("product-details", errors.details)}
          />
        </Field>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="product-color" label="Color" error={errors.color}>
            <input
              id="product-color"
              name="color"
              type="text"
              required
              maxLength={PRODUCT_LIMITS.color}
              defaultValue={product?.color}
              className="field"
              {...invalidProps("product-color", errors.color)}
            />
          </Field>
          <Field id="product-badge" label="Badge (optional)" hint="For example, New or Limited." error={errors.badge}>
            <input
              id="product-badge"
              name="badge"
              type="text"
              maxLength={PRODUCT_LIMITS.badge}
              defaultValue={product?.badge ?? ""}
              className="field"
              {...invalidProps("product-badge", errors.badge)}
            />
          </Field>
        </div>
      </Section>

      <Section title="Classification">
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="product-category" label="Category" error={errors.categoryId}>
            <select
              id="product-category"
              name="categoryId"
              required
              defaultValue={product?.categoryId ?? ""}
              className="field"
              {...invalidProps("product-category", errors.categoryId)}
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="product-gender" label="Shown under" error={errors.gender}>
            <select
              id="product-gender"
              name="gender"
              required
              defaultValue={product?.gender ?? "unisex"}
              className="field"
              {...invalidProps("product-gender", errors.gender)}
            >
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {GENDER_LABELS[gender]}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Section>

      <Section title={creating ? "Price & stock" : "Price"}>
        <div className="grid gap-6 sm:grid-cols-2">
          <Field id="product-price" label="Price (USD)" hint="Dollars, like 1290 or 1290.50." error={errors.price}>
            <input
              id="product-price"
              name="price"
              type="text"
              inputMode="decimal"
              required
              defaultValue={product ? priceFieldValue(product.price) : ""}
              className="field"
              {...invalidProps("product-price", errors.price)}
            />
          </Field>
          {creating ? (
            <Field id="product-stock" label="Opening stock" hint="Units available to sell." error={errors.stock}>
              <input
                id="product-stock"
                name="stock"
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_STOCK}
                step={1}
                required
                defaultValue={0}
                className="field"
                {...invalidProps("product-stock", errors.stock)}
              />
            </Field>
          ) : null}
        </div>
      </Section>

      <Section title="Images">
        <p className="type-body-sm text-fg-muted">
          Unsplash photo URLs (https://images.unsplash.com/photo-…). The first image is the card shot; the rest form the
          product page gallery.
        </p>
        <ol className="flex flex-col gap-8">
          {images.map((row, index) => {
            const srcId = `image-${row.key}-src`;
            const altId = `image-${row.key}-alt`;
            return (
              <li key={row.key} className="flex flex-col gap-4">
                <div className="flex items-baseline justify-between gap-4">
                  <p className="type-caption">{index === 0 ? "Primary image" : `Image ${index + 1}`}</p>
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setImages((rows) => rows.filter((r) => r.key !== row.key))}
                      className="type-caption link-quiet text-fg-muted"
                    >
                      Remove<span className="sr-only"> image {index + 1}</span>
                    </button>
                  )}
                </div>
                <Field id={srcId} label="URL" error={errors[`image.${index}.src`]}>
                  <input
                    id={srcId}
                    name="imageSrc"
                    type="url"
                    value={row.src}
                    onChange={(event) => updateImage(row.key, "src", event.target.value)}
                    spellCheck={false}
                    className="field"
                    {...invalidProps(srcId, errors[`image.${index}.src`])}
                  />
                </Field>
                <Field id={altId} label="Alt text" error={errors[`image.${index}.alt`]}>
                  <input
                    id={altId}
                    name="imageAlt"
                    type="text"
                    maxLength={PRODUCT_LIMITS.alt}
                    value={row.alt}
                    onChange={(event) => updateImage(row.key, "alt", event.target.value)}
                    className="field"
                    {...invalidProps(altId, errors[`image.${index}.alt`])}
                  />
                </Field>
              </li>
            );
          })}
        </ol>
        {errors.images && <p className="type-body-sm text-error">{errors.images}</p>}
        {images.length < PRODUCT_LIMITS.images && (
          <button
            type="button"
            onClick={addImage}
            className="btn btn-secondary btn-sm self-start"
          >
            Add image
          </button>
        )}
      </Section>

      <div className="hairline-t flex flex-col gap-4 pt-8">
        <FormStatus state={state} />
        <button
          type="submit"
          aria-disabled={pending || undefined}
          className="btn btn-primary w-full sm:w-auto sm:self-start"
        >
          {pending ? "Saving…" : creating ? "Create product" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
