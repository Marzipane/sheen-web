// 0.7.0 focus: no ring and no glow on pointer focus; one thin ring for keyboard focus only; a text field inside a
// control never draws its own outline. The page knows the last kind of input from data-sheen-pointer on <html>.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const DENSE = ':is(sheen-menu-button.sheen-small,.sheen-small sheen-menu-button,.sheen-bulk-bar sheen-menu-button,.sheen-views-end sheen-menu-button)';

test('a press marks the page as pointer-driven; Tab, and arrows outside a text field, mark it keyboard-driven', () => {
  const w = page('<label class="sheen-control sheen-find"><input type="search" id="q"></label><button id="b" type="button">B</button>');
  const root = w.document.documentElement, q = w.document.getElementById('q'), b = w.document.getElementById('b');
  assert.equal(root.hasAttribute('data-sheen-pointer'), false, 'keyboard until the first press');
  q.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
  assert.equal(root.hasAttribute('data-sheen-pointer'), true);
  key(w, q, 'a');
  key(w, q, 'ArrowLeft');
  assert.equal(root.hasAttribute('data-sheen-pointer'), true, 'typing and moving the caret keep the pointer state');
  key(w, b, 'ArrowDown');
  assert.equal(root.hasAttribute('data-sheen-pointer'), false, 'arrows on a button or a menu item are keyboard use');
  b.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
  key(w, q, 'Tab');
  assert.equal(root.hasAttribute('data-sheen-pointer'), false, 'Tab is keyboard use');
});

test('a text field inside a control draws no outline of its own, and the control no glow', () => {
  // (the normalizer drops the space before ":is("; the min file keeps the descendant combinators)
  has('.sheen:is(.sheen-field,.sheen-segment,.sheen-picker-pill,.sheen-control):is(input,select,textarea,.sheen-segment-trigger,.sheen-picker-trigger):focus-visible{outline:none}');
  assert.ok(min.includes('.sheen :is(.sheen-field,.sheen-segment,.sheen-picker-pill,.sheen-control) :is(input,select,textarea,'));
  assert.ok(!css.includes('.sheen-control:focus-within'), 'no ring or glow on any focus inside a control');
  assert.ok(!/\.sheen-control:focus-visible[^{]*\{[^}]*box-shadow/.test(css), 'no glow on a focused control');
});

test('a control holding a text field shows one thin ring for keyboard focus only', () => {
  has('.sheen-control:has(:is(input,select,textarea):focus-visible){outline:2px solid var(--sheen-accent-text);outline-offset:2px}');
  has(':root[data-sheen-pointer] .sheen-control:has(:is(input,select,textarea):focus-visible){outline:none}');
});

test('text fields focused with a pointer draw no ring anywhere', () => {
  has(':root[data-sheen-pointer]:is(input,select,textarea):focus-visible{outline:none}');
  assert.ok(min.includes(':root[data-sheen-pointer] :is(input,select,textarea):focus-visible{outline:none}'));
});

test('menus ring an item for keyboard focus only; opening one with a pointer rings nothing', () => {
  assert.ok(!css.includes(DENSE + ' .sheen-menu-item:focus{'), 'the 0.7.0 draft ring on any focus is gone');
  has(DENSE + ' .sheen-menu-item:focus-visible{background:none;outline:2px solid var(--sheen-accent-text);outline-offset:-2px}');
});
