/**
 * §5 · Assignment constraints for all files in src/, including subdirectories: no any, no type
 * assertions, no declare, and no comments disabling type checking. Do not modify this file.
 *
 * Tests inspect code as text: comments and string literal contents (quotes, template strings) do not count.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { srcFiles, srcLines } from './support.js';

const lines = srcLines();

/** Lines where `pattern` matches in code (or anywhere in the line with `inComments`). */
function find(pattern, { inComments = false, skip = () => false } = {}) {
  return lines
    .filter((line) => !skip(line) && pattern.test(inComments ? line.text : line.code))
    .map(({ where, text }) => `${where}  ${text.trim()}`);
}

/** Import and re-export lines: `as` in `import { a as b }` is not a type assertion. */
const importLines = new Set();
let inImport = false;
for (const line of lines) {
  const code = line.code.trim();
  if (/^(?:import\b|export\s*(?:type\s*)?[*{])/.test(code)) inImport = true;
  if (inImport) importLines.add(line);
  if (inImport && (/\bfrom\s*['"]/.test(code) || /^import\s*['"]/.test(code) || /;\s*$/.test(code))) inImport = false;
}

test('§5 no any type in src/', () => {
  const found = find(/(?:[:<>,|&=(?[]|\b(?:as|extends|keyof))\s*any\b|\bany\s*\[\s*\]/);
  assert.deepEqual(found, [], `any found:\n${found.join('\n')}`);
});

test('§5 no type assertions in src/: as (except as const), ! after expression, <Type>value, querySelector<…>', () => {
  const found = [
    ...find(/\bas\s+(?!const\b)[\w$({[<'"`]/, { skip: (line) => importLines.has(line) }),
    ...find(/[\w$)\]]!(?!=)/),
    ...find(/(?:^|[=(,:?&|]|\breturn)\s*<\s*[A-Z][\w.]*(?:\[\])?\s*>\s*[\w$]/),
    ...find(/\.(?:querySelector|querySelectorAll|closest)\s*</),
  ];
  assert.deepEqual([...new Set(found)], [], `type assertions found:\n${[...new Set(found)].join('\n')}`);
});

test('§5 no declare or .d.ts files in src/', () => {
  const found = [
    ...find(/(?<![.$\w])declare\s+[\w$]/),
    ...srcFiles()
      .filter((name) => /\.d\.[cm]?ts$/.test(name))
      .map((name) => `src/${name}`),
  ];
  assert.deepEqual(found, [], `found:\n${found.join('\n')}`);
});

test('§5 no @ts-ignore, @ts-nocheck, or @ts-expect-error in src/', () => {
  const found = find(/@ts-(?:ignore|nocheck|expect-error)/, { inComments: true });
  assert.deepEqual(found, [], `found:\n${found.join('\n')}`);
});
