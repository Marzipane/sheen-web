// 0.7.1 release review: the drawer is opt-in and works with either script. sheen.js carries the elements' drawer code,
// set up once by whichever loads first; with forced colors a dense menu item that the arrows reach keeps its outline.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const min = read('dist/sheen.min.css');
const SHELL = '<div class="sheen-sidebar-shell"><aside class="sheen-sidebar" id="side"><nav class="sheen-sidebar-nav"><a class="sheen-sidebar-item" href="#a">A</a><a class="sheen-sidebar-item" href="#b">B</a></nav></aside>' +
  '<div class="sheen-app-main"><header class="sheen-app-bar"><button type="button" class="sheen-control sheen-nav-button" aria-controls="side" aria-expanded="false" aria-label="Menu">≡</button></header><main class="sheen-app-content">Page</main></div></div>';
const load = (...files) => {
  const dom = new JSDOM(`<!doctype html><html><body class="sheen">${SHELL}</body></html>`, { runScripts: 'outside-only', virtualConsole: new VirtualConsole(), pretendToBeVisual: true });
  for (const f of files) dom.window.eval(read(f));
  const w = dom.window, d = w.document;
  return { w, d, s: d.querySelector('.sheen-sidebar-shell'), side: d.getElementById('side'), button: d.querySelector('.sheen-nav-button'), main: d.querySelector('.sheen-app-main') };
};

test('with sheen.js alone the nav button opens the drawer, focus on its first link and the page inert; Esc closes it', () => {
  const { w, d, s, side, button, main } = load('dist/sheen.js');
  button.click();
  assert.equal(s.hasAttribute('data-nav-open'), true);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(d.activeElement, side.querySelector('a'));
  assert.equal(main.hasAttribute('inert'), true);
  d.activeElement.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  assert.equal(s.hasAttribute('data-nav-open'), false);
  assert.equal(d.activeElement, button);
  assert.equal(main.hasAttribute('inert'), false);
});

test('with both scripts on a page one press opens the drawer once: whichever loads first sets it up, the other adds nothing', () => {
  for (const order of [['dist/sheen.js', 'dist/sheen-elements.js'], ['dist/sheen-elements.js', 'dist/sheen.js']]) {
    const { s, button } = load(...order);
    button.click();
    assert.equal(s.hasAttribute('data-nav-open'), true, order.join(' then '));
    button.click();
    assert.equal(s.hasAttribute('data-nav-open'), false, order.join(' then '));
  }
});

test('sheen.js and the elements carry the same drawer code', () => {
  const block = (src) => { const a = src.indexOf('// The sidebar as a drawer under 760px'); assert.ok(a >= 0); return src.slice(a, src.indexOf('})();', a)); };
  assert.equal(block(read('src/js/sheen.js')), block(read('src/elements/00-core.js')));
});

test('with forced colors a dense menu keeps the item the arrows reach outlined: the press rules apply only when forced colors are off', () => {
  const press = ':root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen :focus-visible,:root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen:focus-visible{outline:none!important}';
  const at = min.indexOf(press);
  assert.ok(at >= 0, 'the press rule');
  assert.ok(min.slice(0, at).endsWith('@media not (forced-colors:active){'), 'the press rule sits inside @media not (forced-colors: active)');
  const block = min.slice(at, min.indexOf('}}', at) + 2);
  for (const part of [':is(.sheen-choice:has(input:focus-visible),.sheen-chip:has(>input:focus-visible)){outline:none}', '.sheen-menu-item:focus-visible{background:var(--sheen-tonal)}'])
    assert.ok(block.includes(part), part);
});
