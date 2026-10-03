/**
 * Lab 7 — renders the Courtly mockup and the OG image through headless Edge.
 *
 *   node docs/lab-7/render-mockup.mjs          (run from the repo root)
 *
 * Inputs:
 *   docs/lab-7/mockup/index.html   the reference page — gitignored, local only
 *   docs/lab-7/og-image.html       the 1200×630 social card
 *
 * Outputs:
 *   public/labs/lab-7/mockup-{desktop,tablet,mobile}.webp   full-page captures
 *   public/labs/lab-7/mockup-mobile-menu.webp               first screen, menu open
 *   src/data/courtly-mockup.json                            where each section starts in the
 *                                                           full-page captures (auto-check viewer)
 *   courtly-assets/img/og-image.jpg
 *
 * Edge over CDP rather than `msedge --screenshot`, which returns a blank frame
 * here; `mobile: false` at phone width, because mobile emulation desyncs the
 * visual and layout viewports on long pages. Fonts come from Google Fonts, so
 * the run needs network access.
 */
import { spawn } from 'node:child_process';
import { mkdtempSync, existsSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
// Node strips the types; the function is serialised and run in the page.
import { sectionAnchors } from '../../src/scripts/courtly-check.ts';

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const ROOT = process.cwd();
const MOCKUP = path.join(ROOT, 'docs/lab-7/mockup/index.html');
const OG = path.join(ROOT, 'docs/lab-7/og-image.html');
const OUT = path.join(ROOT, 'public/labs/lab-7');
const ANCHORS = path.join(ROOT, 'src/data/courtly-mockup.json');

if (!existsSync(MOCKUP)) {
  console.error(`Missing ${MOCKUP} — the mockup source is local-only (see docs/lab-7/README.md).`);
  process.exit(1);
}

const profile = mkdtempSync(path.join(tmpdir(), 'courtly-edge-'));
const edge = spawn(EDGE, [
  '--headless=new',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  '--hide-scrollbars',
  '--no-first-run',
  'about:blank',
]);

const wsUrl = await new Promise((resolve, reject) => {
  let buf = '';
  edge.stderr.on('data', (chunk) => {
    buf += chunk;
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) resolve(m[1]);
  });
  edge.on('exit', () => reject(new Error('Edge exited before DevTools came up')));
});

const ws = new WebSocket(wsUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));

let nextId = 0;
const pending = new Map();
const listeners = [];
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
  } else if (msg.method) {
    listeners.forEach((fn) => fn(msg));
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
const page = (method, params) => send(method, params, sessionId);
await page('Page.enable');
await page('Runtime.enable');

const evaluate = async (expression) =>
  (await page('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })).result.value;

async function open(url, width, height) {
  await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  const loaded = new Promise((resolve) => {
    const fn = (msg) => {
      if (msg.method === 'Page.loadEventFired' && msg.sessionId === sessionId) {
        listeners.splice(listeners.indexOf(fn), 1);
        resolve();
      }
    };
    listeners.push(fn);
  });
  await page('Page.navigate', { url });
  await loaded;
  await evaluate('document.fonts.ready.then(() => true)');
}

/**
 * Every <img> inside the viewport decoded. Lazy images below it never start,
 * so waiting on them would hang a first-screen capture.
 */
const imagesReady = () =>
  evaluate(`Promise.all([...document.images].filter((img) => img.getBoundingClientRect().top < innerHeight).map((img) => img.complete ? img.decode().catch(() => {}) : new Promise((r) => { img.onload = img.onerror = r; }))).then(() => true)`);

async function capture(width, height) {
  const { data } = await page('Page.captureScreenshot', {
    format: 'png',
    clip: { x: 0, y: 0, width, height, scale: 1 },
    captureBeyondViewport: false,
  });
  return Buffer.from(data, 'base64');
}

/** Full-page captures by width, with their section anchors. */
const views = {};

async function fullPage(name, width) {
  await open(pathToFileURL(MOCKUP).href, width, 900);
  const height = await evaluate('document.documentElement.scrollHeight');
  await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await imagesReady();
  const overflow = await evaluate('document.documentElement.scrollWidth - innerWidth');
  const anchors = await evaluate(`(${sectionAnchors})(document)`);
  const png = await capture(width, height);
  const info = await sharp(png).webp({ quality: 86, effort: 6 }).toFile(path.join(OUT, name));
  views[width] = { src: `/labs/lab-7/${name}`, height, anchors };
  console.log(`${name.padEnd(26)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB  overflow-x: ${overflow}px`);
}

await fullPage('mockup-desktop.webp', 1440);
await fullPage('mockup-tablet.webp', 768);
await fullPage('mockup-mobile.webp', 375);
writeFileSync(ANCHORS, `${JSON.stringify(views, null, 2)}
`);
console.log(`${'courtly-mockup.json'.padEnd(26)} ${Object.keys(views).length} views`);

// Phone, first screen, menu open.
await open(pathToFileURL(MOCKUP).href, 375, 760);
await imagesReady();
await evaluate(`document.querySelector('.menu-toggle').click(); true`);
{
  const png = await capture(375, 760);
  const info = await sharp(png).webp({ quality: 86 }).toFile(path.join(OUT, 'mockup-mobile-menu.webp'));
  console.log(`${'mockup-mobile-menu.webp'.padEnd(26)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

// OG image.
await open(pathToFileURL(OG).href, 1200, 630);
await imagesReady();
{
  const png = await capture(1200, 630);
  const info = await sharp(png).jpeg({ quality: 85, mozjpeg: true }).toFile(path.join(ROOT, 'courtly-assets/img/og-image.jpg'));
  console.log(`${'og-image.jpg'.padEnd(26)} ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

ws.close();
edge.kill();
await new Promise((r) => setTimeout(r, 500));
rmSync(profile, { recursive: true, force: true, maxRetries: 5 });
