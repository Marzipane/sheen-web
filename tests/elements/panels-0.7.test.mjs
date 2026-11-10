// 0.7.0: the side panel's heading row, its modal form with a dimmed page, its width, and the solid look of layers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');

function panel(attrs = '', inner = '<button id="a">A</button><button id="b">B</button>') {
  const w = page(`<button id="opener">Filters</button><sheen-side-panel label="Filters" close-label="Close" ${attrs}>${inner}</sheen-side-panel>`);
  const p = w.document.querySelector('sheen-side-panel');
  return { w, p, opener: w.document.getElementById('opener') };
}

test('side panel: heading puts the title and the close button on one row above the body', () => {
  const { p } = panel('heading="Filters"');
  const top = p.firstElementChild;
  assert.ok(top.classList.contains('sheen-panel-top'));
  assert.equal(top.querySelector('h2.sheen-panel-title').textContent, 'Filters');
  assert.equal(top.lastElementChild, p.querySelector('.sheen-panel-close'));
  assert.ok(p.children[1].classList.contains('sheen-panel-body'));
  assert.ok(p.querySelector('#a').closest('.sheen-panel-body'));
});

test('side panel: without heading it keeps the 0.4.0 layout; a heading set later takes effect', () => {
  const { p } = panel();
  assert.ok(p.firstElementChild.classList.contains('sheen-panel-close'));
  assert.equal(p.querySelector('.sheen-panel-top'), null);
  p.setAttribute('heading', 'Filters');
  assert.equal(p.querySelector('.sheen-panel-top .sheen-panel-title').textContent, 'Filters');
  p.setAttribute('heading', 'Filtres');
  assert.equal(p.querySelectorAll('.sheen-panel-title').length, 1);
  assert.equal(p.querySelector('.sheen-panel-title').textContent, 'Filtres');
});

test('side panel: modal dims the page behind it, a press on the dim closes it, and the dim goes with it', () => {
  const { w, p, opener } = panel('modal');
  const closes = record(p, 'sheen-panel-close');
  opener.focus();
  p.open();
  assert.equal(p.getAttribute('aria-modal'), 'true');
  const dim = p.previousElementSibling;
  assert.ok(dim && dim.classList.contains('sheen-panel-dim'));
  assert.equal(dim.getAttribute('aria-hidden'), 'true');
  dim.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.equal(p.hidden, true);
  assert.equal(closes.length, 1);
  assert.equal(w.document.querySelector('.sheen-panel-dim'), null);
  assert.equal(w.document.activeElement, opener);
});

test('side panel: without modal there is no dim and the page stays usable (0.4.0)', () => {
  const { w, p } = panel();
  p.open();
  assert.equal(p.getAttribute('aria-modal'), 'false');
  assert.equal(w.document.querySelector('.sheen-panel-dim'), null);
  assert.equal(w.document.activeElement, p, 'the panel itself takes focus, as in 0.4.0');
});

test('side panel: a modal panel puts focus on its first control (the close button), and the panel draws no ring of its own', () => {
  const { w, p } = panel('modal heading="Filters"');
  p.open();
  assert.equal(w.document.activeElement, p.querySelector('.sheen-panel-close'));
  const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
  assert.ok(css.includes('sheen-side-panel.sheen-glass:focus{outline:none}'));
});

test('side panel: modal keeps Tab inside, from the last control to the first and back', () => {
  const { w, p } = panel('modal heading="Filters"');
  p.open();
  const close = p.querySelector('.sheen-panel-close'), b = w.document.getElementById('b');
  b.focus();
  assert.equal(key(w, b, 'Tab'), false, 'the browser does not move focus out');
  assert.equal(w.document.activeElement, close);
  assert.equal(key(w, close, 'Tab', { shiftKey: true }), false);
  assert.equal(w.document.activeElement, b);
  // Esc still closes, and a second open brings the dim back once
  key(w, b, 'Escape');
  assert.equal(p.hidden, true);
  p.open();
  p.open();
  assert.equal(w.document.querySelectorAll('.sheen-panel-dim').length, 1);
});

test('side panel: a modal panel removed from the page takes its dim along', () => {
  const { w, p } = panel('modal');
  p.open();
  p.remove();
  assert.equal(w.document.querySelector('.sheen-panel-dim'), null);
});

test('side panel: width, heading row and dim are in the built CSS', () => {
  assert.match(css, /sheen-side-panel\.sheen-glass\{[^}]*inline-size:min\(var\(--sheen-panel-size,440px\),100vw\)/);
  assert.match(css, /\.sheen-panel-dim\{position:fixed;inset:0;z-index:899;background:rgba\(5,7,11,\.18\)/);
  for (const part of ['.sheen-panel-top{', '.sheen-panel-title{', 'sheen-side-panel[heading]{padding:0}', 'sheen-side-panel[heading] .sheen-panel-close{', 'sheen-side-panel[heading] .sheen-panel-body{']) assert.ok(css.includes(part), part);
});

test('solid layers: .sheen-solid on a layer or any box around it draws menus, panels, cards and the palette on the sheet', () => {
  // beats the glass rules, the light theme's included: :root[data-theme="light"] .sheen-glass is (0,3,0).
  // (this file's normalizer drops the space before ":is(", so the descendant combinator is checked in the min file below)
  const layers = ':root .sheen-solid:is(.sheen-menu.sheen-glass,.sheen-cmd.sheen-glass,.sheen-toast.sheen-glass,sheen-side-panel.sheen-glass,sheen-hover-card.sheen-glass),:root:is(sheen-side-panel,sheen-hover-card).sheen-solid.sheen-glass';
  assert.ok(css.includes(layers + '{background:var(--sheen-sheet);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 0 0 1px var(--sheen-separator),0 14px 34px rgba(16,20,30,.14),0 2px 6px rgba(16,20,30,.06)}'), 'solid fill');
  assert.ok(css.includes(':root .sheen-solid:is(.sheen-menu.sheen-glass,.sheen-cmd.sheen-glass,.sheen-toast.sheen-glass,sheen-side-panel.sheen-glass,sheen-hover-card.sheen-glass)::after,:root:is(sheen-side-panel,sheen-hover-card).sheen-solid.sheen-glass::after{content:none}'), 'no glass rim');
  // modal layers dim the page with a plain shade, no blur
  assert.ok(css.includes('.sheen-solid:is(.sheen-cmd,.sheen-dialog)::backdrop{background:rgba(5,7,11,.22);-webkit-backdrop-filter:none;backdrop-filter:none}'));
  // the shipped file keeps the descendant combinators: a box around the layer, not the layer itself
  const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
  for (const part of [':root .sheen-solid :is(.sheen-menu.sheen-glass', ':root :is(sheen-side-panel,sheen-hover-card).sheen-solid.sheen-glass', '.sheen-solid :is(.sheen-cmd,.sheen-dialog)::backdrop']) assert.ok(min.includes(part), part);
});
