"""Build public/labs/js-basics-starter.zip from js-basics-starter/.

Run from the repo root:

    python docs/lab-8/build-pack.py

Files sit at the zip root, with no top-level folder, so the archive unpacks
straight into a repository or a lab-8/ folder. Python's zipfile rather than
`tar -a`, for the reason in docs/lab-4/starter-defects.md §6.
"""
import pathlib
import zipfile

ROOT = pathlib.Path(__file__).resolve().parents[2]
SRC = ROOT / "js-basics-starter"
OUT = ROOT / "public/labs/js-basics-starter.zip"

files = sorted(p for p in SRC.rglob("*") if p.is_file())
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files:
        z.write(p, p.relative_to(SRC).as_posix())

print(f"{OUT.relative_to(ROOT).as_posix()}  {len(files)} files  {OUT.stat().st_size / 1024:.0f} KB")
