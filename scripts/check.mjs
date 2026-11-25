// Controlli su dist/: struttura SEO/accessibilità di base, link e risorse interne, niente risorse esterne.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { BASE_PATH } from '../src/data.mjs';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
const errors = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(dist);

const exists = (fromDir, url) => {
  const clean = url.split('#')[0].split('?')[0];
  const f = clean.startsWith(BASE_PATH) ? path.join(dist, clean.slice(BASE_PATH.length)) : path.resolve(fromDir, clean);
  return f.startsWith(dist) && fs.existsSync(f) && (!fs.statSync(f).isDirectory() || fs.existsSync(path.join(f, 'index.html')));
};

for (const file of files.filter((f) => f.endsWith('.html'))) {
  const rel = path.relative(dist, file);
  const h = fs.readFileSync(file, 'utf8');
  const h1 = (h.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) err(rel, `serve esattamente 1 <h1> (trovati ${h1})`);
  const title = h.match(/<title>(.*?)<\/title>/)?.[1];
  if (!title) err(rel, 'manca <title>'); else if (title.length > 65) err(rel, `title lungo ${title.length}`);
  const desc = h.match(/<meta name="description" content="(.*?)">/)?.[1];
  if (!desc) err(rel, 'manca meta description'); else if (desc.length > 170) err(rel, `description lunga ${desc.length}`);
  for (const k of ['og:title', 'og:description', ...(rel === '404.html' ? [] : ['canonical'])]) if (!h.includes(k)) err(rel, `manca ${k}`);
  if (!/<html lang="(it|en)"/.test(h)) err(rel, 'manca lang');
  for (const [img] of h.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(img) || !/\bwidth="/.test(img) || !/\bheight="/.test(img)) err(rel, 'img senza alt/width/height');
  for (const m of h.matchAll(/<(?:script|img|source|iframe)\b[^>]*\ssrc="(https?:|\/\/)[^"]*"/g)) err(rel, `risorsa esterna ${m[0]}`);
  for (const m of h.matchAll(/<link\b[^>]*rel="(?:stylesheet|preload|preconnect|icon)"[^>]*href="(https?:|\/\/)[^"]*"/g)) err(rel, `risorsa esterna ${m[0]}`);
  for (const [, u] of h.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:|\/\/|#)/.test(u)) continue;
    if (!exists(path.dirname(file), u)) err(rel, `risorsa/link rotto ${u}`);
  }
  if (/DA CONFERMARE|lorem ipsum|\bTODO\b/i.test(h)) err(rel, 'testo segnaposto presente');
}
for (const file of files.filter((f) => f.endsWith('.css'))) {
  for (const [, u] of fs.readFileSync(file, 'utf8').matchAll(/url\(['"]?([^'")]+)['"]?\)/g)) {
    if (/^(https?:|\/\/)/.test(u)) err(path.relative(dist, file), `risorsa esterna ${u}`);
    else if (!u.startsWith('data:') && !exists(path.dirname(file), u)) err(path.relative(dist, file), `risorsa rotta ${u}`);
  }
}
for (const f of ['index.html', 'en/index.html', '404.html', 'sitemap.xml', 'robots.txt', 'favicon.svg']) if (!fs.existsSync(path.join(dist, f))) err(f, 'file mancante');

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log('Check ok');
