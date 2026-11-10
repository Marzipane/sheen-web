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

function made(attrs, items = [{ id: 'open', label: 'Open' }], dir) {
  const w = page(`<sheen-menu-button ${attrs}></sheen-menu-button>`, dir);
  const m = w.document.querySelector('sheen-menu-button');
  m.items = items;
  return { w, m, button: m.querySelector('button'), list: m.querySelector('[role="menu"]') };
}

test('menu button: variant picks the look: the tonal button or the find row control', () => {
  assert.equal(made('label="Export"').button.className, 'sheen-button');
  assert.equal(made('label="Views" variant="control"').button.className, 'sheen-control');
  assert.equal(made('label="More" glyph="more" variant="control"').button.className, 'sheen-control');
  assert.equal(made('label="More" glyph="more"').button.className, 'sheen-icon-button', '0.5.1 glyph button unchanged');
  const { m, button } = made('label="Views"');
  m.setAttribute('variant', 'control');
  assert.equal(button.className, 'sheen-control', 'follows a variant set later');
  m.setAttribute('compact', '');
  assert.ok(button.classList.contains('sheen-compact-glyph'));
  m.removeAttribute('compact');
  assert.equal(button.classList.contains('sheen-compact-glyph'), false);
});

test('menu button: icon puts a glyph before the label, chevron one after it; the label is the text and the name', () => {
  const { button } = made('label="Views" variant="control" icon="star" chevron');
  const [lead, words, chev] = button.children;
  assert.equal(lead.getAttribute('aria-hidden'), 'true');
  assert.ok(lead.classList.contains('sheen-glyph'));
  assert.equal(words.tagName, 'SPAN');
  assert.equal(words.textContent, 'Views');
  assert.ok(chev.classList.contains('sheen-control-chevron'));
  assert.equal(chev.getAttribute('aria-hidden'), 'true');
  assert.equal(button.textContent, 'Views');
  assert.equal(button.getAttribute('aria-label'), 'Views');
});

test('menu button: a glyph button in any variant is named by its label', () => {
  const { button } = made('label="More actions" glyph="more" variant="control"');
  assert.equal(button.getAttribute('aria-label'), 'More actions');
  assert.equal(button.textContent, '');
});

test('menu button: items take a glyph and an accent tone; a plain item stays its label', () => {
  const { list } = made('label="Views"', [
    { id: 'open', label: 'Open the record', glyph: 'eye', shortcut: 'Enter' },
    { id: 'save', label: 'Save current filters as a view', hint: 'Name it', glyph: 'plus', accent: true },
    { id: 'lock', label: 'Lock account', glyph: 'lock', disabled: true, danger: true, hint: 'Needs Super admin' },
    { id: 'plain', label: 'Plain' },
  ]);
  const [open, save, lock, plain] = list.querySelectorAll('[role="menuitem"]');
  assert.equal(open.firstElementChild.tagName.toLowerCase(), 'svg');
  assert.equal(open.firstElementChild.getAttribute('aria-hidden'), 'true');
  assert.equal(open.textContent, 'Open the recordEnter');
  assert.equal(open.lastElementChild.className, 'sheen-kbd', 'the shortcut sits at the end');
  assert.ok(save.classList.contains('sheen-accent'));
  assert.equal(save.querySelector('.sheen-menu-hint').textContent, 'Name it');
  assert.equal(lock.getAttribute('aria-disabled'), 'true');
  assert.equal(lock.firstElementChild.tagName.toLowerCase(), 'svg');
  assert.equal(plain.textContent, 'Plain');
  assert.equal(plain.children.length, 0);
});

test('menu button: the new looks are in the built CSS', () => {
  for (const part of ['.sheen-control-chevron{',
    '[aria-expanded="true"]>.sheen-control-chevron{transform:rotate(180deg)}', '.sheen-menu-item>.sheen-glyph{', '.sheen-menu-item.sheen-accent,.sheen-menu-item.sheen-accent>.sheen-glyph{color:var(--sheen-accent-text)}', '.sheen-menu-item.sheen-danger>.sheen-glyph{color:var(--sheen-danger)}',
    '.sheen-control.sheen-on{']) assert.ok(css.includes(part), part);
  // a glyph button in the control look is a 36px square (a page header's •••)
  assert.match(css, /sheen-menu-button\[glyph\]>\.sheen-control\{[^}]*inline-size:36px/);
  // the chevron and words go in a narrow list kit, only the icon stays
  assert.match(css, /@container \(max-width:760px\)\{[^@]*?\.sheen-control\.sheen-compact-glyph>\.sheen-control-chevron\{display:none\}/);
  // an enabled item with a hint reads as a title over its description; an item with only a glyph keeps its weight
  assert.ok(css.includes('.sheen-menu-item:not([aria-disabled="true"]) .sheen-menu-words:has(>.sheen-menu-hint)>span:first-child{font-weight:600}'));
  // small menus are the dense app size, and their width can be set
  assert.match(css, /\.sheen-menu\{[^}]*min-inline-size:var\(--sheen-menu-min-size,180px\)/);
  assert.match(css, /sheen-menu-button\.sheen-small \.sheen-menu,[^{]*\{[^}]*font-size:13\.5px;[^}]*min-inline-size:var\(--sheen-menu-min-size,250px\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{[^}]*\.sheen-control-chevron\{transition:none\}/);
});

// WCAG contrast from the tokens in the built CSS
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }
const themes = () => [['light', tokens(css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0])], ['dark', tokens(css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0])]];

test('menu button: accent items, hints, glyphs and danger items reach WCAG AA on the menu sheet and the page, light and dark', () => {
  for (const [name, t] of themes()) {
    for (const [what, fg] of [['accent item', 'accent-text'], ['hint', 'text-tertiary'], ['glyph and control words', 'text-secondary'], ['danger item', 'danger']]) {
      for (const under of ['sheet', 'surface', 'background']) {
        const ratio = contrast(hex(t[fg]), hex(t[under]));
        assert.ok(ratio >= 4.5, `${what} on ${under} (${name}): ${ratio.toFixed(2)}`);
      }
    }
    // the applied-filters control: accent words on its 8% tint
    const share = Number(css.match(/\.sheen-control\.sheen-on\{[^}]*background:color-mix\(in srgb,var\(--sheen-accent\) (\d+)%/)[1]) / 100;
    const tint = mixed(hex(t.accent), hex(t.surface), share);
    assert.ok(contrast(hex(t.text), tint) >= 4.5, `control on, its words (${name})`);
    assert.ok(contrast(hex(t['accent-text']), tint) >= 3, `control on, its glyph (${name})`);
  }
});

test('menu button: a Views control at the end edge keeps its 320px menu on screen, lined up with its end edge, in English and Arabic', () => {
  for (const [dir, rect, left] of [['ltr', { left: 913, right: 1024 - 12 }, 1012 - 320], ['rtl', { left: 12, right: 123 }, 12]]) {
    const w = page('<div class="sheen-views-end"><sheen-menu-button label="Views" variant="control" icon="star" chevron></sheen-menu-button></div>', dir);
    const m = w.document.querySelector('sheen-menu-button');
    m.items = [{ heading: 'Last used' }, { id: 'last', label: 'Your last filters', hint: 'Restored for each list', glyph: 'clock' }];
    const button = m.querySelector('button'), list = m.querySelector('[role="menu"]');
    button.getBoundingClientRect = () => ({ ...rect, top: 220, bottom: 256, width: rect.right - rect.left, height: 36 });
    shrinking(w, list, { width: 320, height: 120 });
    button.click();
    assert.equal(list.style.left, left + 'px', dir);
    const box = list.getBoundingClientRect();
    assert.ok(box.left >= 0 && box.right <= w.innerWidth, `${dir}: on screen`);
    assert.equal(box.right - box.left, 320, `${dir}: full width`);
    assert.equal(list.style.top, '262px', `${dir}: under its button`);
  }
});

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
