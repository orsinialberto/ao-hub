// Traduce rotella e trackpad in passi: un gesto, una scena.
const THRESHOLD = 40;   // px accumulati per un passo
const QUIET = 200;      // ms di pausa che chiudono un gesto
const COOLDOWN = 500;   // ms prima di riconoscere un nuovo slancio durante l'inerzia

export function createWheelStepper() {
  let sum = 0, direction = 0, lastTime = -Infinity, firedAt = -Infinity, lastSize = 0, locked = false;

  return {
    /** Ritorna -1, 0 o 1. */
    push(delta, time) {
      if (!delta) return 0;
      const sign = Math.sign(delta), size = Math.abs(delta);
      // l'inerzia cala soltanto: se la spinta risale di colpo, e' un gesto nuovo
      const surge = locked && time - firedAt > COOLDOWN && size > 15 && size > lastSize * 2;
      if (time - lastTime > QUIET || sign !== direction || surge) {
        sum = 0;
        locked = false;
      }
      direction = sign;
      lastTime = time;
      lastSize = size;
      if (locked) return 0;
      sum += size;
      if (sum < THRESHOLD) return 0;
      locked = true;
      firedAt = time;
      return sign;
    },
  };
}
