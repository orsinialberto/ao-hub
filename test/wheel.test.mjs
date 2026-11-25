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

// casi dell'uso vero: il secondo gesto non deve andare perso
const inertia = (from, count, start) => series(Array.from({ length: count }, (_, i) => Math.max(2, Math.round(from * 0.95 ** i))), start);

test('a second swipe 300 ms after the first counts, even if not much stronger than the tail', () => {
  const first = [...series([10, 35, 60]), ...inertia(60, 15, 48)];
  const second = series([34, 48, 56, 40, 30], first.at(-1)[1] + 16);
  assert.deepEqual(feed([...first, ...second]), [1, 1]);
});
test('mouse notches in quick succession keep turning', () => {
  assert.deepEqual(feed([[100, 0], [100, 280]]), [1, 1]);
  const spinning = Array.from({ length: 8 }, (_, i) => [100, i * 120]); // 8 scatti in 0,84 s
  assert.ok(feed(spinning).length >= 3, String(feed(spinning).length));
});
test('uneven inertia is still one swipe', () => {
  const noisy = Array.from({ length: 90 }, (_, i) => Math.max(1, Math.round(70 * 0.95 ** i) + [0, 3, -3, 2, -2][i % 5]));
  assert.deepEqual(feed(series([8, 25, 55, 70, ...noisy])), [1]);
});
test('a long slow push that keeps accelerating is one swipe', () => {
  assert.deepEqual(feed(series(Array.from({ length: 30 }, (_, i) => 3 + i * 3))), [1]);
});
test('two events of the same flick a few ms apart are one step', () => {
  assert.deepEqual(feed([[100, 0], [100, 16], [100, 32]]), [1]);
});
test('a fading swipe delivered slowly (busy page) is still one swipe', () => {
  // sequenza registrata nel browser: un evento ogni 66 ms circa
  const slow = series(Array.from({ length: 40 }, (_, i) => Math.max(2, 60 - i * 2)), 0, 66);
  assert.deepEqual(feed(slow), [1]);
});
