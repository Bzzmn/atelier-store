"use server";

import {
  CategoryInUseError,
  createCategory,
  deleteCategory,
  MissingRowError,
  renameCategory,
  revalidateCatalog,
  SlugTakenError,
} from "@/lib/admin/catalog";
import { parseCategoryForm, parseId } from "@/lib/admin/product-input";
import { requireAdmin } from "@/lib/session";

import { type AdminActionState, CHECK_FIELDS, FAILED, failure, success } from "../state";

// Every export must call requireAdmin() first (admin-guard.test.ts).

export async function createCategoryAction(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin("/admin/categories");

  const input = parseCategoryForm(formData);
  if (!input.ok) return failure(prev, CHECK_FIELDS, input.errors);

  try {
    await createCategory(input.value);
  } catch (error) {
    if (error instanceof SlugTakenError) {
      return failure(prev, CHECK_FIELDS, { name: `A category already uses the URL /shop/${input.value.slug}.` });
    }
    console.error("Create category failed", error);
    return failure(prev, FAILED);
  }

  revalidateCatalog();
  return success(prev, `Added ${input.value.name}.`);
}

export async function renameCategoryAction(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin("/admin/categories");

  const id = parseId(formData.get("id"));
  if (id === undefined) return failure(prev, FAILED);
  const input = parseCategoryForm(formData);
  if (!input.ok) return failure(prev, CHECK_FIELDS, input.errors);

  try {
    await renameCategory(id, input.value.name);
  } catch (error) {
    if (error instanceof MissingRowError) return failure(prev, "This category no longer exists. Reload the page.");
    console.error("Rename category failed", { id, error });
    return failure(prev, FAILED);
  }

  revalidateCatalog();
  return success(prev, "Saved.");
}

export async function deleteCategoryAction(prev: AdminActionState, formData: FormData): Promise<AdminActionState> {
  await requireAdmin("/admin/categories");

  const id = parseId(formData.get("id"));
  if (id === undefined) return failure(prev, FAILED);

  try {
    await deleteCategory(id);
  } catch (error) {
    if (error instanceof CategoryInUseError) {
      return failure(prev, "Move or reassign its products before deleting this category.");
    }
    console.error("Delete category failed", { id, error });
    return failure(prev, FAILED);
  }

  revalidateCatalog();
  return success(prev, "Category deleted.");
}
