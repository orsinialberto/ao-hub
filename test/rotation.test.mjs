import test from 'node:test';
import assert from 'node:assert/strict';
import { createRotation, dragStart, dragBy, release, goTo, step, tick, activeIndex, figureVisibility, trackFraction, scrubStart, scrubTo, scrubEnd } from '../src/assets/js/rotation.js';

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
test('figure hidden halfway, full at stops', () => {
  assert.equal(figureVisibility({ pos: 0.5 }), 0);
  assert.equal(figureVisibility({ pos: 2 }), 1);
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
