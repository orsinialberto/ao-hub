// Il titolo si ispessisce sotto il mouse: più una lettera è vicina al puntatore, più è pesante.

/** Peso a riposo: deve coincidere con quello di `.intro h1` nel CSS. */
export const REST_WEIGHT = 340;
export const PEAK_WEIGHT = 900;
const REACH_EM = 1.4; // raggio d'azione, in corpi del titolo
const EASE_SECONDS = 0.09; // più è alto, più l'inseguimento è morbido e in ritardo

export function weightAt(distance, reach) {
  if (!(reach > 0)) return REST_WEIGHT;
  const t = Math.max(0, 1 - distance / reach);
  return Math.round(REST_WEIGHT + (PEAK_WEIGHT - REST_WEIGHT) * t * t * (3 - 2 * t));
}

/** Un passo di avvicinamento al peso voluto, uguale a qualunque frequenza dello schermo. */
export function approach(current, target, dt) {
  const next = target + (current - target) * Math.exp(-dt / EASE_SECONDS);
  return Math.abs(next - target) < 0.5 ? target : next;
}

export function followPointer(title, calm) {
  // Niente transizioni CSS: ripartendo a ogni movimento del mouse resterebbero ferme, e poi scatterebbero.
  const letters = [...title.querySelectorAll('.letter')].map((el) => ({ el, weight: REST_WEIGHT }));
  let spots = null;
  let pointer = null; // { x, y } nella finestra; null quando il mouse è fuori
  let frame = 0;
  let last = 0;

  // Le posizioni si leggono una volta, a riposo: ispessendosi le lettere si spostano, e rileggerle
  // a ogni movimento le farebbe tremare. Gli offset ignorano la trasformazione dell'animazione d'ingresso.
  const measure = () => letters.map(({ el }) => ({
    x: el.offsetLeft + el.offsetWidth / 2,
    y: el.offsetTop + el.offsetHeight / 2,
    half: el.offsetHeight / 2,
  }));

  function targets() {
    if (!pointer) return letters.map(() => REST_WEIGHT);
    spots ??= measure();
    const origin = title.offsetParent.getBoundingClientRect();
    const x = pointer.x - origin.left;
    const y = pointer.y - origin.top;
    const reach = parseFloat(getComputedStyle(title).fontSize) * REACH_EM;
    // dentro la riga conta solo la distanza orizzontale
    return spots.map((s) => weightAt(Math.hypot(x - s.x, Math.max(0, Math.abs(y - s.y) - s.half)), reach));
  }

  function loop(ms) {
    const dt = Math.max(0, Math.min(0.05, (ms - last) / 1000));
    last = ms;
    const wanted = targets();
    let moving = false;
    letters.forEach((letter, i) => {
      letter.weight = approach(letter.weight, wanted[i], dt);
      if (letter.weight !== wanted[i]) moving = true;
      letter.el.style.fontWeight = letter.weight === REST_WEIGHT ? '' : letter.weight.toFixed(1);
    });
    // arrivati a destinazione il ciclo si ferma: il prossimo movimento lo riaccende
    frame = moving ? requestAnimationFrame(loop) : 0;
  }
  function wakeUp() {
    if (frame) return;
    last = performance.now();
    frame = requestAnimationFrame(loop);
  }
  /** Subito a riposo, senza animazione. */
  function reset() {
    cancelAnimationFrame(frame);
    frame = 0;
    pointer = null;
    spots = null;
    for (const letter of letters) {
      letter.weight = REST_WEIGHT;
      letter.el.style.fontWeight = '';
    }
  }

  title.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch' || calm.matches) return;
    pointer = { x: e.clientX, y: e.clientY };
    wakeUp();
  });
  title.addEventListener('pointerleave', () => {
    if (!pointer) return;
    pointer = null;
    wakeUp();
  });
  addEventListener('resize', reset);
  document.fonts.ready.then(() => { spots = null; });
  calm.addEventListener('change', reset);
}
