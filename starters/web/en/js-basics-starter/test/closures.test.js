// C5 · createCounter, once, memoize. Do not modify tests: this is the specification in code.
import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import { createCounter, memoize, once } from '../src/closures.js';

describe('createCounter', () => {
  test('starts at 0 without argument; increment increases by 1 and returns new value', () => {
    const counter = createCounter();
    assert.equal(counter.value(), 0);
    assert.equal(counter.increment(), 1);
    assert.equal(counter.increment(), 2);
    assert.equal(counter.value(), 2);
  });

  test('start sets initial value; reset restores it', () => {
    const counter = createCounter(10);
    counter.increment();
    assert.equal(counter.reset(), 10);
    assert.equal(counter.value(), 10);
  });

  test('two counters maintain independent state', () => {
    const first = createCounter();
    const second = createCounter(100);
    first.increment();
    first.increment();
    second.increment();
    assert.equal(first.value(), 2);
    assert.equal(second.value(), 101);
  });

  test('methods work detached from the object', () => {
    const { increment, value } = createCounter(5);
    increment();
    assert.equal(value(), 6);
  });

  test('state is encapsulated in closure: only three methods exposed', () => {
    assert.deepEqual(Object.keys(createCounter()).sort(), ['increment', 'reset', 'value']);
  });
});

describe('once', () => {
  test('calls fn once and returns the first result on subsequent calls', () => {
    const calls = [];
    const init = once((x) => {
      calls.push(x);
      return x * 2;
    });
    assert.equal(init(21), 42);
    assert.equal(init(100), 42);
    assert.deepEqual(calls, [21]);
  });

  test('does not call fn again even if it returned undefined', () => {
    let calls = 0;
    const log = once(() => {
      calls += 1;
    });
    log();
    log();
    log();
    assert.equal(calls, 1);
  });

  test('each wrapper maintains its own state', () => {
    const first = once(() => 'first');
    const second = once(() => 'second');
    assert.equal(first(), 'first');
    assert.equal(second(), 'second');
  });
});

describe('memoize', () => {
  test('subsequent call with the same argument returns cached result', () => {
    let calls = 0;
    const square = memoize((n) => {
      calls += 1;
      return n * n;
    });
    assert.equal(square(4), 16);
    assert.equal(square(4), 16);
    assert.equal(calls, 1);
    assert.equal(square(5), 25);
    assert.equal(calls, 2);
  });

  test("1 and '1' are distinct arguments", () => {
    const type = memoize((x) => typeof x);
    assert.equal(type(1), 'number');
    assert.equal(type('1'), 'string');
  });

  test('caches falsy results: 0, undefined, false', () => {
    let calls = 0;
    const zero = memoize(() => {
      calls += 1;
      return 0;
    });
    zero('a');
    zero('a');
    assert.equal(calls, 1);
  });

  test('each memoized function has its own cache', () => {
    const double = memoize((n) => n * 2);
    const triple = memoize((n) => n * 3);
    assert.equal(double(3), 6);
    assert.equal(triple(3), 9);
  });
});
