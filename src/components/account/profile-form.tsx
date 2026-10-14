"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useRef, useState } from "react";

import { authClient } from "@/lib/auth-client";

const MAX_NAME = 100;

type Status = { kind: "success" | "error"; message: string } | null;

// Edits user.name through authClient (the /api/auth handler), which also
// refreshes the session cookie cache with the new name.
export function ProfileForm({ name }: { name: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState(false);
  // State lags a fast double submit; the ref doesn't.
  const pendingRef = useRef(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    const value = String(new FormData(event.currentTarget).get("name") ?? "").trim();
    if (value === name) {
      setStatus({ kind: "success", message: "Your details are up to date." });
      return;
    }

    pendingRef.current = true;
    setPending(true);
    setStatus(null);
    let error: { status: number } | null;
    try {
      ({ error } = await authClient.updateUser({ name: value }));
    } catch {
      error = { status: 0 };
    }
    pendingRef.current = false;
    setPending(false);

    if (!error) {
      setStatus({ kind: "success", message: "Your details have been saved." });
      router.refresh();
      return;
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
            : "We couldn't save your details. Please try again.",
    });
  }

  return (
    <form
      method="post"
      onSubmit={onSubmit}
      noValidate
      aria-busy={pending || undefined}
      className="flex flex-col gap-6"
    >
      <div>
        <label htmlFor="account-name" className="type-micro text-fg-muted">
          Name <span className="text-fg-subtle">(optional)</span>
        </label>
        <input
          id="account-name"
          type="text"
          name="name"
          defaultValue={name}
          maxLength={MAX_NAME}
          autoComplete="name"
          readOnly={pending}
          onChange={() => setStatus(null)}
          aria-describedby={status?.kind === "error" ? "profile-status" : undefined}
          className="field"
        />
      </div>

      <p
        id="profile-status"
        role="status"
        className={`type-body-sm empty:hidden ${status?.kind === "error" ? "text-error" : "text-success"}`}
      >
        {status?.message}
      </p>

      {/* aria-disabled rather than disabled, so focus stays on the button while pending. */}
      <button
        type="submit"
        aria-disabled={pending || undefined}
        className="btn btn-primary w-full sm:w-auto sm:self-start"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
