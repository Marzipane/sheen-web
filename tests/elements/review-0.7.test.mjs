// 0.7.0 review fixes: the modal Tab trap with radios and hidden inputs, the dim's lifecycle, an empty heading, keyboard
// dismissal of a top toast, names of icon menu buttons, forced colors, the keyboard state, narrow screens, mirroring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(css.includes(part), part);

function modal(inner) {
  const w = page(`<button id="outside">Outside</button><sheen-side-panel label="Filters" close-label="Close" heading="Filters" modal>${inner}</sheen-side-panel>`);
  const p = w.document.querySelector('sheen-side-panel');
  return { w, p, close: p.querySelector('.sheen-panel-close'), outside: w.document.getElementById('outside') };
}

test('modal panel: Tab from the last reachable control wraps, past a radio group\'s other radios and a hidden input', () => {
  const { w, p, close } = modal('<label><input type="radio" name="r" id="r1" checked> A</label><label><input type="radio" name="r" id="r2"> B</label><input type="hidden" id="h"><button tabindex="-1" id="skip">x</button>');
  p.open();
  const r1 = w.document.getElementById('r1');
  r1.focus();
  assert.equal(key(w, r1, 'Tab'), false);
  assert.equal(w.document.activeElement, close, 'the checked radio is the group\'s only stop, so Tab wraps from it');
  assert.equal(key(w, close, 'Tab', { shiftKey: true }), false);
  assert.equal(w.document.activeElement, r1);
});

test('modal panel: focus that lands outside the panel while it is open comes back into it', () => {
  const { w, p, close, outside } = modal('<button id="a">A</button>');
  p.open();
  outside.focus();
  assert.equal(w.document.activeElement, close);
});

test('modal panel: hiding it by its attribute takes the dim away; moving it while open keeps one', () => {
  const { w, p } = modal('<button>A</button>');
  p.open();
  p.hidden = true;
  assert.equal(w.document.querySelector('.sheen-panel-dim'), null);
  p.open();
  const parent = p.parentNode;
  parent.removeChild(p);
  parent.appendChild(p);
  assert.equal(w.document.querySelectorAll('.sheen-panel-dim').length, 1, 'moved while open: the dim comes back');
  assert.equal(p.previousElementSibling.classList.contains('sheen-panel-dim'), true);
});

test('side panel: an empty heading is no heading; the headed look follows a class the element sets', () => {
  const w = page('<sheen-side-panel heading=""></sheen-side-panel><sheen-side-panel heading="Filters"></sheen-side-panel>');
  const [none, headed] = w.document.querySelectorAll('sheen-side-panel');
  assert.equal(none.classList.contains('sheen-headed'), false);
  assert.equal(headed.classList.contains('sheen-headed'), true);
  headed.setAttribute('heading', '');
  assert.equal(headed.classList.contains('sheen-headed'), false);
  assert.ok(!css.includes('sheen-side-panel[heading]'), 'no rule keys on the bare attribute');
  has('sheen-side-panel.sheen-headed{padding:0}');
});

test('side panel: a panel that takes focus itself shows the keyboard ring and only drops it for a press', () => {
  has('sheen-side-panel.sheen-glass:focus:not(:focus-visible){outline:none}');
  assert.ok(!css.includes('sheen-side-panel.sheen-glass:focus{outline:none}'));
});

test('top toast: a close button keyboard users can reach, out of sight until it has focus; Esc closes the toast', () => {
  const w = page('<sheen-toaster position="top" close-label="Close"></sheen-toaster>');
  const t = w.document.querySelector('sheen-toaster');
  t.show({ title: 'Saved', tone: 'success', timeout: 0, action: { label: 'Undo', onClick() {} } });
  const close = t.querySelector('.sheen-toast-close');
  assert.ok(close && close.classList.contains('sheen-focus-only'));
  assert.equal(close.getAttribute('aria-label'), 'Close');
  const undo = t.querySelector('.sheen-link-button');
  key(w, undo, 'Escape');
  assert.equal(t.querySelector('.sheen-toast'), null, 'Esc closes it without running the action');
  has('.sheen-focus-only:not(:focus){position:absolute;inline-size:1px;block-size:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}');
});

test('menu button: a button with an icon or chevron is named by its label, so it keeps a name when compact hides the words', () => {
  const w = page('<sheen-menu-button label="Views" variant="control" icon="star" chevron compact></sheen-menu-button><sheen-menu-button label="Export"></sheen-menu-button>');
  const [views, exp] = w.document.querySelectorAll('sheen-menu-button');
  assert.equal(views.querySelector('button').getAttribute('aria-label'), 'Views');
  assert.equal(exp.querySelector('button').hasAttribute('aria-label'), false, 'a words-only button keeps its words as its name');
  views.setAttribute('label', 'Vues');
  assert.equal(views.querySelector('button').getAttribute('aria-label'), 'Vues');
});

test('forced colors: the Filters checkboxes fall back to the system checkbox', () => {
  has('@media (forced-colors:active){.sheen-filter-option input[type="checkbox"]{appearance:auto;-webkit-appearance:auto;box-shadow:none}.sheen-filter-option input[type="checkbox"]:checked::after{content:none}}');
});

test('keyboard state: a lone modifier or a shortcut key on the page is not navigation; only Tab is', () => {
  const w = page('<input id="q">');
  const root = w.document.documentElement;
  key(w, w.document.body, 'Shift');
  key(w, w.document.body, '/');
  assert.equal(root.hasAttribute('data-sheen-keyboard'), false);
  key(w, w.document.body, 'Tab', { shiftKey: true });
  assert.equal(root.hasAttribute('data-sheen-keyboard'), true);
});

test('placement: a menu wider than the room on both sides stays on screen', () => {
  const w = page('<sheen-menu-button label="Views"></sheen-menu-button>');
  Object.defineProperty(w, 'innerWidth', { value: 375, configurable: true });
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'a', label: 'A' }];
  const button = m.querySelector('button'), list = m.querySelector('[role="menu"]');
  button.getBoundingClientRect = () => ({ left: 150, right: 260, top: 50, bottom: 86, width: 110, height: 36 });
  list.getBoundingClientRect = () => ({ left: 0, right: 320, top: 0, bottom: 100, width: 320, height: 100 });
  button.click();
  const left = parseFloat(list.style.left);
  assert.ok(left >= 0 && left + 320 <= 375, `left ${left}`);
});

test('mirroring: the top toaster follows the page direction; a solid panel\'s shadow falls toward the page in Arabic, however dir is set', () => {
  assert.ok(!css.includes('[dir="rtl"] sheen-toaster[position="top"]'), 'no physical pin');
  assert.ok(min.includes(':root .sheen-solid sheen-side-panel.sheen-glass:dir(rtl),:root sheen-side-panel.sheen-solid.sheen-glass:dir(rtl){box-shadow:20px 0 60px rgba(0,0,0,.12)}'));
});

test('hidden wins over the display of the new parts too', () => {
  has(':where(.sheen-find-row,.sheen-views-row,.sheen-applied-row,.sheen-control,.sheen-control-count,.sheen-link-button,.sheen-filter-chip,.sheen-list-message,.sheen-status,sheen-menu-button,.sheen-views-end,.sheen-page-tabs,.sheen-filter-footer,.sheen-panel-foot,.sheen-status-actions,.sheen-table-foot,.sheen-pager,.sheen-page-head,.sheen-page-head-text,.sheen-page-head-actions)[hidden]{display:none!important}');
});

test('logical sizes: small buttons in the list kit use block-size', () => {
  assert.ok(min.includes(':is(.sheen-list-kit,.sheen-filter-footer,.sheen-list-message) .sheen-button.sheen-small{block-size:34px;'));
});

test('no project name in the shipped CSS', () => {
  assert.ok(!/olamop/i.test(min));
  assert.ok(!/olamop/i.test(readFileSync(new URL('../../dist/sheen-elements.js', import.meta.url), 'utf8')));
});
