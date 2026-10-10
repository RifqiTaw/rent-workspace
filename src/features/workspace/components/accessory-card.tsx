import { Minus, Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AccessoryKind, AccessoryProduct } from "../types";
import { formatIDR } from "../utils/pricing";
import { ProductThumbnail } from "./product-thumbnail";

const KIND_LABELS: Record<AccessoryKind, [singular: string, plural: string]> = {
  monitor: ["monitor", "monitors"],
  lamp: ["lamp", "lamps"],
  plant: ["plant", "plants"],
};

interface AccessoryCardProps {
  product: AccessoryProduct;
  quantity: number;
  /** Maximum allowed quantity given other accessories of the same kind. */
  limit: number;
  /** Total slots for this accessory kind. */
  capacity: number;
  disabled?: boolean;
  onQuantityChange: (quantity: number) => void;
}

export function AccessoryCard({
  product,
  quantity,
  limit,
  capacity,
  disabled = false,
  onQuantityChange,
}: AccessoryCardProps) {
  const selected = quantity > 0;
  const canAdd = quantity < limit;
  const [singular, plural] = KIND_LABELS[product.kind];
  const hintId = `${product.id}-hint`;

  // The stepper and the "Add" button swap places; keep keyboard focus on the
  // control that replaces the one the user just pressed.
  const addRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const restoreFocus = useRef(false);
  useEffect(() => {
    if (!restoreFocus.current) return;
    restoreFocus.current = false;
    (selected ? plusRef : addRef).current?.focus();
  }, [selected]);

  const changeQuantity = (next: number) => {
    restoreFocus.current = (next > 0) !== selected;
    onQuantityChange(next);
  };
  const hint = canAdd
    ? null
    : `Limit reached: ${capacity} ${capacity === 1 ? singular : plural} per workspace`;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border bg-card p-3 transition-[border-color,background-color,box-shadow]",
        selected && "border-brand bg-brand-soft/50 shadow-sm",
      )}
    >
      <div className="flex items-center gap-3">
        <ProductThumbnail product={product} className="size-16" />
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="font-medium leading-tight">{product.name}</span>
          <span className="line-clamp-2 text-xs text-muted-foreground">{product.description}</span>
          <span className="mt-1 text-sm font-medium tabular-nums">
            {formatIDR(product.monthlyPrice)}
            <span className="font-normal text-muted-foreground"> / mo</span>
          </span>
        </div>
      </div>

      <div className="flex min-h-8 items-center justify-between gap-3">
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint ?? (selected ? "Added to your workspace" : " ")}
        </p>
        {selected ? (
          <div className="flex items-center gap-1" role="group" aria-label={`${product.name} quantity`}>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled}
              onClick={() => changeQuantity(quantity - 1)}
              aria-label={quantity === 1 ? `Remove ${product.name}` : `Remove one ${product.name}`}
            >
              <Minus />
            </Button>
            <output
              aria-live="polite"
              aria-label={`${product.name} quantity`}
              className="w-7 text-center text-sm font-medium tabular-nums"
            >
              {quantity}
            </output>
            <Button
              variant="outline"
              size="icon"
              disabled={disabled || !canAdd}
              ref={plusRef}
              focusableWhenDisabled
              onClick={() => changeQuantity(quantity + 1)}
              aria-label={`Add another ${product.name}`}
              aria-describedby={hint ? hintId : undefined}
            >
              <Plus />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            ref={addRef}
            focusableWhenDisabled
            disabled={disabled || !canAdd}
            onClick={() => changeQuantity(1)}
            aria-label={`Add ${product.name}`}
            aria-describedby={hint ? hintId : undefined}
          >
            <Plus data-icon="inline-start" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
}
