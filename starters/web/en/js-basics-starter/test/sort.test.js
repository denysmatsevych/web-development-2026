// C3 · sortShows. Do not modify tests: this is the specification in code.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { sortShows } from '../src/sort.js';

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

/** Only fields used for sorting. Perfect Ten is fictional: rating 10 is rare, but valid. */
const shows = deepFreeze([
  { name: 'Under the Dome', year: 2013, rating: 6.6 },
  { name: 'Utopia', year: 2014, rating: null },
  { name: 'Perfect Ten', year: 2020, rating: 10 },
  { name: 'black-ish', year: 2014, rating: 6.2 },
  { name: 'Lost', year: 2004, rating: 8.2 },
]);

const names = (list) => list.map((show) => show.name);

describe('sortShows', () => {
  test('returns a new array and does not mutate the input', () => {
    const result = sortShows(shows, 'year');
    assert.notEqual(result, shows, 'returned the original array instead of a new one');
    assert.equal(result.length, shows.length);
  });

  test('rating, asc: compares numbers rather than strings; null sorts at the end', () => {
    assert.deepEqual(names(sortShows(shows, 'rating', 'asc')), [
      'black-ish',
      'Under the Dome',
      'Lost',
      'Perfect Ten',
      'Utopia',
    ]);
  });

  test('rating, desc: null also sorts at the end', () => {
    assert.deepEqual(names(sortShows(shows, 'rating', 'desc')), [
      'Perfect Ten',
      'Lost',
      'Under the Dome',
      'black-ish',
      'Utopia',
    ]);
  });

  test('year, asc: identical values preserve original relative order', () => {
    assert.deepEqual(names(sortShows(shows, 'year', 'asc')), [
      'Lost',
      'Under the Dome',
      'Utopia',
      'black-ish',
      'Perfect Ten',
    ]);
  });

  test('year, desc: identical values also preserve original relative order', () => {
    assert.deepEqual(names(sortShows(shows, 'year', 'desc')), [
      'Perfect Ten',
      'Utopia',
      'black-ish',
      'Under the Dome',
      'Lost',
    ]);
  });

  test('name: localeCompare — casing does not determine order', () => {
    assert.deepEqual(names(sortShows(shows, 'name', 'asc')), [
      'black-ish',
      'Lost',
      'Perfect Ten',
      'Under the Dome',
      'Utopia',
    ]);
  });

  test('without direction → defaults to asc', () => {
    assert.deepEqual(sortShows(shows, 'name'), sortShows(shows, 'name', 'asc'));
  });
});
