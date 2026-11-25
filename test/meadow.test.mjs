import test from 'node:test';
import assert from 'node:assert/strict';
import { ISLAND, CLEARING, paint, inside, plantMeadow } from '../src/assets/js/meadow.js';

test('planting is repeatable and has the asked blade count plus one stem per flower', () => {
  const a = plantMeadow({ count: 5000 }), b = plantMeadow({ count: 5000 });
  assert.deepEqual(a.blades, b.blades);
  assert.deepEqual(a.flowers, b.flowers);
  assert.ok(a.flowers.length > 0);
  assert.equal(a.blades.length / 12, 5000 + a.flowers.length / 12);
});

test('stays on the island and keeps the clearing low', () => {
  const { blades, flowers } = plantMeadow({ count: 20000 });
  let inClearing = 0;
  for (const data of [blades, flowers]) {
    for (let i = 0; i < data.length; i += 12) {
      const [x, z, h] = data.slice(i, i + 3);
      assert.ok(Math.hypot(x, z) < ISLAND * 1.4);
      if (Math.hypot(x, z) < CLEARING.radius) { inClearing++; assert.ok(h <= CLEARING.height + 1e-6, `tall blade ${h}`); }
    }
  }
  assert.ok(inClearing > 100, 'the clearing is not bare');
});

test('ground colour and coastline', () => {
  assert.equal(inside(0, 0), 1);
  assert.equal(inside(ISLAND * 2, 0), 0);
  assert.ok(paint(1, 2).every((v) => v >= 0 && v <= 1));
});
