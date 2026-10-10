"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { useShallow } from "zustand/react/shallow";
import { cn } from "@/lib/utils";
import { PREVIEW_ROOM_SRC } from "../data/preview-layout";
import {
  useWorkspaceHydrated,
  useWorkspaceStore,
} from "../store/workspace-store";
import type { AccessoryProduct } from "../types";
import {
  describePreview,
  getPreviewHotspots,
  getPreviewLayers,
  type PreviewLayer,
} from "../utils/preview";
import { PreviewHotspots } from "./preview-hotspots";

/** Largest rendered stage width in CSS px, used to hint image `sizes`. */
const MAX_STAGE_WIDTH = 1024;

/** How long a hotspot add takes to settle (popover close + re-render). */
const FOCUS_SETTLE_MS = 350;

const LAYER_POSITION =
  "absolute transition-[left,top] duration-500 ease-out motion-reduce:transition-none";

/** Entrance animations: accessories drop into place, desk/chair fade in. */
const LAYER_MOTION = {
  drop: "motion-safe:animate-drop-in",
  fade: "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300",
} as const;

function PreviewLayerImage({
  layer,
  motion,
}: {
  layer: PreviewLayer;
  motion: keyof typeof LAYER_MOTION;
}) {
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
      <div
        style={style}
        className={cn(LAYER_POSITION, "flex items-center justify-center")}
      >
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
        LAYER_MOTION[motion],
      )}
    />
  );
}

export function WorkspacePreview({ className }: { className?: string }) {
  const hydrated = useWorkspaceHydrated();
  const selection = useWorkspaceStore(
    useShallow(({ deskId, chairId, accessories }) => ({
      deskId,
      chairId,
      accessories,
    })),
  );
  const addAccessory = useWorkspaceStore((state) => state.addAccessory);
  const sceneRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState("");

  // Render nothing selection-specific until the persisted config has loaded,
  // so the server HTML and the first client render always match.
  const layers = useMemo(
    () => (hydrated ? getPreviewLayers(selection) : []),
    [hydrated, selection],
  );
  const hotspots = useMemo(
    () => (hydrated ? getPreviewHotspots(selection) : []),
    [hydrated, selection],
  );

  const summary = describePreview(layers);
  const label = !hydrated
    ? "Loading workspace preview"
    : summary
      ? `Workspace preview: ${summary}`
      : "Workspace preview: empty room";

  const handleAdd = (product: AccessoryProduct) => {
    const count = (selection.accessories[product.id] ?? 0) + 1;
    addAccessory(product.id);
    setAnnouncement(`Added ${product.name} (${count} in your workspace).`);
    // A hotspot disappears once its kind is full; keep keyboard focus in the
    // preview instead of letting it fall back to the page.
    setTimeout(() => {
      const active = document.activeElement;
      if (!active || active === document.body) {
        sceneRef.current?.focus({ preventScroll: true });
      }
    }, FOCUS_SETTLE_MS);
  };

  return (
    <figure className={cn("relative w-full", className)}>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border/70">
        <div
          ref={sceneRef}
          role="img"
          aria-label={label}
          aria-busy={!hydrated}
          tabIndex={-1}
          className="absolute inset-0 outline-none"
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
          {/* Keyed per product unit: a replaced desk/chair unmounts at once. */}
          {layers.map((layer) => (
            <PreviewLayerImage
              key={layer.key}
              layer={layer}
              motion={layer.product.category === "accessory" ? "drop" : "fade"}
            />
          ))}
        </div>
        <PreviewHotspots hotspots={hotspots} onAdd={handleAdd} />
        {!hydrated && (
          <div className="absolute inset-0 animate-pulse bg-background/30 motion-reduce:animate-none" />
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      <figcaption className="pointer-events-none absolute bottom-2 left-2 rounded-full bg-background/85 px-2.5 py-1 text-[0.7rem] text-muted-foreground shadow-xs ring-1 ring-border/60 backdrop-blur sm:bottom-3 sm:left-3 sm:text-xs">
        Illustrative placeholder artwork
      </figcaption>
    </figure>
  );
}
