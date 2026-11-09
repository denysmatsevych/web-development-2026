"""Build a lab's PDF handout from src/content/labs/<course>/<lang>/<lab>.md.

Matches the look of lab-3.pdf (Noto Sans, navy headings, green deadline line,
grey code blocks), on A4. Run from the repo root with the lab's id, the
course slug for any course other than Web Development, and `--lang en` for
the English translation:

    python docs/web/build-handout.py lab-6              # public/uk/web/labs/lab-6.pdf
    python docs/web/build-handout.py lab-1 react        # public/uk/react/labs/lab-1.pdf
    python docs/web/build-handout.py lab-1 --lang en    # public/en/web/labs/lab-1.pdf

The PDF goes to the course's labs/ folder for its language under public/ (the
layout is in README.md). The lab's `handout:` field is that path without
`public/`, e.g. `handout: /en/web/labs/lab-1.pdf`.

The green deadline line comes from a blockquote that opens the lab's body:
`> **Термін здачі:** 19.10.2026.` in Ukrainian, `> **Deadline:** 19.10.2026.`
in English. Any other wording stays an ordinary blockquote.

A centred title block opens the handout: the university and the department,
a rule, the title, and the course from the lab's `discipline:` field. Every
page's footer carries the short attribution and the page number.

Needs `markdown-it-py` (pip), Microsoft Edge, and Node for an English
handout's site links; fonts come from jsDelivr (Fontsource), so the run needs
network access.
"""
import argparse
import json
import pathlib
import re
import subprocess
import sys
import tempfile

from markdown_it import MarkdownIt

ROOT = pathlib.Path(__file__).resolve().parents[2]
cli = argparse.ArgumentParser(description="Build a lab's PDF handout from its Markdown.")
cli.add_argument("lab", help="lab id, e.g. lab-6")
cli.add_argument("course", nargs="?", default="web-development", help="course slug (default: web-development)")
cli.add_argument("--lang", choices=("uk", "en"), default="uk", help="content language (default: uk)")
# Intermixed, so `--lang` may also come between the lab id and the course.
args = cli.parse_intermixed_args()
LAB, COURSE, LANG = args.lab, args.course, args.lang
SRC = ROOT / f"src/content/labs/{COURSE}/{LANG}/{LAB}.md"
OUT_DIR = ROOT / "public" / LANG / ("web" if COURSE == "web-development" else COURSE) / "labs"
OUT = OUT_DIR / f"{LAB}.pdf"
# The handout's own wording around the Markdown: the university and department
# above the title, the line before the title (named as the site's interface
# names a lab), the course line under it, the label of the leading deadline
# blockquote, and the footer. The Ukrainian `discipline:` value carries its
# own «», the English one has none.
WORDS = {
    "uk": {
        "university": "Національний університет «Острозька академія»",
        "department": "Кафедра інформаційних технологій та аналітики даних",
        "lab": "Лабораторна робота №{}.",
        "discipline": "з дисципліни {}",
        "deadline": "Термін здачі",
        "footer": "НаУОА • ННІ ІТ та бізнесу • Кафедра ІТАД",
        "page": "Сторінка",
        "of": "з",
    },
    "en": {
        "university": "National University of Ostroh Academy",
        "department": "Department of Information Technologies and Data Analytics",
        "lab": "Lab {}.",
        "discipline": "{}",
        "deadline": "Deadline",
        "footer": "NaUOA • Institute of IT & Business • Department of IT & Data Analytics",
        "page": "Page",
        "of": "of",
    },
}[LANG]
SITE = "https://denysmatsevych.github.io/web-development-2026"
EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"

text = SRC.read_text(encoding="utf-8")
_, front, body = text.split("---", 2)
title = re.search(r'^title:\s*"(.+)"\s*$', front, re.M).group(1)
discipline_m = re.search(r'^discipline:\s*"(.+)"\s*$', front, re.M)
discipline = discipline_m.group(1) if discipline_m else None
kind_m = re.search(r'^kind:\s*(\w+)', front, re.M)
kind = kind_m.group(1) if kind_m else "lab"
# `numberLabel` ("4-5") wins over the ordering `number` when the lab spans slots.
label = re.search(r'^numberLabel:\s*"?([^"\n]+?)"?\s*$', front, re.M)
number_m = re.search(r"^number:\s*(\d+)", front, re.M)
number = label.group(1) if label else (number_m.group(1) if number_m else None)

# Individual assignments have no lab number in the title/eyebrow.
is_individual = kind == "individual" or LAB == "individual"
eyebrow_line = "" if is_individual else f'{WORDS["lab"].format(number)}<br>'
page_title = title if is_individual else f'{WORDS["lab"].format(number)} {title}'

# The leading deadline blockquote becomes the green line under the title.
m = re.match(rf"\s*>\s*\*\*{re.escape(WORDS['deadline'])}:\*\*\s*(.+?)\s*\n", body)
deadline = m.group(1).rstrip(".") if m else None
if m:
    body = body[m.end():]

# Site-relative images load from public/, which the site serves at its root,
# so the PDF shows them before they are deployed.
PUBLIC = (ROOT / "public").as_uri()
body = re.sub(r"(!\[[^\]]*\]\()/", rf"\g<1>{PUBLIC}/", body)
# Site-relative links would be dead in a downloaded file, so they get the
# site's address. An English handout's links first go through the site's own
# rule for adding /en/ (in the Markdown link plugin, run by Node), so a link
# opens the same page from the PDF as from the site.
SITE_LINK = re.compile(r"\]\((/[^)\s]*)")
localized = {}
if LANG == "en":
    hrefs = sorted(set(SITE_LINK.findall(body)))
    plugin = (ROOT / "plugins" / "base-links.mjs").as_uri()
    node = subprocess.run(
        ["node", "--input-type=module", "-e",
         f"import {{ createEnglishLocalizer }} from {json.dumps(plugin)};"
         "const localize = createEnglishLocalizer();"
         "let input = ''; for await (const chunk of process.stdin) input += chunk;"
         "process.stdout.write(JSON.stringify(JSON.parse(input).map((href) => localize(href))));"],
        input=json.dumps(hrefs), capture_output=True, text=True, encoding="utf-8",
        cwd=ROOT, check=True,
    )
    localized = dict(zip(hrefs, json.loads(node.stdout)))
body = SITE_LINK.sub(lambda m: f"]({SITE}{localized.get(m[1], m[1])}", body)

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

CSS = f"""
@page {{
  size: A4;
  margin: 0.78in 0.86in 0.85in;
  @bottom-left {{
    content: "{WORDS['footer']}";
    font-family: "Noto Sans", sans-serif;
    font-size: 8pt;
    color: #718096;
  }}
  @bottom-right {{
    content: "{WORDS['page']} " counter(page) " {WORDS['of']} " counter(pages);
    font-family: "Noto Sans", sans-serif;
    font-size: 8pt;
    color: #718096;
  }}
}}
:root {{ --ink: #303845; --head: #1e3264; --link: #184fa3; --ok: #0a8a3b;
        --code-bg: #f4f6f8; --code-line: #dce1e7; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ font-family: "Noto Sans", sans-serif; font-size: 11.2pt; line-height: 1.55;
       color: var(--ink); margin: 0; }}
.masthead {{ text-align: center; margin: 0 0 1.3em; padding-bottom: 0.9em;
            border-bottom: 1px solid var(--code-line); }}
.university, .department {{ color: var(--head); margin: 0; }}
.university {{ font-size: 9.6pt; font-weight: 700; letter-spacing: 0.04em;
              text-transform: uppercase; }}
.department {{ font-size: 9pt; opacity: 0.8; margin-top: 0.15em; padding-bottom: 0.75em;
              border-bottom: 2px solid var(--head); margin-bottom: 0.7em; }}
.masthead h1 {{ margin: 0 0 0.25em; }}
.discipline {{ margin: 0; }}
h1, h2, h3, h4 {{ color: var(--head); font-weight: 700; line-height: 1.2;
                 break-after: avoid; page-break-after: avoid; }}
h1 {{ font-size: 27pt; margin: 0 0 0.55em; }}
h2 {{ font-size: 20.8pt; margin: 1.05em 0 0.35em; }}
h3 {{ font-size: 16.2pt; margin: 1em 0 0.3em; }}
h4 {{ font-size: 12.6pt; margin: 0.9em 0 0.25em; }}
p {{ margin: 0 0 0.5em; }}
/* A bold-only label ("Тема листа:") or a line introducing code belongs to what follows it. */
p:has(> strong:only-child), p:has(+ pre) {{ break-after: avoid; page-break-after: avoid; }}
li:first-child {{ break-before: avoid; }}
a {{ color: var(--link); }}
.deadline {{ color: var(--ok); font-weight: 700; font-size: 12.2pt; margin: 0 0 1.3em; }}
ul, ol {{ margin: 0.2em 0 0.6em; padding-left: 1.6em; }}
li {{ margin: 0.12em 0; }}
li > p {{ margin: 0; }}
code {{ font-family: "Noto Sans Mono", monospace; font-size: 0.92em; }}
pre {{ background: var(--code-bg); border: 1px solid var(--code-line); padding: 8px 10px;
      margin: 0.35em 0 0.7em; white-space: pre-wrap; break-inside: avoid;
      font-size: 9.4pt; line-height: 1.5; }}
pre code {{ font-size: inherit; }}
blockquote {{ margin: 0.5em 0 0.8em; padding: 0.45em 0.9em; border-left: 3px solid var(--head);
             background: #f5f7fb; break-inside: avoid; }}
blockquote p:last-child {{ margin-bottom: 0; }}
table {{ border-collapse: collapse; width: 100%; margin: 0.4em 0 0.9em; font-size: 9.6pt;
        line-height: 1.4; }}
tr {{ break-inside: avoid; }}
thead {{ display: table-header-group; }}
th, td {{ border: 1px solid var(--code-line); padding: 4px 7px; text-align: left; vertical-align: top; }}
th {{ background: var(--code-bg); color: var(--head); }}
/* Capped so a screenshot fits under a page's opening text instead of leaving a gap. */
img {{ display: block; max-width: 100%; max-height: 3.8in; width: auto; height: auto;
      margin: 0.4em 0 0.9em; border: 1px solid var(--code-line); break-inside: avoid; }}
"""

html = f"""<!doctype html>
<html lang="{LANG}"><head><meta charset="utf-8">
<title>{page_title}</title>
{FONTS}
<style>{CSS}</style></head><body>
<header class="masthead">
<p class="university">{WORDS["university"]}</p>
<p class="department">{WORDS["department"]}</p>
<h1>{eyebrow_line}{title}</h1>
{f'<p class="discipline">{WORDS["discipline"].format(discipline)}</p>' if discipline else ''}
</header>
{f'<p class="deadline">{WORDS["deadline"]}: {deadline}</p>' if deadline else ''}
{html_body}
</body></html>"""

# Only now, so a mistyped lab id or course slug leaves no empty folder behind.
OUT_DIR.mkdir(parents=True, exist_ok=True)
before = OUT.stat().st_mtime_ns if OUT.exists() else None
with tempfile.TemporaryDirectory(ignore_cleanup_errors=True) as tmp:
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
