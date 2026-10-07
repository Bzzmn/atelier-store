"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

// Sign-in and sign-up go through authClient (the /api/auth handler) instead of
// server actions: Better Auth's rate limiter only runs on HTTP requests, and
// calling auth.api.signInEmail() directly would bypass it.
export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
