// 0.8.0 the minimum gap: one token, --sheen-space-min, is the least room between two boxes the kit lays out. Every kit
// layout gap between boxes is floored at it, and dialog and panel bodies keep it between two boxes they stack.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const css = read('dist/sheen.css').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const tokens = JSON.parse(read('tokens/tokens.json'));
const has = (part) => assert.ok(css.includes(part), part);
const floor = (v) => `max(var(--sheen-space-min),${v})`;

test('one token: space.min is 8 in tokens.json and --sheen-space-min:8px on :root, set once', () => {
  assert.equal(tokens.space.min, 8);
  const root = css.match(/:root\{[^}]*\}/)[0];
  assert.ok(root.includes('--sheen-space-min:8px;'));
  assert.equal(css.split('--sheen-space-min:').length - 1, 1, 'set once, the same in light and dark');
});

test('every kit layout gap between boxes is floored at the token, with the same value as before', () => {
  for (const [rule, gap] of [
    ['.sheen-stack{display:flex;flex-direction:column;', floor('var(--sheen-gap,12px)')],
    ['.sheen-row{display:flex;align-items:center;', floor('var(--sheen-gap,12px)')],
    ['.sheen-chip-row{display:flex;flex-wrap:wrap;', floor('8px')],
    ['.sheen-fields{display:grid;grid-template-columns:repeat(var(--sheen-cols,2),minmax(0,1fr));', floor('10px')],
    ['.sheen-choices{display:flex;flex-direction:column;', floor('10px')],
    ['.sheen-dialog-foot{display:flex;justify-content:flex-end;flex-wrap:wrap;', floor('10px')],
    ['.sheen-empty-actions{display:flex;flex-wrap:wrap;justify-content:center;', floor('8px')],
    ['.sheen-form{display:flex;flex-direction:column;', floor('14px')],
    ['.sheen-list-kit{display:flex;flex-direction:column;', floor('12px')],
    ['.sheen-find-row{display:flex;align-items:center;', floor('8px')],
    ['.sheen-applied-row{display:flex;align-items:center;', floor('8px')],
    ['.sheen-list-message-actions{display:flex;', floor('8px')],
    ['.sheen-page-head{display:flex;flex-wrap:wrap;align-items:flex-end;', floor('16px')],
    ['.sheen-page-head-actions{display:flex;flex-wrap:wrap;', floor('8px')],
    ['.sheen-status-actions{display:flex;flex-direction:column;', floor('8px')],
    ['.sheen-panel-foot{display:flex;flex-wrap:wrap;', floor('10px')],
    ['.sheen-dialog.sheen-small{display:flex;flex-direction:column;', floor('10px')],
  ]) has(rule + 'gap:' + gap);
  has('.sheen-fields.sheen-small{gap:' + floor('12px') + ' ' + floor('16px') + '}');
  assert.match(css, /\.sheen-filter-footer\{[^}]*gap:max\(var\(--sheen-space-min\),10px\)/);
  assert.match(css, /\.sheen-bulk-bar\{[^}]*gap:max\(var\(--sheen-space-min\),10px\)/);
  assert.match(css, /gap:max\(var\(--sheen-space-min\),var\(--sheen-gap,24px\)\)/, 'the grid');
});

test('no kit layout gap between boxes is left under the token', () => {
  // The gaps that stay under 8px join parts of one control (tabs in a segmented bar, a label over its box, key caps of one
  // shortcut, rows of one list) or follow a mockup that draws them closer (the pager's arrows, a bulk bar's actions).
  for (const rule of ['.sheen-stack{', '.sheen-row{', '.sheen-fields{', '.sheen-fields.sheen-small{', '.sheen-form{', '.sheen-dialog-foot{', '.sheen-panel-foot{', '.sheen-chip-row{']) {
    const body = css.slice(css.indexOf(rule)).match(/\{([^}]*)\}/)[1];
    assert.match(body, /gap:max\(var\(--sheen-space-min\)/, rule);
  }
});

// The body rules, applied by a tiny cascade: jsdom has no layout, so read the matching rules' margin from the built CSS
// through the CSSOM and check which children they reach.
function body(kind, inner) {
  const dom = new JSDOM(`<!doctype html><html><head><style>${read('dist/sheen.css')}</style></head><body><div class="${kind}">${inner}</div></body></html>`);
  const w = dom.window, box = w.document.querySelector('.' + kind);
  const rules = [...w.document.styleSheets[0].cssRules].filter((r) => r.selectorText && r.style && r.style.getPropertyValue('margin-block-start') === 'var(--sheen-space-min)');
  return [...box.children].map((c) => ({ id: c.id, spaced: rules.some((r) => c.matches(r.selectorText)) }));
}
const spaced = (list) => list.filter((c) => c.spaced).map((c) => c.id);

test('a dialog body keeps the minimum between two boxes it stacks, the date field, the times row and the hub field among them', () => {
  const kids = body('sheen-dialog-body',
    '<p id="help" class="sheen-footnote">Help</p><div id="date" class="sheen-field"></div><div id="times"><div class="sheen-field"></div><div class="sheen-field"></div></div>'
    + '<p id="error" class="sheen-field-error">Error</p><label id="hub" class="sheen-field"></label><div id="reason" class="sheen-field"></div>');
  assert.deepEqual(spaced(kids), ['date', 'times', 'hub', 'reason'], 'every box after another child; never the first child, never a paragraph');
});

test('a panel body keeps the minimum only between two boxes: text, filter groups and the footer keep their own spacing', () => {
  const kids = body('sheen-panel-body',
    '<h2 id="title">Filters</h2><div id="g1" class="sheen-filter-group"></div><div id="g2" class="sheen-filter-group"></div>'
    + '<div id="fields" class="sheen-fields sheen-small"></div><label id="switch" class="sheen-switch sheen-switch-row"></label><p id="note">Note</p><div id="after"></div>');
  assert.deepEqual(spaced(kids), ['switch'], 'only the switch row after the field grid');
});

test('a popup wider than the room on both sides keeps the minimum gap from the screen edges; one that fits still lines up with its button', async () => {
  const { page } = await import('./setup.mjs');
  const w = page('<sheen-menu-button label="Views"></sheen-menu-button>');
  w.document.documentElement.style.setProperty('--sheen-space-min', '8px');
  Object.defineProperty(w, 'innerWidth', { value: 390, configurable: true });
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'a', label: 'A' }];
  const button = m.querySelector('button'), list = m.querySelector('[role="menu"]');
  let width = 374;
  button.getBoundingClientRect = () => ({ left: 150, right: 260, top: 50, bottom: 86, width: 110, height: 36 });
  list.getBoundingClientRect = () => ({ left: 0, right: width, top: 0, bottom: 100, width, height: 100 });
  button.click();
  assert.equal(list.style.left, '8px', 'a 374px popup in a 390px window: 8px from each edge');
  button.click();
  width = 386;
  button.click();
  assert.equal(list.style.left, '2px', 'less room than twice the gap: the room is shared on both sides');
  button.click();
  width = 200;
  button.getBoundingClientRect = () => ({ left: 186, right: 386, top: 50, bottom: 86, width: 200, height: 36 });
  button.click();
  assert.equal(list.style.left, '186px', 'a popup that fits lines up with its button, even 4px from the edge');
});

test('the body rules sit at no specificity, so a page rule or a kit rule that sets the margin wins', () => {
  assert.ok(css.includes(':where(.sheen-dialog-body,.sheen-panel-body)>:where(:not('), 'both bodies, at no specificity');
  assert.ok(css.includes(':where(.sheen-dialog-body)>:where(p,h1,h2,h3,h4,h5,h6,ul,ol,dl,hr,pre,blockquote,figure)+:where(:not('));
  // the panel footer's own auto margin still pushes it to the bottom
  has('.sheen-panel-body>:is(.sheen-filter-footer,.sheen-panel-foot){margin-block-start:auto}');
});
