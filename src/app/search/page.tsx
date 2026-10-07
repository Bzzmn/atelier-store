import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { ProductCard } from "@/components/product/product-card";
import { ProductCardSkeleton } from "@/components/product/product-card-skeleton";
import { SearchForm } from "@/components/search/search-form";
import { Skeleton } from "@/components/skeleton";
import { getNewArrivals, searchProducts } from "@/lib/catalog";

function readQuery(q: string | string[] | undefined) {
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const query = readQuery((await searchParams).q);
  return {
    title: query ? `“${query}” – Search` : "Search",
    // Result pages are endless permutations of the catalog; keep them out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = readQuery((await searchParams).q);

  return (
    <main className="flex-1 pt-header pb-section">
      <div className="page-container pt-10 pb-8 md:pt-14 md:pb-10">
        <nav aria-label="Breadcrumb">
          <ol className="type-micro flex flex-wrap items-center gap-2 text-fg-muted">
            <li>
              <Link href="/" className="link-quiet">
                Home
              </Link>
            </li>
            <li className="flex items-center gap-2">
              <span aria-hidden="true">/</span>
              <span aria-current="page" className="text-fg">
                Search
              </span>
            </li>
          </ol>
        </nav>

        <h1 className="type-headline mt-8">Search</h1>
        <div className="mt-6 max-w-xl">
          <SearchForm defaultQuery={query} />
        </div>
      </div>

      <Suspense fallback={<ResultsSkeleton />}>
        <SearchResults query={query} />
      </Suspense>
    </main>
  );
}

async function SearchResults({ query }: { query: string }) {
  const products = query ? await searchProducts(query) : await getNewArrivals(8);

  let summary: string;
  if (!query) summary = "New arrivals";
  else if (products.length === 0) summary = `No results for “${query}”`;
  else summary = `${products.length} ${products.length === 1 ? "result" : "results"} for “${query}”`;

  return (
    <section aria-labelledby="search-results-title">
      <div className="page-container pb-4">
        <h2 id="search-results-title" className="sr-only">
          {query ? "Search results" : "New arrivals"}
        </h2>
        <p role="status" className="type-label">
          {summary}
        </p>
      </div>

      {products.length > 0 ? (
        <ul className="product-grid hairline-t">
          {products.map((product, index) => (
            <li key={product.slug}>
              <ProductCard product={product} preload={index < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="prose-container section-y hairline-t flex flex-col items-center text-center">
          <p className="type-body text-fg-muted">
            Check the spelling, or try a broader term like a category or color.
          </p>
          <Link href="/shop/new" className="btn btn-secondary mt-8">
            Shop New Arrivals
          </Link>
        </div>
      )}
    </section>
  );
}

// Matches SearchResults: summary line over a grid of card placeholders.
function ResultsSkeleton() {
  return (
    <div aria-busy="true">
      <p role="status" className="sr-only">
        Loading products…
      </p>
      <div className="page-container pb-4">
        <Skeleton className="h-4 w-40" />
      </div>
      <ul aria-hidden="true" className="product-grid hairline-t">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index}>
            <ProductCardSkeleton />
          </li>
        ))}
      </ul>
    </div>
  );
}
