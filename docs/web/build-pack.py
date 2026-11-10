"""Build a starter zip under public/ from a folder in starters/.

Run from the repo root with the folder's path:

    python docs/web/build-pack.py starters/web/js-basics-starter      # public/uk/web/starters/js-basics-starter.zip
    python docs/web/build-pack.py starters/web/en/layout-lab-starter  # public/en/web/starters/layout-lab-starter.zip
    python docs/web/build-pack.py starters/react/lab-2                # public/uk/react/starters/lab-2.zip

starters/<course>/<name>/ becomes public/uk/<course>/starters/<name>.zip, and
its English version, starters/<course>/en/<name>/, becomes
public/en/<course>/starters/<name>.zip under the same name (the layout is in
README.md). File managers unpack a zip into a folder named after
it, which is why a React starter's folder is named after its lab: lab-2.zip
unpacks into the lab-2/ folder the lab needs.

Files sit at the zip root, with no top-level folder, so the archive unpacks
straight into a repository or a lab-N/ folder. Python's zipfile rather than
`tar -a`, for the reason in docs/web/lab-4/starter-defects.md §6.

A rebuild without edits gives the same zip. Text files go in with LF line
endings whatever the checkout has (with `core.autocrlf` on, Git writes CRLF
into the working tree), and each entry is dated by the last commit that
changed the file, not by its modification time, which every checkout resets.
A commit that only moved the file doesn't count. A file that has no commit
yet keeps its modification time.

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
    """Local date and time of the last commit that changed `path`, or None.

    --follow carries the history across a move, and --diff-filter=r skips the
    move itself, so moving a starter doesn't re-date every file in its zip.
    """
    out = subprocess.run(["git", "log", "-1", "--follow", "--diff-filter=r",
                          "--format=%ct", "--", str(path)],
                         cwd=ROOT, capture_output=True, text=True).stdout.strip()
    return datetime.datetime.fromtimestamp(int(out)).timetuple()[:6] if out else None


def tracked(folder):
    """Files under `folder` that Git tracks (in the index), sorted."""
    out = subprocess.run(["git", "ls-files", "-z", "--", folder.relative_to(ROOT).as_posix()],
                         cwd=ROOT, capture_output=True, encoding="utf-8", check=True).stdout
    return sorted(ROOT / name for name in out.split("\0") if name and (ROOT / name).is_file())


ROOT = pathlib.Path(__file__).resolve().parents[2]
USAGE = ("usage: python docs/web/build-pack.py starters/<course>/[en/]<name>"
         "   (e.g. starters/web/js-basics-starter, starters/web/en/layout-lab-starter,"
         " or starters/react/lab-2)")
if len(sys.argv) != 2:
    sys.exit(USAGE)
SRC = (ROOT / sys.argv[1]).resolve()
# The folder sets the language, as for content: an `en/` level means English.
LANG = "en" if SRC.parent.name == "en" else "uk"
COURSE = SRC.parent.parent if LANG == "en" else SRC.parent
if not SRC.is_dir() or SRC.name == "en" or COURSE.parent != ROOT / "starters":
    sys.exit(f"no starter folder {sys.argv[1]}/\n{USAGE}")
OUT = ROOT / "public" / LANG / COURSE.name / "starters" / f"{SRC.name}.zip"
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
