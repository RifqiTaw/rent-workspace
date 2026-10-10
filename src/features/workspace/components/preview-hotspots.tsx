import { Plus } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AccessoryProduct } from "../types";
import { formatIDR } from "../utils/pricing";
import type { PreviewHotspot } from "../utils/preview";
import { ProductThumbnail } from "./product-thumbnail";

const HOTSPOT_BUTTON =
  "pointer-events-auto absolute flex h-10 min-w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1.5 rounded-full border border-dashed border-brand/70 bg-background/90 px-2.5 text-xs font-medium whitespace-nowrap text-brand shadow-sm backdrop-blur-sm outline-none transition-[left,top,background-color,color,border-color] duration-500 ease-out hover:border-solid hover:bg-brand hover:text-brand-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:border-solid data-popup-open:bg-brand data-popup-open:text-brand-foreground motion-safe:animate-hotspot-pulse motion-reduce:transition-none sm:h-9 sm:px-3";

function HotspotContent({ label }: { label: string }) {
  return (
    <>
      <Plus className="size-4" aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </>
  );
}

interface PreviewHotspotsProps {
  hotspots: readonly PreviewHotspot[];
  onAdd: (product: AccessoryProduct) => void;
}

/**
 * "+ add" buttons placed on the free slots of the scene. A kind with several
 * models (monitors) opens a small picker; a single product is added directly.
 */
export function PreviewHotspots({ hotspots, onAdd }: PreviewHotspotsProps) {
  const [openKind, setOpenKind] = useState<string | null>(null);

  return (
    <div className="pointer-events-none absolute inset-0 z-50">
      {hotspots.map(({ kind, label, left, top, products }) => {
        const style: CSSProperties = { left: `${left}%`, top: `${top}%` };

        if (products.length === 1) {
          const [product] = products;
          return (
            <button
              key={kind}
              type="button"
              style={style}
              className={HOTSPOT_BUTTON}
              aria-label={`${label}: ${product.name}, ${formatIDR(product.monthlyPrice)} per month`}
              onClick={() => onAdd(product)}
            >
              <HotspotContent label={label} />
            </button>
          );
        }

        return (
          <Popover
            key={kind}
            open={openKind === kind}
            onOpenChange={(open) => setOpenKind(open ? kind : null)}
          >
            <PopoverTrigger
              style={style}
              className={HOTSPOT_BUTTON}
              aria-label={`${label}: choose a model`}
            >
              <HotspotContent label={label} />
            </PopoverTrigger>
            <PopoverContent className="w-64 gap-0 p-1.5">
              <p className="px-2 pt-1 pb-1.5 text-xs font-medium text-muted-foreground">
                {label}
              </p>
              {products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-md p-2 text-left outline-none transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                  onClick={() => {
                    setOpenKind(null);
                    onAdd(product);
                  }}
                >
                  <ProductThumbnail product={product} className="size-10" />
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{product.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {formatIDR(product.monthlyPrice)} / mo
                    </span>
                  </span>
                </button>
              ))}
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
