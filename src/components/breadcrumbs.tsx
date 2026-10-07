import Link from "next/link";

export type Crumb = { label: string; href?: string };

// Trail that starts at Home; the last item is the current page.
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="type-micro flex flex-wrap items-center gap-2 text-fg-muted">
        <li>
          <Link href="/" className="link-quiet">
            Home
          </Link>
        </li>
        {items.map((crumb, index) => (
          // Keyed by position: labels can repeat (a product named like its category).
          <li key={index} className="flex items-center gap-2">
            <span aria-hidden="true">/</span>
            {index === items.length - 1 ? (
              <span aria-current="page" className="text-fg">
                {crumb.label}
              </span>
            ) : (
              <Link href={crumb.href ?? "/"} className="link-quiet">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
