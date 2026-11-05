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
