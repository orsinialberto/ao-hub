// Pulisce i contorni di un ritaglio RGBA: veli quasi trasparenti, puntini isolati, frange sature.
const MIN_ALPHA = 32;
const REACH = 2; // px dalla trasparenza

function isFringeColour(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  if (max / 255 <= 0.6 || d / max <= 0.85) return false;
  let hue;
  if (max === r) hue = 60 * (((g - b) / d + 6) % 6);
  else if (max === g) hue = 60 * ((b - r) / d + 2);
  else hue = 60 * ((r - g) / d + 4);
  return hue < 20 || hue > 340 || (hue > 45 && hue < 160); // rossi, gialli, verdi
}

export function cleanEdges(rgba, width, height) {
  const out = Uint8Array.from(rgba);
  const n = width * height;
  for (let i = 0; i < n; i++) if (out[i * 4 + 3] < MIN_ALPHA) out[i * 4 + 3] = 0;

  const nearClear = (x, y) => {
    for (let dy = -REACH; dy <= REACH; dy++) for (let dx = -REACH; dx <= REACH; dx++) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height || out[(ny * width + nx) * 4 + 3] === 0) return true;
    }
    return false;
  };
  for (let pass = 0; pass < 3; pass++) {
    const drop = [];
    for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
      const k = (y * width + x) * 4;
      if (out[k + 3] && isFringeColour(out[k], out[k + 1], out[k + 2]) && nearClear(x, y)) drop.push(k);
    }
    if (!drop.length) break;
    for (const k of drop) out[k + 3] = 0;
  }

  // componenti isolati troppo piccoli
  let opaque = 0;
  for (let i = 0; i < n; i++) if (out[i * 4 + 3]) opaque++;
  const minSize = Math.max(4, Math.round(opaque * 0.0005));
  const seen = new Uint8Array(n);
  for (let start = 0; start < n; start++) {
    if (seen[start] || !out[start * 4 + 3]) continue;
    const part = [start];
    seen[start] = 1;
    for (let h = 0; h < part.length; h++) {
      const x = part[h] % width, y = (part[h] - x) / width;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const nx = x + dx, ny = y + dy, j = ny * width + nx;
        if (nx >= 0 && ny >= 0 && nx < width && ny < height && !seen[j] && out[j * 4 + 3]) { seen[j] = 1; part.push(j); }
      }
    }
    if (part.length < minSize) for (const i of part) out[i * 4 + 3] = 0;
  }
  return out;
}
