// 0.7.0 list kit: the ticked filter option and the table card with its small table. Layout and look only, checked in the
// built CSS; contrast computed from the tokens.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);

test('filter panel: a ticked option is tinted', () => {
  has('.sheen-filter-option:has(input:checked){background:color-mix(in srgb,var(--sheen-accent) 10%,transparent);font-weight:600}');
});

test('table card: a surface card with an 18px radius that still scrolls sideways; the small table has a tinted header', () => {
  assert.match(css, /\.sheen-table-card\{background:var\(--sheen-surface\);border-radius:18px/);
  assert.match(css, /:root\[data-theme="light"\] \.sheen-table-card\{box-shadow:/);
  assert.match(css, /@media \(prefers-color-scheme:light\)\{:root:not\(\[data-theme="dark"\]\) \.sheen-table-card\{box-shadow:/);
  has('.sheen-table.sheen-small{font-size:13.5px}');
  assert.match(css, /\.sheen-table\.sheen-small th\{font-size:12px;padding:10px 14px;background:color-mix\(in srgb,var\(--sheen-track\) 35%,var\(--sheen-surface\)\)/);
  assert.match(css, /\.sheen-table\.sheen-small td\{padding:10px 14px;border-block-end:0;border-block-start:1px solid var\(--sheen-separator\)/);
  has('.sheen-table.sheen-small .sheen-sort-button{padding:10px 14px}');
});

test('the new list kit rules use logical sides only', () => {
  const ours = css.slice(css.indexOf('/* 0.7.0 list kit */'), css.indexOf('/* end 0.7.0 list kit */'));
  assert.ok(ours.length > 100, 'marked block found');
  assert.doesNotMatch(ours, /(margin|padding|border)-(left|right)|[;{](left|right):|text-align:(left|right)/);
});

// WCAG contrast from the tokens in the built CSS
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }

test('list kit 0.7.0: header words and ticked options reach WCAG AA in light and dark', () => {
  for (const [name, block] of [['light', css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0]], ['dark', css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0]]]) {
    const t = tokens(block);
    const header = mixed(hex(t.track), hex(t.surface), 0.35);
    for (const fg of ['text-secondary', 'text']) assert.ok(contrast(hex(t[fg]), header) >= 4.5, `${fg} on the tinted header (${name})`);
    for (const under of ['sheet', 'surface']) {
      const ticked = mixed(hex(t.accent), hex(t[under]), 0.10);
      assert.ok(contrast(hex(t.text), ticked) >= 4.5, `ticked option on ${under} (${name})`);
    }
  }
});
