/**
 * ЛР-7 check report — the result the instructor shares with the student,
 * carried in the link to `/labs/lab-7/report/`.
 *
 * The site is static, so there is nowhere to store a report: the URL fragment
 * holds it, as JSON compressed with deflate-raw and encoded as base64url
 * (about 3 KB for a typical page). A fragment never reaches a server.
 *
 * The link is a snapshot of the run as graded, so it does not change when the
 * student edits the site afterwards. It is the student's copy, not the
 * record: anyone who decodes it can edit it, and the mark lives in the
 * instructor's gradebook. A tamper-proof report needs a backend.
 */
import { withBase } from '@/lib/paths';
import { GROUPS, type Check, type GroupId, type Status } from '@/scripts/courtly-check';

export interface ReportSnapshot {
  pageUrl: string;
  /** ISO time of the check run. */
  at: string;
  /** The rows as reported, verdicts and comments applied (`withVerdicts()`). */
  checks: Check[];
}

/** A link that does not decode to a report. */
export class ReportError extends Error {}

/** Bump when `Wire` changes; old links then say so instead of misreading. */
const VERSION = 1;

/** [id, group, title, weight, status, detail, judged by hand] — short keys keep the link short. */
type Row = [string, GroupId, string, number, Status, string, 0 | 1];
interface Wire {
  v: number;
  u: string;
  t: string;
  c: Row[];
}

const STATUSES: Status[] = ['pass', 'warn', 'fail', 'skip'];

async function pipe(bytes: Uint8Array<ArrayBuffer>, through: CompressionStream | DecompressionStream) {
  const stream = new Blob([bytes]).stream().pipeThrough(through);
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(binary, (ch) => ch.charCodeAt(0));
}

export async function encodeReport(report: ReportSnapshot): Promise<string> {
  const wire: Wire = {
    v: VERSION,
    u: report.pageUrl,
    t: report.at,
    c: report.checks.map((c) => [c.id, c.group, c.title, c.weight, c.status, c.detail ?? '', c.manual ? 1 : 0]),
  };
  const json = new TextEncoder().encode(JSON.stringify(wire));
  return toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
}

/** The report in a fragment (without `#`); throws `ReportError`. */
export async function decodeReport(fragment: string): Promise<ReportSnapshot> {
  const broken = new ReportError('Посилання на звіт пошкоджене або неповне. Попросіть викладача надіслати його ще раз.');
  let wire: Wire;
  try {
    const json = await pipe(fromBase64Url(fragment), new DecompressionStream('deflate-raw'));
    wire = JSON.parse(new TextDecoder().decode(json));
  } catch {
    throw broken;
  }
  if (wire?.v !== VERSION) {
    throw new ReportError('Це посилання на звіт старого формату. Попросіть викладача сформувати звіт ще раз.');
  }
  const groups = new Set(GROUPS.map((g) => g.id));
  const valid =
    typeof wire.u === 'string' &&
    /^https?:\/\//.test(wire.u) &&
    !Number.isNaN(Date.parse(wire.t)) &&
    Array.isArray(wire.c) &&
    wire.c.length > 0 &&
    wire.c.every(
      (r) =>
        Array.isArray(r) &&
        typeof r[0] === 'string' &&
        groups.has(r[1]) &&
        typeof r[2] === 'string' &&
        Number.isFinite(r[3]) &&
        r[3] >= 0 &&
        STATUSES.includes(r[4]) &&
        typeof r[5] === 'string',
    );
  if (!valid) throw broken;
  return {
    pageUrl: wire.u,
    at: wire.t,
    checks: wire.c.map(([id, group, title, weight, status, detail, manual]) => ({
      id,
      group,
      title,
      weight,
      status,
      ...(detail ? { detail } : {}),
      ...(manual ? { manual: true } : {}),
    })),
  };
}

/** Absolute link to the report page holding `report`. */
export async function reportHref(report: ReportSnapshot): Promise<string> {
  const url = new URL(withBase('/labs/lab-7/report/'), location.origin);
  url.hash = await encodeReport(report);
  return url.href;
}
