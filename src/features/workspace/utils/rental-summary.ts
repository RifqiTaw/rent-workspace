import { PRICING_DISCLAIMER } from "../data/rental-terms";
import type { LineItem, RentalEstimate } from "../types";
import { formatIDR } from "./pricing";

export interface LineItemGroup {
  id: "desk" | "chair" | "accessory";
  label: string;
  items: LineItem[];
}

const GROUPS: readonly Omit<LineItemGroup, "items">[] = [
  { id: "desk", label: "Desk" },
  { id: "chair", label: "Chair" },
  { id: "accessory", label: "Accessories" },
];

/** Splits line items into desk / chair / accessory groups, dropping empty ones. */
export function groupLineItems(lineItems: readonly LineItem[]): LineItemGroup[] {
  return GROUPS.map((group) => ({
    ...group,
    items: lineItems.filter((item) => item.product.category === group.id),
  })).filter((group) => group.items.length > 0);
}

/** `Intl` uses a non-breaking space after "Rp"; plain text gets a normal one. */
const plainIDR = (amount: number) => formatIDR(amount).replace(/ /g, " ");

/** Readable plain-text rental summary for sharing via the clipboard. */
export function formatRentalSummaryText(
  lineItems: readonly LineItem[],
  estimate: RentalEstimate,
): string {
  const months = estimate.durationMonths;
  const lines = ["monis.rent: Workspace rental estimate (demo)", ""];

  for (const group of groupLineItems(lineItems)) {
    lines.push(group.label);
    for (const { product, quantity, monthlyTotal } of group.items) {
      const each = quantity > 1 ? ` (${plainIDR(product.monthlyPrice)} each)` : "";
      lines.push(`- ${quantity} × ${product.name}: ${plainIDR(monthlyTotal)}/mo${each}`);
    }
    lines.push("");
  }

  lines.push(
    `Rental duration: ${months} ${months === 1 ? "month" : "months"}`,
    `Monthly subtotal: ${plainIDR(estimate.monthlySubtotal)}`,
  );
  if (estimate.discountAmount > 0) {
    lines.push(
      `Long-term discount (${Math.round(estimate.discountRate * 100)}%): -${plainIDR(estimate.discountAmount)}`,
    );
  }
  lines.push(
    `Estimated monthly cost: ${plainIDR(estimate.monthlyAfterDiscount)}`,
    `Estimated total: ${plainIDR(estimate.total)}`,
    "",
    PRICING_DISCLAIMER,
    "This is a demo estimate, not an order or booking.",
  );

  return lines.join("\n");
}
