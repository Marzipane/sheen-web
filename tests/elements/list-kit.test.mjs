import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');

function rowMenu() {
  const w = page('<sheen-menu-button label="Row actions" glyph="more"></sheen-menu-button>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [
    { id: 'open', label: 'Open', shortcut: 'Enter' },
    { id: 'edit', label: 'Edit', shortcut: 'E', disabled: true, hint: 'Needs edit rights' },
    { separator: true },
    { heading: 'Danger' },
    { id: 'pause', label: 'Pause', danger: true },
  ];
  return { w, m, picks: record(m, 'sheen-menu-select'), button: m.querySelector('button'), list: m.querySelector('[role="menu"]') };
}

test('menu button: an item can show its shortcut, a hint under the label, and a danger tone', () => {
  const { list } = rowMenu();
  const [open, edit, pause] = list.querySelectorAll('[role="menuitem"]');
  assert.equal(open.querySelector('.sheen-kbd').textContent, 'Enter');
  assert.equal(open.getAttribute('aria-keyshortcuts'), 'Enter');
  assert.equal(edit.querySelector('.sheen-menu-hint').textContent, 'Needs edit rights');
  assert.equal(edit.getAttribute('aria-disabled'), 'true');
  // the hint is part of the item's name, so a screen reader says why it is off
  assert.match(edit.textContent, /Edit.*Needs edit rights/);
  assert.equal(pause.classList.contains('sheen-danger'), true);
});

test('menu button: separators and headings are not items, so the arrows never stop on them', () => {
  const { w, list, button, picks } = rowMenu();
  assert.equal(list.querySelectorAll('[role="menuitem"]').length, 3);
  assert.equal(list.querySelectorAll('[role="separator"]').length, 1);
  assert.equal(list.querySelector('.sheen-menu-heading').getAttribute('role'), 'presentation');
  button.focus();
  key(w, button, 'ArrowDown');
  assert.equal(w.document.activeElement.dataset.id, 'open');
  key(w, w.document.activeElement, 'ArrowDown');
  assert.equal(w.document.activeElement.dataset.id, 'pause');
  key(w, w.document.activeElement, 'Enter');
  assert.deepEqual(picks, [{ id: 'pause' }]);
});

test('menu button: a plain item keeps its label as its only text', () => {
  const w = page('<sheen-menu-button label="Export"></sheen-menu-button>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'csv', label: 'CSV' }];
  assert.equal(m.querySelector('[role="menuitem"]').textContent, 'CSV');
});

test('list kit: every part is in the built CSS and uses logical sides only', () => {
  for (const part of ['.sheen-list-kit{', '.sheen-views-row{', '.sheen-view-tab{', '.sheen-view-tab[aria-selected="true"]{', '.sheen-find-row{',
    '.sheen-control{', '.sheen-find{', '.sheen-control-count{', '.sheen-link-button{', '.sheen-applied-row{', '.sheen-filter-chip{', '.sheen-chip-remove{',
    '.sheen-result-count{', '.sheen-filter-option{', '.sheen-filter-footer{', '.sheen-list-message{', '.sheen-sort-button{', '.sheen-sort-glyph{',
    '.sheen-table .sheen-pin-end{', '.sheen-bulk-bar{', '.sheen-bulk-count{', '.sheen-bulk-status{', '.sheen-bulk-clear{', '.sheen-menu-hint{',
    '.sheen-menu-heading{', '.sheen-menu-separator{', '.sheen-menu-item.sheen-danger{', 'sheen-menu-button.sheen-small>.sheen-button{']) {
    assert.ok(css.includes(part), part);
  }
  assert.match(css, /th\[aria-sort="descending"\] \.sheen-sort-glyph\{transform:rotate\(180deg\)\}/);
  assert.match(css, /@container \(max-width:760px\)\{[^@]*?\.sheen-applied-row\{flex-wrap:nowrap/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.sheen-spin\{animation:none\}\}/);
});

test('list kit: the row-menu column stays pinned at the end edge, the left in Arabic', () => {
  assert.match(css, /\.sheen-table \.sheen-pin-end\{position:sticky;inset-inline-end:0/);
  // a sticky cell is its own layer, so the one holding an open menu must rise above the rows after it
  assert.match(css, /\.sheen-table \.sheen-pin-end:focus-within\{z-index:2\}/);
});

// WCAG contrast of accent text on the kit's accent tints, read from the built rules, in light and dark.
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }

test('list kit: accent words on the chip, the selected tab count and the bulk bar reach WCAG AA in light and dark', () => {
  const themes = [tokens(css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0]), tokens(css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0])];
  const tint = (rule) => Number(css.match(new RegExp(rule + '\\{[^}]*background:color-mix\\(in srgb,var\\(--sheen-accent\\) (\\d+)%'))[1]) / 100;
  const parts = [['\\.sheen-filter-chip', 'surface'], ['\\.sheen-bulk-bar', 'surface'], ['\\.sheen-view-tab\\[aria-selected="true"\\] small', null]];
  for (const [rule, base] of parts) {
    const share = tint(rule);
    for (const t of themes) {
      for (const under of base ? [base] : ['surface', 'background', 'sheet']) {
        const back = mixed(hex(t.accent), hex(t[under]), share);
        const ratio = contrast(hex(t['accent-text']), back);
        assert.ok(ratio >= 4.5, `${rule} on ${under}: ${ratio.toFixed(2)}`);
      }
    }
  }
});

test('menu button: the menu is placed on the page itself, so a scrolling table cannot cut it off', () => {
  const w = page('<div style="overflow:auto"><sheen-menu-button label="Row actions"></sheen-menu-button></div>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'open', label: 'Open' }];
  const button = m.querySelector('button');
  const list = m.querySelector('[role="menu"]');
  button.getBoundingClientRect = () => ({ left: 100, right: 130, top: 50, bottom: 80, width: 30, height: 30 });
  list.getBoundingClientRect = () => ({ left: 100, right: 280, top: 86, bottom: 200, width: 180, height: 114 });
  button.click();
  assert.equal(list.style.position, 'fixed');
  assert.equal(list.style.left, '100px');
  assert.equal(list.style.top, '86px');
});

test('menu button: near the end edge it lines up with the button end, and it follows the button when the page scrolls', () => {
  const w = page('<sheen-menu-button label="Row actions"></sheen-menu-button>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'open', label: 'Open' }];
  const button = m.querySelector('button');
  const list = m.querySelector('[role="menu"]');
  button.getBoundingClientRect = () => ({ left: 990, right: 1020, top: 50, bottom: 80, width: 30, height: 30 });
  list.getBoundingClientRect = () => ({ left: 990, right: 1170, top: 86, bottom: 200, width: 180, height: 114 });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-flip'), true);
  assert.equal(list.style.left, '840px');
  button.getBoundingClientRect = () => ({ left: 990, right: 1020, top: 20, bottom: 50, width: 30, height: 30 });
  list.getBoundingClientRect = () => ({ left: 840, right: 1020, top: 56, bottom: 170, width: 180, height: 114 });
  w.dispatchEvent(new w.Event('scroll'));
  assert.equal(list.hidden, false);
  assert.equal(list.style.top, '56px');
});
