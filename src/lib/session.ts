import "server-only";

import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

// The only place pages and server actions read the session. Proxy only checks
// that a cookie exists; every protected page and action must call these.

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

export async function requireSession(returnTo: string) {
  const session = await getSession();
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return session;
}

/**
 * Like requireSession, but checked against the database instead of the 5-minute cookie
 * cache, so a revoked session (e.g. after a password change) is refused at once. For pages
 * that show personal data such as order addresses.
 */
export const requireFreshSession = cache(async (returnTo: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  return session;
});

/**
 * Every admin page and admin server action calls this first (src/lib/admin/admin-guard.test.ts
 * enforces it). `returnTo` is where sign-in sends the admin back to.
 */
export const requireAdmin = cache(async (returnTo = "/admin") => {
  // Bypass the cookie cache so a role change applies on the next request.
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) redirect(`/sign-in?next=${encodeURIComponent(returnTo)}`);
  // 404 rather than 403 so the admin area isn't advertised.
  if (session.user.role !== "admin") notFound();
  return session;
});

// Only same-origin paths: "/account" passes, "//evil.com" and URLs don't.
export function safeNext(next: unknown, fallback = "/account") {
  if (typeof next !== "string" || !next.startsWith("/")) return fallback;
  if (next.startsWith("//") || next.startsWith("/\\")) return fallback;
  return next;
}
