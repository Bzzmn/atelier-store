"use client";

import { createCategoryAction, deleteCategoryAction, renameCategoryAction } from "@/app/admin/categories/actions";
import { FieldError, FormStatus, invalidProps } from "@/components/admin/form-status";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { PRODUCT_LIMITS } from "@/lib/admin/product-input";

export function NewCategoryForm() {
  const { state, onSubmit, pending } = useAdminForm(createCategoryAction);

  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-busy={pending || undefined} className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="category-new" className="type-micro text-fg-muted">
            New category
          </label>
          <input
            // Remount after each success so the field clears.
            key={state.status === "success" ? state.id : "draft"}
            id="category-new"
            name="name"
            type="text"
            required
            maxLength={PRODUCT_LIMITS.category}
            className="field"
            {...invalidProps("category-new", state.errors.name)}
          />
        </div>
        <button type="submit" aria-disabled={pending || undefined} className="btn btn-primary">
          {pending ? "Adding…" : "Add category"}
        </button>
      </div>
      <FieldError id="category-new" message={state.errors.name} />
      {state.status === "success" && <FormStatus state={state} />}
    </form>
  );
}

/** A category's rename form and delete button. Its slug (the /shop URL) never changes. */
export function CategoryRow({
  category,
}: {
  category: { id: number; slug: string; name: string; productCount: number };
}) {
  const rename = useAdminForm(renameCategoryAction);
  const remove = useAdminForm(deleteCategoryAction);
  const inputId = `category-${category.id}`;
  const status = remove.state.id > rename.state.id ? remove.state : rename.state;
  const inUse = category.productCount > 0;

  return (
    <li className="hairline-b flex flex-col gap-3 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <form method="post" onSubmit={rename.onSubmit} noValidate aria-busy={rename.pending || undefined} className="flex flex-1 items-end gap-4">
          <input type="hidden" name="id" value={category.id} />
          <div className="flex-1">
            <label htmlFor={inputId} className="type-micro text-fg-muted">
              Name <span className="text-fg-subtle">· /shop/{category.slug}</span>
            </label>
            <input
              id={inputId}
              name="name"
              type="text"
              required
              maxLength={PRODUCT_LIMITS.category}
              defaultValue={category.name}
              className="field"
              {...invalidProps(inputId, rename.state.errors.name)}
            />
          </div>
          <button type="submit" aria-disabled={rename.pending || undefined} className="btn btn-secondary btn-sm">
            {rename.pending ? "Saving…" : "Rename"}
            <span className="sr-only"> {category.name}</span>
          </button>
        </form>
        <form method="post" onSubmit={remove.onSubmit} aria-busy={remove.pending || undefined}>
          <input type="hidden" name="id" value={category.id} />
          <button
            type="submit"
            aria-disabled={inUse || remove.pending || undefined}
            aria-describedby={inUse ? `${inputId}-count` : undefined}
            onClick={(event) => inUse && event.preventDefault()}
            className="btn btn-ghost btn-sm"
          >
            {remove.pending ? "Deleting…" : "Delete"}
            <span className="sr-only"> {category.name}</span>
          </button>
        </form>
      </div>
      <p id={`${inputId}-count`} className="type-body-sm text-fg-muted">
        {category.productCount === 1 ? "1 product" : `${category.productCount} products`}
        {inUse && " · Categories with products can't be deleted."}
      </p>
      <FieldError id={inputId} message={rename.state.errors.name} />
      <FormStatus state={status} />
    </li>
  );
}
