import { describe, expect, it } from "vitest";
import { ACCESSORIES, CHAIRS, DESKS } from "../data/catalog";
import {
  ACCESSORY_HOTSPOTS,
  ACCESSORY_SLOT_LAYOUTS,
  DESK_SLOT,
  getAccessoryCapacity,
} from "../data/preview-layout";
import { getPreviewHotspots, getPreviewLayers } from "./preview";

const [monitor27, monitor24, lamp, plant] = ACCESSORIES;
const base = { deskId: DESKS[0].id, chairId: CHAIRS[0].id, accessories: {} };

describe("getPreviewLayers", () => {
  it("lists desk then chair, with the chair stacked in front", () => {
    const layers = getPreviewLayers(base);
    expect(layers.map((l) => l.product.id)).toEqual([DESKS[0].id, CHAIRS[0].id]);
    expect(layers[1].zIndex).toBeGreaterThan(layers[0].zIndex);
  });

  it("aligns each asset's origin with its slot", () => {
    const [desk] = getPreviewLayers(base);
    const { originX, originY } = DESKS[0].preview;
    expect((desk.left / 100) * 1200 + originX).toBeCloseTo(DESK_SLOT.x);
    expect((desk.top / 100) * 800 + originY).toBeCloseTo(DESK_SLOT.y);
  });

  it("centres a single monitor and splits two monitors across slots", () => {
    const single = getPreviewLayers({ ...base, accessories: { [monitor27.id]: 1 } });
    const [center] = ACCESSORY_SLOT_LAYOUTS.monitor[0];
    const monitorLayer = single.find((l) => l.product.id === monitor27.id);
    expect(monitorLayer?.zIndex).toBe(center.zIndex);

    const pair = getPreviewLayers({
      ...base,
      accessories: { [monitor27.id]: 1, [monitor24.id]: 1 },
    });
    const monitors = pair.filter((l) => l.product.category === "accessory");
    expect(monitors).toHaveLength(2);
    expect(new Set(monitors.map((l) => l.left)).size).toBe(2);
  });

  it("keeps stable keys per product unit", () => {
    const layers = getPreviewLayers({ ...base, accessories: { [monitor24.id]: 2 } });
    expect(layers.map((l) => l.key)).toContain(`${monitor24.id}-1`);
  });

  it("shows lamp and plant and skips empty slots", () => {
    const layers = getPreviewLayers({
      deskId: null,
      chairId: null,
      accessories: { [lamp.id]: 1, [plant.id]: 1 },
    });
    expect(layers.map((l) => l.product.id).sort()).toEqual([lamp.id, plant.id].sort());
  });
});

describe("getPreviewHotspots", () => {
  const kinds = (selection: Parameters<typeof getPreviewHotspots>[0]) =>
    getPreviewHotspots(selection).map((h) => h.kind);

  it("has one hotspot position per slot of each kind", () => {
    for (const [kind, { positions }] of Object.entries(ACCESSORY_HOTSPOTS)) {
      expect(positions).toHaveLength(getAccessoryCapacity(kind as keyof typeof ACCESSORY_HOTSPOTS));
    }
  });

  it("offers every kind on an empty desk, with both monitor models", () => {
    const hotspots = getPreviewHotspots(base);
    expect(hotspots.map((h) => h.kind)).toEqual(["monitor", "lamp", "plant"]);
    expect(hotspots[0].products.map((p) => p.id)).toEqual([monitor27.id, monitor24.id]);
  });

  it("moves the monitor hotspot to the next slot and hides full kinds", () => {
    const one = getPreviewHotspots({ ...base, accessories: { [monitor27.id]: 1, [lamp.id]: 1 } });
    const [first] = getPreviewHotspots(base);
    expect(one.map((h) => h.kind)).toEqual(["monitor", "plant"]);
    expect(one[0].left).not.toBe(first.left);

    expect(kinds({ ...base, accessories: { [monitor24.id]: 2, [plant.id]: 1 } })).toEqual(["lamp"]);
  });

  it("only offers floor items when no desk is selected", () => {
    expect(kinds({ ...base, deskId: null })).toEqual(["plant"]);
  });
});
