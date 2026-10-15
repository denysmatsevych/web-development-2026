/**
 * §5 · Обмеження ТЗ для src/: без any і без коментарів, що вимикають перевірку типів.
 * Не змінюйте цей файл.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

const SRC = new URL('../src/', import.meta.url);
const lines = readdirSync(SRC)
  .filter((name) => name.endsWith('.ts'))
  .flatMap((name) =>
    readFileSync(new URL(name, SRC), 'utf8')
      .split(/\r?\n/)
      .map((text, index) => ({ where: `src/${name}:${index + 1}`, text })),
  );

/** Рядки, де `pattern` трапляється в коді (коментар у кінці рядка не рахується). */
function find(pattern, { inComments = false } = {}) {
  return lines
    .filter(({ text }) => pattern.test(inComments ? text : text.replace(/(^|\s)\/\/.*$/, '')))
    .map(({ where, text }) => `${where}  ${text.trim()}`);
}

test('§5 у src/ немає типу any', () => {
  const found = find(/(?:[:<,|&=(]|\bas)\s*any\b|\bany\s*\[\s*\]/);
  assert.deepEqual(found, [], `any знайдено:\n${found.join('\n')}`);
});

test('§5 у src/ немає @ts-ignore, @ts-nocheck і @ts-expect-error', () => {
  const found = find(/@ts-(?:ignore|nocheck|expect-error)/, { inComments: true });
  assert.deepEqual(found, [], `знайдено:\n${found.join('\n')}`);
});
