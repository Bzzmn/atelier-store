import type { Metadata } from "next";

import { PasswordForm } from "@/components/account/password-form";
import { ProfileForm } from "@/components/account/profile-form";
import { requireSession } from "@/lib/session";

export const metadata: Metadata = {
  title: "Account Details",
  robots: { index: false, follow: false },
};

export default async function AccountDetailsPage() {
  const { user } = await requireSession("/account/details");

  return (
    <>
      <h1 className="type-headline">Account details</h1>

      <section aria-labelledby="profile-title" className="hairline-t mt-10 pt-8">
        <h2 id="profile-title" className="type-label">
          Personal information
        </h2>
        <div className="mt-6 max-w-md">
          <p className="type-micro text-fg-muted">Email address</p>
          <p className="type-body mt-2 break-all">{user.email}</p>
          <p className="type-body-sm mt-2 text-fg-subtle">
            Your email is your sign-in and can&apos;t be changed here.
          </p>
          <div className="mt-8">
            <ProfileForm name={user.name} />
          </div>
        </div>
      </section>

      <section aria-labelledby="password-title" className="hairline-t mt-12 pt-8">
        <h2 id="password-title" className="type-label">
          Password
        </h2>
        <p className="type-body-sm mt-3 text-fg-muted">
          Changing your password signs you out on your other devices.
        </p>
        <div className="mt-6 max-w-md">
          <PasswordForm email={user.email} />
        </div>
      </section>
    </>
  );
}
