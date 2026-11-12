// 0.8.0: an input affix (a unit after the value, or a prefix before it) in the dense field, and menu buttons drawn as the
// value they set in a table cell: the cell's words (variant="text") or a status pill in its tone (variant="pill").
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);
const block = (from, to) => { const a = css.indexOf(from), b = css.indexOf(to); assert.ok(a >= 0 && b > a, from); return css.slice(a + from.length, b); };
const rules = (text) => [...text.replace(/\/\*.*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1], body: m[2] }));

// ---- part 9: the affix ----

const field = (inner, dir) => {
  const w = page(`<label class="sheen-form-field sheen-small"><span>Buffer between jobs</span><span class="sheen-affix">${inner}</span></label>`, dir);
  return { w, affix: w.document.querySelector('.sheen-affix'), input: w.document.querySelector('input'), unit: w.document.querySelector('.sheen-affix-unit') };
};

test('affix: the box is the dense field\'s: 38px, an 11px radius, its edge and background, 14px words, the unit 8px from the value', () => {
  has('.sheen-form-field.sheen-small .sheen-affix{display:flex;align-items:center;gap:max(var(--sheen-space-min),8px);min-block-size:var(--sheen-size-field);padding-inline:12px;border-radius:11px;background:var(--sheen-background);box-shadow:inset 0 0 0 1px var(--sheen-separator);font-size:14px;cursor:text}');
});

test('affix: the input inside draws no box of its own, invalid too, and takes the room the unit leaves', () => {
  has('.sheen-form-field.sheen-small .sheen-affix>.sheen-input,.sheen-form-field.sheen-small .sheen-affix>.sheen-input[aria-invalid="true"]{flex:1 1 0;min-inline-size:0;align-self:stretch;block-size:auto;padding:0;border-radius:0;background:none;box-shadow:none}');
});

test('affix: the unit is in the value\'s colour (the mockups write "14 days" in one colour), stays on one line, and a press on it goes through to the box', () => {
  has('.sheen-affix>.sheen-affix-unit{flex:none;white-space:nowrap;color:var(--sheen-text);pointer-events:none}');
});

test('affix: an invalid input rings the whole box in the danger colour; the field\'s hint still turns red', () => {
  has('.sheen-form-field.sheen-small .sheen-affix:has(>.sheen-input[aria-invalid="true"]){box-shadow:inset 0 0 0 2px var(--sheen-danger)}');
  has('.sheen-form-field.sheen-small:has(.sheen-input[aria-invalid="true"])>small{color:var(--sheen-danger)}');
});

test('affix: a text field never draws a ring, so the box around it draws none either', () => {
  const mine = rules(block('/* 0.8.0 affix */', '/* end 0.8.0 affix */'));
  assert.ok(mine.length >= 4);
  for (const r of mine) {
    assert.doesNotMatch(r.selector, /focus/, r.selector);
    assert.doesNotMatch(r.body, /outline/, r.selector);
  }
});

test('affix: logical sides only, and every rule is the affix\'s own, so a page without it sees no change', () => {
  for (const r of rules(block('/* 0.8.0 affix */', '/* end 0.8.0 affix */'))) {
    assert.match(r.selector, /\.sheen-affix/, r.selector);
    assert.doesNotMatch(r.body, /(^|[;-])(left|right|top|bottom|width|height)[:-]/, r.selector);
  }
});

test('affix: inside the field\'s label, a press on the unit lands on the input', () => {
  for (const dir of ['ltr', 'rtl']) {
    const { w, input, unit } = field('<input class="sheen-input" type="number" value="30"><span class="sheen-affix-unit">min</span>', dir);
    const pressed = record(input, 'click');
    unit.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    assert.equal(pressed.length, 1, `${dir}: the label passes the press to the input`);
  }
});

test('affix: a prefix is the same unit before the input; the kit adds no words', () => {
  const { affix, input, unit } = field('<span class="sheen-affix-unit">from</span><input class="sheen-input" type="number" value="80">');
  assert.equal(affix.firstElementChild, unit);
  assert.equal(unit.nextElementSibling, input);
  assert.equal(affix.textContent, 'from', 'the page\'s words only');
  // no order or direction tricks: the unit sits where the page puts it, and flex mirrors it in Arabic
  for (const r of rules(block('/* 0.8.0 affix */', '/* end 0.8.0 affix */'))) assert.doesNotMatch(r.body, /order:|direction:|row-reverse/, r.selector);
});

// ---- part 10: cell pickers ----

function made(attrs, items = [{ id: 'hc6', label: 'HC6' }, { id: 'hc7', label: 'HC7' }], dir) {
  const w = page(`<table class="sheen-table sheen-small"><tbody><tr><td><sheen-menu-button ${attrs}></sheen-menu-button></td></tr></tbody></table>`, dir);
  const m = w.document.querySelector('sheen-menu-button');
  m.items = items;
  return { w, m, button: m.querySelector('button'), list: m.querySelector('[role="menu"]') };
}

test('cell picker: variant="text" draws the button as the cell\'s words: the cell button, no chevron, the label as its text', () => {
  const { button, list } = made('label="HC6" variant="text"');
  assert.equal(button.className, 'sheen-cell-button');
  assert.equal(button.textContent, 'HC6');
  assert.equal(button.children.length, 0, 'no glyph, no chevron');
  assert.equal(button.getAttribute('aria-haspopup'), 'menu');
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  assert.equal(button.getAttribute('aria-controls'), list.id);
  assert.equal(button.hasAttribute('aria-label'), false, 'its words are its name');
  assert.equal(list.getAttribute('aria-label'), 'HC6');
});

test('cell picker: variant="pill" draws a status pill in its tone; another tone keeps the plain pill', () => {
  for (const tone of ['success', 'warning', 'danger']) {
    const { button } = made(`label="Active" variant="pill" tone="${tone}"`);
    assert.equal(button.className, `sheen-pill sheen-${tone}`, tone);
    assert.equal(button.textContent, 'Active');
    assert.equal(button.children.length, 0);
  }
  assert.equal(made('label="Active" variant="pill"').button.className, 'sheen-pill');
  assert.equal(made('label="Active" variant="pill" tone="loud"').button.className, 'sheen-pill', 'only the kit\'s tones');
  assert.equal(made('label="Active" variant="pill" tone="constructor"').button.className, 'sheen-pill');
  assert.equal(made('label="HC6" variant="constructor"').button.className, 'sheen-button', 'an unknown variant keeps the tonal button');
});

test('cell picker: tone, label and variant set later are followed, and the other looks stay as they were', () => {
  const { m, button, list } = made('label="Active" variant="pill" tone="success"');
  m.setAttribute('tone', 'danger');
  assert.equal(button.className, 'sheen-pill sheen-danger');
  m.setAttribute('label', 'Blocked');
  assert.equal(button.textContent, 'Blocked');
  assert.equal(list.getAttribute('aria-label'), 'Blocked');
  m.removeAttribute('tone');
  assert.equal(button.className, 'sheen-pill');
  m.setAttribute('variant', 'text');
  assert.equal(button.className, 'sheen-cell-button');
  m.setAttribute('variant', 'control');
  assert.equal(button.className, 'sheen-control');
  m.removeAttribute('variant');
  assert.equal(button.className, 'sheen-button');
  m.setAttribute('tone', 'success');
  assert.equal(button.className, 'sheen-button', 'tone only colours a pill');
});

test('cell picker: a text or pill trigger opens, moves, picks and closes with the menu button\'s own keys and focus', () => {
  for (const attrs of ['label="HC6" variant="text"', 'label="Active" variant="pill" tone="success"']) {
    const { w, m, button, list } = made(attrs);
    const picked = record(m, 'sheen-menu-select');
    button.click();
    assert.equal(button.getAttribute('aria-expanded'), 'true', attrs);
    assert.equal(list.hidden, false);
    const [first, second] = list.querySelectorAll('[role="menuitem"]');
    assert.equal(w.document.activeElement, first, 'focus on the first item');
    key(w, first, 'ArrowDown');
    assert.equal(w.document.activeElement, second);
    key(w, second, 'Enter');
    assert.deepEqual(picked, [{ id: 'hc7' }]);
    assert.equal(list.hidden, true);
    assert.equal(w.document.activeElement, button, 'focus back on the trigger');
    key(w, button, 'ArrowDown');
    assert.equal(list.hidden, false, 'ArrowDown opens it');
    key(w, w.document.activeElement, 'Escape');
    assert.equal(list.hidden, true, 'Esc closes it');
    assert.equal(button.getAttribute('aria-expanded'), 'false');
    assert.equal(w.document.activeElement, button);
  }
});

test('cell picker: the looks are in the built CSS: the pill is a button with no frame, the small pill is the table\'s 22px', () => {
  has('--sheen-size-pill-small:22px;');
  has('--sheen-size-pill-small-text:12px;');
  has('sheen-menu-button[variant="text"]>.sheen-cell-button[aria-expanded="true"]{text-decoration:underline}');
  has(':where(sheen-menu-button[variant="pill"]>.sheen-pill){border:0}');
  has('sheen-menu-button[variant="pill"]>.sheen-pill{margin:0;padding-block:0;font-family:inherit;white-space:nowrap;cursor:pointer}');
  has('sheen-menu-button[variant="pill"]>.sheen-pill:is(:hover,[aria-expanded="true"]){background-image:linear-gradient(color-mix(in srgb,currentColor 10%,transparent),color-mix(in srgb,currentColor 10%,transparent))}');
  has(':is(sheen-menu-button.sheen-small,.sheen-small sheen-menu-button)[variant="pill"]>.sheen-pill{block-size:var(--sheen-size-pill-small);font-size:var(--sheen-size-pill-small-text)}');
  // the kit's cell button and the base ring stay as they were: a thin ring only after Tab (13-app-pages)
  has('.sheen-cell-button{all:unset;cursor:pointer;');
  // (the space in ".sheen :focus-visible" goes in the squeeze above)
  has('.sheen:focus-visible{outline:2px solid var(--sheen-accent-text);outline-offset:2px}');
  for (const r of rules(block('/* 0.8.0 cell pickers */', '/* end 0.8.0 cell pickers */'))) {
    assert.match(r.selector, /\[variant="(text|pill)"\]/, r.selector);
    assert.doesNotMatch(r.body, /(^|[;-])(left|right|top|bottom|width|height)[:-]|outline/, r.selector);
  }
});

// WCAG contrast from the tokens in the built CSS
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(b) { return Object.fromEntries([...b.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }
const themes = () => [['light', tokens(css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0])], ['dark', tokens(css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0])]];

test('cell picker: a pill\'s words reach WCAG AA on its tint at rest, hovered and open, on the surface, light and dark', () => {
  const hover = Number(css.match(/\.sheen-pill:is\(:hover,\[aria-expanded="true"\]\)\{background-image:linear-gradient\(color-mix\(in srgb,currentColor (\d+)%/)[1]) / 100;
  for (const [name, t] of themes()) {
    for (const tone of ['success', 'warning', 'danger']) {
      const words = mixed(hex(t[tone]), hex(t.text), 0.8);
      const rest = mixed(hex(t[tone]), hex(t.surface), 0.16);
      const over = mixed(words, rest, hover);
      assert.ok(contrast(words, rest) >= 4.5, `${tone} at rest (${name}): ${contrast(words, rest).toFixed(2)}`);
      assert.ok(contrast(words, over) >= 4.5, `${tone} hovered (${name}): ${contrast(words, over).toFixed(2)}`);
    }
  }
});

test('affix: the unit reaches WCAG AA on the field background, light and dark', () => {
  for (const [name, t] of themes()) {
    const ratio = contrast(hex(t.text), hex(t.background));
    assert.ok(ratio >= 4.5, `${name}: ${ratio.toFixed(2)}`);
  }
});
