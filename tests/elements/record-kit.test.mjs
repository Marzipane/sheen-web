import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';

const tick = (ms) => new Promise((done) => setTimeout(done, ms));

function hoverCard() {
  const w = page('<a id="t" href="/x">Ref</a><sheen-hover-card delay="20" label="Details"><p>Facts</p><button>Act</button></sheen-hover-card>');
  const card = w.document.querySelector('sheen-hover-card');
  const trigger = w.document.getElementById('t');
  card.attach(trigger);
  return { w, card, trigger };
}

test('hover card: opens after the delay, not before, and leaving early sends nothing', async () => {
  const { w, card, trigger } = hoverCard();
  const opened = record(card, 'sheen-hover-open');
  trigger.dispatchEvent(new w.Event('pointerenter'));
  trigger.dispatchEvent(new w.Event('pointerleave'));
  await tick(40);
  assert.equal(card.hidden, true);
  assert.equal(opened.length, 0);
  trigger.dispatchEvent(new w.Event('pointerenter'));
  assert.equal(card.hidden, true);
  await tick(40);
  assert.equal(card.hidden, false);
  assert.equal(opened.length, 1);
});

test('hover card: a touch never opens it', async () => {
  const { w, card, trigger } = hoverCard();
  const e = new w.Event('pointerenter');
  e.pointerType = 'touch';
  trigger.dispatchEvent(e);
  await tick(40);
  assert.equal(card.hidden, true);
});

test('hover card: Space on the focused trigger opens it with no pointer, and Esc closes it and returns focus', () => {
  const { w, card, trigger } = hoverCard();
  trigger.focus();
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(key(w, trigger, ' '), false); // handled: the page doesn't scroll
  assert.equal(card.hidden, false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(w.document.activeElement, card.querySelector('button'));
  key(w, card, 'Escape');
  assert.equal(card.hidden, true);
  assert.equal(w.document.activeElement, trigger);
});

test('hover card: it stays while the pointer is over it (WCAG 1.4.13)', async () => {
  const { w, card, trigger } = hoverCard();
  trigger.dispatchEvent(new w.Event('pointerenter'));
  await tick(40);
  trigger.dispatchEvent(new w.Event('pointerleave'));
  card.dispatchEvent(new w.Event('pointerenter'));
  await tick(260);
  assert.equal(card.hidden, false);
  card.dispatchEvent(new w.Event('pointerleave'));
  await tick(260);
  assert.equal(card.hidden, true);
});

test('hover card: it has a name and a dialog role, and takes its words from attributes', () => {
  const { card, trigger } = hoverCard();
  assert.equal(card.getAttribute('role'), 'dialog');
  assert.equal(card.getAttribute('aria-modal'), 'false');
  assert.equal(card.getAttribute('aria-label'), 'Details');
  assert.equal(trigger.getAttribute('aria-haspopup'), 'dialog');
});

test('side panel: opens without a backdrop, takes focus, Esc closes and returns it', () => {
  const w = page('<button id="b">Open</button><sheen-side-panel label="Record" close-label="Close"><p>Body</p></sheen-side-panel>');
  const panel = w.document.querySelector('sheen-side-panel');
  const closed = record(panel, 'sheen-panel-close');
  const opener = w.document.getElementById('b');
  opener.focus();
  assert.equal(panel.hidden, true);
  panel.open();
  assert.equal(panel.hidden, false);
  assert.equal(panel.getAttribute('aria-modal'), 'false');
  assert.ok(panel.contains(w.document.activeElement));
  assert.equal(panel.querySelector('button').getAttribute('aria-label'), 'Close');
  assert.match(panel.textContent, /Body/);
  key(w, panel, 'Escape');
  assert.equal(panel.hidden, true);
  assert.equal(closed.length, 1);
  assert.equal(w.document.activeElement, opener);
});

const areas = [
  { id: 'area:dubai', label: 'Dubai', items: [{ id: 'zone:marina', label: 'Marina' }, { id: 'zone:jlt', label: 'JLT' }, { id: 'zone:palm', label: 'Palm' }] },
  { id: 'area:abudhabi', label: 'Abu Dhabi', items: [{ id: 'zone:yas', label: 'Yas' }] },
];

function picker(value) {
  const w = page('<sheen-scope-picker label="Zones" all-label="All" chosen-label="Only these" except-label="All except" search-label="Search" select-shown-label="Select all shown"></sheen-scope-picker>');
  const p = w.document.querySelector('sheen-scope-picker');
  p.groups = areas;
  if (value) p.value = value;
  return { w, p, changes: record(p, 'sheen-scope-change') };
}
const box = (p, id) => p.querySelector(`input[type=checkbox][value="${id}"]`);
const tickBox = (w, b) => { b.checked = !b.checked; b.dispatchEvent(new w.Event('change', { bubbles: true })); };

test('scope picker: all needs no lists, and the choices hide', () => {
  const { p } = picker();
  assert.deepEqual(JSON.parse(JSON.stringify(p.value)), { mode: 'all', include: [], exclude: [] });
  assert.equal(p.querySelectorAll('input[type=checkbox]').length, 0);
});

test('scope picker: a whole group is stored as the group, so a new member joins the rule', () => {
  const { w, p, changes } = picker({ mode: 'only', include: [], exclude: [] });
  tickBox(w, box(p, 'area:dubai'));
  assert.deepEqual(changes.at(-1), { mode: 'only', include: ['area:dubai'], exclude: [] });
  assert.equal(box(p, 'zone:marina').checked, true);
});

test('scope picker: picking every member turns into the group; unpicking one keeps the others by name', () => {
  const { w, p, changes } = picker({ mode: 'only', include: ['zone:marina', 'zone:jlt'], exclude: [] });
  assert.equal(box(p, 'area:dubai').indeterminate, true);
  tickBox(w, box(p, 'zone:palm'));
  assert.deepEqual(changes.at(-1).include, ['area:dubai']);
  assert.equal(box(p, 'area:dubai').indeterminate, false);
  tickBox(w, box(p, 'zone:palm'));
  assert.deepEqual(changes.at(-1).include.slice().sort(), ['zone:jlt', 'zone:marina']);
});

test('scope picker: all except keeps what is left out in exclude', () => {
  const { w, p, changes } = picker({ mode: 'all_except', include: [], exclude: [] });
  tickBox(w, box(p, 'zone:palm'));
  assert.deepEqual(changes.at(-1), { mode: 'all_except', include: [], exclude: ['zone:palm'] });
});

test('scope picker: search filters, and Select all shown takes only what is shown', () => {
  const { w, p, changes } = picker({ mode: 'only', include: [], exclude: [] });
  const search = p.querySelector('input[type=search]');
  search.value = 'ya';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(box(p, 'zone:marina'), null);
  p.querySelector('.sheen-scope-shown').click();
  assert.deepEqual(changes.at(-1).include, ['area:abudhabi']);
});

test('scope picker: ticking a row keeps focus on that row, group or item', () => {
  const { w, p } = picker({ mode: 'only', include: [], exclude: [] });
  for (const id of [areas[0].items[0].id, areas[0].id]) {
    const row = box(p, id);
    row.focus();
    row.click();
    assert.equal(w.document.activeElement, box(p, id));
  }
});

test('scope picker: a search that finds nothing says so', () => {
  const { p } = picker();
  p.setAttribute('empty-label', 'Nothing found');
  p.value = { mode: 'only', include: [], exclude: [] };
  const search = p.querySelector('input[type=search]');
  search.value = 'zzz';
  search.dispatchEvent(new search.ownerDocument.defaultView.Event('input'));
  assert.equal(p.querySelector('.sheen-scope-empty').textContent, 'Nothing found');
  search.value = '';
  search.dispatchEvent(new search.ownerDocument.defaultView.Event('input'));
  assert.equal(p.querySelector('.sheen-scope-empty'), null);
});

test('scope picker: modes are radios with one name, and the result line uses the page words', () => {
  const { p } = picker();
  const radios = [...p.querySelectorAll('input[type=radio]')];
  assert.equal(radios.length, 3);
  assert.equal(new Set(radios.map((r) => r.name)).size, 1);
  p.setAttribute('result', 'Applies to 43 of 46 zones');
  assert.match(p.textContent, /Applies to 43 of 46 zones/);
  assert.equal(p.querySelector('[role="status"]').textContent, 'Applies to 43 of 46 zones');
});

function menu() {
  const w = page('<sheen-menu-button label="Export"></sheen-menu-button>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'csv', label: 'CSV' }, { id: 'pdf', label: 'PDF', disabled: true }, { id: 'xlsx', label: 'XLSX' }];
  return { w, m, picks: record(m, 'sheen-menu-select'), button: m.querySelector('button') };
}

test('menu button: keyboard opens it, arrows skip a disabled item, Enter picks and returns focus', () => {
  const { w, m, picks, button } = menu();
  assert.equal(button.getAttribute('aria-haspopup'), 'menu');
  button.focus();
  key(w, button, 'ArrowDown');
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(w.document.activeElement.textContent, 'CSV');
  key(w, w.document.activeElement, 'ArrowDown');
  assert.equal(w.document.activeElement.textContent, 'XLSX');
  key(w, w.document.activeElement, 'Enter');
  assert.deepEqual(picks, [{ id: 'xlsx' }]);
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  assert.equal(w.document.activeElement, button);
});

test('menu button: a menu that would leave the screen flips to the other edge', () => {
  const { w, m, button } = menu();
  const list = m.querySelector('[role="menu"]');
  list.getBoundingClientRect = () => ({ left: -40, right: 140 });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-flip'), true);
  key(w, w.document.activeElement, 'Escape');
  list.getBoundingClientRect = () => ({ left: 10, right: 190 });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-flip'), false);
});
test('menu button: Esc closes it and picks nothing', () => {
  const { w, m, picks, button } = menu();
  button.click();
  key(w, w.document.activeElement, 'Escape');
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  assert.equal(picks.length, 0);
  assert.equal(w.document.activeElement, button);
});

test('words set after the element is on the page take effect, as a framework binding sets them', () => {
  const w = page('<sheen-hover-card></sheen-hover-card><sheen-side-panel></sheen-side-panel><sheen-scope-picker></sheen-scope-picker><sheen-menu-button></sheen-menu-button>');
  const d = w.document;
  d.querySelector('sheen-hover-card').setAttribute('label', 'Facts');
  assert.equal(d.querySelector('sheen-hover-card').getAttribute('aria-label'), 'Facts');
  d.querySelector('sheen-side-panel').setAttribute('close-label', 'Close');
  assert.equal(d.querySelector('sheen-side-panel button').getAttribute('aria-label'), 'Close');
  const picker = d.querySelector('sheen-scope-picker');
  picker.setAttribute('all-label', 'All');
  picker.setAttribute('label', 'Zones');
  assert.match(picker.querySelector('legend').textContent, /Zones/);
  assert.match(picker.querySelectorAll('.sheen-scope-mode')[0].textContent, /All/);
  d.querySelector('sheen-menu-button').setAttribute('label', 'Export');
  assert.equal(d.querySelector('sheen-menu-button button').textContent, 'Export');
});
