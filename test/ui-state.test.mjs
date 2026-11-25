import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAG_THRESHOLD, isClick, hitRect, bladeCountFor } from '../src/assets/js/ui-state.js';

test('a drag is not a click, even if it comes back', () => {
  assert.equal(DRAG_THRESHOLD, 8);
  assert.equal(isClick({ x: 0, y: 0 }, { x: 3, y: 3 }, 4), true);
  assert.equal(isClick({ x: 0, y: 0 }, { x: 0, y: 0 }, 120), false);
  assert.equal(isClick({ x: 0, y: 0 }, { x: 30, y: 0 }, 0), false);
});
test('hit test', () => {
  const r = { left: 10, right: 20, top: 10, bottom: 30 };
  assert.equal(hitRect(null, 1, 1), false);
  assert.equal(hitRect(r, 15, 20), true);
  assert.equal(hitRect(r, 25, 20), false);
});
test('fewer blades on phones, also in landscape', () => {
  assert.equal(bladeCountFor(1440, 900), 90000);
  assert.equal(bladeCountFor(390, 844), 40000);
  assert.equal(bladeCountFor(844, 390), 40000);
});
