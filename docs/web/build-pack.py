"""Build a starter zip under public/ from a top-level starter folder.

Run from the repo root with the folder's name, and with the course slug for
any course other than Web Development:

    python docs/web/build-pack.py js-basics-starter         # public/uk/web/starters/js-basics-starter.zip
    python docs/web/build-pack.py react-lab-2-starter react # public/uk/react/starters/lab-2.zip

The zip goes to the course's starters/ folder under public/uk/ (the layout is
in README.md). A Web Development zip keeps the folder's name; any other
course's is named after the lab: the
folder name without the `<course>-` prefix and the `-starter` suffix, so
react-lab-2-starter becomes lab-2.zip. File managers unpack a zip into a
folder named after it, which is then the lab-N/ folder the lab needs.

Files sit at the zip root, with no top-level folder, so the archive unpacks
straight into a repository or a lab-N/ folder. Python's zipfile rather than
`tar -a`, for the reason in docs/web/lab-4/starter-defects.md §6.

A rebuild without edits gives the same zip. Text files go in with LF line
endings whatever the checkout has (with `core.autocrlf` on, Git writes CRLF
into the working tree), and each entry is dated by the file's last commit,
not by its modification time, which every checkout resets. A file that has
no commit yet keeps its modification time.

A pack that adds files from outside its folder (Lab 7's asset pack) has its
own script beside the lab's docs. Only files Git tracks go in, so whatever a
local run leaves behind (`node_modules/`, `dist/`, a `package-lock.json`)
stays out of the zip: `git add` a new file before packing it.
"""
import datetime
import pathlib
import subprocess
import sys
import zipfile

TEXT = {".css", ".html", ".js", ".json", ".jsx", ".md", ".mjs", ".svg", ".ts", ".tsx", ".txt", ".gitignore", ".nojekyll"}


def committed(path):
    """Local date and time of the last commit that touched `path`, or None."""
    out = subprocess.run(["git", "log", "-1", "--format=%ct", "--", str(path)],
                         cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return datetime.datetime.fromtimestamp(int(out)).timetuple()[:6] if out else None


def tracked(folder):
    """Files under `folder` that Git tracks (in the index), sorted."""
    out = subprocess.run(["git", "ls-files", "-z", "--", folder.relative_to(ROOT).as_posix()],
                         cwd=ROOT, capture_output=True, encoding="utf-8", check=True).stdout
    return sorted(ROOT / name for name in out.split("\0") if name and (ROOT / name).is_file())


ROOT = pathlib.Path(__file__).resolve().parents[2]
if len(sys.argv) not in (2, 3):
    sys.exit("usage: python docs/web/build-pack.py <starter-folder> [course]"
             "   (e.g. js-basics-starter, or react-lab-2-starter react)")
SRC = ROOT / sys.argv[1]
if not SRC.is_dir():
    sys.exit(f"no folder {sys.argv[1]}/ at the repo root")
if len(sys.argv) == 3:
    COURSE = sys.argv[2]
    NAME = SRC.name.removeprefix(f"{COURSE}-").removesuffix("-starter")
    OUT = ROOT / f"public/uk/{COURSE}/starters/{NAME}.zip"
else:
    OUT = ROOT / f"public/uk/web/starters/{SRC.name}.zip"
OUT.parent.mkdir(parents=True, exist_ok=True)

files = tracked(SRC)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for p in files:
        info = zipfile.ZipInfo.from_file(p, p.relative_to(SRC).as_posix())
        info.date_time = committed(p) or info.date_time
        data = p.read_bytes()
        if (p.suffix or p.name) in TEXT:
            data = data.replace(b"\r\n", b"\n")
        z.writestr(info, data, zipfile.ZIP_DEFLATED, compresslevel=9)

print(f"{OUT.relative_to(ROOT).as_posix()}  {len(files)} files  {OUT.stat().st_size / 1024:.0f} KB")
