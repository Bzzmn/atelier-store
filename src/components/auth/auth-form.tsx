"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { authClient } from "@/lib/auth-client";

type Mode = "sign-in" | "sign-up";

const SUBMIT_LABEL = {
  "sign-in": ["Sign in", "Signing in…"],
  "sign-up": ["Create account", "Creating account…"],
} as const;

const MIN_PASSWORD = 8;
const MAX_PASSWORD = 128;

function errorMessage(mode: Mode, error: { code?: string; status: number }) {
  if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
  if (mode === "sign-in") {
    // One message for wrong email or password, so accounts can't be probed.
    return error.code === "BANNED_USER"
      ? "This account has been suspended."
      : "Incorrect email or password.";
  }
  switch (error.code) {
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists.";
    case "INVALID_EMAIL":
      return "Enter a valid email address.";
    case "PASSWORD_TOO_SHORT":
    case "PASSWORD_TOO_LONG":
      return `Use a password of ${MIN_PASSWORD} to ${MAX_PASSWORD} characters.`;
    default:
      return "We couldn't create your account. Please try again.";
  }
}

// `next` is already validated by the page (safeNext), so it's a same-origin path.
export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    setPending(true);
    setError(null);
    const { error } =
      mode === "sign-up"
        ? // Better Auth requires a name; we only ask for email, so it starts empty.
          await authClient.signUp.email({ name: "", email, password })
        : await authClient.signIn.email({ email, password });

    if (error) {
      setError(errorMessage(mode, error));
      setPending(false);
      return;
    }
    // Keep pending until navigation so the button can't be pressed twice.
    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <label className="block">
        <span className="type-micro text-fg-muted">Email address</span>
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="name@example.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "auth-error" : undefined}
          className="field"
        />
      </label>
      <label className="block">
        <span className="type-micro text-fg-muted">Password</span>
        <input
          type="password"
          name="password"
          required
          minLength={mode === "sign-up" ? MIN_PASSWORD : undefined}
          maxLength={MAX_PASSWORD}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            [mode === "sign-up" && "password-hint", error && "auth-error"]
              .filter(Boolean)
              .join(" ") || undefined
          }
          className="field"
        />
        {mode === "sign-up" && (
          <span id="password-hint" className="type-micro mt-2 block text-fg-subtle">
            At least {MIN_PASSWORD} characters.
          </span>
        )}
      </label>

      <p id="auth-error" role="alert" className="type-body-sm text-error empty:hidden">
        {error}
      </p>

      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {SUBMIT_LABEL[mode][pending ? 1 : 0]}
      </button>
    </form>
  );
}
