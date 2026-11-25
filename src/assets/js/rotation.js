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

export const activeIndex = (s) => mod(Math.round(s.pos));

export const figureVisibility = (s) => 1 - smoothstep(0.15, 0.45, Math.abs(s.pos - Math.round(s.pos)));
