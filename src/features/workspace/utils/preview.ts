import { ACCESSORIES, getProductById } from "../data/catalog";
import {
  ACCESSORY_SLOT_LAYOUTS,
  CHAIR_SLOT,
  DESK_SLOT,
  PREVIEW_STAGE,
} from "../data/preview-layout";
import type {
  AccessoryKind,
  PreviewSlot,
  Product,
  WorkspaceConfiguration,
} from "../types";

/** A positioned image layer; geometry is in percentages of the stage. */
export interface PreviewLayer {
  /** Stable per product unit so moving between slots animates in place. */
  key: string;
  product: Product;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex: number;
}

type PreviewSelection = Pick<WorkspaceConfiguration, "deskId" | "chairId" | "accessories">;

const ACCESSORY_KINDS = Object.keys(ACCESSORY_SLOT_LAYOUTS) as AccessoryKind[];

function toLayer(product: Product, slot: PreviewSlot, unit = 0): PreviewLayer {
  const { width, height, originX, originY } = product.preview;
  return {
    key: `${product.id}-${unit}`,
    product,
    left: ((slot.x - originX) / PREVIEW_STAGE.width) * 100,
    top: ((slot.y - originY) / PREVIEW_STAGE.height) * 100,
    width: (width / PREVIEW_STAGE.width) * 100,
    height: (height / PREVIEW_STAGE.height) * 100,
    zIndex: slot.zIndex,
  };
}

/**
 * Resolves a selection into positioned layers in reading order (desk, chair,
 * accessories). Visual stacking is controlled by each layer's `zIndex`.
 */
export function getPreviewLayers(selection: PreviewSelection): PreviewLayer[] {
  const layers: PreviewLayer[] = [];

  const desk = selection.deskId ? getProductById(selection.deskId) : undefined;
  if (desk?.category === "desk") layers.push(toLayer(desk, DESK_SLOT));

  const chair = selection.chairId ? getProductById(selection.chairId) : undefined;
  if (chair?.category === "chair") layers.push(toLayer(chair, CHAIR_SLOT));

  for (const kind of ACCESSORY_KINDS) {
    const layouts = ACCESSORY_SLOT_LAYOUTS[kind];
    // Catalog order keeps slot assignment deterministic across renders.
    const units = ACCESSORIES.filter((product) => product.kind === kind)
      .flatMap((product) =>
        Array.from({ length: selection.accessories[product.id] ?? 0 }, (_, unit) => ({
          product,
          unit,
        })),
      )
      .slice(0, layouts.length);

    const slots = layouts[units.length - 1] ?? [];
    units.forEach(({ product, unit }, index) => {
      layers.push(toLayer(product, slots[index], unit));
    });
  }

  return layers;
}

/** Human-readable summary of the scene, e.g. for an accessible label. */
export function describePreview(layers: readonly PreviewLayer[]): string {
  const counts = new Map<string, number>();
  for (const { product } of layers) {
    counts.set(product.name, (counts.get(product.name) ?? 0) + 1);
  }
  return Array.from(counts, ([name, count]) => (count > 1 ? `${count} × ${name}` : name)).join(
    ", ",
  );
}
