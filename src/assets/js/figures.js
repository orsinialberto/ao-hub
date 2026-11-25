// Misure delle figure, prese sui file in public/img.
// anchorX/Y: punto di appoggio a terra sotto il corpo (0–1 dall'alto a sinistra).
// headPx: dalla cima del cappello al mento; serve a dare a tutte la stessa scala.
export const HEAD_WORLD = 1.45;

export const FIGURES = [
  { key: 'gallery', file: 'figure-gallery.webp', width: 565, height: 900, anchorX: 0.5, anchorY: 0.95, headPx: 235 },
  { key: 'cv', file: 'figure-cv.webp', width: 825, height: 900, anchorX: 0.53, anchorY: 0.92, headPx: 238 },
  { key: 'blog', file: 'figure-blog.webp', width: 1413, height: 769, anchorX: 0.47, anchorY: 0.91, headPx: 230 },
];

export function figureSize(f) {
  const scale = HEAD_WORLD / f.headPx;
  return { w: f.width * scale, h: f.height * scale };
}
