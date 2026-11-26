// 0.11.1: the command palette shows every row while its box is empty and every match once something is typed (up to
// 0.11.0 it drew the first 60 and dropped the rest); PageDown and PageUp move by 10 rows; a group's head scrolls into
// view with the group's first row.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page, key, record } from './setup.mjs';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');

// 150 rows in three groups: 10 actions, 130 pages, then 10 settings at the end, where the old cap of 60 cut off.
const many = () => [
  ...Array.from({ length: 10 }, (_, i) => ({ id: 'a' + (i + 1), group: 'Actions', label: 'Action ' + (i + 1) })),
  ...Array.from({ length: 130 }, (_, i) => ({ id: 'p' + (i + 1), group: 'Pages', label: 'Page ' + (i + 1) })),
  ...Array.from({ length: 10 }, (_, i) => ({ id: 's' + (i + 1), group: 'Settings', label: 'Setting ' + (i + 1) })),
];

function palette(attrs = '', dir = 'ltr') {
  const w = page(`<sheen-command-palette label="Command bar" ${attrs}></sheen-command-palette>`, dir);
  const p = w.document.querySelector('sheen-command-palette');
  p.items = many();
  return { w, p };
}

const options = (p) => [...p.querySelectorAll('[role="option"]')];
const active = (w, p) => w.document.getElementById(p.input.getAttribute('aria-activedescendant'));

test('empty box: every row shows, past the old 60, under each group\'s head, in the items\' order', () => {
  for (const dir of ['ltr', 'rtl']) {
    const { p } = palette('', dir);
    p.open();
    const rows = options(p);
    assert.equal(rows.length, 150, dir);
    assert.equal(rows[0].textContent, 'Action 1');
    assert.equal(rows[149].textContent, 'Setting 10', 'the last group shows without typing');
    assert.deepEqual([...p.querySelectorAll('.sheen-cmd-group')].map((g) => g.textContent), ['Actions', 'Pages', 'Settings']);
  }
});

test('typed words: every match shows, with the free-text row first', () => {
  const { p } = palette('submit-label="Run “@q”"');
  p.open('page');
  const rows = options(p);
  assert.equal(rows.length, 131);
  assert.equal(rows[0].textContent, 'Run “page”');
  assert.equal(rows[130].textContent, 'Page 130');
  p.value = 'setting';
  assert.equal(options(p).length, 11);
});

test('rows hidden until typed stay out of the empty box and all show once typed', () => {
  const w = page('<sheen-command-palette></sheen-command-palette>');
  const p = w.document.querySelector('sheen-command-palette');
  p.items = [{ id: 'x', label: 'Shown' },
    ...Array.from({ length: 70 }, (_, i) => ({ id: 'r' + i, group: 'Records', label: 'Record ' + i, hideUntilTyped: true }))];
  p.open();
  assert.deepEqual(options(p).map((o) => o.textContent), ['Shown']);
  p.value = 'record';
  assert.equal(options(p).length, 70);
});

test('keys over 150 rows: arrows wrap, Ctrl+Home and Ctrl+End reach the ends, PageDown and PageUp move 10 and stop at the ends', () => {
  const { w, p } = palette();
  const picked = record(p, 'sheen-select');
  p.open();
  key(w, p.input, 'ArrowUp');
  assert.equal(active(w, p).textContent, 'Setting 10', 'up from the first row wraps to the last');
  assert.equal(active(w, p).getAttribute('aria-selected'), 'true');
  key(w, p.input, 'ArrowDown');
  assert.equal(active(w, p).textContent, 'Action 1', 'down from the last row wraps to the first');
  assert.equal(key(w, p.input, 'PageDown'), false, 'PageDown is the palette\'s, not the page\'s');
  assert.equal(active(w, p).textContent, 'Page 1');
  key(w, p.input, 'PageDown');
  assert.equal(active(w, p).textContent, 'Page 11');
  for (let i = 0; i < 20; i++) key(w, p.input, 'PageDown');
  assert.equal(active(w, p).textContent, 'Setting 10', 'PageDown stops at the last row');
  assert.equal(key(w, p.input, 'PageUp'), false);
  assert.equal(active(w, p).textContent, 'Page 130');
  for (let i = 0; i < 20; i++) key(w, p.input, 'PageUp');
  assert.equal(active(w, p).textContent, 'Action 1', 'PageUp stops at the first row');
  key(w, p.input, 'End', { ctrlKey: true });
  assert.equal(active(w, p).textContent, 'Setting 10');
  key(w, p.input, 'Enter');
  assert.equal(picked[0].item.id, 's10');
  key(w, p.input, 'Home', { ctrlKey: true });
  assert.equal(active(w, p).textContent, 'Action 1');
  assert.equal(options(p).filter((o) => o.getAttribute('aria-selected') === 'true').length, 1, 'one row is active');
});

test('PageDown in a short list goes to its last row', () => {
  const w = page('<sheen-command-palette></sheen-command-palette>');
  const p = w.document.querySelector('sheen-command-palette');
  p.items = [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }];
  p.open();
  key(w, p.input, 'PageDown');
  assert.equal(active(w, p).textContent, 'Three');
  key(w, p.input, 'PageUp');
  assert.equal(active(w, p).textContent, 'One');
});

test('the active row scrolls into view, and a group\'s first row brings its head along', () => {
  const { w, p } = palette();
  const seen = [];
  w.Element.prototype.scrollIntoView = function () { seen.push(this); };
  p.open();
  const head = (name) => [...p.querySelectorAll('.sheen-cmd-group')].find((g) => g.textContent === name);
  key(w, p.input, 'End', { ctrlKey: true });
  assert.equal(seen.at(-1), active(w, p), 'the last row');
  seen.length = 0;
  key(w, p.input, 'Home', { ctrlKey: true });
  assert.deepEqual(seen, [head('Actions'), active(w, p)], 'the first row and the head above it');
  for (let i = 0; i < 10; i++) key(w, p.input, 'ArrowDown');
  assert.equal(active(w, p).textContent, 'Page 1');
  assert.deepEqual(seen.slice(-2), [head('Pages'), active(w, p)], 'down into a group');
  key(w, p.input, 'ArrowDown');
  assert.equal(seen.at(-1), active(w, p));
  assert.notEqual(seen.at(-2), head('Pages'), 'a row inside the group scrolls alone');
  seen.length = 0;
  key(w, p.input, 'ArrowUp');
  assert.deepEqual(seen, [head('Pages'), active(w, p)], 'up onto a group\'s first row');
  seen.length = 0;
  const hovered = options(p).find((o) => o.textContent === 'Setting 1');
  hovered.dispatchEvent(new w.Event('pointermove'));
  assert.equal(active(w, p), hovered, 'the row under the pointer becomes active');
  assert.equal(hovered.getAttribute('aria-selected'), 'true');
  assert.deepEqual(seen, [], 'hovering scrolls nothing');
});

test('0.11.1: the version', () => {
  assert.equal(JSON.parse(read('package.json')).version, '0.11.1');
  const w = page('');
  assert.equal(w.sheenElements.version, '0.11.1');
});
