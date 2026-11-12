// 0.8.0 table and panel: the 440px side panel beside the dense size, small-table checkboxes that leave switches alone,
// end-aligned cells, a compact row icon button and the page header's glyph-only control. Rules read from the built CSS;
// which elements they hit is checked by matching their selectors in a page.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page } from './setup.mjs';

// whitespace collapsed only, so descendant combinators stay
const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(css.includes(part), part);
const rule = (selector) => { const i = css.indexOf(selector + '{'); assert.ok(i >= 0, selector); return css.slice(i, css.indexOf('}', i) + 1); };
const root = css.match(/:root\{[^}]*\}/)[0];

test('tokens: the wide panel, the compact icon button, its radius and its glyph', () => {
  assert.match(root, /--sheen-size-panel-wide:440px;/);
  assert.match(root, /--sheen-size-icon-button-compact:30px;/);
  assert.match(root, /--sheen-size-icon-button-compact-radius:9px;/);
  assert.match(root, /--sheen-size-icon-button-compact-glyph:18px;/);
});

test('side panel: sheen-wide gives the 440px panel from its token, at no specificity, after sheen-small', () => {
  has(':where(sheen-side-panel.sheen-wide){--sheen-panel-size:var(--sheen-size-panel-wide)}');
  // with both classes the later rule wins: the panel is 440px and keeps the dense content of sheen-small
  assert.ok(css.indexOf(':where(sheen-side-panel.sheen-wide)') > css.indexOf(':where(sheen-side-panel.sheen-small)'));
  // the panel still reads its width from --sheen-panel-size, so an app's class rule or inline value wins over both
  assert.match(css, /sheen-side-panel\.sheen-glass\{[^}]*inline-size:min\(var\(--sheen-panel-size,440px\),100vw\)/);
  assert.ok(min.includes(':where(sheen-side-panel.sheen-wide){--sheen-panel-size:var(--sheen-size-panel-wide)}'));
});

test('side panel: the element keeps both classes when it starts', () => {
  const w = page('<sheen-side-panel class="sheen-small sheen-wide" heading="Edit" label="Edit" close-label="Close"><p>Downtown</p></sheen-side-panel>');
  const panel = w.document.querySelector('sheen-side-panel');
  for (const c of ['sheen-small', 'sheen-wide', 'sheen-glass', 'sheen-headed']) assert.ok(panel.classList.contains(c), c);
  assert.ok(panel.matches('sheen-side-panel.sheen-wide'));
});

test('small tables: 16px checkboxes, but a switch keeps its own size', () => {
  const sel = '.sheen-table.sheen-small input[type="checkbox"]:where(:not([role="switch"],.sheen-switch input))';
  assert.equal(rule(sel), sel + '{inline-size:16px;block-size:16px;accent-color:var(--sheen-accent)}');
  // the rule no longer hits every checkbox in a small table
  assert.ok(!css.includes('.sheen-table.sheen-small input[type="checkbox"]{'));
  const w = page('<table class="sheen-table sheen-small"><tr><td><input type="checkbox" aria-label="Select"></td>'
    + '<td><input type="checkbox" role="switch" aria-label="Online"></td>'
    + '<td><label class="sheen-switch"><input type="checkbox" aria-label="Online"></label></td>'
    + '<td><label class="sheen-switch sheen-large"><input type="checkbox" role="switch" aria-label="Online"></label></td></tr></table>');
  const [tick, role, kit, large] = w.document.querySelectorAll('input');
  assert.equal(tick.matches(sel), true, 'a row checkbox is 16px');
  assert.equal(role.matches(sel), false, 'role="switch"');
  assert.equal(kit.matches(sel), false, 'the kit switch');
  assert.equal(large.matches(sel), false, 'the large kit switch');
});

test('table cells: sheen-end puts the words and a sort button at the end edge, mirrored in Arabic', () => {
  has('.sheen-table :is(th,td).sheen-end{text-align:end}');
  has('.sheen-table th.sheen-end .sheen-sort-button{justify-content:flex-end}');
  // .sheen-num stays tabular digits only, so number columns that don't opt in keep their place
  has('.sheen-num{font-variant-numeric:tabular-nums}');
  assert.doesNotMatch(css, /\.sheen-num\{[^}]*text-align/);
  const w = page('<table class="sheen-table sheen-small"><tr><th class="sheen-num sheen-end">Price</th><th>Name</th></tr><tr><td class="sheen-num sheen-end">30</td><td>Marina</td></tr></table>');
  const cells = w.document.querySelectorAll('th,td');
  const end = '.sheen-table :is(th,td).sheen-end';
  assert.deepEqual([...cells].map((c) => c.matches(end)), [true, false, true, false]);
});

test('compact icon button: 30px, radius 9, no fill and the secondary colour, for a row ••• and a plain icon button', () => {
  const box = '.sheen-icon-button.sheen-compact,sheen-menu-button.sheen-compact>.sheen-icon-button';
  has(box + '{inline-size:var(--sheen-size-icon-button-compact);block-size:var(--sheen-size-icon-button-compact);border-radius:var(--sheen-size-icon-button-compact-radius);background:none;color:var(--sheen-text-secondary)}');
  has(':is(.sheen-icon-button.sheen-compact,sheen-menu-button.sheen-compact>.sheen-icon-button):is(:hover,[aria-expanded="true"]){background:var(--sheen-tonal);color:var(--sheen-text)}');
  has(':is(.sheen-icon-button.sheen-compact,sheen-menu-button.sheen-compact>.sheen-icon-button)>:is(.sheen-glyph,.sheen-icon){inline-size:var(--sheen-size-icon-button-compact-glyph);block-size:var(--sheen-size-icon-button-compact-glyph)}');
  // the ring after Tab sits 1px off the button, as the mockups' row •••; a press still draws none (13-app-pages)
  has(':is(.sheen-icon-button.sheen-compact,sheen-menu-button.sheen-compact>.sheen-icon-button):focus-visible{outline-offset:1px}');
  // the menu button's box hugs its 30px button at the top of its line, so no line box adds to the row
  has('sheen-menu-button.sheen-compact{display:inline-flex;vertical-align:top}');
});

test('compact icon button: the element draws a compact row ••• from the class alone; a control or a plain icon button stays as it was', () => {
  const w = page('<sheen-menu-button class="sheen-small sheen-compact" glyph="more" label="Row actions"></sheen-menu-button>'
    + '<sheen-menu-button glyph="more" label="Row actions"></sheen-menu-button>'
    + '<sheen-menu-button class="sheen-compact" glyph="more" variant="control" label="More actions"></sheen-menu-button>'
    + '<button class="sheen-icon-button sheen-compact" aria-label="More"></button><button class="sheen-icon-button" aria-label="More"></button>');
  const box = '.sheen-icon-button.sheen-compact,sheen-menu-button.sheen-compact>.sheen-icon-button';
  const [row, plain, control] = w.document.querySelectorAll('sheen-menu-button');
  assert.ok(row.button.matches(box), 'a compact row •••');
  assert.ok(row.button.querySelector('svg.sheen-glyph'), 'with its glyph');
  assert.equal(row.button.getAttribute('aria-label'), 'Row actions');
  assert.ok(!plain.button.matches(box), 'a row ••• without the class keeps 44px');
  assert.ok(!control.button.matches(box), 'a control keeps its 36px look');
  const [own, other] = w.document.querySelectorAll('button.sheen-icon-button:not(sheen-menu-button *)');
  assert.ok(own.matches(box));
  assert.ok(!other.matches(box));
});

test('page header •••: a glyph-only control takes the font size around it, as the mockups\' header •••; box and glyph unchanged', () => {
  has('sheen-menu-button[variant="control"][glyph]>.sheen-control{font-size:inherit}');
  // the 36px square, radius 11 (the control's) and 18px glyph stay
  has('sheen-menu-button[glyph]>.sheen-control{inline-size:36px;padding-inline:0;justify-content:center}');
  has('sheen-menu-button[glyph]>.sheen-control>.sheen-glyph{inline-size:18px;block-size:18px}');
  // words on a control keep 13.5px
  has('sheen-menu-button[variant="control"]:not([glyph]){font-size:13.5px}');
  const w = page('<sheen-menu-button class="sheen-small" glyph="more" variant="control" label="More actions"></sheen-menu-button><sheen-menu-button variant="control" label="Views"></sheen-menu-button>');
  const [more, words] = w.document.querySelectorAll('sheen-menu-button');
  const sel = 'sheen-menu-button[variant="control"][glyph]>.sheen-control';
  assert.ok(more.button.matches(sel));
  assert.ok(!words.button.matches(sel));
});

// specificity of a selector without commas at its top level: [ids, classes, types]; :where counts nothing, :is and :not
// their most specific argument
function specificity(sel) {
  let s = sel, n = [0, 0, 0];
  const add = (v) => { n = n.map((x, i) => x + v[i]); };
  // split at top-level commas only
  const parts = (list) => { const out = []; let depth = 0, from = 0; [...list].forEach((c, i) => { if (c === '(') depth++; else if (c === ')') depth--; else if (c === ',' && !depth) { out.push(list.slice(from, i)); from = i + 1; } }); return [...out, list.slice(from)]; };
  for (let m; (m = s.match(/:(where|is|not|has)\(/));) {
    let depth = 1, end = m.index + m[0].length;
    for (; depth; end++) depth += s[end] === '(' ? 1 : s[end] === ')' ? -1 : 0;
    const args = s.slice(m.index + m[0].length, end - 1);
    if (m[1] !== 'where') add(parts(args).map(specificity).sort((a, b) => b[0] - a[0] || b[1] - a[1] || b[2] - a[2])[0]);
    s = s.slice(0, m.index) + ' ' + s.slice(end);
  }
  add([(s.match(/#[\w-]+/g) || []).length, (s.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g) || []).length, (s.replace(/\[[^\]]*\]/g, '').match(/(^|[\s>+~])[a-z][\w-]*/g) || []).length]);
  return n;
}
const outranks = (a, b) => { const x = specificity(a), y = specificity(b); return x[0] - y[0] || x[1] - y[1] || x[2] - y[2]; };

test('tight table: cells and sort buttons take 9px at their sides; the pinned ••• cell keeps 4px, a sortable header 0', () => {
  assert.match(root, /--sheen-size-table-tight-padding:9px;/);
  const cells = '.sheen-table.sheen-small.sheen-tight :is(th,td):where(:not(.sheen-pin-end,:has(>.sheen-sort-button)))';
  assert.equal(rule(cells), cells + '{padding-inline:var(--sheen-size-table-tight-padding)}');
  has('.sheen-table.sheen-small.sheen-tight .sheen-sort-button{padding-inline:var(--sheen-size-table-tight-padding)}');
  // over the small table's 14px cells and sort buttons; :where adds nothing, so the cells it leaves out keep their rules
  assert.ok(outranks(cells, '.sheen-table.sheen-small th') > 0);
  assert.ok(outranks(cells, '.sheen-table.sheen-small td') > 0);
  assert.deepEqual(specificity(cells), [0, 3, 1]);
  has('.sheen-table.sheen-small th:has(>.sheen-sort-button){padding:0}');
  has('.sheen-table.sheen-small .sheen-pin-end{padding-inline:4px}');
  assert.ok(outranks('.sheen-table.sheen-small.sheen-tight .sheen-sort-button', '.sheen-table.sheen-small .sheen-sort-button') > 0);
  const w = page('<table class="sheen-table sheen-small sheen-tight"><tr><th>Van</th><th aria-sort="none"><button class="sheen-sort-button">Level</button></th><th class="sheen-pin-end"></th></tr>'
    + '<tr><td>Marina</td><td class="sheen-num sheen-end">3</td><td class="sheen-pin-end"></td></tr></table>'
    + '<table class="sheen-table sheen-small"><tr><td>Marina</td></tr></table>');
  const [plain, sorted, pinHead] = w.document.querySelectorAll('.sheen-tight th');
  const [cell, num, pin] = w.document.querySelectorAll('.sheen-tight td');
  assert.deepEqual([plain, cell, num].map((c) => c.matches(cells)), [true, true, true]);
  assert.equal(sorted.matches(cells), false, 'a sortable header leaves its padding to its button');
  assert.equal(pinHead.matches(cells), false, 'the pinned header cell keeps 4px');
  assert.equal(pin.matches(cells), false, 'the pinned ••• cell keeps 4px');
  assert.equal(w.document.querySelector('table:not(.sheen-tight) td').matches(cells), false, 'a small table without the class keeps 14px');
});

test('the 0.8.0 table and panel rules use logical sides only', () => {
  const ours = css.slice(css.indexOf('/* 0.8.0 table and panel */'), css.indexOf('/* end 0.8.0 table and panel */'));
  assert.ok(ours.length > 100, 'marked block found');
  assert.doesNotMatch(ours, /(margin|padding|border)-(left|right)|[;{ ](left|right|width|height):|text-align:(left|right)/);
  assert.doesNotMatch(ours, /#[0-9a-fA-F]{3,8}\b|rgb\(/);
});
