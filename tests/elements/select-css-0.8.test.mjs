// 0.8.0 <sheen-select>, its look: the dense field and the Filters panel control, the list in the top layer with its
// options, groups, hints, check marks, search box and empty line, the chips and the clear button, light and dark, Arabic.
// Values from the app mockups' CSS (the dense field, the Filters panel control, the menu box, its option rows, check
// boxes and headings); where a rule is the same as an existing kit rule, the select joins that rule's selector list.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page } from './setup.mjs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const own = readFileSync(new URL('../../src/css/16-select.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);
// every rule of the built CSS as [selector, body], @media blocks opened up
const rules = [...css.replace(/\/\*.*?\*\//g, '').replace(/@media[^{]*\{((?:[^{}]*\{[^}]*\})*)\}/g, '$1').matchAll(/([^{}]+)\{([^}]*)\}/g)].map((m) => [m[1].trim(), m[2]]);
const ruleOf = (sel) => rules.filter(([s]) => s.split(/,(?![^(]*\))/).includes(sel)).map(([, b]) => b).join(';');

// the DOM the element draws, as the contract shows it, for selector checks in jsdom
const DRAWN = (multiple) => `<sheen-select ${multiple ? 'data-multiple ' : ''}data-chosen>
  <select class="sheen-select-native" tabindex="-1" aria-hidden="true"${multiple ? ' multiple' : ''}><option value="b" selected>Al Barsha</option><option value="m">Marina</option></select>
  <button type="button" class="sheen-select-trigger" role="combobox" aria-expanded="true"><span class="sheen-select-value">Al Barsha</span></button>
  <button type="button" class="sheen-select-clear" tabindex="-1" aria-label="Clear"></button>
  <svg class="sheen-glyph sheen-select-chevron" aria-hidden="true"></svg>
  <div class="sheen-select-pop sheen-menu sheen-glass" id="pop">
    <div class="sheen-select-search"><svg class="sheen-glyph"></svg><input type="text" class="sheen-select-input" placeholder="Search"></div>
    <div class="sheen-select-list" role="listbox" id="list"${multiple ? ' aria-multiselectable="true"' : ''}>
      <div class="sheen-select-group" role="group"><div class="sheen-menu-heading sheen-select-heading" role="presentation">North</div>
        <div class="sheen-select-option sheen-active" role="option" id="o1" aria-selected="true"><span class="sheen-select-check" aria-hidden="true"></span>
          <span class="sheen-select-words"><span class="sheen-select-label">Al Barsha</span><small class="sheen-select-hint">2 vans</small></span></div>
        <div class="sheen-select-option" role="option" id="o2" aria-selected="false"><span class="sheen-select-check" aria-hidden="true"></span>
          <span class="sheen-select-words"><span class="sheen-select-label">Marina</span></span></div>
      </div>
    </div>
    <div class="sheen-select-empty" hidden>No matches</div>
  </div>
</sheen-select>`;

test('the select uses the shared field and control tokens and adds its own chip and clear sizes', () => {
  // the dense field's 38px and the control's 36px are one token each, shared with the date field and the affix
  for (const [k, v] of [['field', 38], ['control', 36], ['select-chip', 24], ['select-clear', 24]]) {
    has(`--sheen-size-${k}:${v}px;`);
    assert.ok(own.includes(`var(--sheen-size-${k})`), `16-select.css uses --sheen-size-${k}`);
  }
  const tokens = JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8'));
  assert.deepEqual([tokens.size.field, tokens.size.control, tokens.size.selectChip, tokens.size.selectClear], [38, 36, 24, 24]);
  assert.equal(tokens.size.selectField, undefined, 'no second token for the same field height');
});

test('the field is the dense field: at least 38px, an 11px radius, the page background, a hairline, 14px words, 8px apart', () => {
  has('sheen-select{position:relative;display:flex;align-items:center;gap:max(var(--sheen-space-min),8px);min-inline-size:0;min-block-size:var(--sheen-size-field);padding:6px 12px;border-radius:11px;background:var(--sheen-background);box-shadow:inset 0 0 0 1px var(--sheen-separator);color:var(--sheen-text);cursor:pointer;box-sizing:border-box}');
  has('.sheen-select-trigger{flex:1;min-inline-size:0;align-self:stretch;display:flex;align-items:center;margin:0;padding:0;border:0;background:none;color:inherit;font:inherit;font-size:14px;text-align:start;cursor:inherit}');
  has('.sheen-select-value,.sheen-select-placeholder{flex:1;min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}');
  assert.match(ruleOf('.sheen-select-placeholder'), /color:var\(--sheen-text-tertiary\)/);
  // the chevron: 18px in the tertiary text colour at the end edge, never in the way of a press
  has('.sheen-select-chevron{inline-size:18px;block-size:18px;color:var(--sheen-text-tertiary);pointer-events:none}');
  // without the script the native select shows as it is: no box around it
  has('sheen-select:not(:defined){display:contents}');
});

test('an invalid select rings red like the dense field, and so does the hint under it', () => {
  assert.match(ruleOf('sheen-select:has(>.sheen-select-trigger[aria-invalid="true"])'), /^box-shadow:inset 0 0 0 2px var\(--sheen-danger\)$/);
  assert.match(ruleOf('.sheen-form-field.sheen-small:has(.sheen-select-trigger[aria-invalid="true"])>small'), /^color:var\(--sheen-danger\)$/);
});

test('variant="control" is the Filters panel control: 36px on the surface, 13.5px at 500, the value bold, a 15px secondary chevron', () => {
  has('sheen-select[variant="control"]{min-block-size:var(--sheen-size-control);background:var(--sheen-surface)}');
  has('sheen-select[variant="control"]>.sheen-select-trigger{font-size:13.5px;font-weight:500;line-height:1.2}');
  has('sheen-select[variant="control"] .sheen-select-value{font-weight:700}');
  assert.equal(ruleOf('sheen-select[variant="control"]>.sheen-select-chevron'), 'inline-size:15px;block-size:15px;flex:none;color:var(--sheen-text-secondary)');
  // an open control takes the tonal fill, as every open control (0.7.0)
  assert.equal(ruleOf('sheen-select[variant="control"][data-open]'), 'background:var(--sheen-tonal)');
});

test('open draws no ring and no glow; the chevron turns 180 degrees, at once with less motion', () => {
  for (const [sel, body] of rules.filter(([s]) => s.includes('[data-open]'))) {
    assert.ok(!/outline|box-shadow/.test(body), `${sel} draws no ring or glow`);
  }
  assert.equal(ruleOf('sheen-select[data-open]>.sheen-select-chevron'), 'transform:rotate(180deg)');
  assert.match(ruleOf('.sheen-select-chevron'), /transition:transform var\(--sheen-motion-snappy\)/);
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{[^}]*\.sheen-select-chevron[,{][^}]*transition:none\}/);
});

test('the field rings only while the keyboard navigates, around the field; the trigger draws none of its own', () => {
  assert.equal(ruleOf('sheen-select:has(>.sheen-select-trigger:focus-visible)'), 'outline:2px solid var(--sheen-accent-text);outline-offset:2px');
  assert.match(css, /@media not \(forced-colors:active\)\{[^@]*:root\[data-sheen-focus\]:not\(\[data-sheen-keyboard\]\) sheen-select:has\(>\.sheen-select-trigger:focus-visible\)[,{][^}]*outline:none/);
  assert.equal(ruleOf('.sheen-select-trigger:focus-visible'), 'outline:none');
});

test('a disabled select is faint and not allowed', () => {
  assert.equal(ruleOf('sheen-select[data-disabled]'), 'opacity:.45;cursor:not-allowed');
});

test('the native select stays in the form, out of sight and out of the way', () => {
  has('sheen-select>.sheen-select-native,sheen-lookup>.sheen-select-native{position:absolute;inset-block-end:0;inset-inline-start:0;inline-size:1px;block-size:1px;margin:0;padding:0;border:0;opacity:0;overflow:hidden;clip-path:inset(50%);pointer-events:none}');
});

test('inside a glass .sheen-field the native select stays hidden: its rule outranks the field\'s reset of its select', () => {
  // .sheen-field select{all:unset;…;width:100%} (0,1,1) would put the native select back on the page at full width and
  // leave the trigger no room; the native rule matches it at the same specificity and comes later, so it wins.
  const field = css.indexOf('.sheen-field input,.sheen-field select,.sheen-field textarea{all:unset');
  const native = css.indexOf('sheen-select>.sheen-select-native,sheen-lookup>.sheen-select-native{position:absolute');
  assert.ok(field >= 0 && native >= 0, 'both rules are in the built CSS');
  assert.ok(native > field, 'the native rule comes after the field rule');
  assert.ok(!/(^|[}\s,])\.sheen-select-native\{/.test(css), 'no rule left at one class only, which the field rule would beat');
});

test('the list box is a small menu: 16px radius, 6px padding, 4px gaps, at least the field wide, at most the screen', () => {
  has('.sheen-select-pop{display:flex;flex-direction:column;gap:max(var(--sheen-space-min),4px);min-inline-size:min(var(--sheen-select-anchor-size,0px),calc(100vw - 16px));max-inline-size:calc(100vw - 16px);max-block-size:none;overflow:hidden;border-radius:16px;color:var(--sheen-text);font-size:13.5px;font-weight:400;white-space:normal;text-align:start;cursor:default}');
  assert.match(ruleOf('.sheen-menu'), /padding:6px/);
  // the options scroll inside min(320px, 60vh); the search box stays on top
  has('.sheen-select-list{display:flex;flex-direction:column;gap:1px;min-block-size:0;max-block-size:min(320px,60vh);overflow-y:auto;overscroll-behavior:contain}');
  has('.sheen-select-pop:has(>.sheen-select-empty:not([hidden]))>.sheen-select-list{display:none}');
});

test('the list is styled by its own classes, never by where it sits, so the top layer changes nothing', () => {
  for (const [sel] of rules) for (const one of sel.split(/,(?![^(]*\))/)) {
    if (!/\.sheen-select-(pop|list|option|group|search|empty)/.test(one)) continue;
    const start = one.replace(/^:root /, '').replace(/^\[dir="rtl"\] /, '');
    assert.ok(/^(\.sheen-select-|\[aria-(multiselectable|selected)|:where\(\.sheen-select-)/.test(start), `${one} starts at the list's own classes`);
  }
});

test('the list takes the menu box look: the glass in each theme, the opaque surface under .sheen-solid', () => {
  // no rule of the select paints the box, so the glass and solid layers decide
  for (const [sel, body] of rules.filter(([s]) => /\.sheen-select-pop(?![-\w])/.test(s))) {
    assert.ok(!/background|backdrop-filter/.test(body), `${sel} leaves the surface to the menu look`);
  }
  // (the test's whitespace folding drops the space before ":is")
  has(':root .sheen-solid:is(.sheen-menu.sheen-glass,.sheen-cmd.sheen-glass){background:var(--sheen-surface);');
  const w = page(`<div class="sheen-solid">${DRAWN(false)}</div>`);
  assert.ok(w.document.getElementById('pop').matches(':root .sheen-solid :is(.sheen-menu.sheen-glass,.sheen-cmd.sheen-glass)'));
});

test('an option is a 36px row with a 10px radius; the active one and the hovered one take the tonal fill, never a ring', () => {
  assert.equal(ruleOf('.sheen-select-option'), 'display:flex;align-items:center;gap:10px;min-block-size:36px;padding:6px 10px;border-radius:10px;font-size:13.5px;cursor:pointer');
  assert.equal(ruleOf('.sheen-select-option.sheen-active'), 'background:var(--sheen-tonal)');
  assert.equal(ruleOf('.sheen-select-option:not([aria-disabled="true"]):hover'), 'background:var(--sheen-tonal)');
  assert.equal(ruleOf('.sheen-select-option[aria-selected="true"]'), 'background:color-mix(in srgb,var(--sheen-accent) 10%,transparent);font-weight:600');
  // the active option on a chosen row: the tonal fill over the chosen tint
  has('.sheen-select-option[aria-selected="true"]:is(.sheen-active,:hover){background:linear-gradient(var(--sheen-tonal),var(--sheen-tonal)),color-mix(in srgb,var(--sheen-accent) 10%,transparent)}');
  assert.match(ruleOf('.sheen-select-option[aria-disabled="true"]'), /^opacity:\.45;cursor:not-allowed$/);
  for (const [sel, body] of rules.filter(([s]) => s.includes('.sheen-select-option'))) assert.ok(!/outline:[^n]/.test(body), `${sel} draws no ring`);
  // the label and a smaller hint under it
  assert.equal(ruleOf('.sheen-select-words'), 'display:flex;flex-direction:column;flex:1;min-inline-size:0');
  has('.sheen-select-label{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}');
  has('.sheen-select-hint{font-size:12px;font-weight:400;color:var(--sheen-text-tertiary)}');
  has('.sheen-select-group{display:flex;flex-direction:column;gap:1px}');
});

test('hidden options, groups, the clear button and the empty line leave the list', () => {
  has(':where(.sheen-select-option,.sheen-select-group,.sheen-select-clear,.sheen-select-empty,.sheen-select-chips,.sheen-select-search)[hidden]{display:none!important}');
  has('.sheen-select-empty{display:flex;align-items:center;min-block-size:36px;padding:6px 10px;color:var(--sheen-text-tertiary)}');
});

test('a multiple list draws an 18px box with a 5px radius, filled in the accent with the 0.7 tick when chosen', () => {
  assert.equal(ruleOf('.sheen-select-check'), 'inline-size:18px;block-size:18px;margin:0;accent-color:var(--sheen-accent);flex:none;display:inline-grid;place-content:center');
  assert.match(ruleOf('[aria-multiselectable="true"] .sheen-select-check'), /border-radius:5px;box-shadow:inset 0 0 0 1\.5px var\(--sheen-text-tertiary\)/);
  assert.equal(ruleOf('[aria-multiselectable="true"] [aria-selected="true"]>.sheen-select-check'), 'background:var(--sheen-accent);box-shadow:none');
  assert.equal(ruleOf('[aria-selected="true"]>.sheen-select-check::after'), 'content:"";inline-size:9px;block-size:5px;border-inline-start:2px solid var(--sheen-on-accent);border-block-end:2px solid var(--sheen-on-accent);transform:translateY(-1px) rotate(-45deg)');
  const w = page(DRAWN(true));
  assert.ok(w.document.querySelector('#o1 .sheen-select-check').matches('[aria-multiselectable="true"] [aria-selected="true"]>.sheen-select-check'));
  assert.ok(!w.document.querySelector('#o2 .sheen-select-check').matches('[aria-multiselectable="true"] [aria-selected="true"]>.sheen-select-check'));
});

test('a single list draws no box, only the tick in the accent text colour on the chosen row', () => {
  has('.sheen-select-list:not([aria-multiselectable="true"]) .sheen-select-check::after{border-color:var(--sheen-accent-text)}');
  const w = page(DRAWN(false));
  const check = w.document.querySelector('#o1 .sheen-select-check');
  assert.ok(!check.matches('[aria-multiselectable="true"] .sheen-select-check'), 'no box');
  assert.ok(check.matches('[aria-selected="true"]>.sheen-select-check'), 'the chosen row ticks');
  assert.ok(!w.document.querySelector('#o2 .sheen-select-check').matches('[aria-selected="true"]>.sheen-select-check'));
});

test('in Arabic the tick mirrors, and every side is logical', () => {
  assert.equal(ruleOf('[dir="rtl"] [aria-selected="true"]>.sheen-select-check::after'), 'transform:translateY(-1px) rotate(45deg)');
  const w = page(DRAWN(true), 'rtl');
  assert.ok(w.document.querySelector('#o1 .sheen-select-check').matches('[dir="rtl"] [aria-selected="true"]>.sheen-select-check'));
  assert.ok(!/(?:^|[;{])(?:margin|padding|border)-(?:left|right)|(?:^|[;{])(?:left|right):|text-align:(?:left|right)/.test(own), '16-select.css uses logical sides only');
});

test('the search box is 36px with an 11px radius and a hairline, a 15px glyph, 13.5px words and no ring', () => {
  assert.equal(ruleOf('.sheen-select-search'), 'block-size:36px;padding:0 12px;gap:7px;border:0;border-radius:11px;box-shadow:inset 0 0 0 1px var(--sheen-separator);font-size:13.5px;display:flex;align-items:center;flex:none;cursor:text');
  assert.equal(ruleOf('.sheen-select-search>.sheen-glyph'), 'inline-size:15px;block-size:15px;flex:none;color:var(--sheen-text-secondary)');
  assert.equal(ruleOf('.sheen-select-input'), 'all:unset;flex:1;min-inline-size:0;color:var(--sheen-text)');
  assert.equal(ruleOf('.sheen-select-input::placeholder'), 'color:var(--sheen-text-tertiary)');
  for (const [sel, body] of rules.filter(([s]) => /\.sheen-select-(search|input)/.test(s))) assert.ok(!/outline:[^n]|box-shadow:[^;]*2px/.test(body), `${sel} draws no ring`);
});

test('chips are 24px tonal pills with a 12px radius, 12.5px words and a 16px remove mark, wrapping in a growing field', () => {
  has('.sheen-select-chips{flex:1;min-inline-size:0;display:flex;flex-wrap:wrap;gap:max(var(--sheen-space-min),4px)}');
  has('.sheen-select-chip{display:inline-flex;align-items:center;gap:4px;max-inline-size:100%;block-size:var(--sheen-size-select-chip);padding-inline:8px 4px;border-radius:12px;background:var(--sheen-tonal);font-size:12.5px;box-sizing:border-box}');
  has('.sheen-select-chip>span:first-child{min-inline-size:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}');
  has('.sheen-select-chip-remove{inline-size:16px;block-size:16px;flex:none;display:grid;place-items:center;border-radius:8px;color:var(--sheen-text-secondary);cursor:pointer}');
  has('.sheen-select-chip-remove:hover{background:var(--sheen-tonal)}');
  has('.sheen-select-chip-remove>.sheen-glyph{inline-size:14px;block-size:14px}');
  // the field grows: its height is a minimum, never fixed
  assert.ok(!/(?:^|;)block-size:/.test(ruleOf('sheen-select')));
});

test('the clear button is 24px round with a 16px glyph in the tertiary colour, tonal on hover', () => {
  has('.sheen-select-clear{flex:none;inline-size:var(--sheen-size-select-clear);block-size:var(--sheen-size-select-clear);display:grid;place-items:center;margin:0;padding:0;border:0;border-radius:50%;background:none;color:var(--sheen-text-tertiary);cursor:pointer}');
  has('.sheen-select-clear:hover{background:var(--sheen-tonal)}');
  has('.sheen-select-clear>.sheen-glyph{inline-size:16px;block-size:16px}');
});
