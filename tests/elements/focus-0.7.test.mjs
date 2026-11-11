// 0.7.0 focus: a ring only while the keyboard navigates (Tab or Shift+Tab marks <html data-sheen-keyboard>, the next press
// clears it); a text field never draws one, inside a control or not; nothing glows.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const DENSE = ':is(sheen-menu-button.sheen-small,.sheen-small sheen-menu-button,.sheen-bulk-bar sheen-menu-button,.sheen-views-end sheen-menu-button)';

test('Tab marks keyboard navigation and a press clears it; typing, moving the caret and arrows on a button never mark it', () => {
  const w = page('<label class="sheen-control sheen-find"><input type="search" id="q"></label><button id="b" type="button">B</button>');
  const root = w.document.documentElement, q = w.document.getElementById('q'), b = w.document.getElementById('b');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false, 'no ring until the first Tab');
  q.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
  key(w, q, 'a');
  key(w, q, 'ArrowLeft');
  key(w, b, 'ArrowDown');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false, 'typing, the caret and arrows');
  key(w, q, 'Tab');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), true, 'Tab');
  b.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false, 'the next press');
});

test('a text field inside a control draws no outline of its own, and the control no glow', () => {
  // (the normalizer drops the space before ":is("; the min file keeps the descendant combinators)
  has('.sheen:is(.sheen-field,.sheen-segment,.sheen-picker-pill,.sheen-control):is(input,select,textarea,.sheen-segment-trigger,.sheen-picker-trigger):focus-visible{outline:none}');
  assert.ok(min.includes('.sheen :is(.sheen-field,.sheen-segment,.sheen-picker-pill,.sheen-control) :is(input,select,textarea,'));
  assert.ok(!css.includes('.sheen-control:focus-within'), 'no ring or glow on any focus inside a control');
  assert.ok(!/\.sheen-control:focus-visible[^{]*\{[^}]*box-shadow/.test(css), 'no glow on a focused control');
});

test('a control holding a text field draws no ring, keyboard or not: no text field does', () => {
  assert.ok(!css.includes('.sheen-control:has(:is(input,select,textarea):focus-visible){outline'));
  assert.ok(min.includes('.sheen :is(input:not([type="checkbox"],[type="radio"],[type="range"],[type="button"],[type="submit"],[type="reset"],[type="file"],[type="color"],[type="image"]),textarea):focus-visible{outline:none!important}'));
});

test('menus ring an item only while the keyboard navigates; arrows after a press show the hover fill', () => {
  assert.ok(!css.includes(DENSE + ' .sheen-menu-item:focus{'), 'the 0.7.0 draft ring on any focus is gone');
  has(DENSE + ' .sheen-menu-item:focus-visible{background:none;outline:2px solid var(--sheen-accent-text);outline-offset:-2px}');
  assert.ok(min.includes(':root[data-sheen-focus]:not([data-sheen-keyboard]) ' + DENSE + ' .sheen-menu-item:focus-visible{background:var(--sheen-tonal)}'));
});
