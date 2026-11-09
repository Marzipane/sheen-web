import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record, plain } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const pkg = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

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
  { id: 'group:a', label: 'Group A', items: [{ id: 'item:1', label: 'Item 1' }, { id: 'item:2', label: 'Item 2' }, { id: 'item:3', label: 'Item 3' }] },
  { id: 'group:b', label: 'Group B', items: [{ id: 'item:4', label: 'Item Four' }] },
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
  tickBox(w, box(p, 'group:a'));
  assert.deepEqual(changes.at(-1), { mode: 'only', include: ['group:a'], exclude: [] });
  assert.equal(box(p, 'item:1').checked, true);
});

test('scope picker: picking every member turns into the group; unpicking one keeps the others by name', () => {
  const { w, p, changes } = picker({ mode: 'only', include: ['item:1', 'item:2'], exclude: [] });
  assert.equal(box(p, 'group:a').indeterminate, true);
  tickBox(w, box(p, 'item:3'));
  assert.deepEqual(changes.at(-1).include, ['group:a']);
  assert.equal(box(p, 'group:a').indeterminate, false);
  tickBox(w, box(p, 'item:3'));
  assert.deepEqual(changes.at(-1).include.slice().sort(), ['item:1', 'item:2']);
});

test('scope picker: all except keeps what is left out in exclude', () => {
  const { w, p, changes } = picker({ mode: 'all_except', include: [], exclude: [] });
  tickBox(w, box(p, 'item:3'));
  assert.deepEqual(changes.at(-1), { mode: 'all_except', include: [], exclude: ['item:3'] });
});

test('scope picker: search filters, and Select all shown takes only what is shown', () => {
  const { w, p, changes } = picker({ mode: 'only', include: [], exclude: [] });
  const search = p.querySelector('input[type=search]');
  search.value = 'fou';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(box(p, 'item:1'), null);
  p.querySelector('.sheen-scope-shown').click();
  assert.deepEqual(changes.at(-1).include, ['group:b']);
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

// ---- 0.5.0 fixes from the release review of 0.4.0

const rect = (r) => () => ({ left: r.left, top: r.top, right: r.left + r.width, bottom: r.top + r.height, width: r.width, height: r.height, x: r.left, y: r.top });
function sized(el, width, height) {
  Object.defineProperty(el, 'offsetWidth', { configurable: true, get: () => width });
  Object.defineProperty(el, 'offsetHeight', { configurable: true, get: () => height });
}

test('hover card: placed under the trigger on open, from the end edge in Arabic', () => {
  for (const dir of ['ltr', 'rtl']) {
    const w = page('<a id="t" href="/x">Ref</a><sheen-hover-card delay="20" label="Details"><p>Facts</p></sheen-hover-card>', dir);
    const card = w.document.querySelector('sheen-hover-card');
    const trigger = w.document.getElementById('t');
    card.attach(trigger);
    w.innerWidth = 1000; w.innerHeight = 700;
    // the trigger's start edge is 100 px from the window's start edge in both directions
    trigger.getBoundingClientRect = rect({ left: dir === 'rtl' ? 820 : 100, top: 100, width: 80, height: 20 });
    sized(card, 300, 200);
    card.open();
    assert.equal(card.style.top, '128px');
    assert.equal(card.style.insetInlineStart, '100px');
  }
});

test('hover card: closing sets aria-expanded back and fires sheen-hover-close once', () => {
  const { card, trigger } = hoverCard();
  const closed = record(card, 'sheen-hover-close');
  card.open();
  card.close();
  card.close();
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(closed.length, 1);
});

test('hover card: Esc closes a card opened by hover while focus is elsewhere, and moves no focus (WCAG 1.4.13)', async () => {
  const { w, card, trigger } = hoverCard();
  trigger.dispatchEvent(new w.Event('pointerenter'));
  await tick(40);
  assert.equal(card.hidden, false);
  assert.equal(w.document.activeElement, w.document.body);
  key(w, w.document.body, 'Escape');
  assert.equal(card.hidden, true);
  assert.equal(w.document.activeElement, w.document.body);
});

test('hover card: a card opened by Space closes when the keyboard leaves it', () => {
  const w = page('<a id="t" href="/x">Ref</a><sheen-hover-card delay="20" label="Details"><button>Act</button></sheen-hover-card><button id="after">After</button>');
  const card = w.document.querySelector('sheen-hover-card');
  const trigger = w.document.getElementById('t');
  card.attach(trigger);
  trigger.focus();
  key(w, trigger, ' ');
  assert.equal(card.hidden, false);
  w.document.getElementById('after').focus();
  assert.equal(card.hidden, true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
});

test('hover card: focus moving from the card back to its trigger keeps it open', () => {
  const { w, card, trigger } = hoverCard();
  trigger.focus();
  key(w, trigger, ' ');
  trigger.focus();
  assert.equal(card.hidden, false);
});

test('hover card: placed again when its content changes size, and never taller than the window', () => {
  const w = page('<a id="t" href="/x">Ref</a><sheen-hover-card label="Details"></sheen-hover-card>');
  const seen = [];
  w.ResizeObserver = class { constructor(cb) { this.cb = cb; seen.push(this); } observe(el) { this.el = el; } disconnect() { this.off = true; } };
  const card = w.document.querySelector('sheen-hover-card');
  const trigger = w.document.getElementById('t');
  card.attach(trigger);
  w.innerWidth = 1000; w.innerHeight = 700;
  trigger.getBoundingClientRect = rect({ left: 100, top: 420, width: 80, height: 20 });
  sized(card, 300, 40);
  card.open();
  assert.equal(seen.at(-1).el, card); // it watches the card itself, so a change of its content size places it again
  assert.equal(card.style.top, '448px');
  sized(card, 300, 560);
  seen.at(-1).cb([]);
  assert.equal(card.style.top, '12px'); // fits neither below nor above: pinned to the top margin, and scrolls inside
  card.close();
  assert.equal(seen.at(-1).off, true);
  assert.match(css, /sheen-hover-card\.sheen-glass\{[^}]*max-block-size:calc\(100vh - 24px\)[^}]*overflow:auto/);
});

test('hover card: inside a box that holds fixed children (glass, transforms), it still lands beside the trigger', () => {
  const w = page('<div class="sheen-glass" id="box"><a id="t" href="/x">Ref</a><sheen-hover-card label="Details"></sheen-hover-card></div>');
  const card = w.document.querySelector('sheen-hover-card');
  const trigger = w.document.getElementById('t');
  card.attach(trigger);
  w.innerWidth = 1000; w.innerHeight = 700;
  trigger.getBoundingClientRect = rect({ left: 300, top: 200, width: 80, height: 22 });
  sized(card, 300, 200);
  // the box's corner is the card's origin: at top 0 and start 0 the card sits at (300, 200)
  card.getBoundingClientRect = () => {
    const top = parseFloat(card.style.top) + 200, left = parseFloat(card.style.insetInlineStart) + 300;
    return { left, top, right: left + 300, bottom: top + 200, width: 300, height: 200 };
  };
  card.open();
  const box = card.getBoundingClientRect();
  assert.equal(box.left, 300);
  assert.equal(box.top, 230);
});

test('hover card: attach() to another trigger cleans the old one and drops a pending open', async () => {
  const w = page('<a id="t" href="/x">Ref</a><a id="u" href="/y">Other</a><sheen-hover-card delay="20" label="Details"></sheen-hover-card>');
  const card = w.document.querySelector('sheen-hover-card');
  const [t, u] = [w.document.getElementById('t'), w.document.getElementById('u')];
  card.attach(t);
  card.open();
  card.attach(u);
  assert.equal(t.hasAttribute('aria-expanded'), false);
  assert.equal(t.hasAttribute('aria-haspopup'), false);
  assert.equal(card.hidden, true);
  t.dispatchEvent(new w.Event('pointerenter'));
  card.attach(t);
  card.attach(u);
  await tick(40);
  assert.equal(card.hidden, true);
});

test('hover card: moving the card in the page keeps its trigger and adds no second set of listeners', () => {
  const w = page('<a id="t" href="/x">Ref</a><div id="elsewhere"></div><sheen-hover-card label="Details"></sheen-hover-card>');
  const card = w.document.querySelector('sheen-hover-card');
  const trigger = w.document.getElementById('t');
  card.attach(trigger);
  w.document.getElementById('elsewhere').appendChild(card);
  assert.equal(card.trigger, trigger);
  const closed = record(card, 'sheen-hover-close');
  card.open();
  card.focus();
  key(w, card, 'Escape');
  assert.equal(card.hidden, true);
  assert.equal(closed.length, 1);
  assert.equal(w.document.activeElement, trigger);
});

test('hover card: delay="0" means no delay', () => {
  const w = page('<sheen-hover-card delay="0"></sheen-hover-card><sheen-hover-card></sheen-hover-card>');
  const [zero, plain] = w.document.querySelectorAll('sheen-hover-card');
  assert.equal(zero.delay, 0);
  assert.equal(plain.delay, 350);
});

test('side panel: the close button closes it', () => {
  const w = page('<sheen-side-panel label="Record" close-label="Close"><p>Body</p></sheen-side-panel>');
  const panel = w.document.querySelector('sheen-side-panel');
  panel.open();
  panel.querySelector('.sheen-panel-close').click();
  assert.equal(panel.hidden, true);
});

test('side panel: children added after it is on the page go into its body', async () => {
  const w = page('');
  const panel = w.document.createElement('sheen-side-panel');
  w.document.body.appendChild(panel);
  const p = w.document.createElement('p');
  panel.appendChild(p);
  await tick(0);
  assert.equal(p.parentNode, panel.querySelector('.sheen-panel-body'));
  assert.equal(panel.children.length, 2);
});

test('side panel: opened again from inside, it keeps the first opener for when it closes', () => {
  const w = page('<button id="b">Open</button><sheen-side-panel label="Record" close-label="Close"><button id="next">Next</button></sheen-side-panel>');
  const panel = w.document.querySelector('sheen-side-panel');
  const opener = w.document.getElementById('b');
  opener.focus();
  panel.open();
  w.document.getElementById('next').focus();
  panel.open();
  panel.close();
  assert.equal(w.document.activeElement, opener);
});

test('one Esc closes only the innermost layer: a menu inside a side panel', () => {
  const w = page('<sheen-side-panel label="Record" close-label="Close"><sheen-menu-button label="Export"></sheen-menu-button></sheen-side-panel>');
  const panel = w.document.querySelector('sheen-side-panel');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'csv', label: 'CSV' }];
  panel.open();
  m.querySelector('button').click();
  key(w, w.document.activeElement, 'Escape');
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  assert.equal(panel.hidden, false);
  key(w, w.document.activeElement, 'Escape');
  assert.equal(panel.hidden, true);
});

test('one Esc closes only the innermost layer: a hover card inside a side panel', () => {
  const w = page('<sheen-side-panel label="Record" close-label="Close"><a id="t" href="/x">Ref</a><sheen-hover-card label="Details"><button>Act</button></sheen-hover-card></sheen-side-panel>');
  const panel = w.document.querySelector('sheen-side-panel');
  const card = w.document.querySelector('sheen-hover-card');
  const trigger = w.document.getElementById('t');
  card.attach(trigger);
  panel.open();
  trigger.focus();
  key(w, trigger, ' ');
  key(w, w.document.activeElement, 'Escape');
  assert.equal(card.hidden, true);
  assert.equal(panel.hidden, false);
});

test('scope picker: focus comes back to the row in the same group when one id sits in two groups', () => {
  const w = page('<sheen-scope-picker></sheen-scope-picker>');
  const p = w.document.querySelector('sheen-scope-picker');
  p.groups = [{ id: 'g:h', label: 'H', items: [{ id: 'x', label: 'X' }, { id: 'y', label: 'Y' }] }, { id: 'g:j', label: 'J', items: [{ id: 'x', label: 'X' }, { id: 'z', label: 'Z' }] }];
  p.value = { mode: 'only', include: [], exclude: [] };
  // The row in the second group: without the group check, focus would land on the first match.
  const second = p.querySelectorAll('input[type=checkbox][value="x"]')[1];
  second.focus();
  second.click();
  assert.equal(w.document.activeElement, p.querySelectorAll('input[type=checkbox][value="x"]')[1]);
});

test('scope picker: Select all shown leaves out a group with nothing shown', () => {
  const w = page('<sheen-scope-picker></sheen-scope-picker>');
  const p = w.document.querySelector('sheen-scope-picker');
  p.groups = [...areas, { id: 'group:empty', label: 'Empty', items: [] }];
  p.value = { mode: 'all_except', include: [], exclude: [] };
  const changes = record(p, 'sheen-scope-change');
  const search = p.querySelector('input[type=search]');
  search.value = 'fou';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  p.querySelector('.sheen-scope-shown').click();
  assert.deepEqual(changes.at(-1).exclude, ['group:b']);
});

test('scope picker: switching mode fires a change, and a rule carries only the list its mode reads', () => {
  const { w, p, changes } = picker({ mode: 'only', include: ['item:1'], exclude: ['item:4'] });
  const radio = (v) => p.querySelector(`input[type=radio][value="${v}"]`);
  radio('all').checked = true;
  radio('all').dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.deepEqual(changes.at(-1), { mode: 'all', include: [], exclude: [] });
  assert.deepEqual(plain(p.value), { mode: 'all', include: [], exclude: [] });
  radio('only').checked = true;
  radio('only').dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.deepEqual(changes.at(-1), { mode: 'only', include: ['item:1'], exclude: [] }); // switching back restores the picks
});

test('scope picker: search matches a group label and shows the whole group', () => {
  const { w, p } = picker({ mode: 'only', include: [], exclude: [] });
  const search = p.querySelector('input[type=search]');
  search.value = 'group a';
  search.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.ok(box(p, 'item:1'));
  assert.ok(box(p, 'item:3'));
  assert.equal(box(p, 'item:4'), null);
});

test('menu button: its own button closes it, and a disabled item cannot be picked by mouse', () => {
  const { m, picks, button } = menu();
  button.click();
  button.click();
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.click();
  [...m.querySelectorAll('[role="menuitem"]')][1].click();
  assert.equal(picks.length, 0);
});

test('menu button: a press outside closes it without taking focus', () => {
  const w = page('<sheen-menu-button label="Export"></sheen-menu-button><input id="out">');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'csv', label: 'CSV' }];
  m.querySelector('button').click();
  const out = w.document.getElementById('out');
  out.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
  // Closed by the press itself, before focus moves (a press on a non-focusable area moves no focus at all).
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  out.focus();
  assert.equal(m.querySelector('button').getAttribute('aria-expanded'), 'false');
  assert.equal(w.document.activeElement, out);
});

test('menu button: Tab out of the menu closes it', () => {
  const w = page('<sheen-menu-button label="Export"></sheen-menu-button><button id="next">Next</button>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'csv', label: 'CSV' }];
  m.querySelector('button').click();
  w.document.getElementById('next').focus();
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  assert.equal(m.querySelector('button').getAttribute('aria-expanded'), 'false');
  assert.equal(w.document.activeElement, w.document.getElementById('next'));
});

test('menu button: a menu with nothing to pick still closes on Esc', () => {
  const w = page('<sheen-menu-button label="Export"></sheen-menu-button>');
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'csv', label: 'CSV', disabled: true }];
  m.querySelector('button').click();
  key(w, w.document.activeElement, 'Escape');
  assert.equal(m.querySelector('[role="menu"]').hidden, true);
  assert.equal(w.document.activeElement, m.querySelector('button'));
});

test('menu button: a menu that would run off the bottom opens upward, and it scrolls when long', () => {
  const { w, m, button } = menu();
  const list = m.querySelector('[role="menu"]');
  w.innerHeight = 700;
  list.getBoundingClientRect = () => ({ left: 10, right: 190, top: 680, bottom: 793 });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-up'), true);
  key(w, w.document.activeElement, 'Escape');
  list.getBoundingClientRect = () => ({ left: 10, right: 190, top: 100, bottom: 213 });
  button.click();
  assert.equal(list.classList.contains('sheen-menu-up'), false);
  assert.match(css, /\.sheen-menu\.sheen-menu-up\{[^}]*inset-block-end:100%/);
  assert.match(css, /\.sheen-menu\{[^}]*max-block-size:[^;}]+;[^}]*overflow:auto/);
});

test('every record-kit element has its rules in sheen.css', () => {
  for (const sel of ['sheen-hover-card.sheen-glass{', 'sheen-side-panel.sheen-glass{', 'sheen-scope-picker{', '.sheen-scope-list{', 'sheen-menu-button{', '.sheen-menu{', '.sheen-menu-item{']) {
    assert.ok(css.includes(sel), sel);
  }
});

test('elements report the package version', () => {
  const w = page('');
  assert.equal(w.sheenElements.version, pkg.version);
});

test('hover card: a click on the trigger drops a pending open and closes the card, so the next Esc goes to what the click opened', async () => {
  const { w, card, trigger } = hoverCard();
  trigger.addEventListener('click', (e) => e.preventDefault());
  trigger.dispatchEvent(new w.Event('pointerenter'));
  trigger.click();
  await tick(40);
  assert.equal(card.hidden, true);
  card.open();
  trigger.click();
  assert.equal(card.hidden, true);
});

test('menu button: with glyph, the button shows the glyph and its label is the accessible name', () => {
  const w = page('<sheen-menu-button label="More actions" glyph="more"></sheen-menu-button>');
  const m = w.document.querySelector('sheen-menu-button');
  const button = m.querySelector('button');
  assert.equal(button.className, 'sheen-icon-button');
  assert.equal(button.getAttribute('aria-label'), 'More actions');
  assert.equal(button.textContent, '');
  assert.ok(button.querySelector('svg.sheen-glyph[aria-hidden="true"]'));
  assert.equal(m.querySelector('[role="menu"]').getAttribute('aria-label'), 'More actions');
  m.setAttribute('label', 'Other');
  assert.equal(button.getAttribute('aria-label'), 'Other');
  m.removeAttribute('glyph');
  assert.equal(button.className, 'sheen-button');
  assert.equal(button.textContent, 'Other');
  assert.equal(button.hasAttribute('aria-label'), false);
});

test('menu button: without glyph, the label is the button text', () => {
  const { button } = menu();
  assert.equal(button.className, 'sheen-button');
  assert.equal(button.textContent, 'Export');
  assert.equal(button.hasAttribute('aria-label'), false);
});

// WCAG contrast of the tone text drawn on its own tint, over every surface of each theme.
function hex(h) { return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255); }
function mixed(a, b, p) { return a.map((v, i) => v * p + b[i] * (1 - p)); }
function luminance(c) { const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); const [r, g, b] = c.map(f); return 0.2126 * r + 0.7152 * g + 0.0722 * b; }
function contrast(a, b) { const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
function tokens(block) { return Object.fromEntries([...block.matchAll(/--sheen-([a-z-]+):(#[0-9A-Fa-f]{6})/g)].map((m) => [m[1], m[2]])); }

test('tone pills and badges reach WCAG AA (4.5:1) on their tint in light and dark', () => {
  const light = tokens(css.match(/:root\[data-theme="light"\]\{[^}]*\}/)[0]);
  const dark = tokens(css.match(/:root\[data-theme="dark"\]\{[^}]*\}/)[0]);
  const rules = [['pill', 'success', 16], ['pill', 'warning', 16], ['pill', 'danger', 16], ['badge.sheen-ok', 'success', 14], ['badge.sheen-warn', 'warning', 14], ['badge.sheen-bad', 'danger', 14]];
  for (const [cls, tone, tint] of rules) {
    const sel = cls.startsWith('badge') ? `.sheen-${cls}` : `.sheen-pill.sheen-${tone}`;
    const rule = css.match(new RegExp(sel.replace(/\./g, '\\.') + '\\{[^}]*\\}'))[0];
    const share = Number(rule.match(new RegExp(`color:color-mix\\(in srgb,var\\(--sheen-${tone}\\) (\\d+)%,var\\(--sheen-text\\)\\)`))[1]) / 100;
    for (const t of [light, dark]) {
      for (const under of ['surface', 'background', 'surface-muted', 'sheet']) {
        const back = mixed(hex(t[tone]), hex(t[under]), tint / 100);
        const text = mixed(hex(t[tone]), hex(t.text), share);
        assert.ok(contrast(text, back) >= 4.5, `${sel} on ${under}: ${contrast(text, back).toFixed(2)}`);
      }
    }
  }
});

test('a table wrapper contains visually hidden text, so it never widens the page', () => {
  assert.match(css, /\.sheen-table-wrap\{[^}]*overflow-x:auto[^}]*position:relative/);
});
