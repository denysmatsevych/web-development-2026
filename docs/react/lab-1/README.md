# Lab 1 — Local development environment

| Route | Source | What it is |
| --- | --- | --- |
| `/react/labs/lab-1/` | `src/content/labs/react/uk/lab-1.md` | the handout: setup steps, tool checks П1–П4, `AGENTS.md` template and two agent prompts, GitHub and Vercel, report, defence |
| `/react/labs/lab-1.pdf` | built from the handout | the downloadable handout |

There is no starter and no ТЗ: students scaffold their own project with
`create-vite`, as in the Web Development course's ЛР-1.

## Why it looks like this

- **Modelled on Web Development ЛР-1, without its theory section.** The
  students set up an editor, Git and an agent there; this lab adds only what
  React needs.
- **Vercel only, no GitHub Pages.** The report email carries a Vercel link,
  as in the Web Development labs. Vercel detects Vite and builds `dist/` from
  the repository with no settings. A Vite app on a GitHub Pages project site
  would need `base: '/<repository>/'` and an Actions workflow to build it.
  Vercel CI/CD proper comes with Лекція 8.
- **JavaScript template, no React Compiler.** TypeScript is ЛР 19 and the
  compiler is ЛР 15 in the programme.
- **ESLint, not Oxlint.** `create-vite` 9 asks «Which linter to use?» for
  React templates and defaults to Oxlint. The programme names ESLint, so the
  handout has students pick it.
- **Interactive `create-vite`, no flags.** Students see each choice,
  including the linter question, and answer it from the handout's table. The
  one-line form `npm create vite@latest react-lab-1 -- --template react
  --eslint` also works: it was checked in PowerShell with Volta's `npm.exe`,
  but not with the `npm.ps1` shim a plain Node.js install puts first on the
  PowerShell path.
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
- **The `.vscode/settings.json` line in `.gitignore`.** The template ignores
  `.vscode/*` except `extensions.json`.
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

Node.js 26 became the Active LTS on 2026-10-28 (26.13.0). The agent table in
§4.7 follows agents.md, the VS Code Copilot docs (`chat.useAgentsMdFile`, on
by default), the Claude Code memory docs and the Gemini CLI `context.fileName`
docs, as of the same date. Re-check the versions, the `create-vite` questions
and the agent table before the next run of the course.

## Build

```bash
python docs/web/build-handout.py lab-1 react    # public/react/labs/lab-1.pdf
```

The script lives in `docs/web/` and takes the course slug as an optional
second argument.
