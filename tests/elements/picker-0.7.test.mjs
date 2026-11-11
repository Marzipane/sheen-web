// 0.7.0 the picker under the focus rule: its pill rings after Tab only, never on a press or while its list is open; an
// open picker takes the tonal fill, as an open Views or ••• control; its search box, a text field, draws no ring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(min.includes(part), part);
const rulesWith = (sel) => min.split('}').filter((r) => r.slice(0, r.lastIndexOf('{')).includes(sel));

test('the picker pill rings after Tab only, like every ring: not on a press, not while its list is open', () => {
  has('.sheen-picker-pill:has(:focus-visible){outline:2px solid var(--sheen-accent-text);outline-offset:2px}');
  has(':root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen-picker-pill:has(:focus-visible){outline:none}');
  assert.ok(!min.includes('.sheen-picker-pill:focus-within'), 'no ring on any focus inside, a press included');
  for (const r of rulesWith('.sheen-picker-open .sheen-picker-pill')) assert.doesNotMatch(r, /outline|box-shadow/, r);
});

test('an open picker takes the tonal fill, as an open control: a tint over the glass pill, the field filled, no ring or glow', () => {
  has('.sheen-picker-open .sheen-picker-pill::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:var(--sheen-tonal);pointer-events:none}');
  has('.sheen-picker-open .sheen-picker-field{background:var(--sheen-tonal)}');
  for (const r of rulesWith('.sheen-picker-open .sheen-picker-field').filter((r) => !r.includes('Highlight'))) assert.doesNotMatch(r, /box-shadow|outline/, r);
});

test('the picker\'s search box draws no ring while you type in it: its caret shows the focus', () => {
  assert.ok(!min.includes('.sheen-picker-search:focus-within{'));
});
