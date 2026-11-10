// 0.7.0 app page header, ported one to one from the app mockups' CSS (k-head, k-head-t, k-head-b, k-crumbs): the crumbs,
// the 26px title, a secondary line with room for a pill, the actions at the end edge on the bottom line. The mockups set
// no narrow layout; under 320px of words the actions move under them, still at the end edge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(css.includes(part), part);
const rule = (sel) => { const at = css.indexOf(sel + '{'); assert.ok(at >= 0, sel); return css.slice(at, css.indexOf('}', at) + 1); };

test('k-head: a row of the words and the actions, lined up at the bottom, 16px apart, wrapping when narrow', () => {
  has('.sheen-page-head{display:flex;flex-wrap:wrap;align-items:flex-end;gap:16px}');
});

test('k-head-t: the words take the room left, keep 320px (or the whole row when it is narrower) and wrap their own lines 4px by 10px apart', () => {
  has('.sheen-page-head-text{flex:1 1 0;min-inline-size:min(100%,320px);display:flex;flex-wrap:wrap;align-items:center;gap:4px 10px}');
  has('.sheen-page-head-text>.sheen-page-title{inline-size:100%}');
});

test('k-crumbs: 12.5px tertiary on a line of their own; the secondary line is 14px, a pill fits beside it', () => {
  has('.sheen-page-crumbs{inline-size:100%;font-size:12.5px;color:var(--sheen-text-tertiary)}');
  has('.sheen-page-subtitle{margin:0;font-size:14px;color:var(--sheen-text-secondary)}');
});

test('k-head-b: the actions 8px apart at the end edge, on the bottom line or on a line of their own', () => {
  has('.sheen-page-head-actions{display:flex;flex-wrap:wrap;gap:8px;margin-inline-start:auto}');
  assert.ok(min.includes('.sheen-page-head-actions{'));
});

test('the page head uses logical sides only, so Arabic mirrors', () => {
  for (const sel of ['.sheen-page-head', '.sheen-page-head-text', '.sheen-page-crumbs', '.sheen-page-subtitle', '.sheen-page-head-actions'])
    assert.doesNotMatch(rule(sel), /(margin|padding|border)-(left|right)|[^-](left|right|width|height):/, sel);
});

test('hidden wins over the page head parts\' display', () => {
  has(',.sheen-table-foot,.sheen-pager,.sheen-page-head,.sheen-page-head-text,.sheen-page-head-actions)[hidden]{display:none!important}');
});
