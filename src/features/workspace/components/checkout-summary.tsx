"use client";

import Link from "next/link";
import { Info, TriangleAlert } from "lucide-react";
import { useMemo } from "react";
import { buttonVariants } from "@/components/ui/button";
import { PRICING_DISCLAIMER } from "../data/rental-terms";
import { useRentalSummary } from "../hooks/use-rental-summary";
import { useWorkspaceStore } from "../store/workspace-store";
import type { LineItem } from "../types";
import { formatIDR } from "../utils/pricing";
import { formatRentalSummaryText, groupLineItems } from "../utils/rental-summary";
import { CopySummaryButton } from "./copy-summary-button";
import { PriceBreakdown } from "./price-breakdown";
import { ProductThumbnail } from "./product-thumbnail";
import { RentalDurationPicker } from "./rental-duration-picker";

function CheckoutItem({ item }: { item: LineItem }) {
  const { product, quantity, monthlyTotal } = item;
  return (
    <li className="flex items-center gap-4 p-4">
      <ProductThumbnail product={product} className="size-16 sm:size-20" />
      <div className="min-w-0 flex-1">
        <p className="font-medium leading-tight">{product.name}</p>
        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{product.description}</p>
        <p className="mt-1.5 text-xs text-muted-foreground tabular-nums">
          Qty {quantity} × {formatIDR(product.monthlyPrice)} / mo
        </p>
      </div>
      <p className="text-right text-sm font-medium tabular-nums">
        {formatIDR(monthlyTotal)}
        <span className="block text-xs font-normal text-muted-foreground">per month</span>
      </p>
    </li>
  );
}

function CheckoutSkeleton() {
  return (
    <div aria-busy className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <p className="sr-only">Loading your workspace</p>
      {[0, 1].map((column) => (
        <div
          key={column}
          aria-hidden
          className="h-80 animate-pulse rounded-2xl bg-muted motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

function EmptyCheckout() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
      <h2 className="text-lg font-semibold">Your workspace is empty</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        Choose a desk, chair, and accessories in the builder to see your rental estimate here.
      </p>
      <Link href="/" className={buttonVariants({ size: "lg", className: "h-11 px-4" })}>
        Start building
      </Link>
    </div>
  );
}

export function CheckoutSummary() {
  const { hydrated, configuration, lineItems, estimate } = useRentalSummary();
  const setDuration = useWorkspaceStore((state) => state.setDuration);
  const summaryText = useMemo(
    () => formatRentalSummaryText(lineItems, estimate),
    [lineItems, estimate],
  );

  if (!hydrated) return <CheckoutSkeleton />;
  if (lineItems.length === 0) return <EmptyCheckout />;

  const missing = [!configuration.deskId && "desk", !configuration.chairId && "chair"].filter(
    (slot): slot is string => Boolean(slot),
  );

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-6">
        {missing.length > 0 && (
          <div
            role="note"
            className="flex gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              Your workspace has no {missing.join(" or ")} yet. You can still copy this estimate,
              or{" "}
              <Link href="/" className="font-medium underline underline-offset-4">
                edit your workspace
              </Link>{" "}
              to add one.
            </p>
          </div>
        )}

        {groupLineItems(lineItems).map((group) => (
          <section key={group.id} aria-labelledby={`group-${group.id}`} className="flex flex-col gap-3">
            <h2
              id={`group-${group.id}`}
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              {group.label}
            </h2>
            <ul className="divide-y rounded-2xl border bg-card shadow-sm">
              {group.items.map((item) => (
                <CheckoutItem key={item.product.id} item={item} />
              ))}
            </ul>
          </section>
        ))}
      </div>

      <aside
        aria-labelledby="order-summary-heading"
        className="flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-sm lg:sticky lg:top-22"
      >
        <div className="flex items-baseline justify-between gap-2">
          <h2 id="order-summary-heading" className="text-lg font-semibold tracking-tight">
            Order summary
          </h2>
          <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">
            Estimate
          </span>
        </div>

        <RentalDurationPicker value={configuration.durationMonths} onChange={setDuration} />

        <PriceBreakdown
          estimate={estimate}
          ready
          showMonthlyAfterDiscount
          className="border-t pt-4"
        />

        <CopySummaryButton text={summaryText} />

        <div className="flex gap-2.5 rounded-lg bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <p>
            <span className="font-medium text-foreground">Demo estimate.</span> No order, booking,
            or payment is created. {PRICING_DISCLAIMER}
          </p>
        </div>
      </aside>
    </div>
  );
}
