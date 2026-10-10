"use client";

import { useRentalSummary } from "../hooks/use-rental-summary";
import { formatIDR } from "../utils/pricing";
import { CheckoutLink } from "./checkout-link";

/** Always-visible checkout action for small and medium screens. */
export function MobileCheckoutBar() {
  const { hydrated, lineItems, estimate } = useRentalSummary();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur xl:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">
            Estimated total · {estimate.durationMonths} mo
          </p>
          <p className="truncate text-lg font-semibold tracking-tight tabular-nums">
            {hydrated ? formatIDR(estimate.total) : "—"}
          </p>
        </div>
        <CheckoutLink
          enabled={hydrated && lineItems.length > 0}
          label="Checkout"
          className="shrink-0"
        />
      </div>
    </div>
  );
}
