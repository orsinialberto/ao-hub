import test from 'node:test';
import assert from 'node:assert/strict';
import { DRAG_THRESHOLD, SCENE_TOP, SCENE_BOTTOM, isClick, hitRect, bladeCountFor, fitView } from '../src/assets/js/ui-state.js';

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

test('the whole scene fits the stage at every screen size', () => {
  // [stage w, stage h, window w, window h]
  for (const sizes of [[1440, 540, 1440, 900], [2560, 1080, 2560, 1440], [390, 540, 390, 844], [320, 260, 320, 640], [844, 240, 844, 390]]) {
    const { hw, hh, cy } = fitView(...sizes);
    assert.ok(Math.abs(hw / hh - sizes[0] / sizes[1]) < 1e-9, `no stretching ${sizes}`);
    assert.ok(cy + hh >= SCENE_TOP - 1e-9, `top cut ${sizes}`);
    assert.ok(cy - hh <= SCENE_BOTTOM + 1e-9, `bottom cut ${sizes}`);
  }
});
test('on a desktop the island keeps its approved size', () => {
  assert.ok(Math.abs(fitView(1440, 540, 1440, 900).hw - 17) < 1e-9);
  assert.ok(Math.abs(fitView(390, 540, 390, 844).hw - 7.2) < 1e-9);
});
