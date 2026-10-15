import type { ReactNode } from "react";

// Hairline data table for the admin lists. It scrolls sideways on narrow screens instead of
// squeezing columns. Cells use the exported class names so rows stay consistent.

export const TH = "type-micro py-3 pr-6 text-left font-medium text-fg-muted last:pr-0";
export const TD = "py-4 pr-6 align-middle last:pr-0";

export function AdminTable({ label, head, children }: { label: string; head: ReactNode; children: ReactNode }) {
  return (
    <div className="-mx-gutter overflow-x-auto px-gutter md:mx-0 md:px-0">
      <table aria-label={label} className="type-body-sm w-full min-w-[40rem] border-collapse tabular-nums">
        <thead className="hairline-b">
          <tr>{head}</tr>
        </thead>
        <tbody className="[&>tr]:hairline-b">{children}</tbody>
      </table>
    </div>
  );
}

/** A table's empty state, or a page's. */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="type-body hairline-t mt-8 pt-8 text-fg-muted">{children}</p>;
}
