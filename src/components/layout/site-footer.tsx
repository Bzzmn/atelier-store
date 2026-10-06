import Link from "next/link";

import { footerLinks } from "@/lib/sample-data";

export function SiteFooter() {
  return (
    <footer className="bg-bg-inverse text-fg-inverse">
      <div className="page-container section-y grid-12 gap-y-10">
        <div className="col-span-4 md:col-span-12 lg:col-span-3">
          <Link href="/" className="type-wordmark">
            Atelier
          </Link>
        </div>
        {footerLinks.map((group) => (
          <div key={group.title} className="col-span-2 md:col-span-4 lg:col-span-3">
            <h2 className="type-label mb-4">{group.title}</h2>
            <ul className="flex flex-col gap-3">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="type-caption link-quiet">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="page-container flex flex-col gap-2 border-t border-white/20 py-6 md:flex-row md:justify-between">
        <p className="type-micro">© {new Date().getFullYear()} Atelier Store. All rights reserved.</p>
        <p className="type-micro">United States · English · USD</p>
      </div>
    </footer>
  );
}
