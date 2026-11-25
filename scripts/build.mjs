// Build statico: genera dist/ da src/pages.mjs, public/ e src/assets. Solo Node.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pages } from '../src/pages.mjs';
import { SITE_URL } from '../src/data.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'css'), { recursive: true });
fs.cpSync(path.join(root, 'public'), dist, { recursive: true, filter: (f) => !f.endsWith('.DS_Store') });
fs.copyFileSync(path.join(root, 'src/assets/style.css'), path.join(dist, 'css/style.css'));
fs.cpSync(path.join(root, 'src/assets/js'), path.join(dist, 'js'), { recursive: true });

for (const p of pages) {
  const target = path.join(dist, p.file ?? path.join(p.path, 'index.html'));
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, p.html);
}

const indexable = pages.filter((p) => !p.noindex);
const alternates = indexable.map((q) => `\n    <xhtml:link rel="alternate" hreflang="${q.lang}" href="${SITE_URL}${q.path}"/>`).join('')
  + `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}/"/>`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${indexable.map((p) => `  <url>\n    <loc>${SITE_URL}${p.path}</loc>${alternates}\n  </url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
console.log(`Build ok: ${pages.length} pagine → dist/`);
