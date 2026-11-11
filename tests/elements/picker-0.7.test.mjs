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

test('forced colors keep a real outline: the field and pill rings are taken away from a press only when forced colors are off', () => {
  // with forced colors the system outline of a focused field (06-access) must win, after a press too
  has('@media not (forced-colors:active){:root[data-sheen-focus]:not([data-sheen-keyboard]) :is(.sheen-field,.sheen-control):has(:is(select,.sheen-picker-trigger):focus-visible){outline:none}}');
  has('@media not (forced-colors:active){:root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen-picker-pill:has(:focus-visible){outline:none}}');
  let seen = 0;
  for (const sel of [':is(.sheen-field,.sheen-control):has(', '.sheen-picker-pill:has(:focus-visible){outline:none}'])
    for (const m of min.matchAll(/:root\[data-sheen-focus\]:not\(\[data-sheen-keyboard\]\) /g))
      if (min.startsWith(sel, m.index + m[0].length)) { seen++; assert.ok(min.slice(0, m.index).endsWith('@media not (forced-colors:active){'), `${sel} outside the media rule`); }
  assert.equal(seen, 2, 'each rule found once, inside the media rule');
});
