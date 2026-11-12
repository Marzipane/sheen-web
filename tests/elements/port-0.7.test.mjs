// 0.7.0 values ported one to one from the app mockups' CSS: the page head and tabs, controls, the small table, small
// menus, the side panel and the Filters panel, status blocks, toasts and small buttons. Each test names the part it
// ports; where the mockup's rendered value differs from its own rule, the rendered value wins.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const min = readFileSync(new URL('../../dist/sheen.min.css', import.meta.url), 'utf8');
const has = (part) => assert.ok(css.includes(part), part);
const DENSE = ':is(sheen-menu-button.sheen-small,.sheen-small sheen-menu-button,.sheen-bulk-bar sheen-menu-button,.sheen-views-end sheen-menu-button)';

test('the page title is 26px bold, -.02em, on the page line height (39px)', () => {
  has('.sheen-page-title{margin:0;font-size:26px;font-weight:700;letter-spacing:-.02em}');
});

test('page tabs are secondary words with 24px each side, the current one marked by its 2px accent line only', () => {
  has('.sheen-page-tabs{border-block-end:0;box-shadow:inset 0 -1px 0 var(--sheen-separator)}');
  has('.sheen-page-tabs .sheen-view-tab{margin-block-end:0;padding-inline:24px;color:var(--sheen-text-secondary)}');
  has('.sheen-page-tabs .sheen-view-tab[aria-current="page"]{color:var(--sheen-text-secondary)}');
  assert.ok(!css.includes('.sheen-view-tab[aria-current="page"]{color:var(--sheen-accent-text)}'));
});

test('a control with filters on tints its glyph, its words keep the text colour', () => {
  has('.sheen-control.sheen-on:is(.sheen-glyph,.sheen-icon){color:var(--sheen-accent-text)}');
  assert.ok(min.includes('.sheen-control.sheen-on :is(.sheen-glyph,.sheen-icon){color:var(--sheen-accent-text)}'));
  assert.ok(!css.includes('.sheen-control.sheen-on>span:not(.sheen-control-count){color'));
});

test('in a narrow list kit a control with a count keeps its padding and its count; only date and views shrink to 36px', () => {
  assert.match(css, /@container \(max-width:760px\)\{[^@]*?\.sheen-control\.sheen-compact-glyph:has\(>\.sheen-control-count:not\(\[hidden\]\)\)\{inline-size:auto;padding-inline:12px\}/);
});

test('a control menu button\'s box carries the control\'s 13.5px, so it measures like the control it draws', () => {
  // a definite height, as the mockup's 36px controls: a stretching flex row (a page header) never makes the box taller
  has('sheen-menu-button[variant="control"]{display:inline-flex;block-size:36px}');
  has('sheen-menu-button[variant="control"]:not([glyph]){font-size:13.5px}');
  assert.ok(!css.includes('sheen-menu-button[variant="control"]{font-size:13.5px}'), 'a glyph control (the page header •••) keeps the page font, as the mockup');
});

test('an open page header ••• takes the tonal fill, as every open control (no ring: the mockups\' rings are annotations)', () => {
  has('.sheen-control[aria-expanded="true"]{background:var(--sheen-tonal)}');
  assert.ok(!css.includes('sheen-menu-button[glyph]>.sheen-control[aria-expanded="true"]'));
});

test('small menus are 250px to 320px wide; an item with a description lines its glyph up with the title', () => {
  assert.match(css, /sheen-menu-button\.sheen-small \.sheen-menu,[^{]*\{font-size:13\.5px;min-inline-size:min\(var\(--sheen-menu-min-size,250px\),calc\(100vw - 16px\)\);max-inline-size:min\(var\(--sheen-menu-max-size,320px\),calc\(100vw - 16px\)\)/);
  has(DENSE + ' .sheen-menu-item:not([aria-disabled="true"]):has(.sheen-menu-hint){align-items:flex-start}');
  has(DENSE + ' .sheen-menu-item:not([aria-disabled="true"]):has(.sheen-menu-hint)>.sheen-glyph{margin-block-start:2px}');
  has(DENSE + ' .sheen-menu-item:not([aria-disabled="true"]) .sheen-menu-hint{font-size:12px;font-weight:400}');
});

test('small cells stay on one line up to 260px with an ellipsis; .sheen-wrap wraps them; checkboxes keep their own margin', () => {
  has('.sheen-table.sheen-small td{padding:10px 14px;border-block-end:0;border-block-start:1px solid var(--sheen-separator);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-inline-size:260px}');
  has('.sheen-table.sheen-small.sheen-wrap:is(th,td){white-space:normal}');
  has('.sheen-table.sheen-small.sheen-wrap td{max-inline-size:none;vertical-align:top;overflow-wrap:break-word}');
  // 0.8.0: a switch in a small table keeps its own size
  has('.sheen-table.sheen-small input[type="checkbox"]:where(:not([role="switch"],.sheen-switch input)){inline-size:16px;block-size:16px;accent-color:var(--sheen-accent)}');
});

test('mk-loading: a busy table\'s cells lose their lines; their checkboxes stay', () => {
  has('.sheen-table[aria-busy="true"]:is(th,td){color:transparent;background:var(--sheen-track);border-color:transparent;border-radius:7px}');
  has('.sheen-table[aria-busy="true"]:is(th,td)>:not(input){visibility:hidden}');
});

test('the Filters panel title tracks -.022em; the dim is black at 18%', () => {
  assert.match(css, /\.sheen-panel-title\{[^}]*font-size:22px;line-height:1\.2;font-weight:700;letter-spacing:-\.022em/);
  has('.sheen-panel-dim{position:fixed;inset:0;z-index:899;background:rgba(0,0,0,.18)}');
});

test('Filters options 1px apart under their label, counts at 500, an outlined 18px box', () => {
  has('.sheen-filter-field{gap:1px;padding-block-start:0}');
  has('.sheen-filter-field legend{padding-block-start:10px;margin-block-end:6px}');
  has('.sheen-filter-option small{font-weight:500}');
  has('.sheen-filter-option input[type="checkbox"]{appearance:none;-webkit-appearance:none;display:inline-grid;place-content:center;border-radius:5px;box-shadow:inset 0 0 0 1.5px var(--sheen-text-tertiary);cursor:pointer}');
  has('.sheen-filter-option input[type="checkbox"]:checked{background:var(--sheen-accent);box-shadow:none}');
  has('.sheen-filter-option input[type="checkbox"]:checked::after{content:"";inline-size:9px;block-size:5px;border-inline-start:2px solid var(--sheen-on-accent);border-block-end:2px solid var(--sheen-on-accent);transform:translateY(-1px) rotate(-45deg)}');
  has('[dir="rtl"] .sheen-filter-option input[type="checkbox"]:checked::after{transform:translateY(-1px) rotate(45deg)}');
});

test('small buttons in the list kit and the Filters panel: 34px, 13.5px', () => {
  has(':is(.sheen-list-kit,.sheen-filter-footer,.sheen-list-message) .sheen-button.sheen-small{block-size:34px;border-radius:17px;padding-inline:16px;font-size:13.5px}');
  assert.ok(min.includes(':is(.sheen-list-kit,.sheen-filter-footer,.sheen-list-message) .sheen-button.sheen-small{'));
});

test('the status block: a 25px glyph, words at 15px on a 1.3 line, the title tracking -.022em', () => {
  has('.sheen-status-glyph :is(svg,.sheen-icon){inline-size:25px;block-size:25px}'.replace(' :is', ':is'));
  has('.sheen-status p{margin:0;max-inline-size:34ch;font-size:15px;line-height:1.3}');
  has('.sheen-status-title{margin:0;font-size:22px;line-height:1.2;font-weight:700;letter-spacing:-.022em;color:var(--sheen-text)}');
});

test('in Arabic the top toast keeps to the end edge (the left), logical as every sheen part; an app that wants the mockup\'s right edge sets it in its own CSS', () => {
  has('sheen-toaster[position="top"]{inset-block:var(--sheen-toaster-top,20px) auto;inset-inline-end:var(--sheen-toaster-end,20px);');
  assert.ok(!css.includes('[dir="rtl"] sheen-toaster'));
});

test('solid layers take each mockup layer\'s own fill and shadow', () => {
  const normalized = (s) => s.replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
  // menus and the command palette: surface, hairline and a soft drop
  has(normalized(':root .sheen-solid :is(.sheen-menu.sheen-glass,.sheen-cmd.sheen-glass){background:var(--sheen-surface);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 0 0 1px var(--sheen-separator),0 14px 34px rgba(16,20,30,.14),0 2px 6px rgba(16,20,30,.06)}'));
  // side panels: the sheet and a shadow toward the page, mirrored in Arabic
  has(normalized(':root .sheen-solid sheen-side-panel.sheen-glass,:root sheen-side-panel.sheen-solid.sheen-glass{background:var(--sheen-sheet);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:-20px 0 60px rgba(0,0,0,.12)}'));
  has(normalized(':root .sheen-solid sheen-side-panel.sheen-glass:dir(rtl),:root sheen-side-panel.sheen-solid.sheen-glass:dir(rtl){box-shadow:20px 0 60px rgba(0,0,0,.12)}'));
  // toasts: the sheet and a drop, no hairline
  has(normalized(':root .sheen-solid .sheen-toast.sheen-glass{background:var(--sheen-sheet);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 10px 30px rgba(0,0,0,.18)}'));
  // hover cards: the sheet, hairline and a drop
  has(normalized(':root .sheen-solid sheen-hover-card.sheen-glass,:root sheen-hover-card.sheen-solid.sheen-glass{background:var(--sheen-sheet);-webkit-backdrop-filter:none;backdrop-filter:none;box-shadow:0 0 0 1px var(--sheen-separator),0 12px 32px rgba(0,0,0,.18)}'));
  has(normalized(':root .sheen-solid :is(.sheen-menu,.sheen-cmd,.sheen-toast,sheen-side-panel,sheen-hover-card).sheen-glass::after,:root :is(sheen-side-panel,sheen-hover-card).sheen-solid.sheen-glass::after{content:none}'));
});

test('a sortable header in a small table leaves all its padding to the button', () => {
  // the small table's 10px 14px cell padding has the same specificity as the 0.6.0 rule and comes later, so the small
  // table says it again: a sortable header row is 56px as the mockup's, not 59px with padding on top of the button's
  has('.sheen-table.sheen-small th:has(>.sheen-sort-button){padding:0}');
  assert.ok(css.indexOf('.sheen-table.sheen-small th:has(>.sheen-sort-button){padding:0}') > css.indexOf('.sheen-table.sheen-small th{'));
  assert.ok(min.includes('.sheen-table.sheen-small th:has(>.sheen-sort-button){padding:0}'));
});
