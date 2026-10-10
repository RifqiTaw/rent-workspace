import type { RentalDuration } from "../types";

export const RENTAL_DURATIONS = [1, 3, 6, 12] as const satisfies readonly RentalDuration[];

/** Mock long-term discounts, applied to the whole rental period. */
export const DURATION_DISCOUNT_RATES: Readonly<Record<RentalDuration, number>> = {
  1: 0,
  3: 0.05,
  6: 0.1,
  12: 0.15,
};

export const PRICING_DISCLAIMER =
  "Prices are mock estimates for demonstration only and are not official monis.rent prices.";
