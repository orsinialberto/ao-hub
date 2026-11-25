// Versione minima del task 4: disegna una figura a rotazione ferma.
import { createScene } from './renderer.js';
import { createWake } from './wake.js';
import { FIGURES } from './figures.js';

const canvas = document.getElementById('meadow');
const base = document.body.dataset.base;
const figure = Number(new URLSearchParams(location.search).get('scene') ?? 0) % 3;
const wake = createWake();
canvas.hidden = false;
const scene = createScene(canvas, { bladeCount: 90000, figureUrls: FIGURES.map((f) => `${base}img/${f.file}`) });
document.getElementById('poster').hidden = true;
addEventListener('resize', () => scene.resize());
let last = performance.now();
function frame(ms) {
  wake.update(Math.min(0.05, (ms - last) / 1000));
  last = ms;
  scene.render({ yaw: 0.35 + (figure * Math.PI * 2) / 3, time: ms / 1000, wake: wake.data(), figure, visibility: 1 });
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
