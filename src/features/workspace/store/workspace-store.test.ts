import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ACCESSORIES, CHAIRS, DESKS } from "../data/catalog";
import { DEFAULT_CONFIGURATION } from "../utils/configuration";

class MemoryStorage implements Pick<Storage, "getItem" | "setItem" | "removeItem"> {
  private items = new Map<string, string>();
  getItem(key: string) {
    return this.items.get(key) ?? null;
  }
  setItem(key: string, value: string) {
    this.items.set(key, value);
  }
  removeItem(key: string) {
    this.items.delete(key);
  }
}

const storage = new MemoryStorage();
vi.stubGlobal("localStorage", storage);

const STORAGE_KEY = "monis-workspace-config";
const [monitor, , lamp] = ACCESSORIES;

// Imported after stubbing localStorage so persist picks up the stub.
let useWorkspaceStore: typeof import("./workspace-store").useWorkspaceStore;

beforeAll(async () => {
  ({ useWorkspaceStore } = await import("./workspace-store"));
});

beforeEach(() => {
  storage.removeItem(STORAGE_KEY);
  useWorkspaceStore.getState().reset();
});

const state = () => useWorkspaceStore.getState();

describe("desk and chair selection", () => {
  it("replaces the selected desk and chair", () => {
    state().selectDesk(DESKS[1].id);
    state().selectChair(CHAIRS[1].id);
    expect(state()).toMatchObject({ deskId: DESKS[1].id, chairId: CHAIRS[1].id });
  });

  it("ignores IDs from the wrong category", () => {
    state().selectDesk(CHAIRS[1].id);
    state().selectChair("unknown");
    expect(state().deskId).toBe(DEFAULT_CONFIGURATION.deskId);
    expect(state().chairId).toBe(DEFAULT_CONFIGURATION.chairId);
  });

  it("allows clearing a slot", () => {
    state().selectChair(null);
    expect(state().chairId).toBeNull();
  });
});

describe("accessories", () => {
  it("adds, increments and removes accessories", () => {
    state().addAccessory(monitor.id);
    state().addAccessory(monitor.id);
    state().addAccessory(lamp.id);
    expect(state().accessories).toEqual({ [monitor.id]: 2, [lamp.id]: 1 });

    state().removeAccessory(monitor.id);
    expect(state().accessories).toEqual({ [lamp.id]: 1 });
  });

  it("clamps quantities to the per-product maximum", () => {
    state().setAccessoryQuantity(monitor.id, 10);
    expect(state().accessories[monitor.id]).toBe(monitor.preview.placements.length);

    state().addAccessory(lamp.id);
    state().addAccessory(lamp.id);
    expect(state().accessories[lamp.id]).toBe(1);
  });

  it("drops the entry when quantity reaches zero", () => {
    state().setAccessoryQuantity(monitor.id, 1);
    state().setAccessoryQuantity(monitor.id, -2);
    expect(state().accessories).toEqual({});
  });

  it("ignores non-accessory IDs", () => {
    state().addAccessory(DESKS[0].id);
    expect(state().accessories).toEqual({});
  });
});

describe("persistence", () => {
  it("writes only configuration fields to storage", () => {
    state().setDuration(12);
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? "{}");
    expect(Object.keys(saved.state).sort()).toEqual(
      ["accessories", "chairId", "deskId", "durationMonths"],
    );
    expect(saved.state.durationMonths).toBe(12);
  });

  it("sanitizes invalid persisted data on rehydrate", async () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        state: {
          deskId: DESKS[1].id,
          chairId: DESKS[0].id,
          accessories: { [monitor.id]: 99, ghost: 1 },
          durationMonths: 5,
        },
      }),
    );

    await useWorkspaceStore.persist.rehydrate();

    expect(state()).toMatchObject({
      deskId: DESKS[1].id,
      chairId: null,
      accessories: { [monitor.id]: monitor.preview.placements.length },
      durationMonths: DEFAULT_CONFIGURATION.durationMonths,
    });
    expect(typeof state().addAccessory).toBe("function");
  });
});
