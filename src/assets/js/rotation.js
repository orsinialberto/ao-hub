// Stato della rotazione, in "scene": ogni numero intero è un momento fermo.
const COUNT = 3;
const mod = (n) => ((n % COUNT) + COUNT) % COUNT;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smoothstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

export const createRotation = () => ({ pos: 0, target: 0, dragging: false, startStop: 0 });

export function dragStart(s) {
  s.dragging = true;
  s.startStop = Math.round(s.pos);
}

export function dragBy(s, deltaPx, widthPx) {
  if (s.dragging) s.pos -= (deltaPx / widthPx) * 1.5;
}

export function release(s, velocity) {
  if (!s.dragging) return;
  s.dragging = false;
  const stop = Math.round(s.pos + clamp(velocity * 0.25, -0.5, 0.5));
  s.target = clamp(stop, s.startStop - 1, s.startStop + 1) || 0;
}

export function goTo(s, index) {
  const base = Math.round(s.target);
  let delta = mod(index - base);
  if (delta > COUNT / 2) delta -= COUNT;
  s.dragging = false;
  s.target = base + delta;
}

export function step(s, dir) {
  s.dragging = false;
  s.target = Math.round(s.target) + dir;
}

export function tick(s, dt, reduced) {
  if (s.dragging) return;
  if (reduced) { s.pos = s.target; return; }
  s.pos += (s.target - s.pos) * (1 - Math.exp(-7 * dt));
  if (Math.abs(s.target - s.pos) < 0.001) s.pos = s.target;
}

/** Posizione del cursore sulla linea (0–1). Dall'ultimo momento al primo torna indietro senza salti. */
export function trackFraction(pos) {
  const m = mod(pos);
  return m <= COUNT - 1 ? m / (COUNT - 1) : COUNT - m;
}

/** Trascinamento del cursore sulla linea: può attraversare tutti i momenti. */
export function scrubStart(s) {
  s.dragging = true;
  s.scrubBase = Math.floor(Math.round(s.pos) / COUNT) * COUNT;
}

export function scrubTo(s, fraction) {
  if (s.dragging) s.pos = s.scrubBase + clamp(fraction, 0, 1) * (COUNT - 1);
}

export function scrubEnd(s) {
  if (!s.dragging) return;
  s.dragging = false;
  s.target = Math.round(s.pos) || 0;
}

export const activeIndex = (s) => mod(Math.round(s.pos));

const SLIDE = 0.35; // scorrimento laterale durante il passaggio, in unità di mondo

/**
 * Quali disegni mostrare a una data posizione. `to` va disegnato sopra `from`:
 * compare mentre `from` è ancora pieno, poi `from` si dissolve sotto. La figura non sparisce mai.
 */
export function figureBlend(pos) {
  const base = Math.floor(pos);
  const t = pos - base;
  if (t === 0) return { from: mod(base), to: mod(base), weightFrom: 1, weightTo: 0, shiftFrom: 0, shiftTo: 0 };
  return {
    from: mod(base),
    to: mod(base + 1),
    weightFrom: 1 - smoothstep(0.35, 0.85, t),
    weightTo: smoothstep(0.15, 0.65, t),
    shiftFrom: -t * SLIDE,
    shiftTo: (1 - t) * SLIDE,
  };
}
