import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Sign In",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <>
      <h1 className="type-headline text-center">Sign In</h1>
      <p className="type-body mt-3 text-center text-fg-muted">
        Welcome back. Sign in to view your account.
      </p>
      <div className="mt-10">
        <AuthForm mode="sign-in" next={next} />
      </div>
      <p className="type-body-sm hairline-t mt-10 pt-6 text-center text-fg-muted">
        New to Atelier?{" "}
        <Link href={`/sign-up?next=${encodeURIComponent(next)}`} className="link text-fg">
          Create an account
        </Link>
      </p>
    </>
  );
}
