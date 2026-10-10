import { cn } from "@/lib/utils";
import type { RentalEstimate } from "../types";
import { formatIDR } from "../utils/pricing";

const PLACEHOLDER = "—";

interface PriceBreakdownProps {
  estimate: RentalEstimate;
  /** When false, amounts render as placeholders (e.g. before hydration). */
  ready: boolean;
  /** Also show the average monthly cost after the duration discount. */
  showMonthlyAfterDiscount?: boolean;
  className?: string;
}

/** Pricing lines shared by the builder summary and checkout. */
export function PriceBreakdown({
  estimate,
  ready,
  showMonthlyAfterDiscount = false,
  className,
}: PriceBreakdownProps) {
  const money = (amount: number) => (ready ? formatIDR(amount) : PLACEHOLDER);
  const months = estimate.durationMonths;

  return (
    <dl className={cn("flex flex-col gap-2 text-sm", className)}>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Monthly estimate</dt>
        <dd className="tabular-nums">{money(estimate.monthlySubtotal)}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted-foreground">Duration</dt>
        <dd className="tabular-nums">
          {months} {months === 1 ? "month" : "months"}
        </dd>
      </div>
      {estimate.discountAmount > 0 && (
        <div className="flex justify-between gap-4 text-brand">
          <dt>Long-term discount ({Math.round(estimate.discountRate * 100)}%)</dt>
          <dd className="tabular-nums">−{money(estimate.discountAmount)}</dd>
        </div>
      )}
      {showMonthlyAfterDiscount && (
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Estimated monthly cost</dt>
          <dd className="tabular-nums">{money(estimate.monthlyAfterDiscount)}</dd>
        </div>
      )}
      <div className="mt-2 flex items-end justify-between gap-4 border-t pt-4">
        <dt className="font-medium">Estimated total</dt>
        <dd className="text-2xl font-semibold tracking-tight tabular-nums" aria-live="polite">
          {money(estimate.total)}
        </dd>
      </div>
    </dl>
  );
}
