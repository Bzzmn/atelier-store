"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

type Field = "currentPassword" | "newPassword";
type FieldErrors = Partial<Record<Field, string>>;

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
const FIELDS: Field[] = ["currentPassword", "newPassword"];

function validate(values: Record<Field, string>): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.currentPassword) errors.currentPassword = "Enter your current password.";
  if (!values.newPassword) errors.newPassword = "Enter a new password.";
  else if (values.newPassword.length < MIN_PASSWORD) {
    errors.newPassword = `Use at least ${MIN_PASSWORD} characters.`;
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = "Choose a password different from your current one.";
  }
  return errors;
}

// Goes through authClient so Better Auth's rate limiter applies. Other sessions
// are revoked; this device gets a fresh session cookie.
export function PasswordForm({ email }: { email: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<{ kind: "success" | "error"; message: string } | null>(
    null,
  );
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);

  function values(): Record<Field, string> {
    const form = new FormData(formRef.current ?? undefined);
    return {
      currentPassword: String(form.get("currentPassword") ?? ""),
      newPassword: String(form.get("newPassword") ?? ""),
    };
  }

  function focus(field: Field) {
    (formRef.current?.elements.namedItem(field) as HTMLInputElement | null)?.focus();
  }

  // Only re-check a field once it's been flagged, so typing isn't interrupted.
  function onChange(field: Field) {
    setStatus(null);
    if (fieldErrors[field]) setFieldErrors((current) => ({ ...current, [field]: validate(values())[field] }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    const input = values();
    const errors = validate(input);
    setFieldErrors(errors);
    setStatus(null);
    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (firstInvalid) return focus(firstInvalid);

    pendingRef.current = true;
    setPending(true);
    let error: { code?: string; status: number } | null;
    try {
      ({ error } = await authClient.changePassword({ ...input, revokeOtherSessions: true }));
    } catch {
      error = { status: 0 };
    }
    pendingRef.current = false;
    setPending(false);

    if (!error) {
      formRef.current?.reset();
      setStatus({
        kind: "success",
        message: "Your password has been changed. Other devices have been signed out.",
      });
      return;
    }
    if (error.code === "INVALID_PASSWORD") {
      setFieldErrors({ currentPassword: "That password is incorrect." });
      return focus("currentPassword");
    }
    if (error.code === "PASSWORD_TOO_SHORT" || error.code === "PASSWORD_TOO_LONG") {
      setFieldErrors({ newPassword: `Use ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.` });
      return focus("newPassword");
    }
    // Expired session: re-rendering the page redirects to sign-in.
    if (error.status === 401) return router.refresh();
    setStatus({
      kind: "error",
      message:
        error.status === 0
          ? "We couldn't reach the server. Check your connection and try again."
          : error.status === 429
            ? "Too many attempts. Please wait a moment and try again."
            : "We couldn't change your password. Please try again.",
    });
  }

  const showHint = !fieldErrors.newPassword;

  return (
    <form
      ref={formRef}
      // Only reached if submitted before hydration: POST keeps passwords out of the URL.
      method="post"
      onSubmit={onSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="flex flex-col gap-6"
    >
      {/* Lets password managers file the new password under the right account. */}
      <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />

      <div>
        <label htmlFor="current-password" className="type-micro text-fg-muted">
          Current password
        </label>
        <input
          id="current-password"
          type="password"
          name="currentPassword"
          required
          maxLength={MAX_PASSWORD}
          autoComplete="current-password"
          readOnly={pending}
          onChange={() => onChange("currentPassword")}
          aria-invalid={fieldErrors.currentPassword ? true : undefined}
          aria-describedby={fieldErrors.currentPassword ? "current-password-error" : undefined}
          className="field"
        />
        {fieldErrors.currentPassword && (
          <p id="current-password-error" className="type-body-sm mt-2 text-error">
            {fieldErrors.currentPassword}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="new-password" className="type-micro text-fg-muted">
          New password
        </label>
        <input
          id="new-password"
          type="password"
          name="newPassword"
          required
          minLength={MIN_PASSWORD}
          maxLength={MAX_PASSWORD}
          autoComplete="new-password"
          readOnly={pending}
          onChange={() => onChange("newPassword")}
          aria-invalid={fieldErrors.newPassword ? true : undefined}
          aria-describedby={fieldErrors.newPassword ? "new-password-error" : "new-password-hint"}
          className="field"
        />
        {showHint ? (
          <p id="new-password-hint" className="type-micro mt-2 text-fg-subtle">
            At least {MIN_PASSWORD} characters.
          </p>
        ) : (
          <p id="new-password-error" className="type-body-sm mt-2 text-error">
            {fieldErrors.newPassword}
          </p>
        )}
      </div>

      <p
        role="status"
        className={`type-body-sm empty:hidden ${status?.kind === "error" ? "text-error" : "text-success"}`}
      >
        {status?.message}
      </p>

      {/* aria-disabled rather than disabled, so focus stays on the button while pending. */}
      <button
        type="submit"
        aria-disabled={pending || undefined}
        className="btn btn-secondary w-full sm:w-auto sm:self-start"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
