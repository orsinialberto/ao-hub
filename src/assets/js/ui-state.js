// Piccole decisioni dell'interfaccia, pure e verificabili.
export const DRAG_THRESHOLD = 8;

/** `maxDistance` è lo spostamento massimo raggiunto durante la pressione. */
export const isClick = (start, end, maxDistance) =>
  maxDistance < DRAG_THRESHOLD && Math.hypot(end.x - start.x, end.y - start.y) < DRAG_THRESHOLD;

export const hitRect = (r, x, y) => !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

export const bladeCountFor = (width, height) => (Math.min(width, height) < 700 ? 40000 : 90000);

/** Estremi verticali della scena (unità di mondo sullo schermo, 0 = centro del prato). */
export const SCENE_TOP = 5.8;
export const SCENE_BOTTOM = -4.1;

/** Inquadratura della camera dentro il riquadro disponibile: niente deve restare tagliato. */
export function fitView(width, height, windowWidth, windowHeight) {
  const aspect = windowWidth / windowHeight;
  const wanted = aspect > 1 ? Math.max(17, 8.5 * aspect) : 7.2; // semi-larghezza ideale
  const perUnit = Math.min(width / (2 * wanted), height / (SCENE_TOP - SCENE_BOTTOM));
  return { hw: width / (2 * perUnit), hh: height / (2 * perUnit), cy: (SCENE_TOP + SCENE_BOTTOM) / 2 };
}
