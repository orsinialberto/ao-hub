// Traduce rotella e trackpad in passi: un gesto, una scena.
const THRESHOLD = 40; // px accumulati per un passo
const QUIET = 180;    // ms di pausa che chiudono un gesto
const REARM = 220;    // ms minimi fra due passi nella stessa direzione senza pausa
const NOTCH_GAP = 50; // ms: il trackpad manda eventi più fitti, gli scatti del mouse no

export function createWheelStepper() {
  let sum = 0, direction = 0, lastTime = -Infinity, firedAt = -Infinity;
  let locked = false, peak = 0, trough = Infinity, falling = false, lastSize = 0;

  return {
    /** Ritorna -1, 0 o 1. */
    push(delta, time) {
      if (!delta) return 0;
      const sign = Math.sign(delta), size = Math.abs(delta);
      const gap = time - lastTime;
      lastTime = time;
      if (gap > QUIET || sign !== direction) {
        sum = 0;
        locked = false;
      } else if (locked && time - firedAt > REARM) {
        // uno scatto di rotella a sé, oppure una nuova spinta mentre l'inerzia stava calando.
        // L'inerzia cala sempre: anche se arriva a eventi radi (pagina rallentata) non è uno scatto
        const notch = gap > NOTCH_GAP && size >= THRESHOLD && size >= lastSize;
        const pushedAgain = falling && size >= 18 && size > trough * 1.4 && size - trough >= 10;
        if (notch || pushedAgain) {
          sum = 0;
          locked = false;
        }
      }
      direction = sign;
      lastSize = size;
      if (locked) {
        peak = Math.max(peak, size);
        if (size < peak * 0.7) falling = true;
        if (falling) trough = Math.min(trough, size);
        return 0;
      }
      sum += size;
      if (sum < THRESHOLD) return 0;
      locked = true;
      firedAt = time;
      peak = size;
      trough = Infinity;
      falling = false;
      return sign;
    },
  };
}
