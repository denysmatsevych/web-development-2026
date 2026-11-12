/**
 * npm run check — self-check: first types (tsc -p check), then tests (check/*.test.js),
 * ending with a one-line summary. Do not modify this file.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { finished } from 'node:stream/promises';
import { run } from 'node:test';
import { spec } from 'node:test/reporters';
import { fileURLToPath } from 'node:url';

// Tests execute src/*.ts without compilation: Node strips types natively starting from 22.18.
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 18)) {
  console.error(`Requires Node.js 22.18 or newer; currently ${process.version}. Update Node: https://nodejs.org/`);
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const tsc = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));
if (!existsSync(tsc)) {
  console.error('node_modules/typescript is missing: run npm install first.');
  process.exit(1);
}

console.log('Type check: tsc -p check\n');
const typecheck = spawnSync(process.execPath, [tsc, '-p', 'check', '--pretty'], { cwd: root, encoding: 'utf8' });
process.stdout.write(typecheck.stdout || '');
process.stderr.write(typecheck.stderr || '');
const typeErrors = typecheck.status === 0 ? 0 : Number(/Found (\d+) error/.exec(typecheck.stdout)?.[1] ?? 1);
if (!typeErrors) console.log('No type errors.');

console.log('\nTests: node --test check/*.test.js\n');
const files = readdirSync(new URL('.', import.meta.url))
  .filter((name) => name.endsWith('.test.js'))
  .sort()
  .map((name) => fileURLToPath(new URL(name, import.meta.url)));
let passed = 0;
let failed = 0;
const stream = run({ files });
stream.on('test:pass', (event) => {
  if (event.details.type !== 'suite') passed += 1;
});
stream.on('test:fail', (event) => {
  if (event.details.type !== 'suite') failed += 1;
});
const report = stream.compose(spec);
report.pipe(process.stdout);
await finished(report);

const types = typeErrors ? `${typeErrors} ${typeErrors === 1 ? 'error' : 'errors'}` : 'no errors';
console.log(`\nTypes: ${types} · Tests: passed ${passed} of ${passed + failed}`);
process.exitCode = typeErrors || failed ? 1 : 0;
