// images/source/<scena>.png → public/img/figure-<scena>.webp. Richiede: npm i --no-save sharp
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { cleanEdges } from './lib/clean-edges.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MAX_HEIGHT = 900;

for (const key of ['gallery', 'cv', 'blog']) {
  const { data, info } = await sharp(path.join(root, 'images/source', `${key}.png`)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const clean = cleanEdges(new Uint8Array(data), info.width, info.height);
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (clean[(y * info.width + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  }
  const crop = { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
  const height = Math.min(MAX_HEIGHT, crop.height);
  const out = await sharp(Buffer.from(clean), { raw: { width: info.width, height: info.height, channels: 4 } })
    .extract(crop).resize({ height }).webp({ quality: 90, alphaQuality: 100 })
    .toFile(path.join(root, 'public/img', `figure-${key}.webp`));
  console.log(`${key}: ${out.width}×${out.height}, ${Math.round(out.size / 1024)} KB`);
}
