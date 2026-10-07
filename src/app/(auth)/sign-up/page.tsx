import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AuthForm } from "@/components/auth/auth-form";
import { getSession, safeNext } from "@/lib/session";

export const metadata: Metadata = {
  title: "Create Account",
  robots: { index: false, follow: false },
};

export default async function SignUpPage({ searchParams }: PageProps<"/sign-up">) {
  const next = safeNext((await searchParams).next);
  if (await getSession()) redirect(next);

  return (
    <>
      <h1 className="type-headline text-center">Create Account</h1>
      <p className="type-body mt-3 text-center text-fg-muted">
        Save your details and follow your orders.
      </p>
      <div className="mt-10">
        <AuthForm mode="sign-up" next={next} />
      </div>
      <p className="type-body-sm hairline-t mt-10 pt-6 text-center text-fg-muted">
        Already have an account?{" "}
        <Link href={`/sign-in?next=${encodeURIComponent(next)}`} className="link text-fg">
          Sign in
        </Link>
      </p>
    </>
  );
}
