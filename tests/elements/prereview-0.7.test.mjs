// 0.7.0 pre-review of the release fixes: a field rings around its select or picker button after Tab; sheen.js loads in
// Node; the 400px side panel is a class an app can override; dense menus fit a phone; Esc on a toast gives focus back;
// forced colors keep a panel's edge and its dim; placement reads the direction itself; a neutral demo that fits a phone.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { page, key } from './setup.mjs';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const min = read('dist/sheen.min.css');
const has = (part) => assert.ok(min.includes(part), part);
const FIELD = ':is(.sheen-field,.sheen-control):has(:is(select,.sheen-picker-trigger):focus-visible)';

test('a field or control rings around its select or picker button after Tab, the 2px ring like every other; the select draws no box of its own', () => {
  has(FIELD + '{outline:2px solid var(--sheen-accent-text);outline-offset:2px}');
  has(':root[data-sheen-focus]:not([data-sheen-keyboard]) ' + FIELD + '{outline:none}');
  has('.sheen :is(.sheen-field,.sheen-segment,.sheen-picker-pill,.sheen-control) :is(input,select,textarea,.sheen-segment-trigger,.sheen-picker-trigger):focus-visible{outline:none}');
});

test('sheen.js and sheen.min.js load in Node, where there is no document', () => {
  const require = createRequire(import.meta.url);
  for (const f of ['../../dist/sheen.js', '../../dist/sheen.min.js']) assert.doesNotThrow(() => require(f), f);
});

test('the 400px side panel is the sheen-small class at no specificity, so an app\'s own --sheen-panel-size always wins', () => {
  has(':where(sheen-side-panel.sheen-small){--sheen-panel-size:400px}');
  assert.ok(!min.includes('[size="small"]'), 'no size attribute');
  assert.match(read('dist/sheen-elements.js'), /class="sheen-small" makes it 400px wide/);
});

test('a dense menu never asks for more than the window: its minimum keeps 8px from each side', () => {
  assert.match(min, /\.sheen-views-end sheen-menu-button \.sheen-menu\{font-size:13\.5px;min-inline-size:min\(var\(--sheen-menu-min-size,250px\),calc\(100vw - 16px\)\);/);
});

test('Esc on a toast with focus inside it gives focus back to where it was before', () => {
  const w = page('<button id="before">Before</button><sheen-toaster position="top" close-label="Close"></sheen-toaster>');
  const d = w.document, t = d.querySelector('sheen-toaster'), before = d.getElementById('before');
  before.focus();
  t.show({ title: 'Saved', tone: 'success', timeout: 0, action: { label: 'Undo', onClick() {} } });
  const undo = t.querySelector('.sheen-link-button');
  undo.focus();
  key(w, undo, 'Escape');
  assert.equal(t.querySelector('.sheen-toast'), null);
  assert.equal(d.activeElement, before);
});

test('the close button of a toast gives focus back too', () => {
  const w = page('<button id="before">Before</button><sheen-toaster close-label="Close"></sheen-toaster>');
  const d = w.document, t = d.querySelector('sheen-toaster'), before = d.getElementById('before');
  before.focus();
  t.show({ title: 'Saved', timeout: 0 });
  const close = t.querySelector('.sheen-toast-close');
  close.focus();
  close.click();
  assert.equal(d.activeElement, before);
});

test('forced colors: a side panel keeps an edge toward the page and a modal one\'s dim stays visible', () => {
  has('@media (forced-colors:active){sheen-side-panel.sheen-glass{border-inline-start:1px solid CanvasText}.sheen-panel-dim{forced-color-adjust:none;background:color-mix(in srgb,CanvasText 30%,transparent)}}');
});

test('placement reads the direction from the box itself: placeUnder(box, anchor) takes no flag', () => {
  const js = read('dist/sheen-elements.js');
  assert.match(js, /function placeUnder\(box, a\) \{/);
  assert.match(js, /placeUnder\(this\.menu, this\.button\.getBoundingClientRect\(\)\)/);
});

test('the demo takes the app bar size from the token, fits a phone and names its sample data neutrally', () => {
  const demo = read('docs/app-page.html');
  assert.ok(!/\b6[01]px\b/.test(demo.slice(0, demo.indexOf('</style>'))), 'no 60px or 61px in the frame');
  assert.ok(demo.includes('var(--sheen-size-app-bar)'));
  assert.match(demo, /@media \(max-width:760px\)\{\.demo-frame\{grid-template-columns:minmax\(0,1fr\)\}\.demo-side\{display:none\}/);
  assert.doesNotMatch(demo, /\b(perTier|waived|fault|client)\b/);
});
