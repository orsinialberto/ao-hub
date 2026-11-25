// Semina e colori del prato. Modulo puro: stessa semina, stesso prato.
export const ISLAND = 10;
/** Radura attorno alla figura: un cerchio, perché la camera gira. */
export const CLEARING = { radius: 2.8, height: 0.55 };
export const SOIL_SHADE = 235 / 255;

function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function hash(x, y) {
  const h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return h - Math.floor(h);
}
function noise(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(ix, iy), b = hash(ix + 1, iy), c = hash(ix, iy + 1), d = hash(ix + 1, iy + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x, y) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

const COLOURS = {
  grass: hex('#7d9455'), pale: hex('#b9bf86'), deep: hex('#3f6252'),
  warm: hex('#b5673a'), cold: hex('#8a9c8c'),
};
const STEM = hex('#6f7f4a');
const FLOWERS = ['#f3ecd8', '#e8a23c', '#c4532f', '#8f9fd1'].map(hex);

export function paint(x, z) {
  let c = COLOURS.grass;
  c = mix(c, COLOURS.pale, smooth(0.48, 0.72, fbm(x * 0.28 + 7, z * 0.28)));
  c = mix(c, COLOURS.deep, smooth(0.5, 0.7, fbm(x * 0.36 + 31, z * 0.36 + 5)));
  c = mix(c, COLOURS.cold, smooth(0.58, 0.74, fbm(x * 0.5 + 3, z * 0.5 + 41)));
  c = mix(c, COLOURS.warm, smooth(0.6, 0.72, fbm(x * 0.42 + 57, z * 0.42 + 13)));
  return c;
}

/** 0 fuori dall'isola, 1 all'interno; costa frastagliata. */
export function inside(x, z) {
  const a = Math.atan2(z, x);
  const edge = ISLAND * (0.82 + 0.28 * fbm(Math.cos(a) * 2.3 + 9, Math.sin(a) * 2.3 + 9));
  const d = Math.hypot(x, z) + (fbm(x * 1.4, z * 1.4) - 0.5) * 1.6;
  return clamp01((edge - d) / 2.6);
}

/** Altezza massima in un punto: bassa nella radura, poi risale senza gradino. */
const heightCap = (x, z) => CLEARING.height + smooth(CLEARING.radius, CLEARING.radius + 1.6, Math.hypot(x, z)) * 4;

/** 12 numeri per istanza: x, z, altezza, larghezza, piegaX, piegaZ, fase, punta, r, g, b, tipo. */
export function plantMeadow({ count, seed = 7 }) {
  const r = rng(seed), blades = [], flowers = [];
  const gauss = () => (r() + r() + r() - 1.5) / 1.5;
  const widthScale = Math.pow(40000 / count, 0.35);
  let planted = 0;
  while (planted < count) {
    const cx = r() * 26 - 13, cz = r() * 26 - 13, depth = inside(cx, cz);
    if (depth <= 0 || r() > 0.25 + depth) continue;
    const kind = r();
    const tall = kind > 0.93 && Math.hypot(cx, cz) > CLEARING.radius + 1, low = kind < 0.5;
    const radius = (0.18 + r() * 0.42) * (0.5 + depth);
    const patch = fbm(cx * 0.6 + 80, cz * 0.6);
    const base = (tall ? 1.25 : low ? 0.3 : 0.62) * (0.45 + 0.75 * depth) * (0.65 + patch * 0.8);
    const size = Math.round((tall ? 18 : low ? 55 : 45) * (0.5 + depth));
    const tint = 0.88 + r() * 0.26;
    const fx = gauss() * 0.3, fz = gauss() * 0.3;
    for (let b = 0; b < size && planted < count; b++, planted++) {
      const ox = gauss() * radius, oz = gauss() * radius;
      const x = cx + ox, z = cz + oz;
      const centre = 1 - Math.min(1, Math.hypot(ox, oz) / radius);
      const height = Math.min(base * (0.55 + 0.45 * centre + r() * 0.35), heightCap(x, z));
      const width = (tall ? 0.022 : 0.03 + r() * 0.035) * widthScale;
      const colour = paint(x, z).map((v) => clamp01(v * SOIL_SHADE * (b % 9 === 0 ? tint * 1.22 : tint)));
      blades.push(x, z, height, width, fx + ox * 0.9 + gauss() * 0.28, fz + oz * 0.9 + gauss() * 0.28,
        r() * 6.283, tall ? 1.3 : 1.7 + r() * 1.6, ...colour, 0);
    }
    // fiori in cima a steli sopra alcuni ciuffi
    if (r() < 0.07 && depth > 0.15) {
      const colour = FLOWERS[(r() * FLOWERS.length) | 0];
      const heads = 2 + ((r() * 6) | 0);
      for (let f = 0; f < heads; f++) {
        const x = cx + gauss() * radius, z = cz + gauss() * radius;
        const height = Math.min(base * 1.05 + 0.15 + r() * 0.25, heightCap(x, z));
        const lx = gauss() * 0.4, lz = gauss() * 0.4, phase = r() * 6.283;
        // stessa fase: stelo e corolla si muovono insieme
        blades.push(x, z, height, 0.012, lx, lz, phase, 6, ...STEM, 0);
        flowers.push(x, z, height, 0.035 + r() * 0.035, lx, lz, phase, 1, ...colour, 1);
      }
    }
  }
  return { blades: new Float32Array(blades), flowers: new Float32Array(flowers) };
}

/** Texture del terreno (RGBA, lato `size`, copre da -13 a 13). Bordo punteggiato. */
export function groundPixels(size) {
  const data = new Uint8Array(size * size * 4), r = rng(11);
  for (let j = 0; j < size; j++) for (let i = 0; i < size; i++) {
    const x = (i / (size - 1)) * 26 - 13, z = (j / (size - 1)) * 26 - 13;
    const c = paint(x, z), cover = inside(x, z), k = (j * size + i) * 4;
    for (let n = 0; n < 3; n++) data[k + n] = c[n] * SOIL_SHADE * 255;
    data[k + 3] = cover > 0.28 || r() < cover * 1.6 ? 255 : 0;
  }
  return data;
}
