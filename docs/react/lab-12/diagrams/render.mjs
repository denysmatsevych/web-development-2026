// Renders the Mermaid diagrams next to this file (*.mmd) into the images the
// ЛР-12 handout shows in §4, as public/uk/react/labs/lab-12/<name>.webp.
// The site shows a ```mermaid block as code, so a diagram the handout shows
// as a picture is an image.
//
//   node docs/react/lab-12/diagrams/render.mjs <path to mermaid.min.js>
//
// mermaid.min.js comes from the `mermaid` package (dist/mermaid.min.js),
// installed anywhere outside the repository: the site doesn't depend on it.
// Run it from PowerShell with the sandbox off, as solution/shots.mjs: Edge
// doesn't start from Node inside the Bash tool's sandbox.

import { spawn } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = resolve(HERE, '../../../../public/uk/react/labs/lab-12')
const [mermaidJs] = process.argv.slice(2)
if (!mermaidJs) throw new Error('usage: node render.mjs <path to mermaid.min.js>')

const work = mkdtempSync(join(tmpdir(), 'lab12-diagrams-'))
const page = join(work, 'index.html')
writeFileSync(
  page,
  `<!doctype html><meta charset="utf-8">
<style>body { margin: 0; background: #fff } #out { display: inline-block; padding: 16px }</style>
<div id="out"></div>
<script src="${pathToFileURL(resolve(mermaidJs)).href}"></script>
<script>
  mermaid.initialize({
    startOnLoad: false,
    theme: 'base',
    themeVariables: {
      fontFamily: 'Segoe UI, Arial, sans-serif',
      fontSize: '15px',
      primaryColor: '#ffffff',
      primaryBorderColor: '#8a7a6d',
      primaryTextColor: '#2b211b',
      lineColor: '#5b4a3f',
      edgeLabelBackground: '#ffffff',
    },
    flowchart: { htmlLabels: true, nodeSpacing: 28, rankSpacing: 56, wrappingWidth: 420 },
  })
  window.draw = async (source) => {
    const { svg } = await mermaid.render('diagram' + Date.now(), source)
    document.getElementById('out').innerHTML = svg
    // Mermaid sizes the SVG to its container (width 100%); draw it at the
    // size of its viewBox instead.
    const el = document.querySelector('#out svg')
    const [, , w, h] = el.getAttribute('viewBox').split(/\\s+/).map(Number)
    el.setAttribute('width', w)
    el.setAttribute('height', h)
    el.style.maxWidth = 'none'
    const r = document.getElementById('out').getBoundingClientRect()
    return { width: Math.ceil(r.width), height: Math.ceil(r.height) }
  }
</script>`,
)

const profile = mkdtempSync(join(tmpdir(), 'edge-lab12-diagrams-'))
const edge = spawn(EDGE, [
  '--headless=new',
  '--remote-debugging-port=0',
  `--user-data-dir=${profile}`,
  '--no-first-run',
  '--allow-file-access-from-files',
  'about:blank',
])
const wsUrl = await new Promise((done, fail) => {
  let buf = ''
  edge.stderr.on('data', (d) => {
    buf += d
    const m = buf.match(/DevTools listening on (ws:\/\/\S+)/)
    if (m) done(m[1])
  })
  setTimeout(() => fail(new Error('no DevTools line: ' + buf)), 20000)
})

const ws = new WebSocket(wsUrl)
await new Promise((r) => ws.addEventListener('open', r))
let nextId = 0
const pending = new Map()
ws.addEventListener('message', (e) => {
  const msg = JSON.parse(e.data)
  if (msg.id && pending.has(msg.id)) {
    const { done, fail } = pending.get(msg.id)
    pending.delete(msg.id)
    if (msg.error) fail(new Error(JSON.stringify(msg.error)))
    else done(msg.result)
  }
})
const send = (method, params = {}, sessionId) =>
  new Promise((done, fail) => {
    const id = ++nextId
    pending.set(id, { done, fail })
    ws.send(JSON.stringify({ id, method, params, sessionId }))
  })

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true })
const cdp = (method, params) => send(method, params, sessionId)
await cdp('Page.enable')
await cdp('Emulation.setDeviceMetricsOverride', { width: 1600, height: 1200, deviceScaleFactor: 2, mobile: false })
await cdp('Page.navigate', { url: pathToFileURL(page).href })
await new Promise((r) => setTimeout(r, 1500))

for (const file of readdirSync(HERE).filter((f) => f.endsWith('.mmd')).sort()) {
  const source = readFileSync(join(HERE, file), 'utf8')
  const r = await cdp('Runtime.evaluate', {
    expression: `draw(${JSON.stringify(source)})`,
    awaitPromise: true,
    returnByValue: true,
  })
  if (r.exceptionDetails) throw new Error(`${file}: ${r.exceptionDetails.exception?.description ?? r.exceptionDetails.text}`)
  const { width, height } = r.result.value
  const { data } = await cdp('Page.captureScreenshot', {
    format: 'webp',
    quality: 92,
    clip: { x: 0, y: 0, width, height, scale: 1 },
  })
  const name = file.replace(/\.mmd$/, '.webp')
  writeFileSync(join(OUT, name), Buffer.from(data, 'base64'))
  console.log(`${name}: ${width}x${height} CSS px`)
}

ws.close()
edge.kill()
process.exit(0)
