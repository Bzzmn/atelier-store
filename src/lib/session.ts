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

export const requireAdmin = cache(async () => {
  // Bypass the cookie cache so a role change applies on the next request.
  const session = await auth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session) redirect("/sign-in?next=/admin");
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
