import Link from "next/link";
import { Armchair } from "lucide-react";
import { SiteNav } from "./site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex h-10 items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Armchair className="size-4" aria-hidden />
          </span>
          monis.rent
        </Link>
        <SiteNav />
      </div>
    </header>
  );
}
