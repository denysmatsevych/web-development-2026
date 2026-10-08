"""Build public/labs/<starter>.zip from a top-level starter folder.

Run from the repo root with the folder's name:

    python docs/build-pack.py js-basics-starter

Files sit at the zip root, with no top-level folder, so the archive unpacks
straight into a repository or a lab-N/ folder. Python's zipfile rather than
`tar -a`, for the reason in docs/lab-4/starter-defects.md §6.

A rebuild without edits gives the same zip. Text files go in with LF line
endings whatever the checkout has (with `core.autocrlf` on, Git writes CRLF
into the working tree), and each entry is dated by the file's last commit,
not by its modification time, which every checkout resets. A file that has
no commit yet keeps its modification time.

A pack that adds files from outside its folder (Lab 7's asset pack) has its
own script beside the lab's docs.
"""
import datetime
import pathlib
import subprocess
import sys
import zipfile

TEXT = {".css", ".html", ".js", ".json", ".md", ".mjs", ".svg", ".txt", ".nojekyll"}


def committed(path):
    """Local date and time of the last commit that touched `path`, or None."""
    out = subprocess.run(["git", "log", "-1", "--format=%ct", "--", str(path)],
                         cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return datetime.datetime.fromtimestamp(int(out)).timetuple()[:6] if out else None


ROOT = pathlib.Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    sys.exit("usage: python docs/build-pack.py <starter-folder>   (e.g. js-basics-starter)")
SRC = ROOT / sys.argv[1]
if not SRC.is_dir():
    sys.exit(f"no folder {sys.argv[1]}/ at the repo root")
OUT = ROOT / f"public/labs/{SRC.name}.zip"

files = sorted(p for p in SRC.rglob("*") if p.is_file())
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files:
        info = zipfile.ZipInfo.from_file(p, p.relative_to(SRC).as_posix())
        info.date_time = committed(p) or info.date_time
        data = p.read_bytes()
        if (p.suffix or p.name) in TEXT:
            data = data.replace(b"\r\n", b"\n")
        z.writestr(info, data, zipfile.ZIP_DEFLATED, compresslevel=9)

print(f"{OUT.relative_to(ROOT).as_posix()}  {len(files)} files  {OUT.stat().st_size / 1024:.0f} KB")
