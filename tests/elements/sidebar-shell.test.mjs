import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const part = readFileSync('src/css/10-sidebar.css', 'utf8');
const dist = readFileSync('dist/sheen.css', 'utf8');

test('sidebar shell: the parts reach the built stylesheet', () => {
  for (const name of ['.sheen-sidebar-shell', '.sheen-sidebar-item', '.sheen-app-bar', '.sheen-auth-card', '.sheen-input', '.sheen-form-error'])
    assert.ok(dist.includes(name), name);
});

test('sidebar shell: every side is logical, so right to left needs no second rule', () => {
  assert.doesNotMatch(part, /(margin|padding|border)-(left|right|top|bottom)|(?<![-\w])(width|height):/);
});

test('sidebar shell: colours come from the tokens', () => {
  assert.doesNotMatch(part, /#[0-9a-fA-F]{3,8}\b|\brgba?\(/);
});

test('motion: the tokens reach the stylesheet, and reduced motion drops the spring and the press', () => {
  assert.match(dist, /--sheen-motion-press-scale:/);
  assert.match(dist, /@media \(prefers-reduced-motion:reduce\)\{:root\{[^}]*--sheen-motion-press-scale:1/);
});

test('sidebar shell: the current page is marked and an item that leads nowhere has no hover', () => {
  assert.match(part, /\.sheen-sidebar-item\[aria-current="page"\]\{[^}]*background:color-mix\(in srgb,var\(--sheen-accent\) 14%,transparent\);color:color-mix\(in srgb,var\(--sheen-accent-text\) 80%,var\(--sheen-text\)\)/);
  assert.match(part, /\.sheen-sidebar-item\[aria-disabled="true"\]\{[^}]*cursor:default/);
  assert.match(part, /\.sheen-sidebar-item\[aria-disabled="true"\]:hover\{background:none\}/);
  assert.ok(dist.includes('.sheen-sidebar-item[aria-current="page"]'));
});

test('sidebar shell: the current page text reaches WCAG AA on its tint in light and dark', () => {
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const mix = (a, b, p) => a.map((v, i) => v * p + b[i] * (1 - p));
  const lum = (c) => { const [r, g, b] = c.map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  for (const theme of ['light', 'dark']) {
    const block = dist.match(new RegExp(`:root\\[data-theme="${theme}"\\]\\{[^}]*\\}`))[0];
    const t = Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]]));
    for (const under of ['surface', 'background', 'surface-muted', 'sheet']) {
      const r = ratio(mix(hex(t['accent-text']), hex(t.text), 0.8), mix(hex(t.accent), hex(t[under]), 0.14));
      assert.ok(r >= 4.5, `${theme} on ${under}: ${r.toFixed(2)}`);
    }
  }
});
