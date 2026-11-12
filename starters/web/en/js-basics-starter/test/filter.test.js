// C2 · filterShows. Do not modify tests: this is the specification in code.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { filterShows } from '../src/filter.js';

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

/** Only fields needed by filters. Bad Pilot is fictional: rating 0 is rare, but valid. */
const shows = deepFreeze([
  { name: 'Breaking Bad', rating: 9.2, genres: ['Drama', 'Crime', 'Thriller'] },
  { name: 'The Big Bang Theory', rating: 8, genres: ['Comedy'] },
  { name: 'Utopia', rating: null, genres: [] },
  { name: 'Bad Pilot', rating: 0, genres: ['Drama', 'Comedy'] },
  { name: 'The Wire', rating: 8.9, genres: ['Drama', 'Crime'] },
]);

const names = (list) => list.map((show) => show.name);

describe('filterShows', () => {
  test('no options → all shows in a new array', () => {
    const result = filterShows(shows);
    assert.deepEqual(result, shows);
    assert.notEqual(result, shows, 'returned the original array instead of a new one');
  });

  test('query: part of the name, ignoring case and leading/trailing spaces', () => {
    assert.deepEqual(names(filterShows(shows, { query: '  BAD ' })), ['Breaking Bad', 'Bad Pilot']);
  });

  test('genre: exact match with one of the genres', () => {
    assert.deepEqual(names(filterShows(shows, { genre: 'Comedy' })), [
      'The Big Bang Theory',
      'Bad Pilot',
    ]);
  });

  test('minRating: 8.9 → rating ≥ 8.9; unrated shows are excluded', () => {
    assert.deepEqual(names(filterShows(shows, { minRating: 8.9 })), ['Breaking Bad', 'The Wire']);
  });

  test('minRating: 0 means no filter: ratings 0 and null remain', () => {
    assert.deepEqual(filterShows(shows, { minRating: 0 }), shows);
  });

  test('null in any field means unset', () => {
    assert.deepEqual(filterShows(shows, { query: null, genre: null, minRating: null }), shows);
  });

  test('an empty string or a string of spaces also means unset', () => {
    assert.deepEqual(filterShows(shows, { query: '   ', genre: '' }), shows);
  });

  test('several filters combine with AND', () => {
    const result = filterShows(shows, { query: 'the', genre: 'Drama', minRating: 8 });
    assert.deepEqual(names(result), ['The Wire']);
  });
});
