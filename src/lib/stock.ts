export const LOW_STOCK = 5;

export type StockLevel = "OUT" | "LOW" | "OK";

export function stockLevel(stock: number): StockLevel {
  if (stock <= 0) return "OUT";
  if (stock <= LOW_STOCK) return "LOW";
  return "OK";
}
