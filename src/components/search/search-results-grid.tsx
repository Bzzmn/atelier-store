"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { ProductGrid } from "@/components/product/product-grid";
import type { ProductSummary } from "@/lib/catalog";

type SearchResultsGridProps = {
  query: string;
  initialProducts: ProductSummary[];
  total: number;
};

type SearchPage = { products: ProductSummary[]; total: number };

// First page of results, rendered on the server; "Show more" fetches only the next page and
// appends it. Remount (key) it when the query changes.
export function SearchResultsGrid({ query, initialProducts, total: initialTotal }: SearchResultsGridProps) {
  const [products, setProducts] = useState(initialProducts);
  const [total, setTotal] = useState(initialTotal);
  // Rows the server has sent, duplicates included. Paging by this rather than by unique cards
  // means a page of duplicates (the catalog shifted between clicks) still moves forward.
  const [fetched, setFetched] = useState(initialProducts.length);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  // Where focus goes after a load: the first new card (by index), or the status line.
  const focusTarget = useRef<number | "status" | null>(null);

  // Keyboard and screen-reader users land on what just loaded, never on a removed button.
  useEffect(() => {
    const target = focusTarget.current;
    if (target === null) return;
    focusTarget.current = null;
    if (target === "status") statusRef.current?.focus();
    else containerRef.current?.querySelectorAll<HTMLElement>("li > a")[target]?.focus();
  }, [products, fetched]);

  const hasMore = fetched < total;

  function showMore() {
    if (pending) return;
    setError(false);
    startTransition(async () => {
      try {
        const params = new URLSearchParams({ q: query, offset: String(fetched) });
        const response = await fetch(`/api/search?${params}`);
        if (!response.ok) throw new Error(`Search failed: ${response.status}`);
        const page: SearchPage = await response.json();

        const seen = new Set(products.map((product) => product.slug));
        const fresh = page.products.filter((product) => !seen.has(product.slug));
        startTransition(() => {
          if (page.products.length === 0) {
            // Nothing past this offset any more (matches were removed): stop here.
            setTotal(fetched);
            focusTarget.current = "status";
          } else {
            setTotal(page.total);
            focusTarget.current = fresh.length > 0 ? products.length : "status";
          }
          setFetched(fetched + page.products.length);
          setProducts([...products, ...fresh]);
        });
      } catch {
        setError(true);
      }
    });
  }

  return (
    <div ref={containerRef}>
      <ProductGrid products={products} />
      {initialTotal > initialProducts.length && (
        <div className="page-container flex flex-col items-center gap-4 pt-10">
          {/* Live region: announces each load. Focusable so focus has somewhere to go when
              the button disappears. */}
          <p
            ref={statusRef}
            role="status"
            tabIndex={-1}
            className="type-caption text-fg-muted outline-none"
          >
            {error
              ? "More pieces couldn’t be loaded. Please try again."
              : `Showing ${products.length} of ${Math.max(total, products.length)}`}
          </p>
          {hasMore && (
            <button
              type="button"
              onClick={showMore}
              aria-disabled={pending}
              className="btn btn-secondary"
            >
              {pending ? "Loading…" : "Show more"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
