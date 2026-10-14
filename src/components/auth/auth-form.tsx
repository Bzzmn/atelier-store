"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";
type Field = "email" | "password";
type FieldErrors = Partial<Record<Field, ReactNode>>;

const SUBMIT_LABEL = {
  "sign-in": ["Sign in", "Signing in…"],
  "sign-up": ["Create account", "Creating account…"],
} as const;

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;
// Close to the server's check, which rejects addresses browsers accept (e.g. "a@b").
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FIELDS: Field[] = ["email", "password"];

function validate(mode: Mode, field: Field, value: string): string | undefined {
  if (field === "email") {
    if (!value) return "Enter your email address.";
    if (!EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
    return;
  }
  if (!value) return "Enter your password.";
  // Sign-in doesn't enforce the policy: older passwords may predate it.
  if (mode === "sign-up" && value.length < MIN_PASSWORD) {
    return `Use at least ${MIN_PASSWORD} characters.`;
  }
}

type ServerError = { code?: string; message?: string; status: number };

// Maps a Better Auth error to field errors (shown under an input) or a form-level message.
function describeError(
  mode: Mode,
  error: ServerError,
  next: string,
): { fields?: FieldErrors; form?: string; invalid?: Field[] } {
  if (error.status === 429) return { form: "Too many attempts. Please wait a moment and try again." };
  if (mode === "sign-in") {
    if (error.code === "BANNED_USER") return { form: "This account has been suspended." };
    // One message for wrong email or password, so accounts can't be probed.
    if (error.status === 401) return { form: "Incorrect email or password.", invalid: FIELDS };
    return { form: "We couldn't sign you in. Please try again." };
  }
  switch (error.code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return {
        fields: {
          email: (
            <>
              An account with this email already exists.{" "}
              <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="link text-fg">
                Sign in instead
              </Link>
            </>
          ),
        },
      };
    case "INVALID_EMAIL":
      return { fields: { email: "Enter a valid email address." } };
    case "VALIDATION_ERROR":
      if (error.message?.includes("email")) {
        return { fields: { email: "Enter a valid email address." } };
      }
      break;
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return { fields: { password: `Use ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.` } };
  }
  return { form: "We couldn't create your account. Please try again." };
}

// `next` is already validated by the page (safeNext), so it's a same-origin path.
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<{ message: string; invalid: Field[] } | null>(null);
  const [pending, setPending] = useState(false);
  // State lags a fast double submit; the ref doesn't.
  const pendingRef = useRef(false);

  function setFieldError(field: Field, message: ReactNode | undefined) {
    setFieldErrors((current) => ({ ...current, [field]: message }));
  }

  function input(field: Field) {
    return formRef.current?.elements.namedItem(field) as HTMLInputElement | null;
  }

  // Don't flag a field while it's first being filled in: check on blur, then live once flagged.
  function onBlur(field: Field, value: string) {
    if (value) setFieldError(field, validate(mode, field, value.trim()));
  }

  function onChange(field: Field, value: string) {
    setFormError(null);
    if (fieldErrors[field]) setFieldError(field, validate(mode, field, value.trim()));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const errors: FieldErrors = {
      email: validate(mode, "email", email),
      password: validate(mode, "password", password),
    };
    setFieldErrors(errors);
    setFormError(null);
    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      input(firstInvalid)?.focus();
      return;
    }

    pendingRef.current = true;
    setPending(true);
    let error: ServerError | null;
    try {
      ({ error } =
        mode === "sign-up"
          ? // Better Auth requires a name; we only ask for email, so it starts empty.
            await authClient.signUp.email({ name: "", email, password })
          : await authClient.signIn.email({ email, password }));
    } catch {
      error = { status: 0 };
    }

    if (error) {
      const result =
        error.status === 0
          ? { form: "We couldn't reach the server. Check your connection and try again." }
          : describeError(mode, error, next);
      if (result.fields) {
        setFieldErrors(result.fields);
        input(FIELDS.find((field) => result.fields?.[field]) ?? "email")?.focus();
      }
      if (result.form) setFormError({ message: result.form, invalid: result.invalid ?? [] });
      pendingRef.current = false;
      setPending(false);
      return;
    }
    // Keep pending until navigation so the button can't be pressed twice.
    router.replace(next);
    router.refresh();
  }

  function describedBy(...ids: (string | false | null | undefined)[]) {
    return ids.filter(Boolean).join(" ") || undefined;
  }

  const hasError = (field: Field) => Boolean(fieldErrors[field]);
  const invalid = (field: Field) =>
    hasError(field) || formError?.invalid.includes(field) ? true : undefined;
  const showHint = mode === "sign-up" && !hasError("password");

  return (
    <form
      ref={formRef}
      // Only reached if submitted before hydration: POST keeps the password out of the URL.
      method="post"
      onSubmit={onSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="flex flex-col gap-6"
    >
      <div>
        <label htmlFor="email" className="type-micro text-fg-muted">
          Email address
        </label>
        <input
          id="email"
          type="email"
          name="email"
          required
          autoComplete="email"
          spellCheck={false}
          placeholder="name@example.com"
          readOnly={pending}
          onBlur={(event) => onBlur("email", event.target.value)}
          onChange={(event) => onChange("email", event.target.value)}
          aria-invalid={invalid("email")}
          aria-describedby={describedBy(
            hasError("email") && "email-error",
            formError?.invalid.includes("email") && "auth-error",
          )}
          className="field"
        />
        {hasError("email") && (
          <p id="email-error" className="type-body-sm mt-2 text-error">
            {fieldErrors.email}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="type-micro text-fg-muted">
          Password
        </label>
        <input
          id="password"
          type="password"
          name="password"
          required
          minLength={mode === "sign-up" ? MIN_PASSWORD : undefined}
          maxLength={MAX_PASSWORD}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          readOnly={pending}
          onBlur={(event) => onBlur("password", event.target.value)}
          onChange={(event) => onChange("password", event.target.value)}
          aria-invalid={invalid("password")}
          aria-describedby={describedBy(
            showHint && "password-hint",
            hasError("password") && "password-error",
            formError?.invalid.includes("password") && "auth-error",
          )}
          className="field"
        />
        {hasError("password") ? (
          <p id="password-error" className="type-body-sm mt-2 text-error">
            {fieldErrors.password}
          </p>
        ) : (
          showHint && (
            <p id="password-hint" className="type-micro mt-2 text-fg-subtle">
              At least {MIN_PASSWORD} characters.
            </p>
          )
        )}
      </div>

      <p id="auth-error" role="alert" className="type-body-sm text-error empty:hidden">
        {formError?.message}
      </p>

      {/* aria-disabled rather than disabled, so focus stays on the button while pending. */}
      <button
        type="submit"
        aria-disabled={pending || undefined}
        className="btn btn-primary w-full"
      >
        {SUBMIT_LABEL[mode][pending ? 1 : 0]}
      </button>
      <p role="status" className="sr-only">
        {pending ? SUBMIT_LABEL[mode][1] : ""}
      </p>
    </form>
  );
}
