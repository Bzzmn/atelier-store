export const LOW_STOCK_THRESHOLD = 3;

export type StockState =
  | { status: "in_stock"; label: string }
  | { status: "low_stock"; label: string }
  | { status: "out_of_stock"; label: string };

export function getStockState(stock: number): StockState {
  if (stock <= 0) return { status: "out_of_stock", label: "Out of stock" };
  if (stock <= LOW_STOCK_THRESHOLD) {
    return { status: "low_stock", label: `Only ${stock} left` };
  }
  return { status: "in_stock", label: "In stock" };
}
