// 0.7.0 open and applied controls: the mockups' blue rings are annotations, not looks. An open control (Views while its
// menu is open, a page header's •••) takes the tonal fill; a control whose filters are on keeps the tint and its count.
// Neither draws a ring or a glow; only keyboard focus draws one, the base 2px ring.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);
const rules = (sel) => css.split('}').filter((r) => r.split('{')[0].split(',').some((s) => s.trim() === sel));

test('an open control takes the tonal fill and keeps its hairline: no accent ring, no glow', () => {
  has('.sheen-control[aria-expanded="true"]{background:var(--sheen-tonal)}');
  for (const r of rules('.sheen-control[aria-expanded="true"]')) assert.doesNotMatch(r, /box-shadow|outline/, r);
  for (const r of css.split('}').filter((r) => r.split('{')[0].includes('.sheen-control')))
    assert.doesNotMatch(r, /1\.5px var\(--sheen-accent-text\)|0 0 0 4px color-mix/, r);
});

test('an open page header ••• is an open control like any other: no rule of its own', () => {
  assert.ok(!css.includes('sheen-menu-button[glyph]>.sheen-control[aria-expanded="true"]'));
});

test('a control whose filters are on keeps the tint, the accent glyph and its count, and no accent ring', () => {
  has('.sheen-control.sheen-on{background:color-mix(in srgb,var(--sheen-accent) 8%,var(--sheen-surface))}');
  for (const r of rules('.sheen-control.sheen-on')) assert.doesNotMatch(r, /box-shadow|outline/, r);
  has('.sheen-control.sheen-on:is(.sheen-glyph,.sheen-icon){color:var(--sheen-accent-text)}');
});

test('keyboard focus keeps its one 2px ring on a control, open or not', () => {
  // the base ring for buttons, which no control rule takes away outside a press
  assert.match(css, /:focus-visible\{outline:2px solid var\(--sheen-accent-text\)/);
  assert.ok(!/\.sheen-control(\[aria-expanded="true"\]|\.sheen-on)?:focus-visible\{outline:none/.test(css));
});
