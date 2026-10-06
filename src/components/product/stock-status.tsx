import { getStockState } from "@/lib/stock";

const dotStyles = {
  in_stock: "bg-success",
  low_stock: "bg-error",
  out_of_stock: "border border-fg-subtle",
} as const;

export function StockStatus({ stock }: { stock: number }) {
  const { status, label } = getStockState(stock);

  return (
    <p className="type-caption flex items-center gap-2">
      <span aria-hidden="true" className={`size-1.5 rounded-full ${dotStyles[status]}`} />
      <span className={status === "out_of_stock" ? "text-fg-subtle" : undefined}>{label}</span>
    </p>
  );
}
