"""Build courtly-assets.zip, the Lab 7 asset pack, in Ukrainian or English.

    python docs/web/lab-7/build-pack.py            # public/uk/web/starters/courtly-assets.zip
    python docs/web/lab-7/build-pack.py --lang en  # public/en/web/starters/courtly-assets.zip

(run from the repo root). The zip is `starters/web/[en/]courtly-assets/` plus two
things kept out of that folder so they are not duplicated in git:

- `mockup/`  — the 1:1 captures from public/uk/web/labs/lab-7/ (render-mockup.mjs).
               Both languages get the same captures: the page is in Ukrainian;
- `SPEC.md`  — §2–5 of src/content/tasks/web-development/<lang>/lab-7.md, so the pack
               works offline and can never disagree with the design page.

Zips with Windows' bsdtar: Git Bash's GNU tar ignores `-a` and would write a
tarball under a .zip name.
"""
import pathlib
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[3]
SITE = "https://denysmatsevych.github.io/web-development-2026"
TAR = r"C:\Windows\System32\tar.exe"

args = sys.argv[1:]
if args not in ([], ["--lang", "uk"], ["--lang", "en"]):
    sys.exit("usage: python docs/web/lab-7/build-pack.py [--lang en]")
LANG = args[1] if args else "uk"

# Ukrainian keeps unprefixed site URLs and the top-level starter folder.
PREFIX = "" if LANG == "uk" else f"/{LANG}"
SRC = ROOT / "starters/web" / ("" if LANG == "uk" else LANG) / "courtly-assets"
OUT = ROOT / "public" / LANG / "web/starters/courtly-assets.zip"
PAGE = f"{SITE}{PREFIX}/web-development/labs/lab-7/task/"

HEADER = {
    "uk": f"""# Courtly — специфікація

Копія розділів 2–5 сторінки «Courtly — макет і дизайн-система»:
<{PAGE}>

Знімки макета — у теці `mockup/`, масштаб 1 : 1 (1 px зображення = 1 CSS px).

""",
    "en": f"""# Courtly — specification

A copy of §2–5 of the page "Courtly — mockup and design system":
<{PAGE}>

The mockup captures are in the `mockup/` folder, at 1 : 1 (1 image px = 1 CSS px).

""",
}[LANG]

brief = (ROOT / f"src/content/tasks/web-development/{LANG}/lab-7.md").read_text(encoding="utf-8")
body = brief.split("---", 2)[2]
spec = body[body.index("## 2. Design tokens"):].strip()
# Root-relative site links do not resolve outside the site.
spec = re.sub(r"\]\((/[^)]*)\)", lambda m: f"]({SITE}{m.group(1)})", spec)

with tempfile.TemporaryDirectory() as tmp:
    stage = pathlib.Path(tmp) / "courtly-assets"
    shutil.copytree(SRC, stage)
    # newline="\n": text mode would otherwise write CRLF on Windows.
    (stage / "SPEC.md").write_text(HEADER + spec + "\n", encoding="utf-8", newline="\n")
    shutil.copytree(ROOT / "public/uk/web/labs/lab-7", stage / "mockup")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.unlink(missing_ok=True)
    subprocess.run([TAR, "-a", "-c", "-f", str(OUT), "courtly-assets"], cwd=tmp, check=True)

print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
