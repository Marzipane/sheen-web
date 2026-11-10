// 0.7.0 app page parts: filled glyphs, key caps, page tabs and title, the Filters panel footer, a busy table, the status
// block (Flutter sheen's SheenStatusScreen), a failed list message, and the toaster at the top (Flutter sheen's toast).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, record } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const has = (part) => assert.ok(css.includes(part), part);
const DENSE = ':is(sheen-menu-button.sheen-small,.sheen-small sheen-menu-button,.sheen-bulk-bar sheen-menu-button,.sheen-views-end sheen-menu-button)';

test('glyphs: the Flutter sheen filled icons draw as "<name>-fill", filled with the text colour', () => {
  const w = page('');
  const filled = w.sheenElements.glyph('check-circle-fill', 18);
  assert.equal(filled.getAttribute('fill'), 'currentColor');
  assert.equal(filled.getAttribute('stroke'), 'none');
  assert.ok(w.sheenElements.glyphNames().includes('star-fill'));
  const stroke = w.sheenElements.glyph('check', 18);
  assert.equal(stroke.getAttribute('fill'), 'none', 'stroke glyphs unchanged');
  assert.equal(stroke.getAttribute('stroke'), 'currentColor');
});

test('key caps: the find row\'s "/" and the shortcuts in small menus are plain outlined caps', () => {
  has('.sheen-find .sheen-kbd,' + DENSE + ' .sheen-menu-item .sheen-kbd,sheen-command-palette.sheen-small .sheen-kbd,.sheen-keys .sheen-kbd{min-inline-size:20px;block-size:20px;padding-inline:5px;border-radius:6px;background:none;box-shadow:inset 0 0 0 1px var(--sheen-separator);color:var(--sheen-text-tertiary);font:inherit;font-family:monospace;line-height:1}');
  // the mockup's k-fkbd says font:600 11px/1 inherit, which browsers drop as invalid: its caps take the row's font
  assert.ok(!css.includes('font:600 11px/1 inherit'));
});

test('the hidden attribute hides list kit parts, though they set their own display', () => {
  has(':where(.sheen-find-row,.sheen-views-row,.sheen-applied-row,.sheen-control,.sheen-control-count,.sheen-link-button,.sheen-filter-chip,.sheen-list-message,.sheen-status,')
  has(')[hidden]{display:none!important}');
});

test('page tabs drawn as links keep the tab colours (the base link rule made them the text colour)', () => {
  has('.sheen-page-tabs .sheen-view-tab{margin-block-end:0;padding-inline:24px;color:var(--sheen-text-secondary)}');
  has('.sheen-page-tabs .sheen-view-tab:hover{color:var(--sheen-text)}');
  has('.sheen-page-tabs .sheen-view-tab[aria-current="page"]{color:var(--sheen-text-secondary)}');
});

test('a glyph control whose menu is open keeps its fill and hairline, no focus ring (a page header\'s •••)', () => {
  has('sheen-menu-button[glyph]>.sheen-control[aria-expanded="true"]{box-shadow:inset 0 0 0 1px var(--sheen-separator)}');
});

test('page tabs mark the current page by its line only; an app page title is 26px', () => {
  has('.sheen-page-tabs{border-block-end:0;box-shadow:inset 0 -1px 0 var(--sheen-separator)}');
  has('.sheen-page-title{margin:0;font-size:26px;font-weight:700;letter-spacing:-.02em}');
});

test('a side panel with a heading keeps the Filters footer at its bottom edge', () => {
  has('sheen-side-panel.sheen-headed .sheen-panel-body{display:flex;flex-direction:column}');
  has('sheen-side-panel.sheen-headed .sheen-panel-body>:is(.sheen-filter-footer,.sheen-panel-foot){margin-block-start:auto}');
  // the body keeps no padding under the footer, so the footer's edge is the panel's (k-fpfoot sits under k-fpbody)
  has('sheen-side-panel.sheen-headed .sheen-panel-body:has(>.sheen-filter-footer){padding-block-end:0}');
  has('sheen-side-panel.sheen-headed .sheen-filter-footer{margin-inline:-20px;margin-block-end:0;padding:12px 20px 16px}');
});

test('small tables: 16px checkboxes in the accent; a busy table is one solid placeholder block', () => {
  has('.sheen-table.sheen-small input[type="checkbox"]{inline-size:16px;block-size:16px;accent-color:var(--sheen-accent)}');
  // (the normalizer drops the space before ":is("; the min file below keeps the descendant combinator)
  has('.sheen-table[aria-busy="true"]:is(th,td){color:transparent;background:var(--sheen-track);border-color:transparent;border-radius:7px}');
  has('.sheen-table[aria-busy="true"]:is(th,td)>:not(input){visibility:hidden}');
  const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
  assert.ok(min.includes('.sheen-table[aria-busy="true"] :is(th,td){'), 'cells of the busy table, not the table');
  assert.match(css, /@media \(prefers-reduced-motion:no-preference\)\{\.sheen-table\[aria-busy="true"\]\{animation:sheen-busy 1\.4s ease-in-out infinite\}\}/);
  has('@keyframes sheen-busy{50%{opacity:.55}}');
});

test('status block: a glyph in a 72px circle of its tone, a title, narrow words and stacked actions', () => {
  assert.match(css, /\.sheen-status\{display:flex;flex-direction:column;align-items:center;text-align:center;[^}]*color:var\(--sheen-text-secondary\)/);
  assert.match(css, /\.sheen-status-glyph\{display:grid;place-items:center;inline-size:72px;block-size:72px;border-radius:50%;[^}]*background:var\(--sheen-tonal\);color:var\(--sheen-accent-text\)/);
  has('.sheen-status.sheen-danger .sheen-status-glyph{background:color-mix(in srgb,var(--sheen-danger) 14%,transparent);color:var(--sheen-danger)}');
  has('.sheen-status.sheen-warning .sheen-status-glyph{background:color-mix(in srgb,var(--sheen-warning) 16%,transparent);color:var(--sheen-warning)}');
  has('.sheen-status:is(.sheen-danger,.sheen-warning,.sheen-success){color:var(--sheen-text-secondary)}');
  has('.sheen-status p{margin:0;max-inline-size:34ch;font-size:15px;line-height:1.3}');
  has('.sheen-status-actions{display:flex;flex-direction:column;gap:8px;margin-block-start:8px;inline-size:min(100%,280px)}');
  has('.sheen-status-actions>*{inline-size:100%}');
});

test('a list message that failed has a danger ring and a title in the text colour', () => {
  has('.sheen-list-message.sheen-danger{color:var(--sheen-text);box-shadow:inset 0 0 0 2px var(--sheen-danger)}');
  has('.sheen-list-message.sheen-danger .sheen-glyph{color:var(--sheen-danger)}');
});

test('the new page rules use logical sides only', () => {
  const ours = css.slice(css.indexOf('/* 0.7.0 app pages */'), css.indexOf('/* end 0.7.0 app pages */'));
  assert.ok(ours.length > 100, 'marked block found');
  assert.doesNotMatch(ours, /(margin|padding|border)-(left|right)|[;{](left|right):|text-align:(left|right)/);
});

function toaster(attrs) {
  const w = page(`<sheen-toaster ${attrs}></sheen-toaster>`);
  const t = w.document.querySelector('sheen-toaster');
  const runs = [];
  t.show({ title: 'Filters cleared · showing all 41', tone: 'success', glyph: 'check-circle-fill', timeout: 0, action: { label: 'Undo', onClick: () => runs.push('undo') } });
  return { w, t, runs, toast: t.querySelector('.sheen-toast') };
}

test('toaster at the top: a glyph in its tone, the action as a link, a close button for keyboard users only; a press on it closes it', () => {
  const { w, t, runs, toast } = toaster('position="top" close-label="Close"');
  const mark = toast.firstElementChild;
  assert.ok(mark.classList.contains('sheen-toast-glyph'));
  assert.equal(mark.getAttribute('aria-hidden'), 'true');
  assert.equal(toast.querySelector('.sheen-toast-dot'), null);
  const action = toast.querySelector('button');
  assert.equal(action.className, 'sheen-link-button');
  assert.equal(action.textContent, 'Undo');
  assert.ok(toast.querySelector('.sheen-toast-close').classList.contains('sheen-focus-only'));
  action.click();
  assert.deepEqual(runs, ['undo']);
  assert.equal(t.querySelector('.sheen-toast'), null);
  t.show({ title: 'Saved', tone: 'success', timeout: 0 });
  t.querySelector('.sheen-toast-text').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.equal(t.querySelector('.sheen-toast'), null, 'a press on the toast closes it, as Flutter sheen\'s tap');
});

test('toaster at the bottom (0.3.0) keeps its dot, its tonal action and its close button; a glyph replaces the dot', () => {
  const { toast } = toaster('close-label="Close"');
  assert.equal(toast.querySelector('.sheen-toast-glyph').getAttribute('aria-hidden'), 'true');
  assert.equal(toast.querySelector('.sheen-toast-dot'), null);
  assert.ok(toast.querySelector('.sheen-button.sheen-small'));
  assert.ok(toast.querySelector('.sheen-toast-close'));
  const plain = page('<sheen-toaster close-label="Close"></sheen-toaster>').document.querySelector('sheen-toaster');
  plain.show({ title: 'Saved', timeout: 0 });
  assert.ok(plain.querySelector('.sheen-toast-dot'), 'no glyph: the 0.3.0 dot');
});

test('toaster at the top: placed under the app bar at the end edge, its glyph in the tone colour, solid with .sheen-solid', () => {
  assert.match(css, /sheen-toaster\[position="top"\]\{inset-block:var\(--sheen-toaster-top,20px\) auto;inset-inline-end:var\(--sheen-toaster-end,20px\);inline-size:min\(var\(--sheen-toaster-size,400px\),calc\(100vw - 32px\)\)\}/);
  has('.sheen-toast-glyph{inline-size:18px;block-size:18px;flex:none;color:var(--sheen-accent-text)}');
  has('.sheen-toast-success .sheen-toast-glyph{color:var(--sheen-success)}');
  has('.sheen-toast-danger .sheen-toast-glyph{color:var(--sheen-danger)}');
  has('sheen-toaster[position="top"] .sheen-toast-text{font-size:14.5px;font-weight:600}');
  const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
  assert.ok(min.includes(':root .sheen-solid .sheen-toast.sheen-glass{'), 'toasts are solid too');
});

// WCAG contrast from the tokens in the built CSS
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }

test('page parts reach WCAG AA in light and dark: words 4.5:1, status glyphs 3:1 on their circles', () => {
  for (const [name, block] of [['light', css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0]], ['dark', css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0]]]) {
    const t = tokens(block);
    for (const [what, fg, under] of [['current page tab', 'accent-text', 'background'], ['key cap', 'text-tertiary', 'surface'], ['status words', 'text-secondary', 'background'],
      ['failed message title', 'text', 'surface'], ['toast words', 'text', 'sheet']]) {
      const ratio = contrast(hex(t[fg]), hex(t[under]));
      assert.ok(ratio >= 4.5, `${what} (${name}): ${ratio.toFixed(2)}`);
    }
    for (const [tone, share] of [['danger', 0.14], ['warning', 0.16]]) {
      const ratio = contrast(hex(t[tone]), mixed(hex(t[tone]), hex(t.background), share));
      assert.ok(ratio >= 3, `${tone} status glyph on its circle (${name}): ${ratio.toFixed(2)}`);
    }
    assert.ok(contrast(hex(t.success), hex(t.sheet)) >= 3, `success toast glyph on the sheet (${name})`);
  }
});
