import type { Metadata } from "next";

import { SessionKeepAlive } from "@/components/auth/session-keep-alive";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { requireAdmin } from "@/lib/session";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// Placeholder dashboard. Every admin page and admin server action must call
// requireAdmin() itself; proxy.ts only checks that a cookie exists.
export default async function AdminPage() {
  const { user } = await requireAdmin();

  return (
    <main className="flex-1 pt-header pb-section">
      <SessionKeepAlive />
      <div className="page-container pt-10 md:pt-14">
        <p className="type-label text-fg-muted">Admin</p>
        <h1 className="type-headline mt-3">Dashboard</h1>
        <p className="type-body mt-4 text-fg-muted">
          Signed in as {user.email} ({user.role}).
        </p>
        <div className="mt-10">
          <SignOutButton />
        </div>
      </div>
    </main>
  );
}
