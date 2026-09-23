/**
 * Lab 4 — regenerates the FlowTask starter's raster assets.
 *
 *   node docs/lab-4/generate-assets.mjs        (run from the repo root)
 *
 * Defect A9 depends on real bytes: `hero.jpg` has to be genuinely oversized
 * (~4000 px wide, ~3 MB) or Lighthouse has nothing to report and the LCP
 * exercise collapses. That is why the hero is grain over a gradient with a
 * translucent app-window mock composited on top — the mock makes it read as a
 * product shot, the grain underneath keeps the file heavy. Flat vector art at
 * the same size compresses to ~200 KB and the defect disappears.
 *
 * `sharp` comes from the site's own node_modules (an Astro dependency), so no
 * extra install is needed. Output is deterministic: same seed, same bytes.
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'flowtask-starter/img';
mkdirSync(OUT, { recursive: true });

let seed = 20260930;
const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);

/** Gradient + soft blobs + per-pixel grain, as a raw RGB sharp pipeline. */
function grainField(w, h, stops, blobCount, grain) {
  const blobs = [];
  for (let i = 0; i < blobCount; i++) {
    blobs.push({
      x: rnd() * w,
      y: rnd() * h,
      r: (0.12 + rnd() * 0.35) * Math.min(w, h),
      c: [rnd(), rnd(), rnd()],
    });
  }

  const buf = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const t = (x / w) * 0.6 + (y / h) * 0.4;
      const i = Math.min(stops.length - 2, Math.floor(t * (stops.length - 1)));
      const f = t * (stops.length - 1) - i;
      let r = stops[i][0] + (stops[i + 1][0] - stops[i][0]) * f;
      let g = stops[i][1] + (stops[i + 1][1] - stops[i][1]) * f;
      let b = stops[i][2] + (stops[i + 1][2] - stops[i][2]) * f;

      for (const bl of blobs) {
        const d = Math.hypot(x - bl.x, y - bl.y) / bl.r;
        if (d < 1) {
          const k = (1 - d) * (1 - d) * 0.55;
          r += (bl.c[0] * 255 - r) * k;
          g += (bl.c[1] * 255 - g) * k;
          b += (bl.c[2] * 255 - b) * k;
        }
      }

      const n = (rnd() - 0.5) * grain;
      const o = (y * w + x) * 3;
      buf[o] = Math.max(0, Math.min(255, r + n));
      buf[o + 1] = Math.max(0, Math.min(255, g + n * 0.9));
      buf[o + 2] = Math.max(0, Math.min(255, b + n * 1.1));
    }
  }

  return sharp(buf, { raw: { width: w, height: h, channels: 3 } });
}

/* hero.jpg — 4000 × 2500, ~3 MB, no `width`/`height` in the markup (A9). */

const W = 4000;
const H = 2500;
const base = grainField(
  W,
  H,
  [[38, 43, 120], [79, 70, 229], [139, 92, 246], [45, 212, 191], [236, 240, 253]],
  14,
  38,
);

const card = (x, y, w, h, o) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="18" fill="#ffffff" opacity="${o}"/>`;
const bar = (x, y, w, h, fill, o) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${fill}" opacity="${o}"/>`;

let columns = '';
const colX = [860, 1560, 2260, 2960];
const colAccent = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b'];
for (let c = 0; c < 4; c++) {
  const x = colX[c];
  columns += `<rect x="${x}" y="760" width="620" height="1480" rx="26" fill="#ffffff" opacity="0.62"/>`;
  columns += bar(x + 40, 810, 210, 26, colAccent[c], 0.85);
  let y = 890;
  const cards = 3 + Math.floor(rnd() * 2);
  for (let i = 0; i < cards; i++) {
    const h = 210 + Math.floor(rnd() * 120);
    columns += card(x + 34, y, 552, h, 0.93);
    columns += bar(x + 70, y + 46, 300 + rnd() * 180, 20, '#111827', 0.55);
    columns += bar(x + 70, y + 92, 380 + rnd() * 120, 16, '#111827', 0.25);
    columns += bar(x + 70, y + 126, 260 + rnd() * 160, 16, '#111827', 0.18);
    columns += bar(x + 70, y + h - 60, 120, 28, colAccent[c], 0.35);
    columns += `<circle cx="${x + 520}" cy="${y + h - 46}" r="22" fill="#111827" opacity="0.2"/>`;
    y += h + 40;
  }
}

const window = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect x="300" y="280" width="3400" height="2100" rx="44" fill="#ffffff" opacity="0.55"/>
  <rect x="300" y="280" width="3400" height="130" rx="44" fill="#ffffff" opacity="0.75"/>
  <rect x="300" y="360" width="3400" height="50" fill="#ffffff" opacity="0.75"/>
  <circle cx="380" cy="345" r="20" fill="#ef4444" opacity="0.8"/>
  <circle cx="440" cy="345" r="20" fill="#f59e0b" opacity="0.8"/>
  <circle cx="500" cy="345" r="20" fill="#22c55e" opacity="0.8"/>
  ${bar(600, 325, 900, 40, '#111827', 0.14)}
  <rect x="300" y="410" width="480" height="1970" fill="#ffffff" opacity="0.5"/>
  ${bar(360, 470, 320, 34, '#4f46e5', 0.7)}
  ${[0, 1, 2, 3, 4, 5].map((i) => bar(360, 570 + i * 78, 300 - i * 14, 26, '#111827', 0.28)).join('')}
  ${bar(360, 1120, 260, 26, '#111827', 0.16)}
  ${[0, 1, 2].map((i) => bar(360, 1200 + i * 78, 280 - i * 20, 26, '#111827', 0.22)).join('')}
  ${bar(860, 470, 420, 44, '#111827', 0.45)}
  ${bar(3200, 466, 460, 52, '#4f46e5', 0.72)}
  ${bar(860, 560, 1200, 28, '#111827', 0.16)}
  ${columns}
</svg>`);

await base
  .composite([{ input: window, top: 0, left: 0 }])
  .jpeg({ quality: 94, chromaSubsampling: '4:4:4' })
  .toFile(`${OUT}/hero.jpg`);

/* avatar-1..3.jpg — testimonial portraits, 480 × 480. */

const palettes = [
  [[92, 74, 160], [214, 158, 122], [244, 232, 220]],
  [[52, 96, 140], [160, 190, 210], [238, 244, 248]],
  [[128, 82, 74], [210, 170, 140], [246, 238, 228]],
];

for (let i = 0; i < palettes.length; i++) {
  await grainField(480, 480, palettes[i], 5, 18)
    .jpeg({ quality: 82 })
    .toFile(`${OUT}/avatar-${i + 1}.jpg`);
}
