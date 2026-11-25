import test from 'node:test';
import assert from 'node:assert/strict';
import { links, SCENES } from '../src/data.mjs';
import { pages } from '../src/pages.mjs';

test('links follow the language, gallery is shared', () => {
  assert.deepEqual(links('it'), { gallery: 'https://gallery.albertorsini.it/', cv: 'https://curriculum.albertorsini.it/', blog: 'https://albertorsini.it/it/' });
  assert.deepEqual(links('en'), { gallery: 'https://gallery.albertorsini.it/', cv: 'https://curriculum.albertorsini.it/en/', blog: 'https://albertorsini.it/en/' });
});

test('three pages: it, en, 404', () => {
  assert.deepEqual(pages.map((p) => p.file ?? p.path), ['/', '/en/', '404.html']);
});

test('doors work as plain html, in button order', () => {
  for (const p of pages.slice(0, 2)) {
    const nav = p.html.match(/<nav id="doors"[\s\S]*?<\/nav>/)[0];
    assert.deepEqual([...nav.matchAll(/data-scene="(\w+)"/g)].map((m) => m[1]), ['blog', 'cv', 'gallery']);
    assert.doesNotMatch(nav, /target=|hidden/);
    for (const url of Object.values(links(p.lang))) assert.ok(nav.includes(`href="${url}"`), url);
    assert.equal(p.html.match(/<h1[\s>]/g).length, 1);
    assert.match(p.html, /hreflang="it"/);
    assert.match(p.html, /hreflang="en"/);
    assert.match(p.html, /<meta name="robots" content="noindex/);
    assert.doesNotMatch(p.html, /(src|href)="\/(?!\/)/);
  }
});

test('scene data for the script follows scene order and starts hidden', () => {
  for (const p of pages.slice(0, 2)) {
    const data = JSON.parse(p.html.match(/<script type="application\/json" id="scenes">([\s\S]*?)<\/script>/)[1]);
    assert.deepEqual(data.map((s) => s.key), SCENES);
    for (const s of data) assert.equal(s.href, links(p.lang)[s.key]);
    assert.match(p.html, /id="turner"[^>]*\shidden/);
  }
});

test('404 is bilingual', () => {
  assert.match(pages[2].html, /Page not found/);
  assert.match(pages[2].html, /Pagina non trovata/);
});

test('the only visible doors are the buttons on top', () => {
  for (const p of pages.slice(0, 2)) assert.doesNotMatch(p.html, /id="enter"/);
});

test('turning controls are a slider line with a hint and two arrows, no dots', () => {
  for (const [p, hint] of [[pages[0], 'Trascina per girare'], [pages[1], 'Drag to turn']]) {
    const turner = p.html.match(/<div id="turner"[\s\S]*?<\/footer>/)[0];
    assert.match(turner, /id="track"[^>]*role="slider"[^>]*tabindex="0"/);
    assert.match(turner, /id="thumb"/);
    assert.ok(turner.includes(hint));
    assert.ok(turner.indexOf('id="prev"') < turner.indexOf('id="next"'));
    assert.doesNotMatch(p.html, /id="dots"/);
  }
});

test('before the first paint the page knows a script is coming, and can give up', () => {
  for (const p of pages.slice(0, 2)) {
    const boot = p.html.indexOf("classList.add('boot')");
    assert.ok(boot > 0 && boot < p.html.indexOf('rel="stylesheet"') && boot < p.html.indexOf('type="module"'));
    assert.match(p.html, /classList\.remove\('boot'\)/);
  }
});
