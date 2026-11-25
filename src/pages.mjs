// HTML delle pagine. Percorsi relativi: il sito di prova vive in una sottocartella.
import { SITE_URL, TRIAL, BASE_PATH, SCENES, DOOR_ORDER, links, copy } from './data.mjs';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

const head = (lang, path, t) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(t.title)}</title>
<meta name="description" content="${t.description.replace(/"/g, '&quot;')}">
${TRIAL ? '<meta name="robots" content="noindex">\n' : ''}<link rel="canonical" href="${SITE_URL}${path}">
<link rel="alternate" hreflang="it" href="${SITE_URL}/">
<link rel="alternate" hreflang="en" href="${SITE_URL}/en/">
<link rel="alternate" hreflang="x-default" href="${SITE_URL}/">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(t.title)}">
<meta property="og:description" content="${t.description.replace(/"/g, '&quot;')}">
<meta property="og:url" content="${SITE_URL}${path}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta name="theme-color" content="#faf8f2">`;

function home(lang, path) {
  const t = copy[lang];
  const rel = lang === 'en' ? '../' : '';
  const url = links(lang);
  const scenes = SCENES.map((key) => ({ key, href: url[key], caption: t.captions[key], dotLabel: t.dots[key] }));
  const langLink = (code, href) => `<a href="${href}" hreflang="${code}" lang="${code}"${code === lang ? ' aria-current="page"' : ''}>${code.toUpperCase()}</a>`;
  return `<!doctype html>
<html lang="${lang}">
<head>
${head(lang, path, t)}
<link rel="icon" href="${rel}favicon.svg" type="image/svg+xml">
<link rel="preload" href="${rel}fonts/Fraunces-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${rel}css/style.css">
<script type="module" src="${rel}js/main.js"></script>
</head>
<body data-lang="${lang}" data-base="${rel}">
<nav class="lang" aria-label="${esc(t.languageLabel)}">${langLink('it', lang === 'it' ? './' : '../')}<span aria-hidden="true">/</span>${langLink('en', lang === 'en' ? './' : 'en/')}</nav>
<header class="intro">
<h1>${esc(t.title)}</h1>
<p>${esc(t.tagline)}</p>
<nav id="doors" aria-label="${esc(t.doorsLabel)}">
${DOOR_ORDER.map((k) => `<a data-scene="${k}" href="${url[k]}">${esc(t.doors[k])}</a>`).join('\n')}
</nav>
</header>
<main class="stage">
<canvas id="meadow" tabindex="0" role="group" aria-label="${esc(t.sceneLabel)}" hidden></canvas>
<img id="poster" src="${rel}img/poster.webp" width="1200" height="600" alt="${esc(t.posterAlt)}">
<button id="prev" class="arrow" type="button" aria-label="${esc(t.prev)}" hidden>←</button>
<button id="next" class="arrow" type="button" aria-label="${esc(t.next)}" hidden>→</button>
</main>
<footer class="controls">
<div id="dots" hidden>
${SCENES.map((k, i) => `<button type="button" data-index="${i}" aria-label="${esc(t.dots[k])}"></button>`).join('\n')}
</div>
<p id="announce" class="sr-only" aria-live="polite"></p>
</footer>
<script type="application/json" id="scenes">${JSON.stringify(scenes).replace(/</g, '\\u003c')}</script>
</body>
</html>
`;
}

const notFound = () => `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Pagina non trovata · Page not found</title>
<meta name="description" content="Pagina non trovata. Page not found.">
<meta name="robots" content="noindex">
<meta property="og:title" content="Alberto Orsini">
<meta property="og:description" content="Pagina non trovata. Page not found.">
<link rel="icon" href="${BASE_PATH}favicon.svg" type="image/svg+xml">
<style>body{margin:0;min-height:100vh;display:grid;place-content:center;gap:1.5rem;padding:16px;text-align:center;background:#faf8f2;color:#22251e;font:1rem/1.5 system-ui,sans-serif}h1{margin:0;font:400 2rem/1.2 Georgia,serif}p{margin:0}a{color:#9a3a18}</style>
</head>
<body>
<h1>Pagina non trovata<br><span lang="en">Page not found</span></h1>
<p><a href="${BASE_PATH}">Torna alla home</a></p>
<p lang="en"><a href="${BASE_PATH}en/">Back to home</a></p>
</body>
</html>
`;

export const pages = [
  { key: 'home', lang: 'it', path: '/', html: home('it', '/') },
  { key: 'home', lang: 'en', path: '/en/', html: home('en', '/en/') },
  { key: '404', lang: 'it', path: '/404.html', file: '404.html', noindex: true, html: notFound() },
];
