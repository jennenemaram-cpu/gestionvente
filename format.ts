export const CURRENCY = "DT";

export function formatPrice(value: number) {
  return `${value.toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ${CURRENCY}`;
}