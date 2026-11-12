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

  test('rating.average: 0 is a rating of 0, not a missing rating', () => {
    assert.equal(normalizeShow(variant({ rating: { average: 0 } })).rating, 0);
  });

  test('rating.average: null, rating: null or no rating field → rating: null', () => {
    assert.equal(normalizeShow(variant({ rating: { average: null } })).rating, null);
    assert.equal(normalizeShow(variant({ rating: null })).rating, null);
    assert.equal(normalizeShow(without('rating')).rating, null);
  });

  test('premiered: null or no field → year: null (not NaN and not 1970)', () => {
    assert.equal(normalizeShow(variant({ premiered: null })).year, null);
    assert.equal(normalizeShow(without('premiered')).year, null);
  });

  test('network: null or no field → network: null', () => {
    assert.equal(normalizeShow(variant({ network: null })).network, null);
    assert.equal(normalizeShow(without('network')).network, null);
  });

  test('runtime: null or no field → runtime: null', () => {
    assert.equal(normalizeShow(variant({ runtime: null })).runtime, null);
    assert.equal(normalizeShow(without('runtime')).runtime, null);
  });

  test('no genres field → genres: []', () => {
    assert.deepEqual(normalizeShow(without('genres')).genres, []);
  });

  test('genres is a new array, not a reference to the input one', () => {
    const result = normalizeShow(complete);
    assert.notEqual(
      result.genres,
      complete.genres,
      'result.genres is the same array as raw.genres',
    );
    assert.deepEqual(result.genres, complete.genres);
  });
});
