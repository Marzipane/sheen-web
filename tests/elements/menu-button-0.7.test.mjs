// 0.7.0: the menu button's looks (variant, icon, chevron), its items (glyph, accent, note, text) and its placement.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');

// A menu whose size follows the room it is given, as a fixed box with auto width does in a browser: it shrinks to the
// space between its left edge and the end of the screen, and its words wrap onto more lines when it is narrow.
function shrinking(w, list, natural = { width: 260, height: 160 }) {
  list.getBoundingClientRect = () => {
    const left = parseFloat(list.style.left) || 0, top = parseFloat(list.style.top) || 0;
    const width = Math.min(natural.width, w.innerWidth - left);
    const height = width < natural.width ? natural.height * 2 : natural.height;
    return { left, right: left + width, top, bottom: top + height, width, height };
  };
  Object.defineProperty(list, 'offsetWidth', { get: () => list.getBoundingClientRect().width });
}

function menuAt(rect, dir) {
  const w = page('<sheen-menu-button label="Row actions" glyph="more"></sheen-menu-button>', dir);
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'open', label: 'Open the record' }, { id: 'copy', label: 'Copy the reference' }];
  const button = m.querySelector('button');
  const list = m.querySelector('[role="menu"]');
  button.getBoundingClientRect = () => rect;
  shrinking(w, list);
  return { w, m, button, list };
}

test('menu button: near the end edge the menu keeps its full width and lines up with the button end', () => {
  // jsdom's window is 1024 wide; the button sits 4px from the end edge
  const { button, list } = menuAt({ left: 990, right: 1020, top: 50, bottom: 80, width: 30, height: 30 });
  button.click();
  assert.equal(list.style.left, String(1020 - 260) + 'px');
  assert.equal(list.classList.contains('sheen-menu-flip'), true);
  assert.equal(list.style.top, '86px', 'room below: it opens down');
  assert.equal(list.classList.contains('sheen-menu-up'), false);
});

test('menu button: in Arabic near the start (left) edge the menu keeps its full width and lines up with the button', () => {
  const { button, list } = menuAt({ left: 20, right: 50, top: 50, bottom: 80, width: 30, height: 30 }, 'rtl');
  button.click();
  assert.equal(list.style.left, '20px');
  assert.equal(list.classList.contains('sheen-menu-flip'), true);
});

test('menu button: it opens upward only when it does not fit below and there is more room above', () => {
  const { w, button, list } = menuAt({ left: 100, right: 130, top: 700, bottom: 730, width: 30, height: 30 });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-up'), true);
  assert.equal(list.style.top, String(700 - 160 - 6) + 'px');
  button.click();
  // a button high on the page with little room above: down, even when the bottom is close
  button.getBoundingClientRect = () => ({ left: 100, right: 130, top: 40, bottom: 70, width: 30, height: 30 });
  Object.defineProperty(w, 'innerHeight', { value: 200, configurable: true });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-up'), false);
  assert.equal(list.style.top, '76px');
});
