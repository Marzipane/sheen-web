// 0.8.0 action buttons and the confirm sheet, ported one to one from the app mockups' action kit: a danger button for a
// step that takes something away, an extra small button for a bulk bar's actions, and a confirm sheet 440px wide near
// the top of the window with 34px buttons.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page } from './setup.mjs';
import { readFileSync } from 'node:fs';

const raw = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8');
const squeeze = (s) => s.replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const css = squeeze(raw);
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const tokens = JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8'));
const has = (part) => assert.ok(css.includes(squeeze(part)), part);
// the body of the first rule with exactly this selector
const body = (sel) => {
  const s = squeeze(sel) + '{';
  for (let at = css.indexOf(s); at >= 0; at = css.indexOf(s, at + 1)) if ('}/ '.includes(css[at - 1])) return css.slice(at + s.length, css.indexOf('}', at));
  assert.fail('no rule ' + sel);
};
const floor = (v) => `max(var(--sheen-space-min),${v})`;
// this part's own rules, from its file marker to the next one
const own = (() => {
  const at = raw.indexOf('/* 18-actions.css */');
  if (at < 0) return '';
  const next = /\n\/\* \d+-[\w-]+\.css \*\/\n/g; next.lastIndex = at + 1;
  const end = next.exec(raw);
  return raw.slice(at, end ? end.index : undefined).replace(/\/\*[\s\S]*?\*\//g, '');
})();
test('the part is built into dist/sheen.css', () => assert.ok(own.trim().length > 0, 'dist/sheen.css has 18-actions.css'));

// WCAG contrast, as the list kit tests it
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }

// ---- part 3: danger button

test('danger button: the fill of a deal, white words, on the tonal button', () => {
  has('.sheen-button.sheen-danger{background:var(--sheen-deal-fill);color:var(--sheen-on-accent)}');
  // it comes after the accent fill, so a button with both classes draws danger
  assert.ok(css.indexOf('.sheen-button.sheen-danger{') > css.indexOf('.sheen-button.sheen-glass-prominent,.sheen-icon-button.sheen-glass-prominent{'));
});

test('danger button: a press-ready hover darkens the fill; a disabled one keeps the kit\'s faded look and no hover', () => {
  has('.sheen-button.sheen-danger:hover:not([disabled],[aria-disabled="true"]){filter:brightness(.94)}');
  has('.sheen-button[disabled],.sheen-button[aria-disabled="true"]{opacity:.45;cursor:not-allowed}');
  assert.doesNotMatch(own, /opacity|cursor/);
});

test('danger button: white words keep 4.5:1 on the fill in light and dark, resting and hovered', () => {
  const factor = Number(/\.sheen-button\.sheen-danger:hover[^{]*\{filter:brightness\(([\d.]+)\)\}/.exec(css)[1]);
  assert.ok(factor <= 1, 'the hover never lightens the fill under white words');
  for (const theme of ['light', 'dark']) {
    const t = tokens.color[theme];
    const fill = hex(t.dealFill), words = hex(t.onAccent);
    const rest = contrast(words, fill);
    const hover = contrast(words, fill.map((v) => Math.min(1, v * factor)));
    assert.ok(rest >= 4.5, `${theme} resting ${rest.toFixed(2)}`);
    assert.ok(hover >= 4.5, `${theme} hovered ${hover.toFixed(2)}`);
  }
});

test('danger button: the part adds no focus look of its own, so the kit\'s keyboard-only ring applies', () => {
  assert.doesNotMatch(own, /:focus|autofocus|outline/);
});

// ---- part 8: an extra small button for a bulk bar

test('extra small button: a 32px token, half of it as the radius, 12px sides, 13px words, 6px between glyph and words', () => {
  assert.equal(tokens.size.buttonXsmall, 32);
  assert.ok(min.includes('--sheen-size-button-xsmall:32px;'));
  has('.sheen-button.sheen-xsmall,sheen-menu-button.sheen-xsmall>.sheen-button{block-size:var(--sheen-size-button-xsmall);border-radius:calc(var(--sheen-size-button-xsmall) / 2);padding-inline:12px;gap:6px;font-size:13px}');
  has(':is(.sheen-button.sheen-xsmall,sheen-menu-button.sheen-xsmall>.sheen-button) :is(.sheen-glyph,.sheen-icon){inline-size:14px;block-size:14px}');
});

test('extra small button: a menu button with the class makes its own button extra small, glyph and chevron too', () => {
  const w = page('<div class="sheen-bulk-bar"><span class="sheen-bulk-actions"><button class="sheen-button sheen-xsmall">Send</button><sheen-menu-button class="sheen-xsmall" label="More actions" chevron></sheen-menu-button></span></div>');
  const inner = w.document.querySelector('sheen-menu-button>button');
  assert.ok(inner.matches('sheen-menu-button.sheen-xsmall>.sheen-button'));
  assert.ok(inner.querySelector('.sheen-glyph').matches(':is(.sheen-button.sheen-xsmall,sheen-menu-button.sheen-xsmall>.sheen-button) :is(.sheen-glyph,.sheen-icon)'));
  assert.ok(w.document.querySelector('.sheen-bulk-actions>button').matches('.sheen-button.sheen-xsmall'));
});

test('extra small button: its rule outweighs the bulk bar\'s small menu button, and its glyph rule the menu button\'s 18px glyph', () => {
  // sheen-menu-button.sheen-xsmall>.sheen-button (0,2,2) over .sheen-bulk-bar sheen-menu-button>.sheen-button (0,2,1)
  // and the glyph rule (0,3,1) over sheen-menu-button>.sheen-button>.sheen-glyph (0,2,1), both later in the file
  assert.ok(css.indexOf('sheen-menu-button.sheen-xsmall>.sheen-button{') > css.indexOf('.sheen-bulk-bar sheen-menu-button>.sheen-button,'));
  assert.ok(css.indexOf(':is(.sheen-button.sheen-xsmall,') > css.indexOf('sheen-menu-button>.sheen-button>.sheen-glyph{'));
});

test('extra small button: a page that does not opt in keeps the 0.7 sizes, bulk bar included', () => {
  has('.sheen-button.sheen-small,sheen-menu-button.sheen-small>.sheen-button,.sheen-small sheen-menu-button>.sheen-button,.sheen-bulk-bar sheen-menu-button>.sheen-button,.sheen-views-end sheen-menu-button>.sheen-button{height:40px;border-radius:20px;padding-inline:16px;font-size:14.5px}');
  has('sheen-menu-button>.sheen-button>.sheen-glyph{inline-size:18px;block-size:18px;flex:none}');
  // every selector of this part names its own class
  for (const sel of own.match(/[^{}]+(?=\{)/g)) assert.match(sel, /sheen-(danger|xsmall|confirm)/, sel.trim());
});

// ---- part 11: the confirm sheet

test('confirm sheet: the small dialog 440px wide (a token), 14% down the window, never taller than the room under that', () => {
  assert.equal(tokens.size.confirm, 440);
  assert.ok(min.includes('--sheen-size-confirm:440px;'));
  has('.sheen-dialog.sheen-small.sheen-confirm{inline-size:min(var(--sheen-size-confirm),calc(100vw - 32px));margin-block-start:14vh;max-block-size:calc(100dvh - 14vh - var(--sheen-space-l))}');
  // the small dialog it builds on: a column 10px apart, 20px in, 20px corners, the surface
  const small = body('.sheen-dialog.sheen-small');
  for (const part of ['display:flex;flex-direction:column;', `gap:${floor('10px')}`, 'padding:20px;border-radius:20px;background:var(--sheen-surface);']) assert.ok(small.includes(part), part);
});

test('confirm sheet: the question, the record, the words and the buttons stack 10px apart with no padding of their own', () => {
  has('.sheen-dialog.sheen-small.sheen-confirm :is(.sheen-dialog-head,.sheen-dialog-body,.sheen-dialog-foot){padding:0}');
  has('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-body{display:flex;flex-direction:column;gap:inherit}');
  // the body's gap already keeps the minimum, so the kit's margin between two boxes (21-space, no specificity) stays
  // out; at one class, so a page's own margin still wins
  has(':where(.sheen-dialog.sheen-small.sheen-confirm) .sheen-dialog-body>*{margin-block:0}');
  // the question keeps the small dialog's 22px title
  has('.sheen-dialog.sheen-small .sheen-dialog-head>:first-child{font-size:22px;line-height:1.2;letter-spacing:-.022em}');
});

test('confirm sheet: the record is a tag that hugs its words; the words under it are 13.5px and secondary', () => {
  has('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-body>.sheen-pill{align-self:flex-start;block-size:auto;padding:3px 10px;border-radius:8px;font-weight:600;color:var(--sheen-text)}');
  has('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-body>p{font-size:13.5px}');
  // the colour at no specificity, so the high-contrast .sheen-secondary (06-access) still wins on the same words
  has(':where(.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-body>p){color:var(--sheen-text-secondary)}');
});

test('confirm sheet: the buttons sit at the end 8px apart, 6px more below the words, 34px tall (a token)', () => {
  assert.equal(tokens.size.confirmButton, 34);
  assert.ok(min.includes('--sheen-size-confirm-button:34px;'));
  // 8px is the minimum gap itself, floored at the token like every kit gap between boxes
  has(`.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-foot{gap:${floor('8px')};margin-block-start:6px}`);
  has('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-foot .sheen-button{block-size:var(--sheen-size-confirm-button);border-radius:calc(var(--sheen-size-confirm-button) / 2);padding-inline:16px;font-size:14.5px}');
  // the foot keeps the base dialog's end alignment and wrap
  assert.ok(body('.sheen-dialog-foot').startsWith('display:flex;justify-content:flex-end;flex-wrap:wrap;'));
});

test('confirm sheet: the markup an app writes picks up every rule', () => {
  const w = page(`<dialog class="sheen-dialog sheen-small sheen-confirm" role="alertdialog" aria-labelledby="q" aria-describedby="s">
    <div class="sheen-dialog-head"><h2 id="q">Take this item offline?</h2></div>
    <div class="sheen-dialog-body"><span class="sheen-pill">A1</span><p id="s">Its jobs move to the next one.</p></div>
    <div class="sheen-dialog-foot"><button class="sheen-button sheen-small">Keep it</button><button class="sheen-button sheen-small sheen-danger">Take offline</button></div>
  </dialog>`);
  const d = w.document;
  assert.ok(d.querySelector('dialog').matches('.sheen-dialog.sheen-small.sheen-confirm'));
  assert.ok(d.querySelector('.sheen-pill').matches('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-body>.sheen-pill'));
  assert.ok(d.querySelector('p').matches('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-body>p'));
  for (const b of d.querySelectorAll('.sheen-dialog-foot button')) assert.ok(b.matches('.sheen-dialog.sheen-small.sheen-confirm .sheen-dialog-foot .sheen-button'));
  assert.ok(d.querySelector('.sheen-danger').matches('.sheen-button.sheen-danger'));
  // no button asks for the first focus: the app puts it on the safe one
  assert.equal(d.querySelector('[autofocus]'), null);
});

test('the part mirrors in Arabic: logical sides only, colours only from tokens', () => {
  assert.doesNotMatch(own, /\b(left|right|top|bottom|width|height)\s*:/);
  assert.doesNotMatch(own, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
});
