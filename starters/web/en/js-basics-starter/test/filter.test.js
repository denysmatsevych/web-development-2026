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
  test('without options → returns all shows in a new array', () => {
    const result = filterShows(shows);
    assert.deepEqual(result, shows);
    assert.notEqual(result, shows, 'returned the original array instead of a new one');
  });

  test('query: matches partial show name case-insensitively, trimming boundary whitespace', () => {
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

  test('minRating: 0 is considered unset → unrated shows remain included', () => {
    assert.deepEqual(names(filterShows(shows, { minRating: 0 })), names(shows));
  });

  test('empty query or genre is considered unset', () => {
    assert.deepEqual(names(filterShows(shows, { query: '' })), names(shows));
    assert.deepEqual(names(filterShows(shows, { query: '   ' })), names(shows));
    assert.deepEqual(names(filterShows(shows, { genre: '' })), names(shows));
  });

  test('null values in options are considered unset', () => {
    assert.deepEqual(
      names(filterShows(shows, { query: null, genre: null, minRating: null })),
      names(shows),
    );
  });

  test('combines multiple active filters with logical AND', () => {
    assert.deepEqual(names(filterShows(shows, { genre: 'Drama', minRating: 9 })), ['Breaking Bad']);
  });

  test('preserves original relative order of elements', () => {
    assert.deepEqual(names(filterShows(shows, { genre: 'Drama' })), [
      'Breaking Bad',
      'Bad Pilot',
      'The Wire',
    ]);
  });

  test('does not mutate input array or its objects', () => {
    assert.doesNotThrow(() => filterShows(shows, { minRating: 8 }));
  });
});
