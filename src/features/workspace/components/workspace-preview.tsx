"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useMemo, useState, type CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { PREVIEW_ROOM_SRC } from "../data/preview-layout";
import { useWorkspaceHydrated, useWorkspaceStore } from "../store/workspace-store";
import { describePreview, getPreviewLayers, type PreviewLayer } from "../utils/preview";

/** Largest rendered stage width in CSS px, used to hint image `sizes`. */
const MAX_STAGE_WIDTH = 1024;

const LAYER_POSITION =
  "absolute transition-[left,top] duration-500 ease-out motion-reduce:transition-none";

function PreviewLayerImage({ layer }: { layer: PreviewLayer }) {
  const [failed, setFailed] = useState(false);
  const { product } = layer;
  const style: CSSProperties = {
    left: `${layer.left}%`,
    top: `${layer.top}%`,
    width: `${layer.width}%`,
    height: `${layer.height}%`,
    zIndex: layer.zIndex,
  };

  if (failed) {
    return (
      <div style={style} className={cn(LAYER_POSITION, "flex items-center justify-center")}>
        <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm ring-1 ring-border">
          <ImageOff className="size-3.5" aria-hidden />
          {product.name}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={product.preview.src}
      alt=""
      width={product.preview.width}
      height={product.preview.height}
      sizes={`(min-width: ${MAX_STAGE_WIDTH}px) ${Math.ceil((layer.width / 100) * MAX_STAGE_WIDTH)}px, ${Math.ceil(layer.width)}vw`}
      loading="eager"
      draggable={false}
      onError={() => setFailed(true)}
      style={style}
      className={cn(
        LAYER_POSITION,
        "pointer-events-none max-w-none origin-bottom select-none",
        "motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 motion-safe:duration-300",
      )}
    />
  );
}

export function WorkspacePreview({ className }: { className?: string }) {
  const hydrated = useWorkspaceHydrated();
  const selection = useWorkspaceStore(
    useShallow(({ deskId, chairId, accessories }) => ({ deskId, chairId, accessories })),
  );

  // Render nothing selection-specific until the persisted config has loaded,
  // so the server HTML and the first client render always match.
  const layers = useMemo(
    () => (hydrated ? getPreviewLayers(selection) : []),
    [hydrated, selection],
  );

  const summary = describePreview(layers);
  const label = !hydrated
    ? "Loading workspace preview"
    : summary
      ? `Workspace preview: ${summary}`
      : "Workspace preview: empty room";

  return (
    <figure className={cn("w-full", className)}>
      <div
        role="img"
        aria-label={label}
        aria-busy={!hydrated}
        className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/70"
      >
        <Image
          src={PREVIEW_ROOM_SRC}
          alt=""
          fill
          sizes={`(min-width: ${MAX_STAGE_WIDTH}px) ${MAX_STAGE_WIDTH}px, 100vw`}
          loading="eager"
          fetchPriority="high"
          draggable={false}
          className="pointer-events-none select-none object-cover"
        />
        {layers.map((layer) => (
          <PreviewLayerImage key={layer.key} layer={layer} />
        ))}
        {!hydrated && (
          <div className="absolute inset-0 animate-pulse bg-background/30 motion-reduce:animate-none" />
        )}
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">
        Illustrative preview using placeholder artwork, not final product renders.
      </figcaption>
    </figure>
  );
}
