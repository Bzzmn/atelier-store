"use client";

import { setStockAction } from "@/app/admin/stock/actions";
import { FormStatus } from "@/components/admin/form-status";
import { useAdminForm } from "@/components/admin/use-admin-form";
import { MAX_STOCK } from "@/lib/admin/product-input";

/**
 * Sets one product's stock. `expected` is the value this row shows: the server only writes
 * if the stock is still that, so a checkout that reserved units since the page loaded isn't
 * overwritten. After a save or a conflict the page re-renders with the current value.
 */
export function StockForm({
  productId,
  name,
  stock,
  label,
}: {
  productId: number;
  name: string;
  stock: number;
  /** A visible label (the product page); table rows label the field for screen readers only. */
  label?: string;
}) {
  const { state, onSubmit, pending } = useAdminForm(setStockAction);
  const inputId = `stock-${productId}`;

  return (
    <form method="post" onSubmit={onSubmit} noValidate aria-busy={pending || undefined} className="flex flex-col gap-2">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="expected" value={stock} />
      <div className="flex items-end gap-3">
        {!label && (
          <label htmlFor={inputId} className="sr-only">
            New stock for {name}
          </label>
        )}
        <div>
          {label && (
            <label htmlFor={inputId} className="type-micro block text-fg-muted">
              {label}
            </label>
          )}
          <input
          // Remount when the saved value changes, so the field shows it.
          key={stock}
          id={inputId}
          name="stock"
          type="number"
          inputMode="numeric"
          min={0}
          max={MAX_STOCK}
          step={1}
          required
          defaultValue={stock}
          aria-invalid={state.status === "error" || undefined}
          className="field w-24"
          />
        </div>
        <button type="submit" aria-disabled={pending || undefined} className="btn btn-secondary btn-sm">
          {pending ? "Saving…" : "Save"}
          <span className="sr-only"> stock for {name}</span>
        </button>
      </div>
      <FormStatus state={state} className="max-w-64" />
    </form>
  );
}
