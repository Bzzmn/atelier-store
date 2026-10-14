"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Breadcrumbs } from "@/components/breadcrumbs";

const ACCOUNT_LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/details", label: "Account details" },
] as const;

// Section links for the account area: a scrolling tab row on mobile, a sidebar from md.
export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account sections" className="hairline-b md:border-b-0">
      <ul className="scrollbar-none -mx-gutter flex gap-6 overflow-x-auto px-gutter md:mx-0 md:flex-col md:gap-4 md:overflow-visible md:px-0">
        {ACCOUNT_LINKS.map((link) => (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              aria-current={pathname === link.href ? "page" : undefined}
              className="type-label link-quiet block py-3 text-fg-muted aria-[current=page]:text-fg md:py-0"
            >
              {link.label}
            </Link>
          </li>
        ))}
        <li className="ml-auto shrink-0 md:ml-0 md:hairline-t md:mt-4 md:pt-8">
          <SignOutButton className="type-label link-quiet block py-3 text-fg-muted md:py-0" />
        </li>
      </ul>
    </nav>
  );
}

// "Home / My Account / <section>", from the same links as the nav.
export function AccountBreadcrumbs() {
  const pathname = usePathname();
  const section = ACCOUNT_LINKS.find((link) => link.href === pathname && link.href !== "/account");

  return (
    <Breadcrumbs
      items={
        section
          ? [{ label: "My Account", href: "/account" }, { label: section.label }]
          : [{ label: "My Account" }]
      }
    />
  );
}
