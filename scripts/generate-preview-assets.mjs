/**
 * Generates the PLACEHOLDER isometric artwork used by the workspace preview.
 *
 * Every object is modelled from simple 3D primitives in one world coordinate
 * system (centimetres) and projected with the same isometric camera, scale
 * and light direction, so all layers share a coherent perspective.
 *
 *   node scripts/generate-preview-assets.mjs
 *
 * Outputs transparent SVGs to public/products/{preview,thumbnails} and prints
 * the geometry (size + anchor origin) and slot positions that the catalog and
 * preview layout consume. These are temporary illustrations, not final
 * product renders.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PREVIEW_DIR = join(ROOT, "public/products/preview");
const THUMBNAIL_DIR = join(ROOT, "public/products/thumbnails");

/** Reference stage (px) and isometric camera. */
const STAGE = { width: 1200, height: 800, originX: 376, originY: 270 };
const SCALE = 3.2; // reference px per cm
const COS30 = Math.cos(Math.PI / 6);
const ELLIPSE_RX = Math.SQRT2 * COS30 * SCALE;
const ELLIPSE_RY = Math.SQRT2 * 0.5 * SCALE;

const project = ([x, y, z]) => [(x - y) * COS30 * SCALE, ((x + y) / 2 - z) * SCALE];
const n1 = (value) => Math.round(value * 10) / 10;
const pointList = (points) => points.map(([x, y]) => `${n1(x)},${n1(y)}`).join(" ");

/* ---------- colour & light (light comes from the upper left) ---------- */

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function mix(hex, target, amount) {
  const from = hexToRgb(hex);
  const to = hexToRgb(target);
  return `#${from
    .map((v, i) => Math.round(v + (to[i] - v) * amount).toString(16).padStart(2, "0"))
    .join("")}`;
}
const lighten = (hex, amount) => mix(hex, "#ffffff", amount);
const darken = (hex, amount) => mix(hex, "#1b1612", amount);

/* ---------- drawing primitives ---------- */

class Drawing {
  constructor(id) {
    this.id = id;
    this.defs = [];
    this.body = [];
    this.bounds = [];
    this.count = 0;
  }

  uid(prefix) {
    return `${this.id}-${prefix}${this.count++}`;
  }

  track(points, pad = 0) {
    for (const [x, y] of points) this.bounds.push([x - pad, y - pad], [x + pad, y + pad]);
  }

  polygon(points3d, fill, { strokeWidth = 0.8, opacity } = {}) {
    const points = points3d.map(project);
    this.track(points);
    const alpha = opacity === undefined ? "" : ` fill-opacity="${opacity}"`;
    this.body.push(
      `<polygon points="${pointList(points)}" fill="${fill}"${alpha} stroke="${fill}" stroke-width="${strokeWidth}" stroke-linejoin="round"/>`,
    );
  }

  /** Axis-aligned box; only the three camera-facing faces are drawn. */
  box([x, y, z], [dx, dy, dz], color, options = {}) {
    const [X, Y, Z] = [x + dx, y + dy, z + dz];
    const { top = lighten(color, 0.16), left = color, right = darken(color, 0.22) } = options;
    this.polygon([[x, Y, z], [X, Y, z], [X, Y, Z], [x, Y, Z]], left, options);
    this.polygon([[X, y, z], [X, Y, z], [X, Y, Z], [X, y, Z]], right, options);
    this.polygon([[x, y, Z], [X, y, Z], [X, Y, Z], [x, Y, Z]], top, options);
  }

  /** Flat ellipse lying on a horizontal plane. */
  disc([x, y, z], radius, fill, extra = "") {
    const [cx, cy] = project([x, y, z]);
    const rx = radius * ELLIPSE_RX;
    const ry = radius * ELLIPSE_RY;
    this.track([[cx - rx, cy - ry], [cx + rx, cy + ry]]);
    this.body.push(
      `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${fill}"${extra}/>`,
    );
  }

  /** Vertical cylinder with a shaded side and a lit top. */
  cylinder([x, y, z], radius, height, color) {
    const [tx, ty] = project([x, y, z + height]);
    const [bx, by] = project([x, y, z]);
    const rx = radius * ELLIPSE_RX;
    const ry = radius * ELLIPSE_RY;
    const gradient = this.uid("cyl");
    this.defs.push(
      `<linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="${n1(bx - rx)}" y1="0" x2="${n1(bx + rx)}" y2="0">` +
        `<stop offset="0" stop-color="${lighten(color, 0.1)}"/><stop offset=".45" stop-color="${color}"/>` +
        `<stop offset="1" stop-color="${darken(color, 0.3)}"/></linearGradient>`,
    );
    this.track([[tx - rx, ty - ry], [bx + rx, by + ry]]);
    this.body.push(
      `<path d="M${n1(tx - rx)} ${n1(ty)}L${n1(bx - rx)} ${n1(by)}A${n1(rx)} ${n1(ry)} 0 0 0 ${n1(bx + rx)} ${n1(by)}L${n1(tx + rx)} ${n1(ty)}Z" fill="url(#${gradient})"/>`,
      `<ellipse cx="${n1(tx)}" cy="${n1(ty)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="${lighten(color, 0.18)}"/>`,
    );
  }

  /** Round-capped stroke through 3D points (thin rods, legs, arms). */
  rod(points3d, width, color) {
    const points = points3d.map(project);
    this.track(points, width / 2);
    this.body.push(
      `<polyline points="${pointList(points)}" fill="none" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`,
    );
  }

  /** Soft contact shadow on the floor. */
  shadow(points3d, opacity = 0.22, blur = 6) {
    const filter = this.uid("blur");
    const points = points3d.map(project);
    this.track(points, blur * 3);
    this.defs.push(
      `<filter id="${filter}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`,
    );
    this.body.push(
      `<polygon points="${pointList(points)}" fill="#3b2f25" fill-opacity="${opacity}" filter="url(#${filter})"/>`,
    );
  }

  roundShadow(center, radius, opacity = 0.22, blur = 5) {
    const filter = this.uid("blur");
    const [cx, cy] = project(center);
    const rx = radius * ELLIPSE_RX;
    const ry = radius * ELLIPSE_RY;
    this.track([[cx - rx, cy - ry], [cx + rx, cy + ry]], blur * 3);
    this.defs.push(
      `<filter id="${filter}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${blur}"/></filter>`,
    );
    this.body.push(
      `<ellipse cx="${n1(cx)}" cy="${n1(cy)}" rx="${n1(rx)}" ry="${n1(ry)}" fill="#3b2f25" fill-opacity="${opacity}" filter="url(#${filter})"/>`,
    );
  }

  /** Two-tone leaf in screen space; the half facing the light is brighter. */
  leaf([bx, by], angleDeg, length, width, color) {
    const angle = (angleDeg * Math.PI) / 180;
    const [dx, dy] = [Math.cos(angle), Math.sin(angle)];
    const [nx, ny] = [-dy, dx];
    const tip = [bx + dx * length, by + dy * length];
    const mid = [bx + dx * length * 0.45, by + dy * length * 0.45];
    const sideA = [mid[0] + nx * width, mid[1] + ny * width];
    const sideB = [mid[0] - nx * width, mid[1] - ny * width];
    const [lit, shaded] = nx <= 0 ? [sideA, sideB] : [sideB, sideA];
    this.track([[bx, by], tip, sideA, sideB]);
    const half = (control, fill) =>
      `<path d="M${n1(bx)} ${n1(by)}Q${n1(control[0])} ${n1(control[1])} ${n1(tip[0])} ${n1(tip[1])}Z" fill="${fill}"/>`;
    this.body.push(
      half(lit, lighten(color, 0.12)),
      half(shaded, darken(color, 0.12)),
      `<path d="M${n1(bx)} ${n1(by)}L${n1(tip[0])} ${n1(tip[1])}" stroke="${darken(color, 0.3)}" stroke-width="1.2" stroke-linecap="round"/>`,
    );
  }

  raw(svg, points = []) {
    this.track(points);
    this.body.push(svg);
  }

  bbox(pad = 4) {
    const xs = this.bounds.map(([x]) => x);
    const ys = this.bounds.map(([, y]) => y);
    const minX = Math.floor(Math.min(...xs) - pad);
    const minY = Math.floor(Math.min(...ys) - pad);
    return {
      minX,
      minY,
      width: Math.ceil(Math.max(...xs) + pad) - minX,
      height: Math.ceil(Math.max(...ys) + pad) - minY,
    };
  }

  svg(viewBox, width, height, transform) {
    const content = transform
      ? [`<g transform="${transform}">`, ...this.body, "</g>"]
      : this.body;
    return [
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}">`,
      `<!-- PLACEHOLDER artwork generated by scripts/generate-preview-assets.mjs. Not a final product render. -->`,
      this.defs.length ? `<defs>${this.defs.join("")}</defs>` : "",
      ...content,
      `</svg>`,
      "",
    ].join("\n");
  }
}

/* ---------- products (local coordinates, anchor at origin) ---------- */

const FRAME = "#2c2d30";

function oakStandingDesk(d) {
  d.shadow([[-74, -38, 0], [74, -38, 0], [74, 38, 0], [-74, 38, 0]], 0.2, 7);
  d.box([-64, -30, 0], [7, 60, 3], FRAME);
  d.box([-62.5, -3, 3], [5, 6, 64], FRAME);
  d.box([-58, -2.5, 62], [116, 4, 6], FRAME);
  d.box([57, -30, 0], [7, 60, 3], FRAME);
  d.box([58.5, -3, 3], [5, 6, 64], FRAME);
  d.box([-62, -26, 67], [124, 52, 4], FRAME);
  d.box([38, 31, 65.5], [16, 4, 5.5], "#1f2023");
  d.polygon([[49, 35, 67.5], [51.5, 35, 67.5], [51.5, 35, 69], [49, 35, 69]], "#7dd3a8", { strokeWidth: 0.3 });
  d.box([-70, -35, 71], [140, 70, 3], "#d7b38a", { top: "#e6c9a4", left: "#cfa77a", right: "#b78d62" });
  for (const y of [-22, -6, 12, 26]) {
    d.rod([[-66, y, 74.05], [66, y + 2, 74.05]], 0.7, "#dcbc96");
  }
}

function walnutMinimalDesk(d) {
  d.shadow([[-72, -36, 0], [72, -36, 0], [72, 36, 0], [-72, 36, 0]], 0.18, 7);
  for (const [x, y] of [[-66, -31], [-66, 28], [63, -31], [63, 28]]) {
    d.box([x, y, 0], [3, 3, 69], FRAME);
  }
  d.box([-63, -28, 68], [126, 56, 4], "#6b4430");
  d.polygon([[-24, 28, 68.6], [24, 28, 68.6], [24, 28, 71.4], [-24, 28, 71.4]], "#7d5139", { strokeWidth: 0.4 });
  d.rod([[-6, 28.05, 70], [6, 28.05, 70]], 1.6, "#c9a45c");
  d.box([-70, -35, 72], [140, 70, 2], "#8a5a3c", { top: "#9b6a4a", left: "#7f5236", right: "#68412b" });
}

function starBase(d, legColor, casterColor) {
  d.roundShadow([0, 0, 0], 34, 0.22, 6);
  const legs = [0, 1, 2, 3, 4]
    .map((i) => ((90 + i * 72) * Math.PI) / 180)
    .map((a) => [Math.cos(a) * 30, Math.sin(a) * 30])
    .sort(([ax, ay], [bx, by]) => ax + ay - (bx + by));
  for (const [x, y] of legs) {
    d.disc([x, y, 0.5], 3, casterColor);
    d.cylinder([x, y, 0.5], 2.6, 3.5, casterColor);
    d.rod([[0, 0, 9], [x * 0.95, y * 0.95, 5]], 9, legColor);
  }
  d.cylinder([0, 0, 6], 5, 5, legColor);
  d.cylinder([0, 0, 11], 2.3, 27, "#a3a8ae");
}

function meshPattern(d) {
  const id = d.uid("mesh");
  d.defs.push(
    `<pattern id="${id}" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">` +
      `<rect width="5" height="5" fill="#3a3d43"/><path d="M0 0H5M0 0V5" stroke="#55595f" stroke-width="1.1"/></pattern>`,
  );
  return `url(#${id})`;
}

function ergoMeshChair(d) {
  starBase(d, "#2a2c30", "#1c1d1f");
  d.box([-8, -8, 36], [16, 16, 4], "#232427");
  d.box([-27, -6, 44], [3, 6, 17], "#232427");
  d.box([-29.5, -15, 60], [7, 24, 3], "#2f3135");
  d.box([-24, -23, 40], [48, 46, 8], "#33363b", { strokeWidth: 2 });
  d.box([24, -6, 44], [3, 6, 17], "#232427");
  d.box([23, -15, 60], [7, 24, 3], "#2f3135");
  d.box([-3, 21, 42], [6, 4, 14], "#232427");
  d.box([-21, 22, 50], [42, 5, 48], "#26282c", { strokeWidth: 2 });
  const mesh = meshPattern(d);
  d.polygon([[-18, 27.05, 54], [18, 27.05, 54], [18, 27.05, 95], [-18, 27.05, 95]], mesh, { strokeWidth: 0 });
  d.box([-2, 23, 97], [4, 3, 9], "#232427");
  d.box([-13, 21.5, 105], [26, 5, 11], "#26282c", { strokeWidth: 2 });
  d.polygon([[-11, 26.55, 107], [11, 26.55, 107], [11, 26.55, 114], [-11, 26.55, 114]], mesh, { strokeWidth: 0 });
}

function loungeTaskChair(d) {
  const fabric = "#b9785a";
  starBase(d, "#b4b8be", "#2a2b2e");
  d.box([-8, -8, 36], [16, 16, 4], "#8e939a");
  d.box([-24, -22, 40], [48, 46, 11], fabric, { strokeWidth: 3.5 });
  d.box([-3, 16, 42], [6, 5, 12], "#8e939a");
  d.box([-23, 19, 48], [46, 9, 42], fabric, { strokeWidth: 3.5 });
  d.polygon(
    [[-19, 28.1, 52], [19, 28.1, 52], [19, 28.1, 86], [-19, 28.1, 86]],
    darken(fabric, 0.06),
    { strokeWidth: 0.6 },
  );
  d.rod([[0, 28.15, 54], [0, 28.15, 84]], 0.9, darken(fabric, 0.22));
}

function monitor(width, height, screenFrom, screenTo) {
  return (d) => {
    const half = width / 2;
    d.box([-10, -8, 0], [20, 14, 1.2], "#2a2b2e");
    d.box([-2.5, -6.5, 1.2], [5, 3.5, 16], "#2a2b2e");
    d.box([-half, -3, 12], [width, 2.5, height], "#1d1e21");
    const gradient = d.uid("screen");
    const [left, top] = project([-half + 1.2, -0.45, 12 + height - 1.2]);
    const [right, bottom] = project([half - 1.2, -0.45, 13.5]);
    d.defs.push(
      `<linearGradient id="${gradient}" gradientUnits="userSpaceOnUse" x1="${n1(left)}" y1="${n1(top)}" x2="${n1(right)}" y2="${n1(bottom)}">` +
        `<stop offset="0" stop-color="${screenFrom}"/><stop offset="1" stop-color="${screenTo}"/></linearGradient>`,
    );
    const y = -0.45;
    const face = (x0, x1, z0, z1, fill, options) =>
      d.polygon([[x0, y, z0], [x1, y, z0], [x1, y, z1], [x0, y, z1]], fill, options);
    face(-half + 1.2, half - 1.2, 13.5, 12 + height - 1.2, `url(#${gradient})`, { strokeWidth: 0 });
    face(-half + 4, -2, 17, 12 + height - 6, "#ffffff", { strokeWidth: 0, opacity: 0.18 });
    face(1, half - 4, 23, 12 + height - 6, "#ffffff", { strokeWidth: 0, opacity: 0.12 });
    face(-half + 1.2, half - 1.2, 12 + height - 4, 12 + height - 1.2, "#ffffff", { strokeWidth: 0, opacity: 0.1 });
  };
}

function arcLamp(d) {
  const head = [18, -12, 40];
  const glow = d.uid("glow");
  d.defs.push(
    `<radialGradient id="${glow}"><stop offset="0" stop-color="#ffe2a0" stop-opacity=".55"/>` +
      `<stop offset="1" stop-color="#ffe2a0" stop-opacity="0"/></radialGradient>`,
  );
  d.disc([head[0], head[1], 0.2], 16, `url(#${glow})`);
  d.cylinder([0, 0, 0], 7, 2, "#27282b");
  d.rod([[0, 0, 2], [-3, 2, 30]], 4.5, "#27282b");
  d.rod([[-3, 2, 30], [head[0] - 2, head[1] + 1, head[2] + 3]], 4.5, "#27282b");
  d.disc([-3, 2, 30], 1.6, "#c9a45c");
  d.cylinder([head[0], head[1], head[2] - 5], 6.5, 6, "#27282b");
  d.disc([head[0], head[1], head[2] + 1], 2, "#c9a45c");
}

function monstera(d) {
  d.roundShadow([0, 0, 0], 18, 0.22, 5);
  d.cylinder([0, 0, 0], 13, 28, "#cdb79e");
  d.cylinder([0, 0, 27], 13.8, 3, "#d8c6b0");
  d.disc([0, 0, 30.05], 11.6, "#4a3b2f");
  const [tx, ty] = project([0, 0, 30]);
  const leaves = [
    [-4, -178, -105, 64, 50, "#357248"],
    [26, -176, -62, 62, 48, "#357248"],
    [-40, -138, -148, 64, 50, "#3d7d50"],
    [46, -136, -30, 64, 48, "#3a784c"],
    [-58, -84, 176, 58, 44, "#458a59"],
    [60, -82, 6, 58, 44, "#3d7d50"],
    [-20, -110, -150, 56, 44, "#4f9a63"],
    [16, -116, -28, 56, 44, "#489159"],
    [-2, -78, -95, 48, 38, "#57a36b"],
  ];
  for (const [ex, ey, angle, length, width, color] of leaves) {
    const end = [tx + ex, ty + ey];
    d.raw(
      `<path d="M${n1(tx)} ${n1(ty)}Q${n1(tx + ex * 0.2)} ${n1(ty + ey * 0.7)} ${n1(end[0])} ${n1(end[1])}" fill="none" stroke="#5b7d4a" stroke-width="3" stroke-linecap="round"/>`,
      [[tx, ty], end],
    );
    d.leaf(end, angle, length, width, color);
  }
}

/* ---------- room backdrop (stage coordinates) ---------- */

function room(d) {
  const W = 340;
  const D = 300;
  const H = 260;
  d.polygon([[0, 0, 0], [W, 0, 0], [W, D, 0], [0, D, 0]], "#e4d9c9", { strokeWidth: 0 });
  for (let y = 16; y < D; y += 16) {
    d.rod([[0, y, 0], [W, y, 0]], 1, "#d9ccba");
  }
  d.polygon([[0, 0, 0], [0, D, 0], [0, D, H], [0, 0, H]], "#e6ded3", { strokeWidth: 0 });
  d.polygon([[0, 0, 0], [W, 0, 0], [W, 0, H], [0, 0, H]], "#f2ece4", { strokeWidth: 0 });
  // Window on the left wall and the soft light it casts.
  d.polygon([[0.2, 64, 92], [0.2, 176, 92], [0.2, 176, 212], [0.2, 64, 212]], "#fbf8f3", { strokeWidth: 0 });
  d.polygon([[0.4, 70, 98], [0.4, 170, 98], [0.4, 170, 206], [0.4, 70, 206]], "#dde7ec", { strokeWidth: 0 });
  d.rod([[0.5, 120, 98], [0.5, 120, 206]], 4, "#fbf8f3");
  d.rod([[0.5, 70, 152], [0.5, 170, 152]], 4, "#fbf8f3");
  d.raw(
    `<polygon points="${pointList([[18, 84, 0], [92, 116, 0], [92, 220, 0], [18, 188, 0]].map(project))}" fill="#fffaf2" fill-opacity=".35"/>`,
  );
  // Rug.
  d.polygon([[40, 70, 0.3], [236, 70, 0.3], [236, 206, 0.3], [40, 206, 0.3]], "#efe8dd", { strokeWidth: 0 });
  d.rod([[48, 78, 0.4], [228, 78, 0.4], [228, 198, 0.4], [48, 198, 0.4], [48, 78, 0.4]], 1.2, "#d8ccbb");
  // Baseboards and corner.
  d.box([0, 0, 0], [W, 1.5, 7], "#faf7f2");
  d.box([0, 0, 0], [1.5, D, 7], "#faf7f2");
  d.rod([[0, 0, 7], [0, 0, H]], 1, "#ddd3c6");
}

/* ---------- world layout (shared by every desk / chair / accessory) ---------- */

const DESK_TOP_Z = 74;
const SLOTS = {
  desk: { world: [130, 45, 0], zIndex: 10 },
  chair: { world: [130, 112, 0], zIndex: 40 },
  monitor: [
    [{ world: [130, 22, DESK_TOP_Z], zIndex: 20 }],
    [
      { world: [97, 22, DESK_TOP_Z], zIndex: 20 },
      { world: [163, 22, DESK_TOP_Z], zIndex: 21 },
    ],
  ],
  lamp: [[{ world: [72, 64, DESK_TOP_Z], zIndex: 30 }]],
  plant: [[{ world: [228, 40, 0], zIndex: 35 }]],
};

const PRODUCTS = {
  "desk-oak-standing": oakStandingDesk,
  "desk-walnut-minimal": walnutMinimalDesk,
  "chair-ergo-mesh": ergoMeshChair,
  "chair-lounge-task": loungeTaskChair,
  "monitor-27-4k": monitor(62, 36, "#2d3d5c", "#6f8fbf"),
  "monitor-24-fhd": monitor(54, 32, "#2f4a3e", "#86ad94"),
  "lamp-arc-led": arcLamp,
  "plant-monstera": monstera,
};

/* ---------- output ---------- */

mkdirSync(PREVIEW_DIR, { recursive: true });
mkdirSync(THUMBNAIL_DIR, { recursive: true });

const geometry = {};
for (const [id, draw] of Object.entries(PRODUCTS)) {
  const drawing = new Drawing(id);
  draw(drawing);
  const { minX, minY, width, height } = drawing.bbox();
  writeFileSync(
    join(PREVIEW_DIR, `${id}.svg`),
    drawing.svg(`${minX} ${minY} ${width} ${height}`, width, height),
  );
  geometry[id] = { width, height, originX: -minX, originY: -minY };

  const side = Math.ceil(Math.max(width, height) * 1.12);
  const cx = minX + width / 2;
  const cy = minY + height / 2;
  writeFileSync(
    join(THUMBNAIL_DIR, `${id}.svg`),
    drawing.svg(`${n1(cx - side / 2)} ${n1(cy - side / 2)} ${side} ${side}`, 320, 320),
  );
}

const backdrop = new Drawing("room");
room(backdrop);
writeFileSync(
  join(PREVIEW_DIR, "room.svg"),
  backdrop.svg(
    `0 0 ${STAGE.width} ${STAGE.height}`,
    STAGE.width,
    STAGE.height,
    `translate(${STAGE.originX} ${STAGE.originY})`,
  ),
);

const toStage = ({ world, zIndex }) => {
  const [x, y] = project(world);
  return { x: n1(STAGE.originX + x), y: n1(STAGE.originY + y), zIndex };
};
const slots = {
  desk: toStage(SLOTS.desk),
  chair: toStage(SLOTS.chair),
  monitor: SLOTS.monitor.map((layout) => layout.map(toStage)),
  lamp: SLOTS.lamp.map((layout) => layout.map(toStage)),
  plant: SLOTS.plant.map((layout) => layout.map(toStage)),
};

console.log(JSON.stringify({ geometry, slots }, null, 2));
