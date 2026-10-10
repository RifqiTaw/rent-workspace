export type ProductCategory = "desk" | "chair" | "accessory";

export type AccessoryKind = "monitor" | "lamp" | "plant";

/**
 * Transparent layer artwork. Sizes are in preview reference units (the
 * 1200×800 stage). `originX`/`originY` locate the object's physical anchor
 * (e.g. where it touches the floor or desk) inside the image.
 */
export interface PreviewAsset {
  src: string;
  width: number;
  height: number;
  originX: number;
  originY: number;
}

/** Where an object's anchor sits on the stage, in reference units. */
export interface PreviewSlot {
  x: number;
  y: number;
  zIndex: number;
}

interface BaseProduct {
  id: string;
  name: string;
  description: string;
  /** Mock monthly rental estimate in IDR. Not an official monis.rent price. */
  monthlyPrice: number;
  /** Square catalog image, separate from the preview layer. */
  thumbnail: string;
  preview: PreviewAsset;
}

export interface DeskProduct extends BaseProduct {
  category: "desk";
}

export interface ChairProduct extends BaseProduct {
  category: "chair";
}

export interface AccessoryProduct extends BaseProduct {
  category: "accessory";
  kind: AccessoryKind;
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
