/**
 * T3 · States and messages (src/state.ts). Each test name begins with the assignment rule number.
 * Do not modify this file.
 *
 * Strings are compared strictly, only three dots "..." are accepted as "…".
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HttpError } from '../src/api.ts';
import { errorMessage, messageFor } from '../src/state.ts';
import { SEARCH, SHOWS, describe } from './support.js';

const text = (value) => (typeof value === 'string' ? value.replace('...', '…') : value);

test('T3.2 errorMessage: HttpError 404', () => {
  assert.equal(text(errorMessage(new HttpError(404))), 'Not found (HTTP 404).');
});

test('T3.2 errorMessage: HttpError 429', () => {
  assert.equal(text(errorMessage(new HttpError(429))), 'Too many requests (HTTP 429). Please try again in a few seconds.');
});

test('T3.2 errorMessage: HttpError 500–599 — with status', () => {
  for (const status of [500, 502, 503]) {
    assert.equal(
      text(errorMessage(new HttpError(status))),
      `TVmaze server unavailable (HTTP ${status}). Please try again later.`,
      `HttpError ${status}`,
    );
  }
});

test('T3.2 errorMessage: other HttpError — with status', () => {
  for (const status of [400, 403, 410]) {
    assert.equal(text(errorMessage(new HttpError(status))), `Request error (HTTP ${status}).`, `HttpError ${status}`);
  }
});

test('T3.2 errorMessage: TypeError — network failure', () => {
  assert.equal(text(errorMessage(new TypeError('fetch failed'))), 'Network unavailable. Check your connection.');
});

test('T3.2 errorMessage: any other value', () => {
  const others = [new Error('Unexpected API response'), new SyntaxError('Unexpected token <'), 'boom', null, undefined, 404, { status: 404 }];
  for (const value of others) {
    assert.equal(text(errorMessage(value)), 'Something went wrong. Please try again.', `errorMessage(${describe(value)})`);
  }
});

const girls = SEARCH.girls.map((result) => result.show);

test('T3.3 messageFor: idle', () => {
  assert.equal(text(messageFor({ status: 'idle' })), 'Enter a TV series title.');
});

test('T3.3 messageFor: loading', () => {
  assert.equal(text(messageFor({ status: 'loading' })), 'Loading…');
});

test('T3.3 messageFor: results — show count', () => {
  assert.equal(text(messageFor({ status: 'results', query: 'girls', shows: girls })), `Shows found: ${girls.length}`);
  assert.equal(text(messageFor({ status: 'results', query: 'girls', shows: girls.slice(0, 1) })), 'Shows found: 1');
});

test('T3.3 messageFor: empty — with query', () => {
  assert.equal(text(messageFor({ status: 'empty', query: 'qqqzzz' })), 'Nothing found for "qqqzzz"');
});

test('T3.3 messageFor: show — show title', () => {
  assert.equal(text(messageFor({ status: 'show', show: SHOWS[139] })), 'Show: Girls');
});

test('T3.3 messageFor: error — error message unchanged', () => {
  for (const message of ['Network unavailable. Check your connection.', 'Any text']) {
    assert.equal(text(messageFor({ status: 'error', message })), message);
  }
});
