"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { orderNumber } from "@/lib/checkout-rules";

const ACCOUNT_LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/details", label: "Account details" },
] as const;

/** The section a path belongs to: its own link, or the parent of a nested page (an order). */
function currentSection(pathname: string) {
  return ACCOUNT_LINKS.find(
    (link) => pathname === link.href || (link.href !== "/account" && pathname.startsWith(`${link.href}/`)),
  );
}

// Section links for the account area: a scrolling tab row on mobile, a sidebar from md.
export function AccountNav() {
  const pathname = usePathname();
  const section = currentSection(pathname);

  return (
    <nav aria-label="Account sections" className="hairline-b md:border-b-0">
      <ul className="scrollbar-none -mx-gutter flex gap-6 overflow-x-auto px-gutter md:mx-0 md:flex-col md:gap-4 md:overflow-visible md:px-0">
        {ACCOUNT_LINKS.map((link) => (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
              // "page" on the section itself, "true" on its nested pages (e.g. an order).
              aria-current={pathname === link.href ? "page" : section === link ? "true" : undefined}
              className="type-label link-quiet block py-3 text-fg-muted aria-[current=page]:text-fg aria-[current=true]:text-fg md:py-0"
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

// "Home / My Account / <section> / <order>", from the same links as the nav.
export function AccountBreadcrumbs() {
  const pathname = usePathname();
  const section = currentSection(pathname);
  if (!section || section.href === "/account") return <Breadcrumbs items={[{ label: "My Account" }]} />;

  const account = { label: "My Account", href: "/account" };
  const orderId = pathname.startsWith("/account/orders/") ? pathname.split("/")[3] : undefined;
  return (
    <Breadcrumbs
      items={
        orderId
          ? [account, { label: section.label, href: section.href }, { label: `Order ${orderNumber(orderId)}` }]
          : [account, { label: section.label }]
      }
    />
  );
}
