import { getProductById } from "../data/catalog";
import { DURATION_DISCOUNT_RATES } from "../data/rental-terms";
import type {
  LineItem,
  Product,
  RentalDuration,
  RentalEstimate,
  WorkspaceConfiguration,
} from "../types";

/** Resolves a configuration into priced line items: desk, chair, then accessories. */
export function getLineItems(config: WorkspaceConfiguration): LineItem[] {
  const entries: [string, number][] = [];
  if (config.deskId) entries.push([config.deskId, 1]);
  if (config.chairId) entries.push([config.chairId, 1]);
  entries.push(...Object.entries(config.accessories));

  return entries.flatMap(([id, quantity]) => {
    const product: Product | undefined = getProductById(id);
    if (!product || quantity <= 0) return [];
    return [{ product, quantity, monthlyTotal: product.monthlyPrice * quantity }];
  });
}

export function getMonthlySubtotal(items: readonly LineItem[]): number {
  return items.reduce((sum, item) => sum + item.monthlyTotal, 0);
}

export function getRentalEstimate(
  items: readonly LineItem[],
  durationMonths: RentalDuration,
): RentalEstimate {
  const monthlySubtotal = getMonthlySubtotal(items);
  const discountRate = DURATION_DISCOUNT_RATES[durationMonths];
  const gross = monthlySubtotal * durationMonths;
  const discountAmount = Math.round(gross * discountRate);

  const total = gross - discountAmount;

  return {
    monthlySubtotal,
    durationMonths,
    discountRate,
    discountAmount,
    monthlyAfterDiscount: Math.round(total / durationMonths),
    total,
  };
}

const idrFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export function formatIDR(amount: number): string {
  return idrFormatter.format(amount);
}
