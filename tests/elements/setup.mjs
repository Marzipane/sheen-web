// Loads dist/sheen-elements.js into a fresh jsdom page. node --test tests/elements/
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

const bundle = readFileSync(new URL('../../dist/sheen-elements.js', import.meta.url), 'utf8');

export function page(html = '', dir = 'ltr') {
  const virtualConsole = new VirtualConsole(); // jsdom's "not implemented" (media play) stays quiet
  const dom = new JSDOM(`<!doctype html><html dir="${dir}"><body>${html}</body></html>`,
    { runScripts: 'outside-only', virtualConsole, pretendToBeVisual: true });
  dom.window.eval(bundle);
  return dom.window;
}

export function key(w, el, k, opts = {}) {
  return el.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true, ...opts }));
}

export function record(el, type) {
  const seen = [];
  // details are made inside the page's realm; plain copies compare with deepStrictEqual
  el.addEventListener(type, (e) => seen.push(JSON.parse(JSON.stringify(e.detail))));
  return seen;
}

// a plain copy of something made inside the page (arrays and objects from another realm fail deepStrictEqual)
export const plain = (v) => JSON.parse(JSON.stringify(v));
