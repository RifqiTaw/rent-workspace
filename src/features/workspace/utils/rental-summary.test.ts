import { describe, expect, it } from "vitest";
import { ACCESSORIES, CHAIRS, DESKS } from "../data/catalog";
import { PRICING_DISCLAIMER } from "../data/rental-terms";
import type { WorkspaceConfiguration } from "../types";
import { getLineItems, getRentalEstimate } from "./pricing";
import { formatRentalSummaryText, groupLineItems } from "./rental-summary";

const [monitor27, monitor24, lamp] = ACCESSORIES;
const config: WorkspaceConfiguration = {
  deskId: DESKS[1].id,
  chairId: null,
  accessories: { [monitor27.id]: 1, [monitor24.id]: 1, [lamp.id]: 1 },
  durationMonths: 6,
};
const items = getLineItems(config);

describe("groupLineItems", () => {
  it("groups by category and omits empty groups", () => {
    const groups = groupLineItems(items);
    expect(groups.map((g) => [g.id, g.items.length])).toEqual([
      ["desk", 1],
      ["accessory", 3],
    ]);
  });
});

describe("formatRentalSummaryText", () => {
  it("lists products, quantities, duration and pricing", () => {
    const full = getLineItems({
      ...config,
      chairId: CHAIRS[0].id,
      accessories: { [monitor27.id]: 2 },
    });
    const text = formatRentalSummaryText(full, getRentalEstimate(full, 6));

    expect(text).toBe(
      [
        "monis.rent: Workspace rental estimate (demo)",
        "",
        "Desk",
        "- 1 × Walnut Minimal Desk: Rp 320.000/mo",
        "",
        "Chair",
        "- 1 × Ergo Mesh Chair: Rp 280.000/mo",
        "",
        "Accessories",
        '- 2 × 27" 4K Monitor: Rp 600.000/mo (Rp 300.000 each)',
        "",
        "Rental duration: 6 months",
        "Monthly subtotal: Rp 1.200.000",
        "Long-term discount (10%): -Rp 720.000",
        "Estimated monthly cost: Rp 1.080.000",
        "Estimated total: Rp 6.480.000",
        "",
        PRICING_DISCLAIMER,
        "This is a demo estimate, not an order or booking.",
      ].join("\n"),
    );
  });

  it("omits the discount line for a one-month rental and uses plain spaces", () => {
    const text = formatRentalSummaryText(items, getRentalEstimate(items, 1));
    expect(text).toContain("Rental duration: 1 month\n");
    expect(text).not.toContain("discount (");
    expect(text).not.toContain(" ");
  });
});
