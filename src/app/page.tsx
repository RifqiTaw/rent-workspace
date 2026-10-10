import { ConfigurationSummary } from "@/features/workspace/components/configuration-summary";
import { MobileCheckoutBar } from "@/features/workspace/components/mobile-checkout-bar";
import { ProductPanel } from "@/features/workspace/components/product-panel";
import { WorkspacePreview } from "@/features/workspace/components/workspace-preview";

export default function BuilderPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col gap-6 px-4 pt-6 pb-28 sm:px-6 lg:px-8 xl:pb-10">
      <header className="flex flex-col gap-1.5">
        <p className="text-xs font-medium uppercase tracking-widest text-brand">
          Workspace Builder
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
          Build your Bali workspace, rent it in minutes.
        </h1>
      </header>

      {/*
        Mobile: preview → products → summary.
        Tablet: preview on top, products and summary side by side.
        Desktop: products | preview | summary, with preview as the focus.
      */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[300px_minmax(0,1fr)_320px] xl:items-start 2xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <div className="md:col-span-2 xl:col-span-1 xl:col-start-2 xl:row-start-1 xl:sticky xl:top-22">
          <WorkspacePreview />
        </div>

        <section
          aria-label="Products"
          className="xl:col-start-1 xl:row-start-1"
        >
          <ProductPanel />
        </section>

        <aside className="xl:col-start-3 xl:row-start-1 xl:sticky xl:top-22">
          <ConfigurationSummary />
        </aside>
      </div>

      <MobileCheckoutBar />
    </div>
  );
}
