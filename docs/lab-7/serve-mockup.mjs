// Serves the local reference solution (docs/lab-7/mockup/, gitignored) as a
// "deployed" Courtly page for trying the auto-check on localhost:
//
//   npm run mockup            # → http://localhost:4400/
//   npm run mockup -- 4500    # another port
//
// Then paste http://localhost:4400/ into /labs/lab-7/check/ on `npm run dev`.
//
// The mockup only exists to render the captures, so it has no canonical, Open
// Graph, robots.txt or sitemap.xml. They are added here at serve time; the
// files on disk stay untouched. Expected result: 12 / 12.
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const MOCKUP = path.join(here, "mockup");
const ASSETS = path.resolve(here, "../../courtly-assets");
const PORT = Number(process.argv[2] ?? process.env.PORT ?? 4400);
const ORIGIN = `http://localhost:${PORT}`;

if (!fs.existsSync(path.join(MOCKUP, "index.html"))) {
  console.error(
    `No mockup at ${MOCKUP}. It is gitignored and only exists on the instructor's machine (see README.md).`,
  );
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

const SEO = `
  <link rel="canonical" href="${ORIGIN}/">
  <meta property="og:title" content="Courtly — онлайн-бронювання спортивних майданчиків">
  <meta property="og:description" content="Обирайте майданчик, дату та час і бронюйте онлайн.">
  <meta property="og:url" content="${ORIGIN}/">
  <meta property="og:image" content="${ORIGIN}/courtly-assets/img/og-image.jpg">`;

const ROBOTS = `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`;
const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${ORIGIN}/</loc></url>
</urlset>
`;

/** Map a URL path onto one of the two roots; null when it escapes them. */
function resolve(urlPath) {
  // index.html links assets as ../../../courtly-assets/…, which a browser
  // resolves to /courtly-assets/… when the page is served at /.
  const [root, rel] = urlPath.startsWith("/courtly-assets/")
    ? [ASSETS, urlPath.slice("/courtly-assets/".length)]
    : [MOCKUP, urlPath === "/" ? "index.html" : urlPath.slice(1)];
  const file = path.resolve(root, rel);
  return file.startsWith(root + path.sep) ? file : null;
}

http
  .createServer((req, res) => {
    // Both real hosts (GitHub Pages, Vercel) send this; the checker needs it.
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "no-store");
    const urlPath = decodeURIComponent(new URL(req.url, ORIGIN).pathname);

    if (urlPath === "/robots.txt") return send(res, 200, "text/plain; charset=utf-8", ROBOTS);
    if (urlPath === "/sitemap.xml") return send(res, 200, "application/xml; charset=utf-8", SITEMAP);

    const file = resolve(urlPath);
    if (!file || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      return send(res, 404, "text/html; charset=utf-8", "<!doctype html><title>404</title><h1>404</h1>");
    }
    const ext = path.extname(file).toLowerCase();
    let body = fs.readFileSync(file);
    if (ext === ".html") body = body.toString("utf8").replace("</title>", `</title>${SEO}`);
    send(res, 200, TYPES[ext] ?? "application/octet-stream", body);
  })
  .listen(PORT, () => {
    console.log(`Courtly mockup: ${ORIGIN}/`);
    console.log(`Check it at:    http://localhost:4321/web-development-2026/labs/lab-7/check/?url=${ORIGIN}/`);
  });

function send(res, status, type, body) {
  res.writeHead(status, { "Content-Type": type });
  res.end(body);
}
