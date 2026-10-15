"use server";

import { redirect } from "next/navigation";

import {
  createProduct,
  MissingRowError,
  revalidateCatalog,
  SlugTakenError,
  updateProduct,
} from "@/lib/admin/catalog";
import { parseId, parseNewProductForm, parseProductForm } from "@/lib/admin/product-input";
import { requireAdmin } from "@/lib/session";

import { type AdminActionState, CHECK_FIELDS, FAILED, failure, success } from "../state";

// Every export must call requireAdmin() first (admin-guard.test.ts): server actions are public
// endpoints, and the admin layout doesn't protect them.

export async function createProductAction(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin("/admin/products/new");

  const input = parseNewProductForm(formData);
  if (!input.ok) return failure(prev, CHECK_FIELDS, input.errors);

  let id: number;
  try {
    id = await createProduct(input.value);
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return failure(prev, CHECK_FIELDS, { slug: "Another product already uses this slug." });
    }
    if (error instanceof MissingRowError) {
      return failure(prev, CHECK_FIELDS, { categoryId: "That category no longer exists." });
    }
    console.error("Create product failed", error);
    return failure(prev, FAILED);
  }

  revalidateCatalog();
  redirect(`/admin/products/${id}?created=1`);
}

export async function updateProductAction(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin("/admin/products");

  const id = parseId(formData.get("id"));
  if (id === undefined) return failure(prev, FAILED);
  const input = parseProductForm(formData);
  if (!input.ok) return failure(prev, CHECK_FIELDS, input.errors);

  try {
    await updateProduct(id, input.value);
  } catch (error) {
    if (error instanceof MissingRowError) {
      return failure(prev, "This product or its category no longer exists. Reload the page.");
    }
    console.error("Update product failed", { id, error });
    return failure(prev, FAILED);
  }

  revalidateCatalog();
  return success(prev, "Product saved. The store shows the changes now.");
}
