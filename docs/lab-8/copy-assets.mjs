/**
 * Lab 8 — copies the Courtly design assets into the Courtly Booking starter.
 *
 *   node docs/lab-8/copy-assets.mjs        (run from the repo root)
 *
 * The starter reuses Lab 7's public asset pack (courtly-assets/): tokens,
 * favicon, logo mark and the six venue illustrations. The catalogue has
 * twelve venues, so each of the other six is a mirrored copy of an
 * illustration of the same sport. Every card image is 800×600 — the pack's
 * featured illustration is a portrait, so it is cropped.
 *
 * `sharp` comes from the site's own node_modules. Output is deterministic.
 */
import sharp from 'sharp';
import { copyFileSync, mkdirSync } from 'node:fs';

const SRC = 'courtly-assets';
const OUT = 'courtly-booking-starter';
mkdirSync(`${OUT}/css`, { recursive: true });
mkdirSync(`${OUT}/img/venues`, { recursive: true });

copyFileSync(`${SRC}/tokens.css`, `${OUT}/css/tokens.css`);
copyFileSync(`${SRC}/favicon.svg`, `${OUT}/img/favicon.svg`);
copyFileSync(`${SRC}/img/logo-mark.svg`, `${OUT}/img/logo-mark.svg`);

/** Card image → [pack illustration, mirrored]. */
const VENUES = {
  'arena-sport': ['arena-sport', false],
  'smash-club': ['smash-club', false],
  'tennis-point': ['tennis-point', false],
  'active-hall': ['active-hall', false],
  'riverside-court': ['riverside-court', false],
  'city-football': ['city-football', false],
  'green-field': ['city-football', true],
  'royal-court': ['smash-club', true],
  'sea-volley': ['active-hall', true],
  'hoop-point': ['riverside-court', true],
  'dnipro-futsal': ['arena-sport', true],
  'kharkiv-tennis-center': ['tennis-point', true],
};

for (const [name, [source, mirrored]] of Object.entries(VENUES)) {
  let img = sharp(`${SRC}/img/${source}.webp`).resize(800, 600, { fit: 'cover' });
  if (mirrored) img = img.flop();
  const info = await img.webp({ quality: 80, effort: 6 }).toFile(`${OUT}/img/venues/${name}.webp`);
  console.log(`${name.padEnd(24)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
