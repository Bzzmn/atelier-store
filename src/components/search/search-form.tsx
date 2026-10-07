"use client";

import Form from "next/form";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { CloseIcon, SearchIcon } from "@/components/icons";

const DEBOUNCE_MS = 300;

function searchHref(query: string) {
  const q = query.trim();
  return q ? `/search?q=${encodeURIComponent(q)}` : "/search";
}

// GET form to /search that works without JS; with JS, results update as you type.
export function SearchForm({ defaultQuery }: { defaultQuery: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(defaultQuery);
  const [pending, startTransition] = useTransition();
  // The query this form last sent to the URL (trimmed).
  const [lastSearched, setLastSearched] = useState(defaultQuery);
  const [prevDefaultQuery, setPrevDefaultQuery] = useState(defaultQuery);

  // The URL changed without this form (e.g. the header's search link): show its query.
  // Our own searches are skipped so text typed while one is in flight isn't overwritten.
  if (defaultQuery !== prevDefaultQuery) {
    setPrevDefaultQuery(defaultQuery);
    if (defaultQuery !== lastSearched) {
      setQuery(defaultQuery);
      setLastSearched(defaultQuery);
    }
  }

  useEffect(() => {
    const q = query.trim();
    if (q === lastSearched) return;
    const timer = setTimeout(() => {
      setLastSearched(q);
      startTransition(() => router.replace(searchHref(q), { scroll: false }));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, lastSearched, router]);

  return (
    <Form
      action="/search"
      replace
      scroll={false}
      role="search"
      // Enter navigates via next/form; mark it searched so the debounce doesn't repeat it.
      onSubmit={() => setLastSearched(query.trim())}
      className="relative"
    >
      <label htmlFor="search-query" className="type-label text-fg-muted">
        Search products
      </label>
      <div className="relative mt-2">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-0 -translate-y-1/2" />
        <input
          ref={inputRef}
          id="search-query"
          name="q"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Bags, leather, blue…"
          autoComplete="off"
          enterKeyHint="search"
          maxLength={100}
          autoFocus={!defaultQuery}
          className="field px-8 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="btn-icon absolute top-1/2 -right-2 -translate-y-1/2"
            aria-label="Clear search"
          >
            <CloseIcon width={16} height={16} />
          </button>
        )}
      </div>
      {/* Visual hint only; the results count is the live region. */}
      <p aria-hidden="true" className="type-micro mt-2 h-3 text-fg-subtle">
        {pending ? "Searching…" : ""}
      </p>
      <button type="submit" className="sr-only">
        Search
      </button>
    </Form>
  );
}
