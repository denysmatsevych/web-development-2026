// Writes the readable bank (pk2-pool.md) and the Apps Script bank (apps-script/Bank.gs)
// from tasks.mjs and ./code. Usage: node build.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tasks, topics } from './tasks.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(join(here, 'code', f), 'utf8').replace(/\r\n/g, '\n').trimEnd();
const numbered = (text) => text.split('\n').map((l, i) => `${String(i + 1).padStart(2, ' ')}  ${l}`).join('\n');
const lang = { '.js': 'js', '.ts': 'ts', '.html': 'html', '.txt': 'text' };

// What the student sees under the question: HTML and JS labelled, line numbers, the Console output.
function codeText(task) {
  if (!task.code) return '';
  const html = task.code.filter((f) => f.endsWith('.html')).map(read);
  let body = task.code.filter((f) => !f.endsWith('.html')).map(read).join('\n\n');
  if (task.numbered) body = numbered(body);
  if (html.length) body = `HTML:\n${html.join('\n')}\n\nJS:\n${body}`;
  if (task.after) body += `\n\nConsole:\n${task.after}`;
  return body;
}

// ── pk2-pool.md ───────────────────────────────────────────────────────────
// Prose with HTML tags would vanish in the Markdown preview, so tags go in code spans.
const inline = (text) => (text.includes('`') ? `\`\` ${text} \`\`` : text.replace(/<\/?[a-zA-Z][^<>\n]*>/g, (m) => `\`${m}\``));
const lines = (text) => text.split('\n').map(inline).join('  \n');

function codeBlocks(task) {
  if (!task.code) return [];
  const blocks = task.code.map((f) => {
    const body = task.numbered ? numbered(read(f)) : read(f);
    return '```' + (task.numbered ? 'text' : lang[extname(f)]) + '\n' + body + '\n```';
  });
  if (task.after) blocks.push('```text\n' + task.after + '\n```');
  return blocks;
}

function block(task) {
  const kin = task.family ? tasks.filter((t) => t.family === task.family && t.id !== task.id).map((t) => t.id) : [];
  const note = kin.length ? ` _(схоже: ${kin.join(', ')} — у форму потрапить лише одне)_` : '';
  return [
    `**${task.id}.** ${inline(task.question)}${note}`,
    ...codeBlocks(task),
    task.options.map((o, i) => `${'abcd'[i]}) ${inline(o)}`).join('  \n'),
    `**Відповідь: a)** ${inline(task.options[0])}  \n${lines(task.explain)}`,
  ].join('\n\n');
}

function section(n) {
  return Object.entries(topics)
    .map(([key, topic]) => {
      const list = tasks.filter((t) => t.section === n && t.topic === key);
      if (!list.length) return '';
      return `### ${topic.title} (${topic.source}) · у банку ${list.length}, у форму ${topic.take[n - 1]}\n\n${list.map(block).join('\n\n---\n\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}

const count = (n, key) => tasks.filter((t) => t.section === n && t.topic === key).length;
const rows = Object.entries(topics).map(([key, t]) =>
  `| ${t.title} (${t.source}) | ${count(1, key)} → **${t.take[0]}** | ${count(2, key) ? `${count(2, key)} → **${t.take[1]}**` : '—'} |`);
const total = (n) => tasks.filter((t) => t.section === n).length;
const take = (n) => Object.values(topics).reduce((s, t) => s + t.take[n - 1], 0);

const md = `# ПК-2 — банк завдань

Банк для скрипта Google Forms (\`apps-script/\`): кожен запуск створює нову форму з випадковими
**${take(1)} питаннями розділу 1 (по 0,5 бала) і ${take(2)} завданнями розділу 2 (по 1 балу) = 12 балів**.

| Тема | Розділ 1: у банку → у форму | Розділ 2: у банку → у форму |
| --- | --- | --- |
${rows.join('\n')}
| **Разом** | **${total(1)} → ${take(1)}** | **${total(2)} → ${take(2)}** |

- У файлі правильна відповідь завжди **a)**; у формі скрипт перемішує варіанти.
- «Схоже» — питання на ту саму ідею; у форму потрапить не більше одного з них.
- Відповіді перевірено запуском коду в Node і Edge, TypeScript — у \`tsc --strict\`.
- Джерело — \`tasks.mjs\` і \`code/\`; \`node build.mjs\` оновлює цей файл і \`apps-script/Bank.gs\`. Не комітити.

## Розділ 1 · 0,5 бала

${section(1)}

## Розділ 2 · 1 бал · аналіз коду

${section(2)}
`;
writeFileSync(join(here, 'pk2-pool.md'), md);

// ── apps-script/Bank.gs ───────────────────────────────────────────────────
const str = (s) => JSON.stringify(s);
const tpl = (s) => '`' + s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${') + '`';

const entry = (t) => {
  const fields = [
    `    id: ${str(t.id)}, section: ${t.section}, topic: ${str(t.topic)},${t.family ? ` family: ${str(t.family)},` : ''}`,
    `    question: ${str(t.question)},`,
  ];
  const code = codeText(t);
  if (code) fields.push(`    code: ${tpl(code)},`);
  fields.push(`    options: [\n${t.options.map((o) => `      ${str(o)},`).join('\n')}\n    ],`);
  fields.push(`    explain: ${tpl(t.explain)},`);
  return `  {\n${fields.join('\n')}\n  },`;
};

const gs = `/**
 * ПК-2 · банк завдань для Code.gs. Лише для викладача — не публікувати.
 * Згенеровано build.mjs з tasks.mjs; там же ці відповіді перевірено запуском коду.
 *
 * Поля питання:
 *   section — 1 (0,5 бала) або 2 (1 бал, аналіз коду); topic — ключ із TOPICS;
 *   family — питання на ту саму ідею: у форму потрапить не більше одного з родини;
 *   question — текст питання; code — код під питанням (необов'язково);
 *   options — 4 варіанти, ПЕРШИЙ — правильний (у формі їх буде перемішано);
 *   explain — пояснення для викладача (у формі не показується).
 */

// take: скільки питань теми брати у форму — [розділ 1, розділ 2].
const TOPICS = ${JSON.stringify(Object.fromEntries(Object.entries(topics).map(([k, t]) => [k, { title: t.title, take: t.take }])), null, 2)};

const BANK = [
${tasks.map(entry).join('\n')}
];
`;
mkdirSync(join(here, 'apps-script'), { recursive: true });
writeFileSync(join(here, 'apps-script', 'Bank.gs'), gs);

console.log(`pk2-pool.md + apps-script/Bank.gs: section 1 — ${total(1)}, section 2 — ${total(2)}, total ${tasks.length}`);
