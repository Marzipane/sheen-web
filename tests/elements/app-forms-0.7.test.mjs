// 0.7.0 app forms and sheets, ported one to one from the app mockups' CSS and the computed styles of their rendered states:
// the dense field and its grid, a select, the large switch and its row, the panel footer, the table foot, the small palette,
// the shortcuts sheet and its key caps.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(css.includes(part), part);
const hasMin = (part) => assert.ok(min.includes(part), part);

test('a dense field is a 13px label at 500 over a 38px box with an 11px radius and 14px words', () => {
  has('.sheen-form-field.sheen-small{gap:5px;font-size:13px}');
  has('.sheen-form-field.sheen-small>span:first-child{font-weight:500;color:var(--sheen-text-secondary)}');
  has('.sheen-form-field.sheen-small .sheen-input{block-size:38px;padding:6px 12px;border:0;border-radius:11px;background:var(--sheen-background);box-shadow:inset 0 0 0 1px var(--sheen-separator);font-size:14px}');
  has('.sheen-form-field.sheen-small textarea.sheen-input{block-size:auto;min-block-size:76px}');
  has('.sheen-form-field.sheen-small .sheen-input::placeholder{color:var(--sheen-text-tertiary)}');
  has('.sheen-form-field.sheen-small>small{color:var(--sheen-text-tertiary)}');
  has('.sheen-form-field.sheen-small .sheen-input[aria-invalid="true"]{box-shadow:inset 0 0 0 2px var(--sheen-danger)}');
  has('.sheen-form-field.sheen-small:has(.sheen-input[aria-invalid="true"])>small{color:var(--sheen-danger)}');
});

test('dense fields sit two to a row, 12px by 16px apart; a wide one takes the row', () => {
  has('.sheen-fields.sheen-small{gap:max(var(--sheen-space-min),12px) max(var(--sheen-space-min),16px)}');
  has('.sheen-fields>.sheen-wide{grid-column:1/-1}');
});

test('a select drawn as a field shows its value and an 18px chevron in the same box, the chevron at the end edge', () => {
  has('.sheen-select{position:relative;display:flex}');
  has('.sheen-select>select{appearance:none;-webkit-appearance:none;inline-size:100%;padding-inline-end:38px;cursor:pointer}');
  assert.match(css, /\.sheen-select::after\{content:"";position:absolute;inset-inline-end:12px;inset-block-start:50%;inline-size:18px;block-size:18px;margin-block-start:-9px;background:var\(--sheen-text-tertiary\);-webkit-mask:url\("data:image\/svg\+xml,[^"]+"\) center\/18px no-repeat;mask:url\("data:image\/svg\+xml,[^"]+"\) center\/18px no-repeat;pointer-events:none\}/);
});

test('a side panel footer holds Cancel and the main action on the panel\'s bottom edge, growing alike from 128px and wrapping when narrow', () => {
  has('.sheen-panel-foot{display:flex;flex-wrap:wrap;gap:max(var(--sheen-space-min),10px);margin-block-start:auto;padding-block-start:14px}');
  has('.sheen-panel-foot>*{flex:1 0 128px}');
  has('sheen-side-panel.sheen-headed .sheen-panel-body>:is(.sheen-filter-footer,.sheen-panel-foot){margin-block-start:auto}'.replace(' .sheen-panel-body>:is', ' .sheen-panel-body>:is'));
});

test('a long side panel keeps its footer on the bottom edge: the footer sticks to the end of the scrolling body, 20px under its buttons, opaque on a solid layer', () => {
  // the body scrolls; the footer stays at its end edge with the 20px the body used to keep under it
  has('sheen-side-panel.sheen-headed .sheen-panel-body>.sheen-panel-foot{position:sticky;inset-block-end:0;margin-inline:-20px;padding:14px 20px 20px;background:inherit}');
  has('sheen-side-panel.sheen-headed .sheen-panel-body:has(>.sheen-panel-foot){padding-block-end:0}');
  assert.ok(!css.includes('.sheen-panel-body:has(>.sheen-panel-foot){padding-block-end:20px}'));
  // on a solid layer both footers take the panel's sheet, so rows scrolling under them never show through
  has(':root .sheen-solid sheen-side-panel.sheen-glass .sheen-panel-body>:is(.sheen-filter-footer,.sheen-panel-foot),:root sheen-side-panel.sheen-solid.sheen-glass .sheen-panel-body>:is(.sheen-filter-footer,.sheen-panel-foot){background:var(--sheen-sheet)}');
});

test('a 51 by 31 switch with a 27px knob, in a row with its words; the off track keeps 3:1', () => {
  has('.sheen-switch.sheen-large input{inline-size:51px;block-size:31px;border-radius:16px}');
  has('.sheen-switch.sheen-large input::after{inset-block-start:2px;inset-inline-start:2px;inline-size:27px;block-size:27px;border-radius:14px;box-shadow:0 2px 6px rgba(0,0,0,.2)}');
  has('.sheen-switch.sheen-large input:checked::after{inset-inline-start:22px}');
  has('.sheen-switch.sheen-switch-row{display:flex;justify-content:space-between;gap:12px;min-block-size:38px;padding-block-end:8px;border-block-end:1px solid var(--sheen-separator);font-size:13px;font-weight:500;color:var(--sheen-text-secondary)}');
  // the 0.3.0 off track (text mixed in at 45%) stays: 3:1 against the panel, where the mockup's plain track is not
  has('.sheen-switch input:not(:checked){background:color-mix(in srgb,var(--sheen-text) 45%,transparent)}');
});

test('a table group row: the group\'s name over its rows, with its count as a pill', () => {
  has('.sheen-table tr.sheen-table-group>th{padding:14px 14px 6px;font-size:13px;font-weight:700;color:var(--sheen-text);text-align:start;background:none;border-block-start:1px solid var(--sheen-separator)}');
  has('.sheen-table tr.sheen-table-group small{margin-inline-start:6px;padding:1px 6px;border-radius:8px;background:var(--sheen-track);color:var(--sheen-text-secondary);font-size:11px;font-weight:600;font-variant-numeric:tabular-nums}');
});

test('a table footer with the count at the start and a pager at the end; 18px arrows 6px apart that mirror in Arabic', () => {
  has('.sheen-table-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 14px;font-size:12.5px;color:var(--sheen-text-secondary);border-block-start:1px solid var(--sheen-separator)}');
  has('.sheen-pager{display:inline-flex;align-items:center;gap:6px}');
  // 24px buttons: the mockup draws bare 18px glyphs; a button keeps the 24px target WCAG 2.5.8 asks for
  has('.sheen-pager button{inline-size:24px;block-size:24px;display:inline-grid;place-items:center;padding:0;border:0;border-radius:8px;background:none;color:var(--sheen-text-secondary);cursor:pointer}');
  has('.sheen-pager:is(.sheen-icon,.sheen-glyph){inline-size:18px;block-size:18px}');
  has('.sheen-pager b{font-weight:700;color:var(--sheen-text);font-variant-numeric:tabular-nums}');
  hasMin('[dir="rtl"] .sheen-pager svg{transform:scaleX(-1)}');
});

test('the small command palette is a 560px box with a 36px search field, 36px rows, 18px glyphs and plain key caps', () => {
  has('sheen-command-palette.sheen-small .sheen-cmd{inline-size:min(560px,calc(100vw - 32px));padding:10px;gap:10px;border-radius:20px;margin-block-start:14vh}');
  has('sheen-command-palette.sheen-small .sheen-cmd-head{block-size:36px;padding:0 12px;gap:7px;border:0;border-radius:11px;box-shadow:inset 0 0 0 1px var(--sheen-separator);font-size:13.5px}');
  has('sheen-command-palette.sheen-small .sheen-cmd-head>.sheen-glyph{inline-size:15px;block-size:15px}');
  assert.match(css, /sheen-command-palette\.sheen-small \.sheen-cmd-head\{[^}]*font-size:13\.5px/);
  has('sheen-command-palette.sheen-small .sheen-cmd-input{font-size:13.5px}');
  has('sheen-command-palette.sheen-small .sheen-cmd-list{display:flex;flex-direction:column;gap:1px;padding:0;max-block-size:340px}');
  has('sheen-command-palette.sheen-small .sheen-cmd-group{padding:8px 10px 4px;font-size:11.5px;letter-spacing:.06em}');
  has('sheen-command-palette.sheen-small .sheen-cmd-row{min-block-size:36px;padding:6px 10px;gap:10px;border-radius:10px;font-size:13.5px}');
  has('sheen-command-palette.sheen-small .sheen-cmd-row .sheen-glyph{inline-size:18px;block-size:18px;color:inherit}');
  has('sheen-command-palette.sheen-small .sheen-cmd-row[aria-selected="true"]{background:var(--sheen-tonal)}');
  hasMin(':root .sheen-solid sheen-command-palette.sheen-small .sheen-cmd.sheen-glass{box-shadow:0 0 0 1px var(--sheen-separator),0 24px 60px rgba(16,20,30,.22)}');
});

test('a small dialog 720px wide; the shortcuts in three columns of keys and words, one column when narrow', () => {
  has('.sheen-dialog.sheen-small{display:flex;flex-direction:column;gap:max(var(--sheen-space-min),10px);inline-size:min(720px,calc(100vw - 32px));padding:20px;border-radius:20px;background:var(--sheen-surface);box-shadow:0 0 0 1px var(--sheen-separator),0 24px 60px rgba(16,20,30,.22)}');
  has('.sheen-dialog.sheen-small:not([open]){display:none}');
  has('.sheen-dialog.sheen-small .sheen-dialog-head{padding:18px 20px 6px;justify-content:space-between}');
  has('.sheen-dialog.sheen-small .sheen-dialog-head>:first-child{font-size:22px;line-height:1.2;letter-spacing:-.022em}');
  has('.sheen-dialog.sheen-small .sheen-dialog-body{padding:0}');
  has('.sheen-shortcuts.sheen-small{display:grid;grid-template-columns:repeat(3,auto);gap:14px}');
  has('.sheen-shortcuts.sheen-small ul{display:grid;grid-template-columns:max-content 1fr;column-gap:10px;row-gap:8px;align-items:center;align-content:start;margin:0;padding:0;list-style:none;font-size:13px}');
  has('.sheen-shortcuts.sheen-small li{display:contents}');
  has('.sheen-shortcuts.sheen-small li.sheen-shortcuts-head{display:block;grid-column:1/-1;padding:8px 10px 4px;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--sheen-text-tertiary)}');
  has('.sheen-keys{display:inline-flex;gap:3px}');
  has('.sheen-shortcuts-note{margin:0;font-size:12px;color:var(--sheen-text-tertiary)}');
  assert.match(css, /@media \(max-width:760px\)\{\.sheen-shortcuts\.sheen-small\{grid-template-columns:1fr\}\}/);
});

test('alert: a warning triangle glyph for error states', () => {
  const w = page('');
  assert.ok(w.sheenElements.glyphNames().includes('alert'));
  const svg = w.sheenElements.glyph('alert', 25);
  assert.equal(svg.getAttribute('stroke'), 'currentColor');
  assert.match(svg.innerHTML, /M12 4 21 19\.5H3Z/);
});

test('the new form and sheet rules use logical sides only', () => {
  const ours = css.slice(css.indexOf('/* 0.7.0 app forms */'), css.indexOf('/* end 0.7.0 app forms */'));
  assert.ok(ours.length > 100, 'marked block found');
  assert.doesNotMatch(ours, /(margin|padding|border)-(left|right)|[;{](left|right):|text-align:(left|right)/);
});

// WCAG contrast from the tokens in the built CSS
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }

test('forms and sheets reach WCAG AA in light and dark: labels, hints, placeholders, the group pill, the footer count', () => {
  for (const [name, block] of [['light', css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0]], ['dark', css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0]]]) {
    const t = tokens(block);
    for (const [what, fg, under] of [['field label', 'text-secondary', 'sheet'], ['field words', 'text', 'background'], ['placeholder and hint', 'text-tertiary', 'background'],
      ['hint on the panel', 'text-tertiary', 'sheet'], ['group name', 'text', 'surface'], ['footer count', 'text-secondary', 'surface'], ['key cap', 'text-tertiary', 'surface']]) {
      assert.ok(contrast(hex(t[fg]), hex(t[under])) >= 4.5, `${what} (${name})`);
    }
    assert.ok(contrast(hex(t['text-secondary']), hex(t.track)) >= 4.5, `group count on its pill (${name})`);
    const off = mixed(hex(t.text), hex(t.sheet), 0.45);
    assert.ok(contrast(off, hex(t.sheet)) >= 3, `switch off track on the panel (${name})`);
  }
});
