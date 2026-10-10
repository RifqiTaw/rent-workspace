import Link from "next/link";
import { Armchair } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Builder" },
  { href: "/checkout", label: "Summary" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
            <Armchair className="size-4" aria-hidden />
          </span>
          monis.rent
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
