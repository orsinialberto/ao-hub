import test from 'node:test';
import assert from 'node:assert/strict';
import { REST_WEIGHT, PEAK_WEIGHT, weightAt, approach } from '../src/assets/js/title-weight.js';

test('a letter right under the pointer is the heaviest', () => {
  assert.equal(weightAt(0, 100), PEAK_WEIGHT);
});

test('letters at the edge of the reach or beyond keep the resting weight', () => {
  assert.equal(weightAt(100, 100), REST_WEIGHT);
  assert.equal(weightAt(500, 100), REST_WEIGHT);
});

test('the weight fades gradually with distance', () => {
  const weights = [0, 25, 50, 75, 100].map((d) => weightAt(d, 100));
  for (let i = 1; i < weights.length; i++) assert.ok(weights[i] < weights[i - 1], weights.join(' '));
  assert.equal(weights[2], (REST_WEIGHT + PEAK_WEIGHT) / 2);
});

test('without a measurable reach nothing changes', () => {
  assert.equal(weightAt(0, 0), REST_WEIGHT);
});

const run = (from, targetAt, frames, dt) => {
  const seen = [from];
  for (let i = 0; i < frames; i++) seen.push(approach(seen.at(-1), targetAt(i), dt));
  return seen;
};

test('the weight keeps moving every frame while the target keeps changing', () => {
  const seen = run(REST_WEIGHT, (i) => 400 + i * 20, 20, 1 / 60);
  for (let i = 1; i < seen.length; i++) assert.ok(seen[i] > seen[i - 1], seen.join(' '));
});

test('the easing does not depend on the frame rate', () => {
  const at60 = run(REST_WEIGHT, () => PEAK_WEIGHT, 12, 1 / 60).at(-1);
  const at120 = run(REST_WEIGHT, () => PEAK_WEIGHT, 24, 1 / 120).at(-1);
  assert.ok(Math.abs(at60 - at120) < 0.01, `${at60} ${at120}`);
});

test('the easing never overshoots and ends exactly on the target', () => {
  const seen = run(PEAK_WEIGHT, () => REST_WEIGHT, 90, 1 / 60);
  assert.ok(seen.every((w) => w >= REST_WEIGHT));
  assert.equal(seen.at(-1), REST_WEIGHT);
});
