import type { Metadata } from "next";

import { SessionKeepAlive } from "@/components/auth/session-keep-alive";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

const memberSince = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

export default async function AccountPage() {
  const { user } = await requireSession("/account");

  return (
    <main className="flex-1 pt-header pb-section">
      <SessionKeepAlive />
      <div className="page-container pt-10 md:pt-14">
        <Breadcrumbs items={[{ label: "My Account" }]} />
        <h1 className="type-headline mt-8">{user.name ? `Hello, ${user.name}` : "My Account"}</h1>

        <section aria-labelledby="details-title" className="hairline-t mt-10 max-w-xl pt-8">
          <h2 id="details-title" className="type-label">
            Account details
          </h2>
          <dl className="type-body mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
            {/* Sign-up only asks for email, so the name is often empty. */}
            {user.name && (
              <>
                <dt className="text-fg-muted">Name</dt>
                <dd>{user.name}</dd>
              </>
            )}
            <dt className="text-fg-muted">Email</dt>
            <dd className="break-all">{user.email}</dd>
            <dt className="text-fg-muted">Member since</dt>
            <dd>{memberSince.format(user.createdAt)}</dd>
          </dl>
          <div className="mt-10">
            <SignOutButton />
          </div>
        </section>
      </div>
    </main>
  );
}
