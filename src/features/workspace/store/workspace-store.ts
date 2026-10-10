import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist, type PersistStorage, type StorageValue } from "zustand/middleware";
import { getProductById } from "../data/catalog";
import type { RentalDuration, WorkspaceConfiguration } from "../types";
import {
  clampAccessoryQuantity,
  DEFAULT_CONFIGURATION,
  sanitizeConfiguration,
} from "../utils/configuration";

interface WorkspaceActions {
  selectDesk: (id: string | null) => void;
  selectChair: (id: string | null) => void;
  setAccessoryQuantity: (id: string, quantity: number) => void;
  addAccessory: (id: string) => void;
  removeAccessory: (id: string) => void;
  setDuration: (months: RentalDuration) => void;
  reset: () => void;
}

export type WorkspaceStore = WorkspaceConfiguration & WorkspaceActions;

/**
 * localStorage adapter that never throws. Corrupt or unreadable data is
 * treated as absent so hydration always completes (zustand's JSON storage
 * leaves the store un-hydrated when parsing fails), and failed writes
 * (quota, privacy mode) keep the in-memory state working.
 */
const safeLocalStorage: PersistStorage<WorkspaceConfiguration> = {
  getItem: (name) => {
    try {
      const raw = localStorage.getItem(name);
      const parsed: unknown = raw === null ? null : JSON.parse(raw);
      // The state itself is validated by `sanitizeConfiguration` in `merge`.
      return typeof parsed === "object" && parsed !== null && "state" in parsed
        ? (parsed as StorageValue<WorkspaceConfiguration>)
        : null;
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Ignore: the configuration still works for this session.
    }
  },
  removeItem: (name) => {
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore, as above.
    }
  },
};

function isCategory(id: string, category: "desk" | "chair"): boolean {
  return getProductById(id)?.category === category;
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIGURATION,

      selectDesk: (id) => {
        if (id === null || isCategory(id, "desk")) set({ deskId: id });
      },

      selectChair: (id) => {
        if (id === null || isCategory(id, "chair")) set({ chairId: id });
      },

      setAccessoryQuantity: (id, quantity) => {
        if (getProductById(id)?.category !== "accessory") return;
        const accessories = { ...get().accessories };
        const clamped = clampAccessoryQuantity(id, quantity, accessories);
        if (clamped > 0) accessories[id] = clamped;
        else delete accessories[id];
        set({ accessories });
      },

      addAccessory: (id) => {
        get().setAccessoryQuantity(id, (get().accessories[id] ?? 0) + 1);
      },

      removeAccessory: (id) => {
        get().setAccessoryQuantity(id, 0);
      },

      setDuration: (months) => set({ durationMonths: months }),

      reset: () => set(DEFAULT_CONFIGURATION),
    }),
    {
      name: "monis-workspace-config",
      version: 1,
      storage: safeLocalStorage,
      // Hydrated manually after mount so server and first client render match.
      skipHydration: true,
      partialize: ({ deskId, chairId, accessories, durationMonths }) => ({
        deskId,
        chairId,
        accessories,
        durationMonths,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...sanitizeConfiguration(persisted),
      }),
    },
  ),
);

function subscribeToHydration(onChange: () => void): () => void {
  return useWorkspaceStore.persist.onFinishHydration(onChange);
}

/** True once the persisted configuration has been loaded on the client. */
export function useWorkspaceHydrated(): boolean {
  return useSyncExternalStore(
    subscribeToHydration,
    () => useWorkspaceStore.persist.hasHydrated(),
    () => false,
  );
}
