import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CheckoutSummary } from "@/features/workspace/components/checkout-summary";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 pt-6 pb-16 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-widest text-brand">Checkout</p>
          <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
            Review your rental
          </h1>
        </div>
        <Link
          href="/"
          className={buttonVariants({
            variant: "outline",
            size: "lg",
            className: "h-10 self-start px-3.5 sm:self-auto",
          })}
        >
          <ArrowLeft data-icon="inline-start" />
          Edit Workspace
        </Link>
      </header>

      <CheckoutSummary />
    </div>
  );
}
