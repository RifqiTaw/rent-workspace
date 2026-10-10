import type {
  AccessoryProduct,
  ChairProduct,
  DeskProduct,
  Product,
} from "../types";

/*
 * Mock catalog for the technical challenge. Prices are illustrative estimates
 * only and do not reflect official monis.rent pricing.
 *
 * Preview assets are authored on a shared isometric canvas, so every desk has
 * the same footprint and surface height and accessory placements line up.
 */

export const DESKS = [
  {
    id: "desk-oak-standing",
    category: "desk",
    name: "Oak Standing Desk",
    description: "Electric height-adjustable desk with a solid oak top.",
    monthlyPrice: 450_000,
    thumbnail: "/products/thumbnails/desk-oak-standing.webp",
    preview: {
      src: "/products/preview/desk-oak-standing.webp",
      placement: { x: 50, y: 78, width: 64, zIndex: 20 },
    },
  },
  {
    id: "desk-walnut-minimal",
    category: "desk",
    name: "Walnut Minimal Desk",
    description: "Slim fixed-height desk with a warm walnut finish.",
    monthlyPrice: 320_000,
    thumbnail: "/products/thumbnails/desk-walnut-minimal.webp",
    preview: {
      src: "/products/preview/desk-walnut-minimal.webp",
      placement: { x: 50, y: 78, width: 64, zIndex: 20 },
    },
  },
] as const satisfies readonly DeskProduct[];

export const CHAIRS = [
  {
    id: "chair-ergo-mesh",
    category: "chair",
    name: "Ergo Mesh Chair",
    description: "Breathable mesh back with adjustable lumbar support.",
    monthlyPrice: 280_000,
    thumbnail: "/products/thumbnails/chair-ergo-mesh.webp",
    preview: {
      src: "/products/preview/chair-ergo-mesh.webp",
      placement: { x: 58, y: 92, width: 26, zIndex: 30 },
    },
  },
  {
    id: "chair-lounge-task",
    category: "chair",
    name: "Lounge Task Chair",
    description: "Upholstered task chair with a soft, supportive seat.",
    monthlyPrice: 210_000,
    thumbnail: "/products/thumbnails/chair-lounge-task.webp",
    preview: {
      src: "/products/preview/chair-lounge-task.webp",
      placement: { x: 58, y: 92, width: 26, zIndex: 30 },
    },
  },
] as const satisfies readonly ChairProduct[];

export const ACCESSORIES = [
  {
    id: "monitor-27-4k",
    category: "accessory",
    kind: "monitor",
    name: '27" 4K Monitor',
    description: "Sharp 4K IPS panel for focused, detailed work.",
    monthlyPrice: 300_000,
    thumbnail: "/products/thumbnails/monitor-27-4k.webp",
    preview: {
      src: "/products/preview/monitor-27-4k.webp",
      placements: [
        { x: 46, y: 46, width: 22, zIndex: 40 },
        { x: 64, y: 50, width: 22, zIndex: 41 },
      ],
    },
  },
  {
    id: "monitor-24-fhd",
    category: "accessory",
    kind: "monitor",
    name: '24" Full HD Monitor',
    description: "Reliable everyday display for a second screen.",
    monthlyPrice: 180_000,
    thumbnail: "/products/thumbnails/monitor-24-fhd.webp",
    preview: {
      src: "/products/preview/monitor-24-fhd.webp",
      placements: [
        { x: 44, y: 46, width: 19, zIndex: 40 },
        { x: 62, y: 50, width: 19, zIndex: 41 },
      ],
    },
  },
  {
    id: "lamp-arc-led",
    category: "accessory",
    kind: "lamp",
    name: "Arc LED Desk Lamp",
    description: "Dimmable warm-to-cool LED with an adjustable arm.",
    monthlyPrice: 75_000,
    thumbnail: "/products/thumbnails/lamp-arc-led.webp",
    preview: {
      src: "/products/preview/lamp-arc-led.webp",
      placements: [{ x: 28, y: 44, width: 12, zIndex: 42 }],
    },
  },
  {
    id: "plant-monstera",
    category: "accessory",
    kind: "plant",
    name: "Potted Monstera",
    description: "Low-maintenance floor plant to soften the space.",
    monthlyPrice: 60_000,
    thumbnail: "/products/thumbnails/plant-monstera.webp",
    preview: {
      src: "/products/preview/plant-monstera.webp",
      placements: [{ x: 14, y: 90, width: 18, zIndex: 10 }],
    },
  },
] as const satisfies readonly AccessoryProduct[];

export const PRODUCTS: readonly Product[] = [...DESKS, ...CHAIRS, ...ACCESSORIES];

const productsById = new Map<string, Product>(PRODUCTS.map((p) => [p.id, p]));

export function getProductById(id: string): Product | undefined {
  return productsById.get(id);
}

export function getMaxQuantity(product: AccessoryProduct): number {
  return product.preview.placements.length;
}
