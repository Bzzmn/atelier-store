import type { OrderStatus as Status } from "@/db/schema";

// Payment status as customers read it. Same dot-and-label pattern as StockStatus: the dot is
// decorative, the label carries the meaning. It inherits the surrounding type style.
const STATUSES: Partial<Record<Status, { label: string; dot: string }>> = {
  paid: { label: "Paid", dot: "bg-success" },
  processing: { label: "Payment processing", dot: "border border-fg-subtle" },
  needs_review: { label: "Under review", dot: "border border-fg-subtle" },
  failed: { label: "Payment failed", dot: "bg-error" },
  pending: { label: "Awaiting payment", dot: "border border-fg-subtle" },
};

function orderStatusLabel(status: Status) {
  return STATUSES[status]?.label ?? "Not completed";
}

export function OrderStatus({ status }: { status: Status }) {
  const style = STATUSES[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`size-1.5 shrink-0 rounded-full ${style?.dot ?? "border border-fg-subtle"}`} />
      {orderStatusLabel(status)}
    </span>
  );
}
