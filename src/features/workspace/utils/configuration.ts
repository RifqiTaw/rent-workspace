import { CHAIRS, DESKS, getMaxQuantity, getProductById } from "../data/catalog";
import { RENTAL_DURATIONS } from "../data/rental-terms";
import type { RentalDuration, WorkspaceConfiguration } from "../types";

export const DEFAULT_CONFIGURATION: WorkspaceConfiguration = {
  deskId: DESKS[0].id,
  chairId: CHAIRS[0].id,
  accessories: {},
  durationMonths: 3,
};

export function isRentalDuration(value: unknown): value is RentalDuration {
  return RENTAL_DURATIONS.some((d) => d === value);
}

/** Clamps a requested quantity to the accessory's limits; 0 for unknown IDs. */
export function clampAccessoryQuantity(id: string, quantity: number): number {
  const product = getProductById(id);
  if (product?.category !== "accessory" || !Number.isFinite(quantity)) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 0), getMaxQuantity(product));
}

function isProductOfCategory(id: unknown, category: "desk" | "chair"): id is string {
  return typeof id === "string" && getProductById(id)?.category === category;
}

/**
 * Rebuilds a valid configuration from untrusted input (e.g. localStorage),
 * dropping unknown products and out-of-range quantities.
 */
export function sanitizeConfiguration(input: unknown): WorkspaceConfiguration {
  if (typeof input !== "object" || input === null) return DEFAULT_CONFIGURATION;
  const raw = input as Partial<Record<keyof WorkspaceConfiguration, unknown>>;

  const accessories: Record<string, number> = {};
  if (typeof raw.accessories === "object" && raw.accessories !== null) {
    for (const [id, quantity] of Object.entries(raw.accessories)) {
      const clamped =
        typeof quantity === "number" ? clampAccessoryQuantity(id, quantity) : 0;
      if (clamped > 0) accessories[id] = clamped;
    }
  }

  return {
    deskId: isProductOfCategory(raw.deskId, "desk") ? raw.deskId : null,
    chairId: isProductOfCategory(raw.chairId, "chair") ? raw.chairId : null,
    accessories,
    durationMonths: isRentalDuration(raw.durationMonths)
      ? raw.durationMonths
      : DEFAULT_CONFIGURATION.durationMonths,
  };
}
