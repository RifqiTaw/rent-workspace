import type { AccessoryKind, PreviewSlot } from "../types";

/*
 * Scene layout for the isometric preview, in reference units of a 1200×800
 * stage. Values come from `scripts/generate-preview-assets.mjs`, which places
 * every object in one shared world so perspective and scale stay consistent.
 * All desks share one footprint and surface height, so desk accessories fit
 * any desk.
 */

export const PREVIEW_STAGE = { width: 1200, height: 800 } as const;

export const PREVIEW_ROOM_SRC = "/products/preview/room.svg";

export const DESK_SLOT: PreviewSlot = { x: 611.6, y: 550, zIndex: 10 };

export const CHAIR_SLOT: PreviewSlot = { x: 425.9, y: 657.2, zIndex: 40 };

/**
 * Slot layouts per accessory kind, indexed by how many units are shown:
 * `layouts[n - 1]` holds the `n` slots used for `n` units. The number of
 * layouts is the kind's capacity, which keeps accessories from overlapping.
 */
export const ACCESSORY_SLOT_LAYOUTS: Readonly<
  Record<AccessoryKind, readonly (readonly PreviewSlot[])[]>
> = {
  monitor: [
    [{ x: 675.3, y: 276.4, zIndex: 20 }],
    [
      { x: 583.8, y: 223.6, zIndex: 20 },
      { x: 766.8, y: 329.2, zIndex: 21 },
    ],
  ],
  lamp: [[{ x: 398.2, y: 250.8, zIndex: 30 }]],
  plant: [[{ x: 897, y: 698.8, zIndex: 35 }]],
};

export function getAccessoryCapacity(kind: AccessoryKind): number {
  return ACCESSORY_SLOT_LAYOUTS[kind].length;
}

/** A point on the stage, in reference units. */
export interface StagePoint {
  x: number;
  y: number;
}

/**
 * In-scene "+ add" hotspots per accessory kind. `positions[n]` is where the
 * hotspot sits while `n` units are shown, so it always points at the next
 * free slot; its length must match the kind's capacity. Desk accessories
 * only make sense once a desk is selected.
 */
export const ACCESSORY_HOTSPOTS: Readonly<
  Record<AccessoryKind, { label: string; onDesk: boolean; positions: readonly StagePoint[] }>
> = {
  monitor: {
    label: "Add monitor",
    onDesk: true,
    positions: [
      { x: 675, y: 170 },
      { x: 860, y: 245 },
    ],
  },
  lamp: { label: "Add lamp", onDesk: true, positions: [{ x: 420, y: 190 }] },
  plant: { label: "Place a plant", onDesk: false, positions: [{ x: 905, y: 560 }] },
};
