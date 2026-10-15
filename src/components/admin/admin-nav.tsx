"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SignOutButton } from "@/components/auth/sign-out-button";
import { Breadcrumbs, type Crumb } from "@/components/breadcrumbs";
import { orderNumber } from "@/lib/checkout-rules";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/stock", label: "Stock" },
  { href: "/admin/orders", label: "Orders" },
] as const;

/** The section a path belongs to: its own link, or the parent of a nested page. */
function currentSection(pathname: string) {
  return ADMIN_LINKS.find(
    (link) => pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`)),
  );
}

// Same pattern as AccountNav: a scrolling tab row on mobile, a sidebar from md.
export function AdminNav() {
  const pathname = usePathname();
  const section = currentSection(pathname);

  return (
    <nav aria-label="Admin sections" className="hairline-b md:border-b-0">
      <ul className="scrollbar-none -mx-gutter flex gap-6 overflow-x-auto px-gutter md:mx-0 md:flex-col md:gap-4 md:overflow-visible md:px-0">
        {ADMIN_LINKS.map((link) => (
          <li key={link.href} className="shrink-0">
            <Link
              href={link.href}
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

/** The last crumb for pages below a section. */
function leafLabel(pathname: string): string | undefined {
  if (pathname === "/admin/products/new") return "New product";
  const [, , section, id] = pathname.split("/");
  if (!id) return undefined;
  if (section === "products") return "Edit product";
  if (section === "orders") return `Order ${orderNumber(id)}`;
  return undefined;
}

// "Home / Admin / <section> / <page>", from the same links as the nav.
export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const section = currentSection(pathname);
  if (!section || section.href === "/admin") return <Breadcrumbs items={[{ label: "Admin" }]} />;

  const leaf = leafLabel(pathname);
  const items: Crumb[] = [{ label: "Admin", href: "/admin" }];
  items.push(leaf ? { label: section.label, href: section.href } : { label: section.label });
  if (leaf) items.push({ label: leaf });
  return <Breadcrumbs items={items} />;
}
