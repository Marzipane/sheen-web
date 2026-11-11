// 0.7.1 the sidebar shell under 760px: the sidebar leaves the page and opens as a drawer from the start edge behind a
// .sheen-nav-button in the app bar. A closed drawer draws nothing; Esc, a press outside it or on one of its links closes
// it and focus goes back to the button; while it is open the rest of the shell is inert, so Tab stays in it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';
import { readFileSync } from 'node:fs';

const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(min.includes(part), part);
const narrowCss = (() => { const at = min.indexOf('@media (max-width:760px){.sheen-sidebar-shell{'); assert.ok(at >= 0, 'the shell\'s narrow block'); let depth = 0, i = min.indexOf('{', at); for (; i < min.length; i++) { if (min[i] === '{') depth++; else if (min[i] === '}' && --depth === 0) break; } return min.slice(at, i + 1); })();
const rule = (css, sel) => { const at = css.indexOf(sel + '{'); assert.ok(at >= 0, sel); return css.slice(at, css.indexOf('}', at) + 1); };

const SHELL = `<div class="sheen-sidebar-shell"><aside class="sheen-sidebar" id="side"><nav class="sheen-sidebar-nav"><a class="sheen-sidebar-item" href="#a">A</a><a class="sheen-sidebar-item" href="#b">B</a></nav></aside>
<div class="sheen-app-main"><header class="sheen-app-bar"><button type="button" class="sheen-control sheen-nav-button" aria-controls="side" aria-expanded="false" aria-label="Menu">≡</button></header><main class="sheen-app-content"><button id="inside">x</button></main></div></div>`;
const shell = () => { const w = page(SHELL); const d = w.document; return { w, d, s: d.querySelector('.sheen-sidebar-shell'), side: d.getElementById('side'), button: d.querySelector('.sheen-nav-button'), main: d.querySelector('.sheen-app-main') }; };

test('the menu button stays hidden while the sidebar sits beside the page, and shows under 760px as a 36px square', () => {
  // the button is also a .sheen-control (display:inline-flex, later in the file), so the shell scope outranks it
  has('.sheen-sidebar-shell .sheen-nav-button{display:none}');
  assert.match(rule(narrowCss, '.sheen-sidebar-shell .sheen-nav-button'), /display:inline-grid;place-items:center;inline-size:36px;/);
});

test('under 760px the shell is one row and the sidebar a drawer at the start edge, closed by default, mirrored in Arabic', () => {
  assert.match(rule(narrowCss, '.sheen-sidebar-shell'), /grid-template-columns:minmax\(0,1fr\);grid-template-rows:minmax\(0,1fr\)/);
  const side = rule(narrowCss, '.sheen-sidebar');
  for (const part of ['position:fixed', 'inset-block:0', 'inset-inline-start:0', 'inline-size:min(300px,86vw)', 'transform:translateX(-100%)', 'visibility:hidden'])
    assert.ok(side.includes(part), part);
  assert.ok(narrowCss.includes('.sheen-sidebar:dir(rtl){transform:translateX(100%)}'));
});

test('with less motion the drawer has no transitions at all, so its links can take focus the moment it opens', () => {
  // sheen's less-motion rule gives every element a .01ms transition of every property (transition-property is all by
  // default), which kept the drawer's links hidden for a moment after opening and refused them focus
  has('@media (max-width:760px) and (prefers-reduced-motion:reduce){.sheen-sidebar,.sheen-sidebar *{transition-duration:0s!important}}');
});

test('a closed drawer draws nothing: no shadow, out of sight, so no band shows along the start edge', () => {
  assert.doesNotMatch(rule(narrowCss, '.sheen-sidebar'), /box-shadow/);
  assert.match(rule(narrowCss, '.sheen-sidebar-shell[data-nav-open] .sheen-sidebar'), /transform:none;visibility:visible;/);
  // an open drawer's shade sits with the side panel's (the sidebar file keeps no literal colours): its shadow toward the
  // page, mirrored in Arabic, and the same dim
  has('@media (max-width:760px){.sheen-sidebar-shell[data-nav-open] .sheen-sidebar{box-shadow:20px 0 60px rgba(0,0,0,.12)}.sheen-sidebar-shell[data-nav-open] .sheen-sidebar:dir(rtl){box-shadow:-20px 0 60px rgba(0,0,0,.12)}.sheen-sidebar-shell[data-nav-open]::after{content:"";position:fixed;inset:0;z-index:900;background:rgba(0,0,0,.18)}}');
});

test('the menu button opens the drawer it controls: the shell is marked, the button expanded, focus on the first link, the page inert', () => {
  const { d, s, side, button, main } = shell();
  button.click();
  assert.equal(s.hasAttribute('data-nav-open'), true);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(d.activeElement, side.querySelector('a'));
  assert.equal(main.hasAttribute('inert'), true);
  assert.equal(side.hasAttribute('inert'), false);
});

test('Esc closes the drawer and gives focus back to the button; the page is no longer inert', () => {
  const { w, d, s, button, main } = shell();
  button.click();
  key(w, d.activeElement, 'Escape');
  assert.equal(s.hasAttribute('data-nav-open'), false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(d.activeElement, button);
  assert.equal(main.hasAttribute('inert'), false);
});

test('a press on one of its links or outside it (the dim) closes the drawer; a press inside it does not', () => {
  const { s, side, button } = shell();
  button.click();
  side.querySelector('nav').click();
  assert.equal(s.hasAttribute('data-nav-open'), true, 'a press inside it');
  side.querySelector('a[href="#b"]').click();
  assert.equal(s.hasAttribute('data-nav-open'), false, 'a link');
  button.click();
  s.click();
  assert.equal(s.hasAttribute('data-nav-open'), false, 'the dim (the shell itself)');
});

test('the menu button toggles: a second press closes the drawer', () => {
  const { s, button } = shell();
  button.click();
  assert.equal(s.hasAttribute('data-nav-open'), true);
  button.click();
  assert.equal(s.hasAttribute('data-nav-open'), false);
});
