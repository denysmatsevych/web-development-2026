"""Build a lab's PDF handout from src/content/labs/<course>/uk/<lab>.md.

Matches the look of lab-3.pdf (Noto Sans, navy headings, green deadline line,
grey code blocks, US Letter). Run from the repo root with the lab's id, and
the course slug for any course other than Web Development:

    python docs/web/build-handout.py lab-6          # public/labs/lab-6.pdf
    python docs/web/build-handout.py lab-1 react    # public/react/labs/lab-1.pdf

Web Development handouts keep the /labs/ URLs students already have; every
other course's go under /<course>/labs/. The lab's `handout:` field must name
the same path.

Needs `markdown-it-py` (pip) and Microsoft Edge; fonts come from jsDelivr
(Fontsource), so the run needs network access.
"""
import pathlib
import re
import subprocess
import sys
import tempfile

from markdown_it import MarkdownIt

ROOT = pathlib.Path(__file__).resolve().parents[2]
if len(sys.argv) not in (2, 3):
    sys.exit("usage: python docs/web/build-handout.py <lab-id> [course]   (e.g. lab-6, or lab-1 react)")
LAB = sys.argv[1]
COURSE = sys.argv[2] if len(sys.argv) == 3 else "web-development"
SRC = ROOT / f"src/content/labs/{COURSE}/uk/{LAB}.md"
OUT_DIR = ROOT / ("public/labs" if COURSE == "web-development" else f"public/{COURSE}/labs")
OUT = OUT_DIR / f"{LAB}.pdf"
SITE = "https://denysmatsevych.github.io/web-development-2026"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

text = SRC.read_text(encoding="utf-8")
_, front, body = text.split("---", 2)
title = re.search(r'^title:\s*"(.+)"\s*$', front, re.M).group(1)
# `numberLabel` ("4-5") wins over the ordering `number` when the lab spans slots.
label = re.search(r'^numberLabel:\s*"?([^"\n]+?)"?\s*$', front, re.M)
number = label.group(1) if label else re.search(r"^number:\s*(\d+)", front, re.M).group(1)

# The leading deadline blockquote becomes the green line under the title.
m = re.match(r"\s*>\s*\*\*Термін здачі:\*\*\s*(.+?)\s*\n", body)
deadline = m.group(1).rstrip(".") if m else None
if m:
    body = body[m.end():]

# Site-relative images load from public/, which the site serves at its root,
# so the PDF shows them before they are deployed.
PUBLIC = (ROOT / "public").as_uri()
body = re.sub(r"(!\[[^\]]*\]\()/", rf"\g<1>{PUBLIC}/", body)
# Site-relative links would be dead in a downloaded file.
body = re.sub(r"\]\(/", f"]({SITE}/", body)

md = MarkdownIt("commonmark").enable("table")
# markdown-it refuses file: URLs; let through only the public/ images above.
default_validate = md.validateLink
md.validateLink = lambda url: url.startswith(PUBLIC) or default_validate(url)
html_body = md.render(body)

# Static (non-variable) files: Edge embeds a variable font as Type3 glyphs,
# which bloats the PDF and renders soft in some viewers.
FONTS = "\n".join(
    f'<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fontsource/{pkg}@5/{sheet}.css">'
    for pkg, sheet in [("noto-sans", "400"), ("noto-sans", "700"),
                       ("noto-sans", "400-italic"), ("noto-sans-mono", "400")]
)

CSS = """
@page { size: Letter; margin: 0.78in 0.86in 0.8in; }
:root { --ink: #303845; --head: #1e3264; --link: #184fa3; --ok: #0a8a3b;
        --code-bg: #f4f6f8; --code-line: #dce1e7; }
html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: "Noto Sans", sans-serif; font-size: 11.2pt; line-height: 1.55;
       color: var(--ink); margin: 0; }
h1, h2, h3, h4 { color: var(--head); font-weight: 700; line-height: 1.2;
                 break-after: avoid; page-break-after: avoid; }
h1 { font-size: 27pt; margin: 0 0 0.55em; }
h2 { font-size: 20.8pt; margin: 1.05em 0 0.35em; }
h3 { font-size: 16.2pt; margin: 1em 0 0.3em; }
h4 { font-size: 12.6pt; margin: 0.9em 0 0.25em; }
p { margin: 0 0 0.5em; }
/* A bold-only label ("Тема листа:") or a line introducing code belongs to what follows it. */
p:has(> strong:only-child), p:has(+ pre) { break-after: avoid; page-break-after: avoid; }
li:first-child { break-before: avoid; }
a { color: var(--link); }
.deadline { color: var(--ok); font-weight: 700; font-size: 12.2pt; margin: 0 0 1.3em; }
ul, ol { margin: 0.2em 0 0.6em; padding-left: 1.6em; }
li { margin: 0.12em 0; }
li > p { margin: 0; }
code { font-family: "Noto Sans Mono", monospace; font-size: 0.92em; }
pre { background: var(--code-bg); border: 1px solid var(--code-line); padding: 8px 10px;
      margin: 0.35em 0 0.7em; white-space: pre-wrap; break-inside: avoid;
      font-size: 9.4pt; line-height: 1.5; }
pre code { font-size: inherit; }
blockquote { margin: 0.5em 0 0.8em; padding: 0.45em 0.9em; border-left: 3px solid var(--head);
             background: #f5f7fb; break-inside: avoid; }
blockquote p:last-child { margin-bottom: 0; }
table { border-collapse: collapse; width: 100%; margin: 0.4em 0 0.9em; font-size: 9.6pt;
        line-height: 1.4; }
tr { break-inside: avoid; }
thead { display: table-header-group; }
th, td { border: 1px solid var(--code-line); padding: 4px 7px; text-align: left; vertical-align: top; }
th { background: var(--code-bg); color: var(--head); }
/* Capped so a screenshot fits under a page's opening text instead of leaving a gap. */
img { display: block; max-width: 100%; max-height: 3.8in; width: auto; height: auto;
      margin: 0.4em 0 0.9em; border: 1px solid var(--code-line); break-inside: avoid; }
"""

html = f"""<!doctype html>
<html lang="uk"><head><meta charset="utf-8">
<title>Лабораторна робота №{number}. {title}</title>
{FONTS}
<style>{CSS}</style></head><body>
<h1>Лабораторна робота №{number}.<br>{title}</h1>
{f'<p class="deadline">Термін здачі: {deadline}</p>' if deadline else ''}
{html_body}
</body></html>"""

# Only now, so a mistyped lab id or course slug leaves no empty folder behind.
OUT_DIR.mkdir(parents=True, exist_ok=True)
before = OUT.stat().st_mtime_ns if OUT.exists() else None
with tempfile.TemporaryDirectory() as tmp:
    page = pathlib.Path(tmp) / "handout.html"
    page.write_text(html, encoding="utf-8")
    subprocess.run(
        [EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
         f"--user-data-dir={tmp}\\profile", "--virtual-time-budget=15000",
         f"--print-to-pdf={OUT}", page.as_uri()],
        check=True, capture_output=True,
    )
# Edge can exit 0 without printing (it does when started from some sandboxed
# shells), which would leave the old PDF in place looking freshly built.
if not OUT.exists() or OUT.stat().st_mtime_ns == before:
    sys.exit(f"Edge wrote no PDF; {OUT.relative_to(ROOT)} is unchanged. Try another shell (PowerShell works).")
print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
