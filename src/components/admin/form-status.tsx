import type { AdminActionState } from "@/app/admin/state";

/** A field's error, linked from the input with aria-describedby={errorId(id)}. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={errorId(id)} className="type-body-sm mt-2 text-error">
      {message}
    </p>
  );
}

export function errorId(id: string) {
  return `${id}-error`;
}

/** Props that mark an input invalid and point at its error. */
export function invalidProps(id: string, message?: string) {
  return message ? { "aria-invalid": true as const, "aria-describedby": errorId(id) } : {};
}

/** The form-level result, announced politely. */
export function FormStatus({ state, className = "" }: { state: AdminActionState; className?: string }) {
  return (
    <p
      role="status"
      className={`type-body-sm empty:hidden ${state.status === "error" ? "text-error" : "text-success"} ${className}`}
    >
      {state.message}
    </p>
  );
}
