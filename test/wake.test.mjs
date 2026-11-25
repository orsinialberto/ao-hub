import test from 'node:test';
import assert from 'node:assert/strict';
import { createWake } from '../src/assets/js/wake.js';

test('a still pointer pushes at its position', () => {
  const w = createWake(); w.pointer([2, 3]); for (let i = 0; i < 30; i++) w.update(1 / 60);
  const d = w.data(); assert.equal(d.length, 64);
  const live = []; for (let k = 0; k < d.length; k += 4) if (d[k + 3] > 0.9) live.push([d[k], d[k + 1], d[k + 2]]);
  assert.equal(live.length, 1);
  assert.ok(Math.hypot(live[0][0] - 2, live[0][1] - 3) < 1e-3);
  assert.ok(Math.abs(live[0][2] - 0.8) < 1e-6);
});

test('no jumps in strength or position while sweeping fast', () => {
  const w = createWake(); let prev = w.data().slice(); let peak = 0;
  for (let f = 0; f < 300; f++) {
    w.pointer(f < 200 ? [Math.sin(f / 9) * 6, Math.cos(f / 13) * 4] : null); w.update(1 / 60);
    const now = w.data();
    for (let k = 0; k < now.length; k += 4) {
      peak = Math.max(peak, now[k + 3]);
      assert.ok(Math.abs(now[k + 3] - prev[k + 3]) <= (1 / 60) / 0.12 + 1e-6, `strength jump at frame ${f}`);
      if (prev[k + 3] > 0.02) assert.ok(Math.hypot(now[k] - prev[k], now[k + 1] - prev[k + 1]) < 0.6, `position jump at frame ${f}`);
    }
    prev = now.slice();
  }
  assert.ok(peak > 0.9);
});

test('wake fades to zero after the pointer leaves', () => {
  const w = createWake(); w.pointer([1, 1]); for (let i = 0; i < 30; i++) w.update(1 / 60);
  w.pointer(null); for (let i = 0; i < 90; i++) w.update(1 / 60);
  assert.ok(w.data().every((v, i) => i % 4 !== 3 || v === 0));
});
