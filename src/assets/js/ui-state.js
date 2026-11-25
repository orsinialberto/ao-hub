// Piccole decisioni dell'interfaccia, pure e verificabili.
export const DRAG_THRESHOLD = 8;

/** `maxDistance` è lo spostamento massimo raggiunto durante la pressione. */
export const isClick = (start, end, maxDistance) =>
  maxDistance < DRAG_THRESHOLD && Math.hypot(end.x - start.x, end.y - start.y) < DRAG_THRESHOLD;

export const hitRect = (r, x, y) => !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;

export const bladeCountFor = (width, height) => (Math.min(width, height) < 700 ? 40000 : 90000);
