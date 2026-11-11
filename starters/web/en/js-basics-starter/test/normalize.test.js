// C1 · normalizeShow. Do not modify tests: this is the specification in code.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { normalizeShow } from '../src/normalize.js';

/**
 * Freezes a value recursively along with all nested objects and arrays. Modules run in
 * strict mode, so any function attempting to mutate input data will throw a TypeError.
 */
function deepFreeze(value) {
  if (value !== null && typeof value === 'object') {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
}

/** Record from data/shows.json unchanged. */
const complete = deepFreeze({
  id: 169,
  url: 'https://www.tvmaze.com/shows/169/breaking-bad',
  name: 'Breaking Bad',
  language: 'English',
  genres: ['Drama', 'Crime', 'Thriller'],
  status: 'Ended',
  runtime: 60,
  premiered: '2008-01-20',
  rating: { average: 9.2 },
  network: { id: 20, name: 'AMC' },
});

/** The same record with modified fields. */
const variant = (changes) => deepFreeze({ ...complete, ...changes });

/** The same record without the `key` field. */
function without(key) {
  const copy = { ...complete };
  delete copy[key];
  return deepFreeze(copy);
}

describe('normalizeShow', () => {
  test('returns exactly seven fields: id, name, year, rating, runtime, network, genres', () => {
    assert.deepEqual(normalizeShow(complete), {
      id: 169,
      name: 'Breaking Bad',
      year: 2008,
      rating: 9.2,
      runtime: 60,
      network: 'AMC',
      genres: ['Drama', 'Crime', 'Thriller'],
    });
  });

  test('year: parses year as a number from "YYYY-MM-DD"', () => {
    assert.equal(normalizeShow(complete).year, 2008);
  });

  test('year: returns null if premiered is null or missing', () => {
    assert.equal(normalizeShow(variant({ premiered: null })).year, null);
    assert.equal(normalizeShow(without('premiered')).year, null);
  });

  test('rating: extracts rating.average', () => {
    assert.equal(normalizeShow(complete).rating, 9.2);
  });

  test('rating: preserves rating of 0 as a valid number', () => {
    assert.equal(normalizeShow(variant({ rating: { average: 0 } })).rating, 0);
  });

  test('rating: returns null if rating.average is null, or rating is null/missing', () => {
    assert.equal(normalizeShow(variant({ rating: { average: null } })).rating, null);
    assert.equal(normalizeShow(variant({ rating: null })).rating, null);
    assert.equal(normalizeShow(without('rating')).rating, null);
  });

  test('runtime: preserves value, returns null if null or missing', () => {
    assert.equal(normalizeShow(complete).runtime, 60);
    assert.equal(normalizeShow(variant({ runtime: null })).runtime, null);
    assert.equal(normalizeShow(without('runtime')).runtime, null);
  });

  test('network: extracts network.name, returns null if null or missing', () => {
    assert.equal(normalizeShow(complete).network, 'AMC');
    assert.equal(normalizeShow(variant({ network: null })).network, null);
    assert.equal(normalizeShow(without('network')).network, null);
  });

  test('genres: returns a new array, does not share reference with input', () => {
    const result = normalizeShow(complete);
    assert.deepEqual(result.genres, ['Drama', 'Crime', 'Thriller']);
    assert.notEqual(result.genres, complete.genres, 'genres references the input array');
  });

  test('genres: returns [] if genres is missing or null', () => {
    assert.deepEqual(normalizeShow(without('genres')).genres, []);
    assert.deepEqual(normalizeShow(variant({ genres: null })).genres, []);
  });

  test('does not mutate raw argument (caught by deepFreeze)', () => {
    assert.doesNotThrow(() => normalizeShow(complete));
  });
});
