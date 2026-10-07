// Placeholder block for loading states. Size it with the line height of the text it
// stands in for (e.g. h-4 for type-caption) so content swaps in without layout shift.
// Decorative only: pair it with a visually hidden role="status" message.
export function Skeleton({ className = "" }: { className?: string }) {
  return <div aria-hidden="true" className={`animate-pulse bg-bg-subtle ${className}`} />;
}
