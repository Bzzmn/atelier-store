"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
import { navigation } from "@/lib/sample-data";

// Routes that open on a full-bleed image and get a transparent header on top.
const OVERLAY_ROUTES = new Set(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.documentElement.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  const transparent = OVERLAY_ROUTES.has(pathname) && !scrolled;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          transparent ? "bg-transparent text-fg-inverse" : "bg-bg text-fg"
        }`}
      >
        <div className="page-container header-bar grid grid-cols-[1fr_auto_1fr] gap-4">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              className="type-label -ml-2 flex items-center gap-2 p-2"
            >
              <MenuIcon />
              <span className="sr-only md:not-sr-only">Menu</span>
            </button>
          </div>

          <Link href="/" className="type-wordmark" aria-label="Atelier home">
            Atelier
          </Link>

          <nav aria-label="Account" className="-mr-2 flex items-center justify-end">
            <Link href="/search" className="hidden p-2 sm:block" aria-label="Search">
              <SearchIcon />
            </Link>
            <Link href="/account" className="p-2" aria-label="Account">
              <UserIcon />
            </Link>
            <Link href="/bag" className="p-2" aria-label="Shopping bag">
              <BagIcon />
            </Link>
          </nav>
        </div>
      </header>

      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!menuOpen}
        className={`fixed inset-0 z-50 ${menuOpen ? "visible" : "invisible"}`}
      >
        <div
          onClick={() => setMenuOpen(false)}
          className={`absolute inset-0 bg-overlay transition-opacity duration-500 ${
            menuOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          className={`absolute inset-y-0 left-0 flex w-full flex-col bg-bg transition-transform duration-500 md:max-w-md ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="header-bar px-gutter">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="type-label -ml-2 flex items-center gap-2 p-2"
            >
              <CloseIcon />
              Close
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto px-gutter py-8">
            <ul className="flex flex-col gap-4">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="type-headline link-quiet"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hairline-t flex flex-col gap-3 px-gutter py-6">
            <Link href="/search" className="type-caption link-quiet">
              Search
            </Link>
            <Link href="/contact" className="type-caption link-quiet">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
