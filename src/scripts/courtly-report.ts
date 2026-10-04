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
 *
 * The report page also copies the report formatted for a reply to the
 * student, with its own link in it (`copyReportMail()`).
 */
import { withBase } from '@/lib/paths';
import {
  GROUPS,
  STATUS_ICON,
  STATUS_LABEL,
  groupScore,
  scoreChecks,
  summaryLine,
  type Check,
  type GroupId,
  type Status,
} from '@/scripts/courtly-check';

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

/** «Перевірено 4 жовтня 2026 р. о 11:04» for the time of a run. */
export function checkedLine(at: string): string {
  return `Перевірено ${new Date(at).toLocaleString('uk-UA', { dateStyle: 'long', timeStyle: 'short' })}`;
}

/**
 * Light-theme colours for the mail copy: clients drop stylesheets, so
 * inline. The statuses match the `--lab-*` tokens and muted text the site's
 * `--muted-foreground`. AA on white: pass 5.95, warn 5.57, fail 5.90,
 * muted 7.58 : 1.
 */
const MAIL_MUTED = '#45556c';
const MAIL_COLOR: Record<Status, string> = {
  pass: '#177245',
  warn: '#9a5800',
  fail: '#c0262d',
  skip: MAIL_MUTED,
};

const escapeHtml = (value: string) => value.replace(/[&<>"]/g, (ch) => `&#${ch.charCodeAt(0)};`);

/**
 * The report as it goes into a reply to the student: HTML with inline styles
 * for mail clients, plain text for everything else. `href` is the report's
 * own link; the HTML hides it behind a phrase, plain text cannot.
 */
export function reportMail(report: ReportSnapshot, href: string): { html: string; text: string } {
  const { pageUrl, checks } = report;
  const score = scoreChecks(checks);
  const headline = `ЛР-7 · Автоматична перевірка: оцінка ${score.mark} / 12 (${Math.round(score.percent * 100)} %)`;
  const when = checkedLine(report.at);
  const results = summaryLine(checks);
  const legend = STATUSES.map((s) => `${STATUS_ICON[s]} ${STATUS_LABEL[s].toLowerCase()}`).join(' | ');

  const text = [headline, pageUrl, `Звіт: ${href}`, when, results, legend, ''];
  const html = [
    `<p style="margin:0 0 4px"><b style="font-size:16px">${escapeHtml(headline)}</b></p>`,
    `<p style="margin:0"><a href="${escapeHtml(pageUrl)}">${escapeHtml(pageUrl)}</a></p>`,
    `<p style="margin:0">Звіт: <a href="${escapeHtml(href)}">результати й порівняння з макетом</a></p>`,
    `<p style="margin:0;color:${MAIL_MUTED}">${escapeHtml(when)}<br>${escapeHtml(results)}<br>${escapeHtml(legend)}</p>`,
    `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">`,
  ];
  for (const group of GROUPS) {
    const rows = checks.filter((c) => c.group === group.id);
    if (!rows.length) continue;
    const share = groupScore(rows);
    text.push(share ? `${group.title} — ${share}` : group.title);
    html.push(
      `<tr><td colspan="2" style="padding:14px 0 4px"><b>${escapeHtml(group.title)}</b>${share ? `<span style="color:${MAIL_MUTED}"> — ${escapeHtml(share)}</span>` : ''}</td></tr>`,
    );
    for (const c of rows) {
      const info = c.weight === 0 ? ' · не впливає на оцінку' : '';
      text.push(`  ${STATUS_ICON[c.status]} ${c.title}${c.detail ? ` — ${c.detail}` : ''}${info}`);
      const detailColor = c.status === 'warn' || c.status === 'fail' ? MAIL_COLOR[c.status] : MAIL_MUTED;
      html.push(
        `<tr><td style="padding:2px 8px 2px 0;vertical-align:top;font-weight:bold;color:${MAIL_COLOR[c.status]}">${STATUS_ICON[c.status]}</td>` +
          `<td style="padding:2px 0">${escapeHtml(c.title)}` +
          (c.detail ? `<span style="color:${detailColor}"> — ${escapeHtml(c.detail)}</span>` : '') +
          (info ? `<span style="color:${MAIL_MUTED}">${info}</span>` : '') +
          `</td></tr>`,
      );
    }
    text.push('');
  }
  html.push('</table>');
  return { html: html.join(''), text: text.join('\n').trimEnd() };
}

/** Both flavours, so a mail client pastes it formatted; plain text if the browser cannot. */
export async function copyReportMail(report: ReportSnapshot, href: string): Promise<void> {
  const { html, text } = reportMail(report, href);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard.write) {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      return;
    } catch {
      // fall through to plain text
    }
  }
  await navigator.clipboard.writeText(text);
}
