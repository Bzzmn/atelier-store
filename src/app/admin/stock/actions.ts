"use server";

import { revalidateCatalog, setStock } from "@/lib/admin/catalog";
import { parseStockForm } from "@/lib/admin/product-input";
import { requireAdmin } from "@/lib/session";

import { type AdminActionState, failure, success } from "../state";

// Every export must call requireAdmin() first (admin-guard.test.ts).

export async function setStockAction(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin("/admin/stock");

  const input = parseStockForm(formData);
  if (!input.ok) return failure(prev, input.errors.form ?? input.errors.stock ?? "", input.errors);
  const { productId, expected, stock } = input.value;

  const result = await setStock(productId, expected, stock).catch((error: unknown) => {
    console.error("Set stock failed", { productId, error });
    return undefined;
  });
  if (!result) return failure(prev, "We couldn't save the stock. Please try again.");

  // Refresh either way: on a conflict the row must show the current value.
  revalidateCatalog();
  if (!result.ok) {
    return failure(
      prev,
      result.current === undefined
        ? "This product no longer exists."
        : `Stock changed to ${result.current} since this page loaded (a checkout or another admin). Review it and save again.`,
    );
  }
  return success(prev, `Stock set to ${result.stock}.`);
}
