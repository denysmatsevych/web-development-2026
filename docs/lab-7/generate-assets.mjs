/**
 * Lab 7 — regenerates the Courtly asset pack's raster illustrations.
 *
 *   node docs/lab-7/generate-assets.mjs        (run from the repo root)
 *
 * Every image is a flat vector scene — a sports court drawn in true
 * perspective (ground-plane projection + near-plane clipping), rasterised by
 * `sharp` and written as WebP. Drawn rather than photographed so the pack has
 * no licence strings attached and ships at sizes chosen for the brief:
 * the hero at two widths for `srcset`, the cards at 4:3, the featured card and
 * the info block in portrait so a tall crop still has detail.
 *
 * No text in any scene: librsvg's font fallback differs between machines, and
 * the headline belongs in HTML anyway. The OG image, which does carry text, is
 * rendered through Edge by render-mockup.mjs instead.
 *
 * `sharp` comes from the site's own node_modules (an Astro dependency).
 * Output is deterministic: same seed, same bytes.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'courtly-assets/img';
mkdirSync(OUT, { recursive: true });

let seed = 20261005;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

const NEAR = 0.4;
const f1 = (n) => n.toFixed(1);

/**
 * A pinhole camera over the ground plane. World axes: X and Z on the ground,
 * Y up, metres. `yaw` spins the court under the camera; `d` is how far in
 * front of the camera the court's centre sits; `horizon` is the screen row of
 * the vanishing line (a shift lens, so verticals stay vertical).
 */
function makeScene({ W, H, f, h, d, yaw = 0, horizon, shiftX = 0 }) {
  const c = Math.cos((yaw * Math.PI) / 180);
  const s = Math.sin((yaw * Math.PI) / 180);
  const parts = [];
  const defs = [];

  const cam = ([X, Z, Y = 0]) => [X * c - Z * s, Y, X * s + Z * c + d];
  const proj = ([x, y, z]) => [W / 2 + shiftX + (f * x) / z, horizon + (f * (h - y)) / z];

  /** Sutherland–Hodgman against the plane z = NEAR, in camera space. */
  function clip(pts) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      const ina = a[2] >= NEAR;
      const inb = b[2] >= NEAR;
      if (ina) out.push(a);
      if (ina !== inb) {
        const t = (NEAR - a[2]) / (b[2] - a[2]);
        out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR]);
      }
    }
    return out;
  }

  const scene = {
    W,
    H,
    horizon,
    add: (svg) => parts.push(svg),
    def: (svg) => defs.push(svg),
    /** Depth of a world point — for painter's-order sorting of props. */
    depth: (p) => cam(p)[2],
    point: (p) => proj(cam(p)),
    /** Scale factor at a world point: metres → pixels. */
    scale: (p) => f / cam(p)[2],

    poly(pts, fill, extra = '') {
      const clipped = clip(pts.map(cam));
      if (clipped.length < 3) return;
      const d = clipped.map((p, i) => `${i ? 'L' : 'M'}${proj(p).map(f1).join(',')}`).join('');
      parts.push(`<path d="${d}Z" fill="${fill}" ${extra}/>`);
    },

    rect(x0, z0, x1, z1, fill, extra) {
      scene.poly([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], fill, extra);
    },

    /** A painted line of width `w` metres between two ground points. */
    line(x0, z0, x1, z1, w, fill = LINE) {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const nx = (-(z1 - z0) / len) * (w / 2);
      const nz = ((x1 - x0) / len) * (w / 2);
      scene.poly(
        [[x0 + nx, z0 + nz], [x1 + nx, z1 + nz], [x1 - nx, z1 - nz], [x0 - nx, z0 - nz]],
        fill,
      );
    },

    /** A painted arc (or full circle) as a ring strip. */
    arc(cx, cz, r, w, a0 = 0, a1 = Math.PI * 2, fill = LINE, steps = 64) {
      const outer = [];
      const inner = [];
      for (let i = 0; i <= steps; i++) {
        const a = a0 + ((a1 - a0) * i) / steps;
        outer.push([cx + Math.cos(a) * (r + w / 2), cz + Math.sin(a) * (r + w / 2)]);
        inner.push([cx + Math.cos(a) * (r - w / 2), cz + Math.sin(a) * (r - w / 2)]);
      }
      scene.poly([...outer, ...inner.reverse()], fill);
    },

    disc(cx, cz, r, fill, steps = 32) {
      const pts = [];
      for (let i = 0; i < steps; i++) {
        const a = (Math.PI * 2 * i) / steps;
        pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]);
      }
      scene.poly(pts, fill);
    },

    /** A vertical pole: screen-space line whose width follows depth. */
    pole(X, Z, y0, y1, w, stroke) {
      if (scene.depth([X, Z]) < 1) return;
      const [xa, ya] = scene.point([X, Z, y0]);
      const [xb, yb] = scene.point([X, Z, y1]);
      const sw = Math.max(1, w * scene.scale([X, Z, y0]));
      parts.push(
        `<line x1="${f1(xa)}" y1="${f1(ya)}" x2="${f1(xb)}" y2="${f1(yb)}" stroke="${stroke}" stroke-width="${f1(sw)}" stroke-linecap="round"/>`,
      );
    },

    /** A vertical quad from ground segment (x0,z0)-(x1,z1), heights y0..y1. */
    wall(x0, z0, x1, z1, y0, y1, fill, extra) {
      scene.poly([[x0, z0, y0], [x1, z1, y0], [x1, z1, y1], [x0, z0, y1]], fill, extra);
    },

    async save(name, { width, height, quality = 82 } = {}) {
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs.join('')}</defs>${parts.join('')}</svg>`;
      let img = sharp(Buffer.from(svg));
      if (width) img = img.resize(width, height);
      const info = await img.webp({ quality, effort: 6 }).toFile(`${OUT}/${name}`);
      console.log(`${name.padEnd(24)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
    },
  };
  return scene;
}

const LINE = '#f4f7f2';

/* ------------------------------------------------------------------ */
/* Shared backdrop pieces (screen space)                               */
/* ------------------------------------------------------------------ */

function sky(sc, id, stops) {
  sc.def(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops
      .map(([o, col]) => `<stop offset="${o}" stop-color="${col}"/>`)
      .join('')}</linearGradient>`,
  );
  sc.add(`<rect width="${sc.W}" height="${sc.horizon + 4}" fill="url(#${id})"/>`);
}

/** Ground to the horizon; `far` fades toward the horizon for depth. */
function ground(sc, color, far = color) {
  const id = `gr${sc.horizon}${color.slice(1)}`;
  sc.def(
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${far}"/><stop offset="0.45" stop-color="${color}"/></linearGradient>`,
  );
  sc.add(`<rect y="${sc.horizon}" width="${sc.W}" height="${sc.H - sc.horizon}" fill="url(#${id})"/>`);
}

/** A band of rounded tree crowns sitting on the horizon. */
function treeLine(sc, color, minR, maxR, lift = 0) {
  let x = -maxR;
  const y = sc.horizon - lift;
  const crowns = [];
  while (x < sc.W + maxR) {
    const r = minR + rnd() * (maxR - minR);
    crowns.push(`<circle cx="${f1(x)}" cy="${f1(y - r * 0.35)}" r="${f1(r)}"/>`);
    x += r * (0.9 + rnd() * 0.5);
  }
  sc.add(`<g fill="${color}">${crowns.join('')}<rect y="${f1(y - 2)}" width="${sc.W}" height="${f1(lift + 6)}"/></g>`);
}

/** A strip of blocky buildings with a few lit windows. */
function skyline(sc, color, windowColor, minH, maxH) {
  let x = -10;
  const out = [];
  while (x < sc.W + 10) {
    const w = 40 + rnd() * 90;
    const hgt = minH + rnd() * (maxH - minH);
    const top = sc.horizon - hgt;
    out.push(`<rect x="${f1(x)}" y="${f1(top)}" width="${f1(w)}" height="${f1(hgt + 4)}" fill="${color}"/>`);
    for (let wy = top + 10; wy < sc.horizon - 12; wy += 16) {
      for (let wx = x + 8; wx < x + w - 10; wx += 14) {
        if (rnd() < 0.28) {
          out.push(`<rect x="${f1(wx)}" y="${f1(wy)}" width="6" height="8" fill="${windowColor}"/>`);
        }
      }
    }
    x += w + 4 + rnd() * 10;
  }
  sc.add(out.join(''));
}

/** Soft overall light — a top-left glow and a darker bottom edge. */
function lighting(sc, id, glow = 'rgba(255,248,220,0.22)', shade = 'rgba(6,20,14,0.28)') {
  sc.def(
    `<radialGradient id="${id}g" cx="0.25" cy="0.1" r="0.9"><stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>` +
      `<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0.55" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="${shade}"/></linearGradient>`,
  );
  sc.add(`<rect width="${sc.W}" height="${sc.H}" fill="url(#${id}g)"/>`);
  sc.add(`<rect width="${sc.W}" height="${sc.H}" fill="url(#${id}s)"/>`);
}

/** A floodlight mast with a glow; `props` queue for depth sorting. */
function floodlight(sc, props, X, Z, height = 14) {
  props.push({
    z: sc.depth([X, Z]),
    draw() {
      sc.pole(X, Z, 0, height, 0.35, '#1d2a24');
      const [x, y] = sc.point([X, Z, height]);
      const k = sc.scale([X, Z, height]);
      const w = Math.max(10, 2.4 * k);
      sc.add(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(w * 2.4)}" fill="url(#glow)"/>`);
      sc.add(`<rect x="${f1(x - w / 2)}" y="${f1(y - w * 0.35)}" width="${f1(w)}" height="${f1(w * 0.5)}" rx="2" fill="#fdfbe8"/>`);
    },
  });
}

function glowDef(sc, color = 'rgba(255,250,215,0.55)') {
  sc.def(
    `<radialGradient id="glow"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="rgba(255,250,215,0)"/></radialGradient>`,
  );
}

function meshDef(sc, id, color, step = 5) {
  sc.def(
    `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><path d="M0 0L${step} ${step}M${step} 0L0 ${step}" stroke="${color}" stroke-width="0.8"/></pattern>`,
  );
}

/* ------------------------------------------------------------------ */
/* Courts                                                              */
/* ------------------------------------------------------------------ */

/** Football pitch, length along X. Returns goal props for sorting. */
function footballPitch(sc, { L = 40, Wd = 20, run = 4, stripe = ['#2f9150', '#2a8347'] } = {}) {
  const hx = L / 2;
  const hz = Wd / 2;
  sc.rect(-hx - run, -hz - run, hx + run, hz + run, '#267540');
  const band = L / 10;
  for (let i = 0; i < 10; i++) {
    sc.rect(-hx + i * band, -hz - run * 0.6, -hx + (i + 1) * band, hz + run * 0.6, stripe[i % 2]);
  }
  const w = 0.12;
  sc.line(-hx, -hz, hx, -hz, w);
  sc.line(hx, -hz, hx, hz, w);
  sc.line(hx, hz, -hx, hz, w);
  sc.line(-hx, hz, -hx, -hz, w);
  sc.line(0, -hz, 0, hz, w);
  sc.arc(0, 0, 3, w);
  sc.disc(0, 0, 0.2, LINE);
  for (const side of [-1, 1]) {
    const x0 = side * hx;
    const x1 = side * (hx - 6);
    sc.line(x0, -6, x1, -6, w);
    sc.line(x1, -6, x1, 6, w);
    sc.line(x1, 6, x0, 6, w);
    sc.disc(side * (hx - 9), 0, 0.15, LINE);
  }

  return [-1, 1].map((side) => {
    const x = side * hx;
    const back = side * (hx + 1.2);
    return {
      z: sc.depth([x, 0]),
      draw() {
        // net: back, sides, roof — translucent white
        const net = 'stroke="rgba(255,255,255,0.35)" stroke-width="1"';
        sc.wall(back, -1.6, back, 1.6, 0, 2, 'url(#net)', net);
        sc.wall(x, -1.6, back, -1.6, 0, 2, 'url(#net)', net);
        sc.wall(x, 1.6, back, 1.6, 0, 2, 'url(#net)', net);
        sc.poly([[x, -1.6, 2], [back, -1.6, 2], [back, 1.6, 2], [x, 1.6, 2]], 'url(#net)', net);
        sc.pole(x, -1.6, 0, 2.05, 0.12, '#ffffff');
        sc.pole(x, 1.6, 0, 2.05, 0.12, '#ffffff');
        const [ax, ay] = sc.point([x, -1.6, 2]);
        const [bx, by] = sc.point([x, 1.6, 2]);
        const sw = Math.max(1, 0.12 * sc.scale([x, 0, 2]));
        sc.add(`<line x1="${f1(ax)}" y1="${f1(ay)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="#ffffff" stroke-width="${f1(sw)}" stroke-linecap="round"/>`);
      },
    };
  });
}

function ball(sc, X, Z, r, fill, seam) {
  const [x, y] = sc.point([X, Z, r]);
  const k = sc.scale([X, Z, r]);
  const R = r * k;
  const [sx, sy] = sc.point([X, Z, 0]);
  sc.add(`<ellipse cx="${f1(sx + R * 0.35)}" cy="${f1(sy)}" rx="${f1(R * 1.1)}" ry="${f1(R * 0.32)}" fill="rgba(0,0,0,0.28)"/>`);
  sc.add(`<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="${fill}"/>`);
  if (seam) sc.add(seam(x, y, R));
  sc.add(`<circle cx="${f1(x - R * 0.35)}" cy="${f1(y - R * 0.35)}" r="${f1(R * 0.35)}" fill="rgba(255,255,255,0.25)"/>`);
}

const footballSeam = (x, y, R) => {
  const pts = [];
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (i * Math.PI * 2) / 5;
    pts.push(`${f1(x + Math.cos(a) * R * 0.38)},${f1(y + Math.sin(a) * R * 0.38)}`);
  }
  return `<polygon points="${pts.join(' ')}" fill="#1f2a24"/>`;
};

const basketballSeam = (x, y, R) =>
  `<g fill="none" stroke="#3b1d0c" stroke-width="${f1(Math.max(1, R * 0.06))}">` +
  `<path d="M${f1(x - R)},${f1(y)}H${f1(x + R)}"/><path d="M${f1(x)},${f1(y - R)}V${f1(y + R)}"/>` +
  `<path d="M${f1(x - R * 0.7)},${f1(y - R * 0.72)}Q${f1(x - R * 0.2)},${f1(y)} ${f1(x - R * 0.7)},${f1(y + R * 0.72)}"/>` +
  `<path d="M${f1(x + R * 0.7)},${f1(y - R * 0.72)}Q${f1(x + R * 0.2)},${f1(y)} ${f1(x + R * 0.7)},${f1(y + R * 0.72)}"/></g>`;

/**
 * Windscreen round a rectangle: only the sides beyond the rectangle's centre
 * are drawn, so the camera never looks through a near fence.
 */
function windscreen(sc, x0, z0, x1, z1, height, fill) {
  const centre = sc.depth([(x0 + x1) / 2, (z0 + z1) / 2]);
  const sides = [
    [x0, z0, x1, z0],
    [x1, z0, x1, z1],
    [x1, z1, x0, z1],
    [x0, z1, x0, z0],
  ];
  for (const [a, b, c, e] of sides) {
    if (sc.depth([(a + c) / 2, (b + e) / 2]) > centre) sc.wall(a, b, c, e, 0, height, fill);
  }
}

/** Tennis court, length along X. `net` is returned as a prop. */
function tennisCourt(sc, { court, surround, line = LINE, screen }) {
  const hx = 11.885;
  const hd = 5.485;
  const hs = 4.115;
  sc.rect(-hx - 6, -hd - 3.6, hx + 6, hd + 3.6, surround);
  if (screen) windscreen(sc, -hx - 6, -hd - 3.6, hx + 6, hd + 3.6, 3.5, screen);
  sc.rect(-hx, -hd, hx, hd, court);
  const w = 0.07;
  sc.line(-hx, -hd, hx, -hd, w, line);
  sc.line(-hx, hd, hx, hd, w, line);
  sc.line(-hx, -hs, hx, -hs, w, line);
  sc.line(-hx, hs, hx, hs, w, line);
  sc.line(-hx, -hd, -hx, hd, w * 1.4, line);
  sc.line(hx, -hd, hx, hd, w * 1.4, line);
  sc.line(-6.4, -hs, -6.4, hs, w, line);
  sc.line(6.4, -hs, 6.4, hs, w, line);
  sc.line(-6.4, 0, 6.4, 0, w, line);
  sc.line(-hx, 0, -hx + 0.2, 0, w, line);
  sc.line(hx, 0, hx - 0.2, 0, w, line);

  return {
    z: sc.depth([0, 0]),
    draw() {
      sc.wall(0, -6.4, 0, 6.4, 0, 0.95, 'url(#tnet)', 'stroke="rgba(0,0,0,0.25)" stroke-width="0.5"');
      sc.wall(0, -6.4, 0, 6.4, 0.9, 0.98, '#ffffff');
      sc.pole(0, -6.4, 0, 1.07, 0.1, '#20332a');
      sc.pole(0, 6.4, 0, 1.07, 0.1, '#20332a');
    },
  };
}

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

async function hero() {
  const sc = makeScene({ W: 1200, H: 900, f: 1000, h: 12, d: 33, yaw: -22, horizon: 190, shiftX: 30 });
  glowDef(sc);
  meshDef(sc, 'net', 'rgba(255,255,255,0.45)', 4);
  sky(sc, 'sky', [[0, '#9fd6ff'], [0.7, '#dff2ff'], [1, '#f5fbff']]);
  skyline(sc, '#b9cfdc', '#e8f3fa', 18, 70);
  treeLine(sc, '#3f7d57', 12, 26, 2);
  ground(sc, '#2d7f47', '#7fb58c');
  treeLine(sc, '#356f4b', 20, 44, -60);
  const props = footballPitch(sc);
  floodlight(sc, props, -24, -15);
  floodlight(sc, props, 24, -15);
  floodlight(sc, props, -24, 15);
  floodlight(sc, props, 24, 15);
  props.sort((a, b) => b.z - a.z).forEach((p) => p.draw());
  ball(sc, 2.2, 1.4, 0.35, '#ffffff', footballSeam);
  lighting(sc, 'hl');
  await sc.save('hero-1200.webp');
  await sc.save('hero-800.webp', { width: 800, height: 600 });
}

/** Arena Sport — dusk, floodlit, portrait: the featured card's image. */
async function arenaSport() {
  const sc = makeScene({ W: 900, H: 1200, f: 900, h: 6, d: 30, yaw: 90, horizon: 470 });
  glowDef(sc, 'rgba(255,248,200,0.7)');
  meshDef(sc, 'net', 'rgba(255,255,255,0.5)', 4);
  sky(sc, 'sky', [[0, '#16233f'], [0.6, '#2c4a6b'], [1, '#e7a867']]);
  treeLine(sc, '#15261d', 14, 34, 4);
  ground(sc, '#246b3b', '#1d4a33');
  const props = footballPitch(sc);
  floodlight(sc, props, 22, -15, 16);
  floodlight(sc, props, 22, 15, 16);
  floodlight(sc, props, 0, -16, 16);
  floodlight(sc, props, 0, 16, 16);
  props.sort((a, b) => b.z - a.z).forEach((p) => p.draw());
  ball(sc, -9, 2.5, 0.35, '#ffffff', footballSeam);
  lighting(sc, 'al', 'rgba(255,240,200,0.18)', 'rgba(4,12,8,0.4)');
  await sc.save('arena-sport.webp');
}

async function tennisPoint() {
  // Covered hard court: roof trusses over a green surround, blue court.
  const sc = makeScene({ W: 800, H: 600, f: 760, h: 6.5, d: 19, yaw: 24, horizon: 170 });
  meshDef(sc, 'tnet', 'rgba(20,20,20,0.55)', 3);
  sky(sc, 'hall', [[0, '#e8edf0'], [1, '#c9d4da']]);
  const beams = [];
  for (let i = 0; i < 9; i++) {
    const x = (i / 8) * 800;
    beams.push(`<path d="M${f1(x)},0L${f1(400 + (x - 400) * 0.55)},118" stroke="#aebcc4" stroke-width="3"/>`);
  }
  sc.add(beams.join(''));
  sc.add(`<rect y="118" width="800" height="54" fill="#2a6049"/>`);
  ground(sc, '#2f7a58', '#3b8a66');
  const net = tennisCourt(sc, { court: '#2d5fa6', surround: '#2f7a58', screen: '#22583f' });
  net.draw();
  ball(sc, 5.5, -2.2, 0.12, '#d8f25a');
  lighting(sc, 'tl', 'rgba(255,255,255,0.25)');
  await sc.save('tennis-point.webp');
}

async function smashClub() {
  // Clay courts behind a green windscreen, afternoon.
  const sc = makeScene({ W: 800, H: 600, f: 780, h: 6.5, d: 19, yaw: -30, horizon: 180 });
  meshDef(sc, 'tnet', 'rgba(20,20,20,0.55)', 3);
  sky(sc, 'sky', [[0, '#8fcaf0'], [1, '#e3f3fb']]);
  treeLine(sc, '#3e7a4f', 14, 30, 0);
  sc.add(`<rect y="140" width="800" height="42" fill="#1f5a3c"/>`);
  ground(sc, '#b85a33', '#a84f2c');
  const net = tennisCourt(sc, { court: '#c8683d', surround: '#b85a33', screen: '#1f5a3c' });
  net.draw();
  ball(sc, -6, 2.8, 0.12, '#d8f25a');
  lighting(sc, 'sl');
  await sc.save('smash-club.webp');
}

function basketballCourt(sc, { court = '#d77a3e', key = '#245f8c', outer = '#3a6f8f' } = {}) {
  const hx = 14;
  const hz = 7.5;
  sc.rect(-hx - 3, -hz - 3, hx + 3, hz + 3, outer);
  sc.rect(-hx, -hz, hx, hz, court);
  const w = 0.07;
  for (const side of [-1, 1]) {
    const base = side * hx;
    const ft = side * (hx - 5.8);
    sc.rect(base, -2.45, ft, 2.45, key);
    const hoop = side * (hx - 1.575);
    // three-point line: straights at z=±6.6 then an arc of r=6.75
    const a = Math.asin(6.6 / 6.75);
    const bend = hoop - side * Math.cos(a) * 6.75;
    sc.line(base, -6.6, bend, -6.6, w);
    sc.line(base, 6.6, bend, 6.6, w);
    if (side < 0) sc.arc(hoop, 0, 6.75, w, -a, a);
    else sc.arc(hoop, 0, 6.75, w, Math.PI - a, Math.PI + a);
    sc.line(base, -2.45, ft, -2.45, w);
    sc.line(base, 2.45, ft, 2.45, w);
    sc.line(ft, -2.45, ft, 2.45, w);
    sc.arc(ft, 0, 1.8, w);
  }
  sc.line(-hx, -hz, hx, -hz, w);
  sc.line(-hx, hz, hx, hz, w);
  sc.line(-hx, -hz, -hx, hz, w);
  sc.line(hx, -hz, hx, hz, w);
  sc.line(0, -hz, 0, hz, w);
  sc.arc(0, 0, 1.8, w);

  return [-1, 1].map((side) => {
    const board = side * (hx - 1.2);
    const post = side * (hx + 1.4);
    return {
      z: sc.depth([board, 0]),
      draw() {
        sc.pole(post, 0, 0, 3.4, 0.2, '#26323a');
        const [px, py] = sc.point([post, 0, 3.35]);
        const [bx, by] = sc.point([board, 0, 3.35]);
        const sw = Math.max(1, 0.15 * sc.scale([board, 0, 3.35]));
        sc.add(`<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(bx)}" y2="${f1(by)}" stroke="#26323a" stroke-width="${f1(sw)}"/>`);
        sc.wall(board, -0.9, board, 0.9, 2.9, 3.95, 'rgba(255,255,255,0.92)', 'stroke="#26323a" stroke-width="1.5"');
        sc.wall(board, -0.3, board, 0.3, 3.05, 3.5, 'none', 'stroke="#d9432f" stroke-width="2"');
        // ring: a flat circle at rim height
        const pts = [];
        for (let i = 0; i < 24; i++) {
          const t = (Math.PI * 2 * i) / 24;
          const hoopX = side * (hx - 1.575);
          pts.push(sc.point([hoopX + Math.cos(t) * 0.23, Math.sin(t) * 0.23, 3.05]).map(f1).join(','));
        }
        sc.add(`<polygon points="${pts.join(' ')}" fill="none" stroke="#e0492f" stroke-width="${f1(Math.max(1.5, sw * 0.8))}"/>`);
      },
    };
  });
}

async function riverside() {
  // Outdoor court on the embankment: river and far bank behind.
  const sc = makeScene({ W: 800, H: 600, f: 560, h: 9, d: 26, yaw: 18, horizon: 160 });
  sky(sc, 'sky', [[0, '#7cc0ec'], [1, '#d7eefb']]);
  treeLine(sc, '#4b8a5c', 10, 22, 22);
  sc.add(`<rect y="${160 - 22}" width="800" height="24" fill="#5aa4c8"/>`);
  sc.add(`<rect y="${160 - 10}" width="800" height="3" fill="#8cc8e2"/>`);
  ground(sc, '#9aa6a0', '#b7c0bb');
  const props = basketballCourt(sc);
  props.sort((a, b) => b.z - a.z).forEach((p) => p.draw());
  ball(sc, -2, 3, 0.12 * 2, '#e2742c', basketballSeam);
  lighting(sc, 'rl');
  await sc.save('riverside-court.webp');
}

async function cityFootball() {
  // 5-a-side cage between city blocks, early evening.
  const sc = makeScene({ W: 800, H: 600, f: 560, h: 9, d: 24, yaw: -18, horizon: 175 });
  glowDef(sc);
  meshDef(sc, 'net', 'rgba(255,255,255,0.45)', 4);
  meshDef(sc, 'fence', 'rgba(210,225,230,0.35)', 9);
  sky(sc, 'sky', [[0, '#48678f'], [0.7, '#9fb3c9'], [1, '#f1c89a']]);
  skyline(sc, '#2d3e52', '#ffd98a', 40, 130);
  ground(sc, '#2b7a44');
  const props = footballPitch(sc, { L: 25, Wd: 15, run: 1.5, stripe: ['#2f9150', '#29844a'] });
  // cage: far and near fences, 4 m high
  const hx = 14;
  const hz = 9;
  props.push({
    z: sc.depth([0, -hz]) + 100,
    draw() {
      sc.wall(-hx, hz, hx, hz, 0, 4, 'url(#fence)');
      sc.wall(-hx, -hz, -hx, hz, 0, 4, 'url(#fence)');
      sc.wall(hx, -hz, hx, hz, 0, 4, 'url(#fence)');
    },
  });
  for (let x = -hx; x <= hx; x += 4) {
    props.push({ z: sc.depth([x, hz]), draw: () => sc.pole(x, hz, 0, 4, 0.1, '#20312a') });
  }
  floodlight(sc, props, -hx, hz, 8);
  floodlight(sc, props, hx, hz, 8);
  props.sort((a, b) => b.z - a.z).forEach((p) => p.draw());
  ball(sc, 3, -1, 0.3, '#ffffff', footballSeam);
  lighting(sc, 'cl', 'rgba(255,230,190,0.15)');
  await sc.save('city-football.webp');
}

async function activeHall() {
  // Indoor volleyball hall seen from behind one baseline: net across the
  // frame, orange court on a blue free zone, windows high on the far wall.
  const sc = makeScene({ W: 800, H: 600, f: 560, h: 4.5, d: 13, yaw: 90, horizon: 250 });
  meshDef(sc, 'vnet', 'rgba(15,20,25,0.6)', 5);
  const back = 13;
  const side = 11;
  sc.add(`<rect width="800" height="600" fill="#d9d0c0"/>`);
  ground(sc, '#2b62a4');
  sc.rect(-20, -side, back, side, '#285d9c');
  sc.wall(back, -side, back, side, 0, 9, '#ece4d6');
  sc.wall(back, -side, back, side, 0, 1.6, '#2f6b4f');
  for (let i = 0; i < 6; i++) {
    const z0 = -side + 1 + i * 3.6;
    sc.wall(back, z0, back, z0 + 2.6, 4.6, 7, '#bfe0f2');
  }
  sc.wall(-20, -side, back, -side, 0, 9, '#e3d9c8');
  sc.wall(-20, side, back, side, 0, 9, '#e3d9c8');
  sc.wall(-20, -side, back, -side, 0, 1.6, '#2a6148');
  sc.wall(-20, side, back, side, 0, 1.6, '#2a6148');
  for (let i = 0; i < 4; i++) {
    const x = -6 + i * 5;
    sc.poly([[x, -3, 8.6], [x + 1.4, -3, 8.6], [x + 1.4, 3, 8.6], [x, 3, 8.6]], '#fffbe9');
  }
  sc.rect(-14, -8, back, 8, '#2b62a4');
  sc.rect(-9, -4.5, 9, 4.5, '#e07b39');
  const w = 0.05;
  sc.line(-9, -4.5, 9, -4.5, w);
  sc.line(-9, 4.5, 9, 4.5, w);
  sc.line(-9, -4.5, -9, 4.5, w);
  sc.line(9, -4.5, 9, 4.5, w);
  sc.line(0, -4.5, 0, 4.5, w);
  sc.line(-3, -4.5, -3, 4.5, w);
  sc.line(3, -4.5, 3, 4.5, w);
  ball(sc, -4.5, -1.5, 0.21, '#f3d34a', (x, y, R) =>
    `<path d="M${f1(x - R)},${f1(y)}Q${f1(x)},${f1(y - R * 0.8)} ${f1(x + R)},${f1(y)}" fill="none" stroke="#2b62a4" stroke-width="${f1(R * 0.15)}"/>`,
  );
  // net across X = 0, band from 1.43 to 2.43 m
  sc.wall(0, -5, 0, 5, 1.43, 2.43, 'url(#vnet)');
  sc.wall(0, -5, 0, 5, 2.35, 2.43, '#ffffff');
  sc.wall(0, -5, 0, 5, 1.43, 1.47, '#ffffff');
  sc.pole(0, -5.3, 0, 2.6, 0.12, '#1b2530');
  sc.pole(0, 5.3, 0, 2.6, 0.12, '#1b2530');
  lighting(sc, 'vl', 'rgba(255,250,235,0.25)', 'rgba(10,20,40,0.25)');
  await sc.save('active-hall.webp');
}

/** Info block — portrait basketball court seen low from a corner. */
async function about() {
  const sc = makeScene({ W: 960, H: 1200, f: 950, h: 2.4, d: 15, yaw: 62, horizon: 560, shiftX: 120 });
  sky(sc, 'sky', [[0, '#f7c98c'], [0.55, '#f3dfb5'], [1, '#e9eee6']]);
  skyline(sc, '#c9b89c', '#fff4d6', 20, 80);
  treeLine(sc, '#5f8f63', 14, 30, 2);
  ground(sc, '#8b9892', '#a9b3ad');
  const props = basketballCourt(sc, { court: '#2f7a58', key: '#c8683d', outer: '#3a4f5c' });
  props.sort((a, b) => b.z - a.z).forEach((p) => p.draw());
  ball(sc, -5.5, 2.6, 0.24, '#e2742c', basketballSeam);
  lighting(sc, 'bl', 'rgba(255,236,200,0.3)', 'rgba(20,20,10,0.3)');
  await sc.save('about.webp');
}

await hero();
await arenaSport();
await tennisPoint();
await smashClub();
await riverside();
await cityFootball();
await activeHall();
await about();
