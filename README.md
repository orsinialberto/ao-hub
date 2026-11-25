# ao-hub

Ingresso unico ai siti di Alberto Orsini: un prato animato che gira su tre figure, ognuna porta di un sito. Statico, senza librerie, italiano (`/`) e inglese (`/en/`).

## Comandi (Node >= 22, nessuna dipendenza)

| Comando | Cosa fa |
|---|---|
| `npm test` | test della logica |
| `npm run check` | test, build e controlli su `dist/` |
| `npm run preview` | build e server su http://localhost:4200/ (`-- 4300` per un'altra porta; alcune porte, per esempio 4190, sono bloccate dai browser) |

Il server di anteprima risponde anche agli altri dispositivi della rete (utile per il telefono, su `http://<IP-del-computer>:4200`): usarlo su una rete fidata e chiuderlo con `Ctrl+C`.
`?fps=1` mostra i fotogrammi al secondo, `?scene=1` o `?scene=2` apre un altro momento.

## Dove stanno le cose

- `src/data.mjs` testi e indirizzi · `src/pages.mjs` HTML · `src/assets/style.css`
- `src/assets/js/`: `main.js` interazione, `wheel.js` rotella e trackpad, `renderer.js` e `shaders.js` WebGL2, `meadow.js` semina e colori, `rotation.js`, `wake.js` scia del cursore, `ui-state.js` inquadratura e clic, `figures.js` misure delle figure
- `public/` figure, immagine ferma, anteprima social, font

## Cambiare una figura

1. Mettere il PNG trasparente in `images/source/<gallery|cv|blog>.png` (cartella locale, non va in git).
2. `npm i --no-save --no-package-lock sharp` e `node scripts/images.mjs`.
3. Aggiornare in `src/assets/js/figures.js` larghezza, altezza, `anchorX`, `anchorY` e `headPx` (dalla cima del cappello al mento). I test controllano le dimensioni.
4. Guardare il contorno ingrandito su fondo chiaro e scuro.

Immagine ferma (`public/img/poster.webp`, 1200×600) e anteprima social (`public/og.png`, 1200×630) sono screenshot di `?shot=poster` e `?shot=og`.

## Indirizzi

Il sito è su `https://albertorsini.it` (dominio impostato in Settings → Pages del repository; con il deploy da GitHub Actions non serve un file `CNAME`).
Il blog è su `https://blog.albertorsini.it` (`BLOG_BASE` in `src/data.mjs`). I suoi vecchi indirizzi sul dominio principale (`/it/…` e le pagine sotto `/en/`, escluso `/en/` esatto che è la home inglese dell'hub) sono reindirizzati con una regola in Cloudflare.

## Pubblicazione

Ogni push su `main` esegue `.github/workflows/deploy.yml` (`npm run check`, poi GitHub Pages; in Settings → Pages: Source «GitHub Actions»).
`TRIAL = true` in `src/data.mjs` esclude il sito dai motori di ricerca, se serve una pubblicazione di prova.
