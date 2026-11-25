import test from 'node:test';
import assert from 'node:assert/strict';
import { cleanEdges } from '../scripts/lib/clean-edges.mjs';

const W = 40;
const set = (buf, x, y, rgba) => buf.set(rgba, (y * W + x) * 4);
const alphaAt = (buf, [x, y]) => buf[(y * W + x) * 4 + 3];

test('removes fringe, stray and faint pixels, keeps the drawing', () => {
  const input = new Uint8Array(W * W * 4);
  for (let y = 10; y < 30; y++) for (let x = 10; x < 30; x++) set(input, x, y, [40, 55, 90, 255]);
  const yellowOnEdge = [30, 15], strayDot = [3, 3], faint = [35, 35], yellowInside = [20, 20], blueCorner = [10, 10];
  set(input, ...yellowOnEdge, [255, 255, 0, 255]);
  set(input, ...strayDot, [255, 0, 0, 255]);
  set(input, ...faint, [0, 0, 0, 20]);
  set(input, ...yellowInside, [255, 255, 0, 255]);
  const copyOfInput = input.slice();

  const out = cleanEdges(input, W, W);

  assert.equal(alphaAt(out, yellowOnEdge), 0);
  assert.equal(alphaAt(out, strayDot), 0);
  assert.equal(alphaAt(out, faint), 0);
  assert.equal(alphaAt(out, yellowInside), 255);
  assert.equal(alphaAt(out, blueCorner), 255);
  assert.deepEqual(input, copyOfInput);
});
