import { describe, expect, it } from "vitest";
import { ACCESSORIES, CHAIRS, DESKS } from "../data/catalog";
import type { WorkspaceConfiguration } from "../types";
import { getLineItems, getMonthlySubtotal, getRentalEstimate } from "./pricing";

const [desk] = DESKS;
const [chair] = CHAIRS;
const [monitor] = ACCESSORIES;

const config: WorkspaceConfiguration = {
  deskId: desk.id,
  chairId: chair.id,
  accessories: { [monitor.id]: 2 },
  durationMonths: 1,
};

describe("getLineItems", () => {
  it("resolves desk, chair and accessories with quantities", () => {
    const items = getLineItems(config);
    expect(items.map((i) => [i.product.id, i.quantity])).toEqual([
      [desk.id, 1],
      [chair.id, 1],
      [monitor.id, 2],
    ]);
    expect(items[2].monthlyTotal).toBe(monitor.monthlyPrice * 2);
  });

  it("skips empty slots, unknown IDs and zero quantities", () => {
    const items = getLineItems({
      ...config,
      deskId: null,
      chairId: "does-not-exist",
      accessories: { [monitor.id]: 0, ghost: 3 },
    });
    expect(items).toEqual([]);
  });
});

describe("getRentalEstimate", () => {
  const monthly = desk.monthlyPrice + chair.monthlyPrice + monitor.monthlyPrice * 2;

  it("sums the monthly subtotal", () => {
    expect(getMonthlySubtotal(getLineItems(config))).toBe(monthly);
  });

  it("has no discount for a single month", () => {
    const estimate = getRentalEstimate(getLineItems(config), 1);
    expect(estimate).toMatchObject({ discountRate: 0, discountAmount: 0, total: monthly });
  });

  it("applies the duration discount to the whole period", () => {
    const estimate = getRentalEstimate(getLineItems(config), 12);
    const gross = monthly * 12;
    expect(estimate.discountRate).toBe(0.15);
    expect(estimate.discountAmount).toBe(Math.round(gross * 0.15));
    expect(estimate.total).toBe(gross - estimate.discountAmount);
  });

  it("returns zero for an empty configuration", () => {
    expect(getRentalEstimate([], 6).total).toBe(0);
  });
});
