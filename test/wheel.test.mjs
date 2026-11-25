import test from 'node:test';
import assert from 'node:assert/strict';
import { createWheelStepper } from '../src/assets/js/wheel.js';

/** Feeds [delta, time] events and returns the non-zero steps. */
const feed = (events, w = createWheelStepper()) => events.map(([d, t]) => w.push(d, t)).filter(Boolean);
const series = (deltas, start = 0, every = 16) => deltas.map((d, i) => [d, start + i * every]);

test('one mouse notch moves one scene, down is next, up is previous', () => {
  assert.deepEqual(feed([[100, 0]]), [1]);
  assert.deepEqual(feed([[-100, 0]]), [-1]);
});
test('separate notches move one scene each', () => {
  assert.deepEqual(feed([[100, 0], [100, 400], [100, 800]]), [1, 1, 1]);
});
test('a trackpad swipe with long inertia moves one scene only', () => {
  const swipe = [4, 12, 30, 55, 70, 64, ...Array.from({ length: 80 }, (_, i) => Math.max(1, 60 - i))];
  assert.deepEqual(feed(series(swipe)), [1]);
});
test('a second swipe during the inertia counts', () => {
  const w = createWheelStepper();
  const first = series([30, 60, ...Array.from({ length: 50 }, (_, i) => Math.max(2, 50 - i))]);
  const second = series([20, 55, 70, 40, 20], first.at(-1)[1] + 16);
  assert.deepEqual(feed([...first, ...second], w), [1, 1]);
});
test('changing direction answers at once', () => {
  assert.deepEqual(feed([[100, 0], [-100, 60]]), [1, -1]);
});
test('tiny jitter does nothing, and does not add up over time', () => {
  assert.deepEqual(feed([[8, 0], [8, 500], [8, 1000], [8, 1500], [8, 2000], [8, 2500]]), []);
});
test('zero delta is ignored', () => {
  assert.deepEqual(feed([[0, 0]]), []);
});
