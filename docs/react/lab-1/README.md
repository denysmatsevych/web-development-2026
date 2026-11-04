# Lab 1 — Local development environment

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-1/` | `src/content/labs/react/uk/lab-1.md` | the handout: the `react-labs` repository, setup steps, tool checks П1–П4, `AGENTS.md` template and two agent prompts, GitHub and Vercel, the §4.9 move for an existing `react-lab-1`, report, defence |
| `/react/labs/lab-1.pdf` | built from the handout | the downloadable handout |

There is no starter and no ТЗ: students scaffold their own project with
`create-vite`, as in the Web Development course's ЛР-1, into `lab-1/` of a
`react-labs` repository that later labs add their own folders to.

## Why it looks like this

- **One repository, a folder per lab.** [course-plan.md](../course-plan.md)
  states the rule. The labs mostly have separate goals, so each `lab-N/` is
  its own Vite app rather than one app that grows. The rule came on
  2026-11-04, after the first group had built a standalone `react-lab-1`, so
  §4.9 moves a finished project in place: rename the repository on GitHub,
  `git mv` the files into `lab-1/`, add the root files, then point Vercel at
  `lab-1`. Drop §4.9 before the next run of the course.
- **npm workspaces in the root `package.json`.** Each lab is its own Vercel
  project with Root Directory `lab-N`. By default every push deploys every
  project connected to the repository, and Hobby allows 100 deployments a
  day, one build at a time and 25 projects per repository. Vercel skips
  unaffected projects only in a workspaces monorepo with the lockfile at the
  root and a unique `name` in each package. Those skips don't count against
  the limits, and the skip is on by default for new projects. Builds the
  Ignored Build Step cancels still count. A change outside the `lab-*`
  folders (`AGENTS.md`, `.vscode/`, the root `package.json`) is a global
  change and deploys every project: with ЛР 1–19 in the repository, one
  `AGENTS.md` commit is 19 builds, queued one at a time, about a fifth of the
  day's 100. The handout says so in §4.8 and asks about it in §6.
  Workspaces also keep one `node_modules/` for all labs instead of one per
  lab. `npm install <pkg>` run inside a lab folder writes to that lab's
  `package.json` and the root lockfile, so the handout's install commands
  didn't change.
- **The editor opens the repository root.** `.vscode/` and `AGENTS.md` live
  there and serve every lab. The ESLint extension loads ESLint from the opened
  folder; `"eslint.workingDirectories": [{ "pattern": "./lab-*/" }]` makes
  each lab its own working directory, so a later lab with its own ESLint
  version still gets it. The setting follows the extension's README.
- **A Scope section in `AGENTS.md`.** An agent started at the root sees every
  lab, so the template keeps it in the lab the task names and has it ask when
  the task names none. Prompt 2 therefore names `lab-1`.
- **Root files sit outside `format:check`.** Each lab's Prettier checks its own
  folder. The handout has students check `AGENTS.md` and `.vscode/` with
  `npx prettier --check AGENTS.md .vscode` from the root. That runs the
  hoisted Prettier with default options, and `semi` and `singleQuote` don't
  affect Markdown or JSON. WebStorm users run
  `npx prettier --write AGENTS.md` instead: WebStorm's default Prettier
  pattern covers only JS, TS, JSX, TSX, HTML, Vue and Astro files, so saving
  doesn't format Markdown, and without a `.vscode/` folder the check exits
  with code 2 on the unmatched pattern.
- **Modelled on Web Development ЛР-1, without its theory section.** The
  students set up an editor, Git and an agent there; this lab adds only what
  React needs.
- **Vercel only, no GitHub Pages.** The report email carries a Vercel link,
  as in the Web Development labs. Vercel detects Vite and builds `lab-1/dist/`
  once Root Directory is `lab-1`. A Vite app on a GitHub Pages project site
  would need `base: '/<repository>/'` and an Actions workflow to build it.
  Vercel CI/CD proper comes with Лекція 8.
- **JavaScript template, no React Compiler.** TypeScript is ЛР 19 and the
  compiler is ЛР 15 in the programme.
- **ESLint, not Oxlint.** `create-vite` 9 asks «Which linter to use?» for
  React templates and defaults to Oxlint. The programme names ESLint, so the
  handout has students pick it.
- **Interactive `create-vite`, no flags.** Students see each choice,
  including the linter question, and answer it from the handout's table. The
  one-line form `npm create vite@latest lab-1 -- --template react --eslint`
  also works: it was checked in PowerShell with Volta's `npm.exe`, but not
  with the `npm.ps1` shim a plain Node.js install puts first on the PowerShell
  path. From a non-TTY shell, add `--no-immediate --no-interactive`.
- **`.prettierrc.json` matches the template** (`semi: false`,
  `singleQuote: true`), so Prettier changes no template file and the first
  commits stay small.
- **`.gitattributes` with `* text=auto eol=lf`.** With `core.autocrlf=true`,
  the Git for Windows default, a fresh clone gets CRLF files, and
  `prettier --check` then fails on 11 of them. That includes the instructor's
  clone.
- **`eslint-config-prettier` is wired in although it turns off nothing yet.**
  The template's rule sets have no stylistic rules. The package is the
  integration Prettier documents, and it covers plugins added in later labs.
- **No `eslint-plugin-jsx-a11y`.** Its peer range stops at ESLint 9
  (6.10.2), so `npm install` fails with ERESOLVE against the template's
  ESLint 10.
- **No `.gitignore` line for `.vscode/settings.json`.** The template's
  `.vscode/*` pattern sits in `lab-1/.gitignore` and only applies inside
  `lab-1/`, so the root `.vscode/` is tracked as is. The handout still checks
  `git status -u`, because plain `git status` shows a new folder as one
  `.vscode/` line. Students who moved a project in through §4.9 keep a
  `!.vscode/settings.json` line in `lab-1/.gitignore` that does nothing.
- **A root `.gitignore`.** With workspaces, `node_modules/` sits in the root,
  where the template's `.gitignore` doesn't reach. It also ignores `.idea/`,
  which WebStorm now creates in the root, and macOS's `.DS_Store`, which the
  template's `.gitignore` used to cover there.
- **`npm audit fix --force` warning.** A fresh install reports 6 moderate
  advisories (`minimatch` under ESLint, no fix available). The forced fix
  downgrades `@eslint/js` 10 → 9.39.5 and `eslint-config-prettier` 10 → 6.15.0.

## Verified on 2026-11-03

Every step was run on Windows 11 with Node.js 24.20 and npm 11.19, using
`create-vite` 9.3.3, Vite 8.3.5, React 19.3.1, ESLint 10.14,
`eslint-plugin-react-hooks` 7.1.1, `eslint-plugin-react-refresh` 0.5.7,
Prettier 3.9.10 and `eslint-config-prettier` 10.1.8:

- the template passes `npm run lint`, `prettier --check .` and `npm run build`;
- `npx eslint-config-prettier src/main.jsx` reports no conflicting rules;
- П2's `LintDemo.jsx` gives 5 errors from 4 rules: `no-unused-vars`,
  `react-hooks/rules-of-hooks` (twice), `react-hooks/set-state-in-effect` and
  `react-refresh/only-export-components`. In plugin 0.5 the last one is an
  error, not a warning;
- the `AGENTS.md` template and both `.vscode/` files pass Prettier;
- dev runs on port 5173 and preview on 4173.

Node.js 26 became the Active LTS on 2026-10-28 (26.13.0). On 26.13.0 with npm
11.20, a fresh scaffold, §4.4 and П2 give the same results as above. The agent
table in §4.7 follows agents.md, the VS Code Copilot docs
(`chat.useAgentsMdFile`, on by default), the Claude Code memory docs and the
Gemini CLI `context.fileName` docs, as of 2026-11-03. Re-check the versions,
the `create-vite` questions and the agent table before the next run of the
course.

## Verified on 2026-11-04: the one-repository layout

On Node.js 24.20 and npm 11.19, with the same package versions as above, a
`react-labs` repository built step by step from §4.2–4.7 gave these results:

- `npm install` in the root installs everything into the root `node_modules/`;
  the Prettier installs run inside `lab-1/` land in `lab-1/package.json`, and
  no lockfile appears in `lab-1/`;
- in `lab-1/`, `npm run lint`, `npm run format:check` and `npm run build`
  pass, `npx eslint-config-prettier src/main.jsx` finds no conflicts, and П2
  still gives 5 errors from 4 rules. When lint fails, npm adds a few
  `npm error … workspace lab-1` lines;
- the root `package.json`, `AGENTS.md` and `.vscode/` pass
  `npx prettier --check`. The root `package.json` is written with the array
  expanded because Prettier formats `package.json` the way `JSON.stringify`
  does;
- `git status -u` lists both `.vscode/` files;
- a clone made with `core.autocrlf=true` keeps LF and passes all three
  checks;
- §4.9 was run on a repository rebuilt in the 2026-11-03 layout. Git records
  the move as renames, except `package.json` and `.gitignore`: the root gets
  new files with those names, so they show as `modified` there and as
  `new file` in `lab-1/`. `git log --follow` keeps the history of all of
  them, and the checks pass. When a listed source is missing, `git mv` fails
  with `bad source` and
  moves nothing.

Not run: Vercel (import with Root Directory, how a GitHub rename affects the
connection, the **Skip deployment** toggle on an existing project), and the
ESLint and Prettier editor extensions with the root opened.

## Build

```bash
python docs/web/build-handout.py lab-1 react    # public/react/labs/lab-1.pdf
```

The script lives in `docs/web/` and takes the course slug as an optional
second argument.
