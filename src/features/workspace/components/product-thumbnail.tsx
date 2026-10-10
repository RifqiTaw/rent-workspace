import Image from "next/image";
import { cn } from "@/lib/utils";
import type { Product } from "../types";

export function ProductThumbnail({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-square shrink-0 overflow-hidden rounded-lg bg-surface ring-1 ring-border/60",
        className,
      )}
    >
      <Image
        src={product.thumbnail}
        alt=""
        fill
        sizes="96px"
        className="object-contain p-1.5"
      />
    </div>
  );
}
