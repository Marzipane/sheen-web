// 0.7.0 fixes from the owner's review of an app built on the kit: every control of a find row on one line, focus rings
// only after Tab (a text field never draws one: its caret shows the focus), and a sidebar shell that never makes the
// document scroll.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';
import { readFileSync } from 'node:fs';

const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const js = readFileSync(new URL('../../dist/sheen-elements.js', import.meta.url), 'utf8');
const has = (part) => assert.ok(min.includes(part), part);
const press = (w, el) => el.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));

test('find row: a views end inside it keeps no bottom padding (its 6px is for the views row), so Views lines up with Filters', () => {
  has('.sheen-find-row .sheen-views-end{padding-block-end:0}');
});

test('find row: a control or control menu button inside an inline wrapper (an app component) sits at the top of its line', () => {
  has('.sheen-control,sheen-menu-button[variant="control"]{vertical-align:top}');
});

test('focus: only Tab or Shift+Tab marks keyboard navigation; a press clears it; Esc, Enter, letters and arrows never mark it', () => {
  const w = page('<input id="q" type="search"><button id="b">B</button>');
  const root = w.document.documentElement, q = w.document.getElementById('q'), b = w.document.getElementById('b');
  const on = () => root.hasAttribute('data-sheen-keyboard');
  assert.equal(on(), false, 'no ring before any Tab');
  press(w, b);
  for (const k of ['Escape', 'Enter', 'a', 'Z', '/', ' ', 'ArrowDown', 'ArrowLeft', 'Home', 'PageDown', 'Shift'])
    for (const el of [b, q, w.document.body]) key(w, el, k);
  assert.equal(on(), false, 'Esc after closing a panel, typing in the search, arrows');
  key(w, b, 'Tab', { shiftKey: true });
  assert.equal(on(), true, 'Shift+Tab');
  key(w, q, 'Escape');
  assert.equal(on(), true, 'Esc does not end keyboard navigation either');
  press(w, q);
  assert.equal(on(), false, 'the next press');
  key(w, w.document.body, 'Tab');
  assert.equal(on(), true, 'Tab');
  w.dispatchEvent(new w.Event('blur'));
  assert.equal(on(), true, 'leaving the window keeps it');
});

test('focus: the old press flag is gone from the CSS and the elements', () => {
  assert.ok(!min.includes('data-sheen-pointer'));
  assert.ok(!js.includes('data-sheen-pointer'));
});

test('focus: without keyboard navigation nothing in a sheen page draws a focus ring', () => {
  has(':root:not([data-sheen-keyboard]) .sheen :focus-visible,:root:not([data-sheen-keyboard]) .sheen:focus-visible{outline:none!important}');
  // a ticked chip or choice draws its ring around the box, so it follows Tab too
  has(':root:not([data-sheen-keyboard]) :is(.sheen-choice:has(input:focus-visible),.sheen-chip:has(>input:focus-visible)){outline:none}');
  // a dense menu marks the item the arrows reach with the hover fill instead of its ring
  has(':root:not([data-sheen-keyboard]) :is(sheen-menu-button.sheen-small,.sheen-small sheen-menu-button,.sheen-bulk-bar sheen-menu-button,.sheen-views-end sheen-menu-button) .sheen-menu-item:focus-visible{background:var(--sheen-tonal)}');
});

test('focus: a text field never draws a ring, with or without the keyboard; its caret shows the focus', () => {
  has('.sheen :is(input:not([type="checkbox"],[type="radio"],[type="range"],[type="button"],[type="submit"],[type="reset"],[type="file"],[type="color"],[type="image"]),select,textarea):focus-visible{outline:none!important}');
  assert.ok(!min.includes('.sheen-control:has(:is(input,select,textarea):focus-visible){outline'), 'no ring around a control that holds a field');
  // the travel field kept its label tint and drops its ring and glow
  assert.doesNotMatch(min, /\.sheen-field:focus-within\{[^}]*box-shadow/);
  has('.sheen-field:focus-within>span:first-child{color:var(--sheen-accent-text)}');
});

test('sidebar shell: one row the height of the window, so a long nav scrolls inside the sidebar and the document never scrolls', () => {
  has('.sheen-sidebar-shell{block-size:100vh;block-size:100dvh;display:grid;grid-template-columns:248px minmax(0,1fr);grid-template-rows:minmax(0,1fr)}');
  // a visually hidden word (position: absolute) deep in the nav belongs to the nearest positioned box: the nav itself, which
  // clips it, not the page, which it would stretch (an app's sidebar measured 1224px in a 1000px window)
  assert.match(min, /\.sheen-sidebar-nav\{position:relative;/);
  assert.match(min, /\.sheen-app-content\{position:relative;/);
});
