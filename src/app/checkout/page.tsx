import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout",
};

export default function CheckoutPage() {
  return (
    <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center gap-3 px-4 py-16 sm:px-6 lg:px-8">
      <p className="text-sm font-medium uppercase tracking-widest text-brand">
        Checkout
      </p>
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Review your rental.
      </h1>
      <p className="max-w-xl text-muted-foreground">
        The configuration summary and estimated cost will live here.
      </p>
    </section>
  );
}
