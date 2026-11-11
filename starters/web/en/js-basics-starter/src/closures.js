/**
 * @typedef {object} Counter
 * @property {() => number} increment increments value by 1 and returns the new value
 * @property {() => number} reset resets value to start and returns it
 * @property {() => number} value current value
 */

/**
 * C5.1. Creates a counter.
 * Specification — assignment brief, C5.
 *
 * @param {number} [start]
 * @returns {Counter}
 */
export function createCounter(start = 0) {
  throw new Error('Not implemented');
}

/**
 * C5.2. Wraps `fn` so that it executes at most once.
 * Specification — assignment brief, C5.
 *
 * @template {(...args: any[]) => any} F
 * @param {F} fn
 * @returns {F}
 */
export function once(fn) {
  throw new Error('Not implemented');
}

/**
 * C5.3. Caches the result of `fn` for each value of its single argument.
 * Specification — assignment brief, C5.
 *
 * @template T, R
 * @param {(arg: T) => R} fn
 * @returns {(arg: T) => R}
 */
export function memoize(fn) {
  throw new Error('Not implemented');
}
