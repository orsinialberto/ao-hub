import test from 'node:test';
import assert from 'node:assert/strict';
import { createRotation, dragStart, dragBy, release, goTo, step, tick, activeIndex, figureBlend, trackFraction, scrubStart, scrubTo, scrubEnd } from '../src/assets/js/rotation.js';

const run = (s, secs = 3) => { for (let i = 0; i < secs * 60; i++) tick(s, 1 / 60, false); };

test('interrupted drag still lands on a stop', () => {
  const s = createRotation(); dragStart(s); dragBy(s, -300, 1000); release(s, 0); run(s);
  assert.ok(Number.isInteger(s.pos));
});
test('dragging right decreases the position', () => {
  const s = createRotation(); dragStart(s); dragBy(s, 400, 1000);
  assert.ok(Math.abs(s.pos + 0.6) < 1e-9);
});
test('tick leaves the scene alone while dragging', () => {
  const s = createRotation(); dragStart(s); dragBy(s, -200, 1000); const p = s.pos; run(s);
  assert.equal(s.pos, p);
});
test('a hard fling moves one scene only', () => {
  const s = createRotation(); dragStart(s); dragBy(s, -400, 1000); release(s, 99); run(s);
  assert.equal(Math.abs(s.pos), 1);
});
test('release without a drag changes nothing', () => {
  const s = createRotation(); step(s, 1); release(s, 0);
  assert.equal(s.target, 1);
});
test('ten quick arrow presses', () => {
  const s = createRotation(); for (let i = 0; i < 10; i++) { step(s, 1); tick(s, 1 / 60, false); } run(s);
  assert.equal(s.pos, 10); assert.equal(activeIndex(s), 1);
});
test('negative positions wrap', () => {
  const s = createRotation(); step(s, -1); run(s); assert.equal(activeIndex(s), 2);
});
test('goTo takes the short way', () => {
  const s = createRotation(); goTo(s, 2); assert.equal(s.target, -1);
});
test('reduced motion is immediate', () => {
  const s = createRotation(); step(s, 1); tick(s, 1 / 60, true); assert.equal(s.pos, 1);
});
test('at a stop there is one figure, still', () => {
  assert.deepEqual(figureBlend(2), { from: 2, to: 2, weightFrom: 1, weightTo: 0, shiftFrom: 0, shiftTo: 0 });
  assert.deepEqual(figureBlend(-1), { from: 2, to: 2, weightFrom: 1, weightTo: 0, shiftFrom: 0, shiftTo: 0 });
});
test('halfway both drawings are still clearly there', () => {
  const b = figureBlend(0.5);
  assert.equal(b.from, 0); assert.equal(b.to, 1);
  assert.ok(b.weightFrom > 0.7 && b.weightTo > 0.7, JSON.stringify(b));
});
test('at every moment one drawing is almost solid: the figure never fades out', () => {
  for (let p = 0; p <= 3; p += 0.001) {
    const b = figureBlend(p);
    assert.ok(Math.max(b.weightFrom, b.weightTo) >= 0.75, `faint at ${p}`);
  }
});
test('the turn from the last drawing back to the first blends too', () => {
  const b = figureBlend(2.5);
  assert.equal(b.from, 2); assert.equal(b.to, 0);
});
test('the dissolve and the slide never jump, across several turns both ways', () => {
  // quanto "pesa" ogni disegno e dove sta, a una data posizione
  const state = (p) => { const b = figureBlend(p); const w = [0, 0, 0], x = [null, null, null]; w[b.from] = b.weightFrom; x[b.from] = b.shiftFrom; if (b.to !== b.from) { w[b.to] = b.weightTo; x[b.to] = b.shiftTo; } return { w, x }; };
  for (let p = -4; p < 4; p += 0.005) {
    const a = state(p), c = state(p + 0.005);
    for (let i = 0; i < 3; i++) {
      assert.ok(Math.abs(a.w[i] - c.w[i]) < 0.03, `opacity jump at ${p}`);
      if (a.w[i] > 0.01 && c.w[i] > 0.01) assert.ok(Math.abs(a.x[i] - c.x[i]) < 0.02, `slide jump at ${p}`);
    }
  }
});

test('the thumb goes end to end and never jumps, also when the turn wraps', () => {
  assert.equal(trackFraction(0), 0);
  assert.equal(trackFraction(1), 0.5);
  assert.equal(trackFraction(2), 1);
  assert.equal(trackFraction(3), 0);
  assert.equal(trackFraction(-1), 1);
  for (let p = -6; p < 6; p += 0.01) assert.ok(Math.abs(trackFraction(p + 0.01) - trackFraction(p)) <= 0.0101, `jump at ${p}`);
});
test('dragging the thumb can cross all scenes and lands on a stop', () => {
  const s = createRotation(); scrubStart(s); scrubTo(s, 0.9);
  assert.ok(Math.abs(s.pos - 1.8) < 1e-9);
  scrubEnd(s); run(s);
  assert.equal(activeIndex(s), 2);
});
test('scrubbing after several turns stays on the same turn, and is clamped to the line', () => {
  const s = createRotation(); for (let i = 0; i < 7; i++) step(s, 1); run(s);
  scrubStart(s); scrubTo(s, -3); assert.equal(s.pos, 6); scrubTo(s, 9); assert.equal(s.pos, 8);
  scrubEnd(s); run(s); assert.equal(s.pos, 8);
});
test('scrubbing without a start does nothing', () => {
  const s = createRotation(); scrubTo(s, 1); scrubEnd(s); assert.equal(s.pos, 0); assert.equal(s.target, 0);
});
