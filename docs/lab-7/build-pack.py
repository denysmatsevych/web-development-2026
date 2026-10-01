"""Build public/labs/courtly-assets.zip — the Lab 7 asset pack.

    python docs/lab-7/build-pack.py        (run from the repo root)

The zip is `courtly-assets/` plus two things kept out of that folder so they
are not duplicated in git:

- `mockup/`  — the 1:1 captures from public/labs/lab-7/ (render-mockup.mjs);
- `SPEC.md`  — §2–5 of src/content/tasks/lab-7.md, so the pack works offline
               and can never disagree with the design page.

Zips with Windows' bsdtar: Git Bash's GNU tar ignores `-a` and would write a
tarball under a .zip name.
"""
import pathlib
import re
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = "https://denysmatsevych.github.io/web-development-2026"
PAGE = f"{SITE}/labs/lab-7/task/"
OUT = ROOT / "public/labs/courtly-assets.zip"
TAR = r"C:\Windows\System32\tar.exe"

brief = (ROOT / "src/content/tasks/lab-7.md").read_text(encoding="utf-8")
body = brief.split("---", 2)[2]
spec = body[body.index("## 2. Design tokens"):].strip()
# Root-relative site links do not resolve outside the site.
spec = re.sub(r"\]\((/[^)]*)\)", lambda m: f"]({SITE}{m.group(1)})", spec)

header = f"""# Courtly — специфікація

Копія розділів 2–5 сторінки «Courtly — макет і дизайн-система»:
<{PAGE}>

Знімки макета — у теці `mockup/`, масштаб 1 : 1 (1 px зображення = 1 CSS px).

"""

with tempfile.TemporaryDirectory() as tmp:
    stage = pathlib.Path(tmp) / "courtly-assets"
    shutil.copytree(ROOT / "courtly-assets", stage)
    (stage / "SPEC.md").write_text(header + spec + "\n", encoding="utf-8")
    shutil.copytree(ROOT / "public/labs/lab-7", stage / "mockup")

    OUT.unlink(missing_ok=True)
    subprocess.run([TAR, "-a", "-c", "-f", str(OUT), "courtly-assets"], cwd=tmp, check=True)

print(f"wrote {OUT.relative_to(ROOT)} ({OUT.stat().st_size // 1024} KB)")
