import { CHAIRS, DESKS, getProductById } from "../data/catalog";
import { getAccessoryCapacity } from "../data/preview-layout";
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

/**
 * Maximum quantity of an accessory given the others already selected.
 * Accessories of the same kind (e.g. two monitor models) share preview slots,
 * so they also share one capacity. Returns 0 for unknown IDs.
 */
export function getAccessoryLimit(
  id: string,
  accessories: WorkspaceConfiguration["accessories"],
): number {
  const product = getProductById(id);
  if (product?.category !== "accessory") return 0;

  const usedByOthers = Object.entries(accessories).reduce((sum, [otherId, quantity]) => {
    const other = getProductById(otherId);
    const sameKind = other?.category === "accessory" && other.kind === product.kind;
    return otherId !== id && sameKind ? sum + quantity : sum;
  }, 0);

  return Math.max(getAccessoryCapacity(product.kind) - usedByOthers, 0);
}

/** Clamps a requested quantity to the accessory's remaining capacity. */
export function clampAccessoryQuantity(
  id: string,
  quantity: number,
  accessories: WorkspaceConfiguration["accessories"],
): number {
  if (!Number.isFinite(quantity)) return 0;
  return Math.min(Math.max(Math.trunc(quantity), 0), getAccessoryLimit(id, accessories));
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
        typeof quantity === "number"
          ? clampAccessoryQuantity(id, quantity, accessories)
          : 0;
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
