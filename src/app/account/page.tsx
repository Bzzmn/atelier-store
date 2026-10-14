import type { Metadata } from "next";
import Link from "next/link";

import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "My Account",
  robots: { index: false, follow: false },
};

const memberSince = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

export default async function AccountPage() {
  const { user } = await requireSession("/account");

  return (
    <>
      <h1 className="type-headline">{user.name ? `Hello, ${user.name}` : "My Account"}</h1>
      <p className="type-body mt-3 text-fg-muted">
        Manage your personal details and sign-in settings.
      </p>

      <section aria-labelledby="details-title" className="hairline-t mt-10 pt-8">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="details-title" className="type-label">
            Account details
          </h2>
          <Link href="/account/details" className="type-caption link">
            Edit<span className="sr-only"> account details</span>
          </Link>
        </div>
        <dl className="type-body mt-6 grid grid-cols-[auto_1fr] gap-x-8 gap-y-3">
          {/* Sign-up only asks for email, so the name is often empty. */}
          <dt className="text-fg-muted">Name</dt>
          <dd className={user.name ? undefined : "text-fg-subtle"}>{user.name || "Not added"}</dd>
          <dt className="text-fg-muted">Email</dt>
          <dd className="break-all">{user.email}</dd>
          <dt className="text-fg-muted">Member since</dt>
          <dd>{memberSince.format(user.createdAt)}</dd>
        </dl>
      </section>
    </>
  );
}
