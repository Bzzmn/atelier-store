import type { Metadata } from "next";
import Link from "next/link";
import { type ReactNode, Suspense } from "react";

import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProductGrid, ProductGridSkeleton } from "@/components/product/product-grid";
import { SearchForm } from "@/components/search/search-form";
import { SearchResultsGrid } from "@/components/search/search-results-grid";
import { Skeleton } from "@/components/skeleton";
import { getNewArrivals, searchProducts, searchTerms } from "@/lib/catalog";

// What the visitor typed, echoed back into the form (capped like the input's maxLength);
// searchTerms() decides which words of it are actually searched.
async function readQuery(searchParams: PageProps<"/search">["searchParams"]) {
  const { q } = await searchParams;
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 100) ?? "";
}

export async function generateMetadata({ searchParams }: PageProps<"/search">): Promise<Metadata> {
  const terms = searchTerms(await readQuery(searchParams));
  return {
    title: terms.length > 0 ? `“${terms.join(" ")}” – Search` : "Search",
    // Result pages are endless permutations of the catalog; keep them out of the index.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const query = await readQuery(searchParams);

  return (
    <main className="flex-1 pt-header pb-section">
      <div className="page-container pt-10 pb-8 md:pt-14 md:pb-10">
        <Breadcrumbs items={[{ label: "Search" }]} />
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
  const { terms, products, total } = await searchProducts(query);
  const searched = terms.join(" ");

  // Nothing searchable: suggest the newest pieces instead, and say why if something was typed.
  if (terms.length === 0) {
    return (
      <ResultsSection
        title="Suggestions"
        summary={query ? "Type at least 2 letters to search. Showing new arrivals." : "New arrivals"}
      >
        <ProductGrid products={await getNewArrivals(8)} />
      </ResultsSection>
    );
  }

  const summary =
    total === 0
      ? `No results for “${searched}”`
      : `${total} ${total === 1 ? "result" : "results"} for “${searched}”`;

  return (
    <ResultsSection title="Search results" summary={summary}>
      {total > 0 ? (
        <SearchResultsGrid key={searched} query={query} initialProducts={products} total={total} />
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
    </ResultsSection>
  );
}

// The summary is the live region, so screen readers hear every change of results (including
// clearing the search); the heading is visually hidden and worded differently so it isn't
// read twice.
function ResultsSection({
  title,
  summary,
  children,
}: {
  title: string;
  summary: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby="search-results-title">
      <div className="page-container pb-4">
        <h2 id="search-results-title" className="sr-only">
          {title}
        </h2>
        <p role="status" className="type-label">
          {summary}
        </p>
      </div>
      {children}
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
      <ProductGridSkeleton />
    </div>
  );
}
