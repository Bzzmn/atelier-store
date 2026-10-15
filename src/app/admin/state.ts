import type { FieldErrors } from "@/lib/admin/product-input";

// Lives outside the actions files: a "use server" module may only export async functions.

export type AdminActionState = {
  status: "idle" | "success" | "error";
  /** Form-level message, announced in the form's status region. */
  message: string;
  /** Per-field messages, keyed by input name ("price", "image.0.src"). */
  errors: FieldErrors;
  /** Changes on every response, so clients can react to repeated identical results. */
  id: number;
};

export const initialAdminState: AdminActionState = { status: "idle", message: "", errors: {}, id: 0 };

export function success(prev: AdminActionState, message: string): AdminActionState {
  return { status: "success", message, errors: {}, id: prev.id + 1 };
}

export function failure(prev: AdminActionState, message: string, errors: FieldErrors = {}): AdminActionState {
  return { status: "error", message, errors, id: prev.id + 1 };
}

export const CHECK_FIELDS = "Check the highlighted fields.";
export const FAILED = "Something went wrong. Please try again.";
