export type ProductCategory = "desk" | "chair" | "accessory";

export type AccessoryKind = "monitor" | "lamp" | "plant";

/**
 * Position of a layer on the preview stage. All values are percentages of the
 * stage box so the preview scales responsively. `x`/`y` locate the asset's
 * bottom-center anchor; `width` is relative to the stage width.
 */
export interface PreviewPlacement {
  x: number;
  y: number;
  width: number;
  zIndex: number;
}

interface BaseProduct {
  id: string;
  name: string;
  description: string;
  /** Mock monthly rental estimate in IDR. Not an official monis.rent price. */
  monthlyPrice: number;
  thumbnail: string;
}

export interface DeskProduct extends BaseProduct {
  category: "desk";
  preview: { src: string; placement: PreviewPlacement };
}

export interface ChairProduct extends BaseProduct {
  category: "chair";
  preview: { src: string; placement: PreviewPlacement };
}

export interface AccessoryProduct extends BaseProduct {
  category: "accessory";
  kind: AccessoryKind;
  /** One placement per unit; its length is the maximum rentable quantity. */
  preview: {
    src: string;
    placements: readonly [PreviewPlacement, ...PreviewPlacement[]];
  };
}

export type Product = DeskProduct | ChairProduct | AccessoryProduct;

export type RentalDuration = 1 | 3 | 6 | 12;

export interface WorkspaceConfiguration {
  deskId: string | null;
  chairId: string | null;
  /** Accessory ID → quantity. Only quantities above zero are stored. */
  accessories: Readonly<Record<string, number>>;
  durationMonths: RentalDuration;
}

export interface LineItem {
  product: Product;
  quantity: number;
  monthlyTotal: number;
}

export interface RentalEstimate {
  monthlySubtotal: number;
  durationMonths: RentalDuration;
  discountRate: number;
  discountAmount: number;
  total: number;
}
