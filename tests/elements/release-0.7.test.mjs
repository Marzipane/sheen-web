// 0.7.0 release review: keyboard rings on every page that loads sheen-web (sheen.js alone, the elements alone, or no
// script at all); selects ring after Tab like buttons; dense fields keep their edge in forced colors; the demo and the
// sources speak in their own words; the rules that had no test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync, readdirSync } from 'node:fs';
import { page, key } from './setup.mjs';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const min = read('dist/sheen.min.css');
const has = (part) => assert.ok(min.includes(part), part);

function sheenJsOnly() {
  const dom = new JSDOM('<!doctype html><html><body class="sheen"><a href="#a" id="a">A</a><button id="b">B</button></body></html>',
    { runScripts: 'outside-only', virtualConsole: new VirtualConsole(), pretendToBeVisual: true });
  dom.window.eval(read('dist/sheen.js'));
  return dom.window;
}

test('a page with sheen.js alone follows the keyboard rule: it marks itself, Tab sets the flag, a press clears it', () => {
  const w = sheenJsOnly(), root = w.document.documentElement, b = w.document.getElementById('b');
  assert.equal(root.hasAttribute('data-sheen-focus'), true, 'sheen.js marks the page as following the rule');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false);
  key(w, b, 'Tab');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), true, 'Tab');
  b.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false, 'a press');
  key(w, b, 'Escape');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false, 'Esc');
});

test('the elements mark the page too, and a page with both scripts sets the rule up once', () => {
  const w = page('<button id="b">B</button>');
  assert.equal(w.document.documentElement.hasAttribute('data-sheen-focus'), true);
  // both bundles carry the same guard: the second one finds the page marked and adds no second set of listeners
  for (const src of [read('dist/sheen.js'), read('dist/sheen-elements.js')])
    assert.match(src, /if \(root\.hasAttribute\('data-sheen-focus'\)\) return;/);
});

test('rings are taken away only on a page a script marked: without one, keyboard focus keeps the browser\'s ring', () => {
  has(':root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen :focus-visible,:root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen:focus-visible{outline:none!important}');
  has(':root[data-sheen-focus]:not([data-sheen-keyboard]) :is(.sheen-choice:has(input:focus-visible),.sheen-chip:has(>input:focus-visible)){outline:none}');
  assert.ok(!min.includes(':root:not([data-sheen-keyboard])'), 'no rule takes rings away from an unmarked page');
});

test('a select rings after Tab like a button: only text inputs and textareas never draw a ring', () => {
  has('.sheen :is(input:not([type="checkbox"],[type="radio"],[type="range"],[type="button"],[type="submit"],[type="reset"],[type="file"],[type="color"],[type="image"]),textarea):focus-visible{outline:none!important}');
  // inside a field or control the field rings instead (prereview-0.7); no other rule takes a select's ring away
  for (const r of min.split('}').filter((r) => /focus-visible\{outline:none/.test(r) && !r.includes('.sheen-field,.sheen-segment'))) assert.doesNotMatch(r, /select/, r);
});

test('forced colors: a dense field and its select keep a 1px edge, an invalid one a 2px edge, and the chevron shows', () => {
  has('@media (forced-colors:active){.sheen-form-field.sheen-small .sheen-input{border:1px solid CanvasText}.sheen-form-field.sheen-small .sheen-input[aria-invalid="true"]{border-width:2px}.sheen-select::after{background:CanvasText;forced-color-adjust:none}}');
});

test('rules that had no test: the pinned end column, a link button\'s glyph, the pager\'s hover and off states, the status note', () => {
  has('.sheen-table.sheen-small .sheen-pin-end{padding-inline:4px}');
  has('.sheen-link-button>:is(.sheen-icon,.sheen-glyph){inline-size:14px;block-size:14px;flex:none}');
  has('.sheen-pager button:hover:not(:disabled){background:var(--sheen-tonal);color:var(--sheen-text)}');
  has('.sheen-pager button:disabled{opacity:.45;cursor:not-allowed}');
  assert.match(min, /\.sheen-status small\{[^}]+\}/);
});

test('placement takes no mode: placeUnder(box, anchor) lines a box up under its anchor', () => {
  assert.match(read('dist/sheen-elements.js'), /function placeUnder\(box, a\) \{/);
});

test('the sources, the built files, the demo and the tests describe parts in their own words, not by private mockup classes', () => {
  const files = [...readdirSync(new URL('../../src/css/', import.meta.url)).map((f) => 'src/css/' + f),
    ...readdirSync(new URL('../../src/elements/', import.meta.url)).map((f) => 'src/elements/' + f), 'src/js/sheen.js',
    'dist/sheen.css', 'dist/sheen-elements.js', 'docs/app-page.html',
    ...readdirSync(new URL('./', import.meta.url)).filter((f) => f.endsWith('.mjs')).map((f) => 'tests/elements/' + f)];
  for (const f of files) {
    const hits = read(f).match(/(?<![\w-])[ko]-[a-z][a-z0-9-]*/g);
    assert.equal(hits, null, `${f}: ${hits}`);
  }
});

test('the demo page speaks in neutral sample words', () => {
  const demo = read('docs/app-page.html');
  for (const word of ['Offer a move', 'Per tier', 'Waived', 'Booked by mistake', 'Not home at that time', 'Reason codes', 'Absence'])
    assert.ok(!demo.includes(word), word);
});

test('a side panel takes class="sheen-small" for the 400px filter and edit panels, so an app sets no width; 440px stays the default', () => {
  has(':where(sheen-side-panel.sheen-small){--sheen-panel-size:400px}');
  assert.match(min, /sheen-side-panel\.sheen-glass\{[^}]*inline-size:min\(var\(--sheen-panel-size,440px\),100vw\)/);
  assert.match(read('dist/sheen-elements.js'), /class="sheen-small" makes it 400px wide/);
});

test('a menu button at the end of a views or find row opens a menu 320px to 360px wide, from the kit itself', () => {
  has(':where(.sheen-views-end sheen-menu-button){--sheen-menu-min-size:320px;--sheen-menu-max-size:360px}');
});
