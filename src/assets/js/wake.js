// Scia del cursore sul terreno. Nessun punto compare, sparisce o salta di colpo.
const IDLE = 0.02;
const HEAD_SPEED = 30; // unità al secondo

export function createWake({ slots = 16, attack = 0.12, decay = 0.5, spacing = 0.35, radius = 0.8 } = {}) {
  const points = Array.from({ length: slots }, () => ({ x: 0, z: 0, strength: 0, goal: 0 }));
  const out = new Float32Array(slots * 4);
  let target = null;
  let head = null;
  let last = null; // dove è stato lasciato l'ultimo punto

  const freeSlot = () => points.find((p) => p !== head && p.goal === 0 && p.strength <= IDLE);

  function update(dt) {
    if (target) {
      if (!head) {
        head = freeSlot() ?? null;
        if (head) { Object.assign(head, { x: target[0], z: target[1], goal: 1 }); last = [...target]; }
      } else {
        const dx = target[0] - head.x, dz = target[1] - head.z;
        const dist = Math.hypot(dx, dz);
        if (dist > 1e-6) {
          const move = Math.min(dist * (1 - Math.exp(-18 * dt)), HEAD_SPEED * dt);
          head.x += (dx / dist) * move;
          head.z += (dz / dist) * move;
        }
        // lascia dietro un punto fermo che si spegne
        if (Math.hypot(head.x - last[0], head.z - last[1]) > spacing) {
          const trail = freeSlot();
          if (trail) {
            Object.assign(trail, { x: head.x, z: head.z, strength: 0, goal: 0.7 });
            last = [head.x, head.z];
          }
        }
      }
    } else if (head) {
      head.goal = 0;
      head = null;
    }
    points.forEach((p, i) => {
      if (p.goal > p.strength) p.strength = Math.min(p.goal, p.strength + dt / attack);
      else p.strength = Math.max(p.goal, p.strength - dt / decay);
      // un punto di scia, raggiunto il picco, comincia a spegnersi
      if (p !== head && p.strength >= p.goal) p.goal = 0;
      out.set([p.x, p.z, radius, p.strength], i * 4);
    });
  }

  return {
    pointer(point) { target = point; },
    update,
    data: () => out,
  };
}
