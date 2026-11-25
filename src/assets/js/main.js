// Collega pagina, rotazione, scia e scena. Senza di lui restano i link in HTML.
import { createScene } from './renderer.js';
import { createRotation, dragStart, dragBy, release, goTo, step, tick, activeIndex, figureVisibility, trackFraction, scrubStart, scrubTo, scrubEnd } from './rotation.js';
import { createWake } from './wake.js';
import { createWheelStepper } from './wheel.js';
import { FIGURES } from './figures.js';
import { DRAG_THRESHOLD, isClick, hitRect, bladeCountFor } from './ui-state.js';

const $ = (id) => document.getElementById(id);
const canvas = $('meadow'), poster = $('poster'), prev = $('prev'), next = $('next');
const track = $('track');
const doors = [...$('doors').querySelectorAll('a')];
const scenes = JSON.parse($('scenes').textContent);
const base = document.body.dataset.base;
const params = new URLSearchParams(location.search);
const calm = matchMedia('(prefers-reduced-motion: reduce)');

// solo per generare immagine ferma (?shot=poster) e anteprima social (?shot=og)
if (params.has('shot')) document.body.dataset.shot = params.get('shot');

const rotation = createRotation();
const start = Number(params.get('scene'));
if (start === 1 || start === 2) rotation.pos = rotation.target = start;
let wake = createWake();
let scene = null;
let frameId = 0;
let last = 0;
let shown = -1;        // momento mostrato dall'interfaccia
let announced = activeIndex(rotation);
let drag = null;
let pointer = null;    // { x, y, until }
let onScreen = true;

function showScene(index) {
  shown = index;
  const current = scenes[index];
  track.setAttribute('aria-valuenow', index + 1);
  track.setAttribute('aria-valuetext', current.name);
  // in alto resta solo la porta del momento mostrato
  doors.forEach((a) => {
    a.hidden = a.dataset.scene !== current.key;
    if (a.hidden) a.removeAttribute('aria-current');
    else a.setAttribute('aria-current', 'true');
  });
}

function setControls(visible) {
  $('turner').hidden = !visible;
}

/** Ripiego: immagine ferma e link. */
function showPoster() {
  stop();
  abandon(); // un trascinamento in corso va chiuso, o la rotazione resta a meta
  scene = null;
  canvas.hidden = true;
  poster.hidden = false;
  setControls(false);
  showScene(0);
  // senza scena non si può girare: tornano tutte le porte
  doors.forEach((a) => {
    a.hidden = false;
    a.removeAttribute('aria-current');
  });
}

function startScene() {
  try {
    canvas.hidden = false;
    scene = createScene(canvas, {
      bladeCount: bladeCountFor(innerWidth, innerHeight),
      figureUrls: FIGURES.map((f) => `${base}img/${f.file}`),
    });
  } catch (error) {
    console.warn('Scena non disponibile:', error.message);
    showPoster();
    return;
  }
  wake = createWake();
  poster.hidden = true;
  setControls(true);
  showScene(activeIndex(rotation));
  draw(performance.now(), 0);
  scene.preload();
  run();
}

function draw(ms, dt) {
  tick(rotation, dt, calm.matches);
  if (pointer && ms > pointer.until) pointer = null;
  // il punto sul terreno si ricalcola a ogni fotogramma: la camera può girare
  wake.pointer(pointer && !calm.matches ? scene.toGround(pointer.x, pointer.y) : null);
  wake.update(dt);
  const index = activeIndex(rotation);
  if (index !== shown) showScene(index);
  if (!rotation.dragging && rotation.pos === rotation.target && index !== announced) {
    announced = index;
    $('announce').textContent = scenes[index].caption;
  }
  track.style.setProperty('--x', `${(trackFraction(rotation.pos) * 96).toFixed(2)}%`);
  scene.render({
    yaw: 0.35 + (rotation.pos * Math.PI * 2) / 3,
    time: calm.matches ? 0 : ms / 1000,
    wake: wake.data(),
    figure: index,
    visibility: figureVisibility(rotation),
  });
}

let frames = 0, fpsAt = 0, meter = null;
function countFrame(ms) {
  if (!meter) {
    meter = document.body.appendChild(document.createElement('div'));
    meter.style.cssText = 'position:fixed;left:8px;top:8px;z-index:9;font:12px monospace';
  }
  frames++;
  if (ms - fpsAt > 1000) {
    meter.textContent = `${Math.round((frames * 1000) / (ms - fpsAt))} fps`;
    frames = 0;
    fpsAt = ms;
  }
}

function loop(ms) {
  const dt = Math.max(0, Math.min(0.05, (ms - last) / 1000));
  last = ms;
  draw(ms, dt);
  if (params.has('fps')) countFrame(ms);
  frameId = requestAnimationFrame(loop);
}
function run() {
  if (frameId || !scene || document.hidden || !onScreen) return;
  last = performance.now();
  frameId = requestAnimationFrame(loop);
}
function stop() {
  cancelAnimationFrame(frameId);
  frameId = 0;
}

function endDrag(velocity = 0) {
  if (!drag) return;
  drag = null;
  release(rotation, velocity);
}

const overFigure = (e) => figureVisibility(rotation) === 1 && hitRect(scene?.figureRect() ?? null, e.clientX, e.clientY);
const touchPoint = (e, hold) => ({ x: e.clientX, y: e.clientY, until: performance.now() + hold });

canvas.addEventListener('pointerdown', (e) => {
  if (!scene || !e.isPrimary || e.button !== 0) return;
  canvas.setPointerCapture(e.pointerId);
  const at = { x: e.clientX, y: e.clientY };
  drag = { start: at, x: e.clientX, time: e.timeStamp, velocity: 0, max: 0, turning: false };
  if (e.pointerType !== 'mouse') pointer = touchPoint(e, Infinity);
});

canvas.addEventListener('pointermove', (e) => {
  if (!scene || !e.isPrimary) return;
  pointer = touchPoint(e, e.pointerType === 'mouse' ? 150 : Infinity);
  if (!drag) {
    canvas.style.cursor = overFigure(e) ? 'pointer' : '';
    return;
  }
  drag.max = Math.max(drag.max, Math.hypot(e.clientX - drag.start.x, e.clientY - drag.start.y));
  // sotto la soglia può ancora essere un clic: la scena non si muove
  if (!drag.turning && drag.max >= DRAG_THRESHOLD) {
    drag.turning = true;
    dragStart(rotation);
  }
  if (drag.turning) {
    const delta = e.clientX - drag.x;
    const seconds = Math.max(0.008, (e.timeStamp - drag.time) / 1000);
    dragBy(rotation, delta, canvas.clientWidth);
    drag.velocity = -(delta / canvas.clientWidth) * 1.5 / seconds;
    canvas.style.cursor = 'grabbing';
  }
  drag.x = e.clientX;
  drag.time = e.timeStamp;
});

canvas.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'mouse') pointer = null;
  if (!drag) return;
  const clicked = isClick(drag.start, { x: e.clientX, y: e.clientY }, drag.max) && overFigure(e);
  // se il dito si è fermato prima di staccarsi non è un lancio
  endDrag(e.timeStamp - drag.time > 120 ? 0 : drag.velocity);
  canvas.style.cursor = '';
  if (clicked) location.assign(scenes[activeIndex(rotation)].href);
});

function abandon() {
  pointer = null;
  endScrub();
  endDrag(0);
  canvas.style.cursor = '';
}
canvas.addEventListener('pointercancel', abandon);
canvas.addEventListener('lostpointercapture', () => endDrag(0));
canvas.addEventListener('pointerleave', () => { if (!drag) pointer = null; });
addEventListener('blur', abandon);

prev.addEventListener('click', () => step(rotation, -1));
next.addEventListener('click', () => step(rotation, 1));

// la linea: premere o trascinare porta al punto corrispondente
let scrubbing = false;
const fractionAt = (e) => {
  const box = track.getBoundingClientRect();
  return (e.clientX - box.left) / box.width;
};
function endScrub() {
  if (!scrubbing) return;
  scrubbing = false;
  scrubEnd(rotation);
}
track.addEventListener('pointerdown', (e) => {
  if (!scene || !e.isPrimary || e.button !== 0) return;
  track.setPointerCapture(e.pointerId);
  scrubbing = true;
  scrubStart(rotation);
  scrubTo(rotation, fractionAt(e));
});
track.addEventListener('pointermove', (e) => { if (scrubbing) scrubTo(rotation, fractionAt(e)); });
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) track.addEventListener(type, endScrub);
addEventListener('keydown', (e) => {
  const inScene = [canvas, prev, next, track].includes(document.activeElement);
  if (!scene || !inScene || e.altKey || e.metaKey || e.ctrlKey) return;
  if (e.key === 'ArrowLeft') step(rotation, -1);
  else if (e.key === 'ArrowRight') step(rotation, 1);
  else if (e.key === 'Home' && document.activeElement === track) goTo(rotation, 0);
  else if (e.key === 'End' && document.activeElement === track) goTo(rotation, 2);
  else if (e.key === 'Enter' && document.activeElement === canvas) location.assign(scenes[activeIndex(rotation)].href);
  else return;
  e.preventDefault();
});

const wheel = createWheelStepper();
addEventListener('wheel', (e) => {
  if (!scene || e.ctrlKey) return; // ctrl + rotella è lo zoom
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  // su finestre basse la pagina deve poter scorrere: la scena gira solo quando è arrivata in fondo
  const page = document.documentElement;
  const canScroll = delta > 0 ? scrollY + innerHeight < page.scrollHeight - 1 : scrollY > 0;
  if (canScroll && delta === e.deltaY) return;
  e.preventDefault();
  if (drag || scrubbing) return;
  const pixels = delta * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  const direction = wheel.push(pixels, e.timeStamp);
  if (direction) step(rotation, direction);
}, { passive: false });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { abandon(); stop(); } else run();
});
addEventListener('pageshow', run);
new ResizeObserver(() => {
  if (!scene || canvas.hidden) return;
  scene.resize();
  draw(performance.now(), 0);
}).observe(canvas);
// su schermi bassi la pagina scorre: fuori vista il ciclo si ferma
new IntersectionObserver((entries) => {
  onScreen = entries.at(-1).isIntersecting;
  if (onScreen) run(); else stop();
}).observe(canvas);
calm.addEventListener('change', () => { wake = createWake(); });

canvas.addEventListener('webglcontextlost', (e) => {
  e.preventDefault();
  showPoster();
});
canvas.addEventListener('webglcontextrestored', startScene);

startScene();
