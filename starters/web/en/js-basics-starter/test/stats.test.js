// C4 · genreStats. Do not modify tests: this is the specification in code.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { genreStats } from '../src/stats.js';

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

/**
 * Only fields needed for statistics. Zero Pilot and Fresh Pilot are fictional: rating 0 is rare,
 * but valid, while a newly released show has no rating yet.
 */
const shows = deepFreeze([
  { name: 'Breaking Bad', rating: 9.2, genres: ['Drama', 'Crime'] },
  { name: 'The Wire', rating: 8.9, genres: ['Drama'] },
  { name: 'Fargo', rating: 8.6, genres: ['Crime', 'Comedy'] },
  { name: 'Girls', rating: 6.5, genres: ['Drama', 'Comedy'] },
  { name: 'The Big Bang Theory', rating: 8, genres: ['Comedy'] },
  { name: 'Zero Pilot', rating: 0, genres: ['Comedy'] },
  { name: 'Fresh Pilot', rating: null, genres: ['Comedy'] },
  { name: 'Long Shadow', rating: null, genres: ['War', 'History'] },
  { name: 'The Chair', rating: null, genres: [] },
]);

describe('genreStats', () => {
  test('each genre → { count, averageRating }; shows without genres are ignored', () => {
    assert.deepEqual(genreStats(shows), {
      Drama: { count: 3, averageRating: 8.2 },
      Crime: { count: 2, averageRating: 8.9 },
      Comedy: { count: 5, averageRating: 5.8 },
      War: { count: 1, averageRating: null },
      History: { count: 1, averageRating: null },
    });
  });

  test('averageRating is a number rounded to one decimal place', () => {
    const { averageRating } = genreStats(shows).Drama;
    assert.equal(typeof averageRating, 'number');
    assert.equal(averageRating, 8.2);
  });

  test('average calculation excludes null, but includes 0', () => {
    assert.equal(genreStats(shows).Comedy.averageRating, 5.8);
  });

  test('genre without any ratings → averageRating: null (not NaN and not 0)', () => {
    assert.equal(genreStats(shows).War.averageRating, null);
  });

  test('empty array → empty object', () => {
    assert.deepEqual(genreStats([]), {});
  });
});
