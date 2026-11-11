// 0.7.0 size token: the app bar's block size, so an app places things under it from tokens, never from a raw px value
// (a top toaster: calc(var(--sheen-size-app-bar) + var(--sheen-space-m)) under the bar, var(--sheen-space-xxl) from the edge).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tokens = JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8'));
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const root = min.slice(min.indexOf(':root{'), min.indexOf('}', min.indexOf(':root{')));

test('the app bar size is a token: size.appBar in tokens.json, --sheen-size-app-bar on :root', () => {
  assert.equal(tokens.size.appBar, 60);
  assert.ok(root.includes('--sheen-size-app-bar:60px;'), root.slice(0, 200));
});

test('number tokens with two words take kebab-case names; the one-word ones keep theirs', () => {
  assert.ok(root.includes('--sheen-space-xxl:24px;'));
  assert.ok(root.includes('--sheen-radius-card:24px;'));
  assert.ok(!/--sheen-[a-z]+-[a-z]*[A-Z]/.test(root), 'no camelCase token names');
});

test('the app bar takes its block size from the token', () => {
  assert.ok(min.includes('.sheen-app-bar{block-size:var(--sheen-size-app-bar);'));
});
