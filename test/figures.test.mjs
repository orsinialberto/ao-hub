import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { FIGURES, HEAD_WORLD, figureSize } from '../src/assets/js/figures.js';

test('figures follow scene order and have a ground anchor', () => {
  assert.deepEqual(FIGURES.map((f) => f.key), ['gallery', 'cv', 'blog']);
  for (const f of FIGURES) {
    assert.ok(f.anchorX > 0 && f.anchorX < 1 && f.anchorY > 0.5 && f.anchorY <= 1, f.key);
    assert.ok(Math.abs(figureSize(f).h / f.height - HEAD_WORLD / f.headPx) < 1e-9);
  }
});

test('declared pixel size matches the shipped file', () => {
  for (const f of FIGURES) {
    const buf = fs.readFileSync(new URL(`../public/img/${f.file}`, import.meta.url));
    // WebP con alfa: blocco VP8X, larghezza e altezza (meno 1) su 24 bit
    assert.equal(buf.toString('ascii', 12, 16), 'VP8X', f.file);
    assert.equal(buf.readUIntLE(24, 3) + 1, f.width, f.file);
    assert.equal(buf.readUIntLE(27, 3) + 1, f.height, f.file);
  }
});
