"""Build public/labs/lab-4.pdf from src/content/labs/lab-4.md.

Matches the look of lab-3.pdf (Noto Sans, navy headings, green deadline line,
grey code blocks, US Letter). Run from the repo root:

    python docs/lab-4/build-handout.py

Needs `markdown-it-py` (pip) and Microsoft Edge; fonts come from jsDelivr
(Fontsource), so the run needs network access.
"""
import pathlib
import re
import subprocess
import tempfile

from markdown_it import MarkdownIt

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "src/content/labs/lab-4.md"
OUT = ROOT / "public/labs/lab-4.pdf"
SITE = "https://denysmatsevych.github.io/web-development-2026"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

text = SRC.read_text(encoding="utf-8")
_, front, body = text.split("---", 2)
title = re.search(r'^title:\s*"(.+)"\s*$', front, re.M).group(1)
number = re.search(r"^number:\s*(\d+)", front, re.M).group(1)

# The leading deadline blockquote becomes the green line under the title.
m = re.match(r"\s*>\s*\*\*Термін здачі:\*\*\s*(.+?)\s*\n", body)
deadline = m.group(1).rstrip(".") if m else None
if m:
    body = body[m.end():]

# Site-relative links would be dead in a downloaded file.
body = re.sub(r"\]\(/", f"]({SITE}/", body)

md = MarkdownIt("commonmark").enable("table")
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

with tempfile.TemporaryDirectory() as tmp:
    page = pathlib.Path(tmp) / "handout.html"
    page.write_text(html, encoding="utf-8")
    subprocess.run(
        [EDGE, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
         f"--user-data-dir={tmp}\\profile", "--virtual-time-budget=15000",
         f"--print-to-pdf={OUT}", page.as_uri()],
        check=True, capture_output=True,
    )
print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
