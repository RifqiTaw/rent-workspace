"use client";

import { PRICING_DISCLAIMER } from "../data/rental-terms";
import { useRentalSummary } from "../hooks/use-rental-summary";
import { useWorkspaceStore } from "../store/workspace-store";
import type { LineItem } from "../types";
import { formatIDR } from "../utils/pricing";
import { CheckoutLink } from "./checkout-link";
import { PriceBreakdown } from "./price-breakdown";
import { ProductThumbnail } from "./product-thumbnail";
import { RentalDurationPicker } from "./rental-duration-picker";

function SummaryRow({ item }: { item: LineItem }) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <ProductThumbnail product={item.product} className="size-10" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {item.quantity > 1 && <span className="tabular-nums">{item.quantity} × </span>}
          {item.product.name}
        </p>
        <p className="text-xs text-muted-foreground capitalize">
          {item.product.category === "accessory" ? item.product.kind : item.product.category}
        </p>
      </div>
      <p className="text-sm tabular-nums">{formatIDR(item.monthlyTotal)}</p>
    </li>
  );
}

export function ConfigurationSummary() {
  const { hydrated, configuration, lineItems, estimate } = useRentalSummary();
  const setDuration = useWorkspaceStore((state) => state.setDuration);

  return (
    <section
      aria-labelledby="summary-heading"
      className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm xl:max-h-[calc(100dvh-7rem)]"
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="summary-heading" className="text-lg font-semibold tracking-tight">
          Your workspace
        </h2>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
          Estimate
        </span>
      </div>

      {/* On desktop the panel is capped to the viewport; only this list scrolls,
          so the total and checkout action stay visible. */}
      <div className="-mx-1 min-h-0 overflow-y-auto px-1">
        {!hydrated ? (
          <div className="flex flex-col gap-3" aria-hidden>
            {[0, 1, 2].map((row) => (
              <div key={row} className="h-10 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
            ))}
          </div>
        ) : lineItems.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Your workspace is empty. Choose a desk to get started.
          </p>
        ) : (
          <ul className="divide-y" aria-label="Selected items">
            {lineItems.map((item) => (
              <SummaryRow key={item.product.id} item={item} />
            ))}
          </ul>
        )}
      </div>

      <RentalDurationPicker
        value={configuration.durationMonths}
        disabled={!hydrated}
        onChange={setDuration}
      />

      <PriceBreakdown estimate={estimate} ready={hydrated} className="border-t pt-4" />

      <CheckoutLink enabled={hydrated && lineItems.length > 0} className="w-full" />

      <p className="text-xs leading-relaxed text-muted-foreground">{PRICING_DISCLAIMER}</p>
    </section>
  );
}
