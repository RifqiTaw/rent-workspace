import { Check } from "lucide-react";
import type { Product } from "../types";
import { formatIDR } from "../utils/pricing";
import { ProductThumbnail } from "./product-thumbnail";

interface SelectableProductCardProps {
  product: Product;
  /** Radio group name; cards sharing a name replace each other. */
  name: string;
  checked: boolean;
  onSelect: (id: string) => void;
}

/** Single-choice product card backed by a native radio for keyboard support. */
export function SelectableProductCard({
  product,
  name,
  checked,
  onSelect,
}: SelectableProductCardProps) {
  return (
    <label className="group relative flex cursor-pointer items-center gap-3 rounded-xl border bg-card p-3 transition-[border-color,background-color,box-shadow] hover:border-foreground/25 hover:shadow-sm has-checked:border-brand has-checked:bg-brand-soft/50 has-checked:shadow-sm has-focus-visible:ring-3 has-focus-visible:ring-ring/50 has-disabled:cursor-not-allowed has-disabled:opacity-60">
      <input
        type="radio"
        name={name}
        value={product.id}
        checked={checked}
        onChange={() => onSelect(product.id)}
        className="sr-only"
      />
      <ProductThumbnail product={product} className="size-16" />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium leading-tight">{product.name}</span>
        <span className="line-clamp-2 text-xs text-muted-foreground">{product.description}</span>
        <span className="mt-1 text-sm font-medium tabular-nums">
          {formatIDR(product.monthlyPrice)}
          <span className="font-normal text-muted-foreground"> / mo</span>
        </span>
      </span>
      <span
        aria-hidden
        className="flex size-5 shrink-0 items-center justify-center self-start rounded-full border border-border bg-background text-brand-foreground transition-colors group-has-checked:border-brand group-has-checked:bg-brand"
      >
        <Check className="size-3 scale-50 opacity-0 transition-[opacity,scale] duration-200 group-has-checked:scale-100 group-has-checked:opacity-100 motion-reduce:transition-none" />
      </span>
    </label>
  );
}
