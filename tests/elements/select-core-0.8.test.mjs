// 0.8.0: <sheen-select>, its core (75-select.js): the native select wrapped in place and kept as the form control, the
// roles and names, open and close, the active option, the keys, type-ahead and the sync with a framework that sets the
// select by property. The page here loads the bundle without 76-select-more.js, so the core is proven on its own.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM, VirtualConsole } from 'jsdom';
import { readFileSync } from 'node:fs';
import { key, plain } from './setup.mjs';

const full = readFileSync(new URL('../../dist/sheen-elements.js', import.meta.url), 'utf8');
// The core alone: the bundle without the "more" file (search, clear, chips), which adds methods to SheenSelect.prototype.
const core = full.replace(/\/\/ ---- 76-select-more\.js\n[\s\S]*?(?=\/\/ ---- )/, '');

function page(html = '', dir = 'ltr') {
  const dom = new JSDOM(`<!doctype html><html dir="${dir}"><body>${html}</body></html>`,
    { runScripts: 'outside-only', virtualConsole: new VirtualConsole(), pretendToBeVisual: true });
  dom.window.eval(core);
  return dom.window;
}

const HUB = `<form><label class="sheen-form-field sheen-small"><span>Hub</span>
  <sheen-select placeholder="All hubs">
    <select name="hub" required>
      <option value="">All hubs</option>
      <optgroup label="North"><option value="b">Al Barsha</option><option value="m" data-hint="2 vans">Marina</option></optgroup>
      <option value="d" disabled>Downtown</option>
    </select>
  </sheen-select></label></form><button id="after">After</button>`;

function made(html = HUB, dir) {
  const w = page(html, dir);
  const el = w.document.querySelector('sheen-select');
  return { w, el, native: el.querySelector('select'), trigger: el.querySelector('.sheen-select-trigger'),
    pop: el.querySelector('.sheen-select-pop'), list: el.querySelector('[role="listbox"]') };
}
const rows = (list) => [...list.querySelectorAll('[role="option"]')];
const words = (row) => row.querySelector('.sheen-select-label').textContent;
const active = (list) => [...list.querySelectorAll('.sheen-active')].map(words);
const shown = (trigger) => [...trigger.children].map((c) => c.className + ':' + c.textContent);
const tick = (w) => new Promise((r) => w.setTimeout(r, 0));
function events(at, native) {
  const seen = [];
  for (const type of ['input', 'change']) at.addEventListener(type, (e) => { if (e.target === native) seen.push(type + ':' + native.value); });
  return seen;
}

test('select: the native select is wrapped in place and its options are listed as role=option rows', () => {
  const { w, el, native, trigger, pop, list } = made();
  assert.equal(el.select, native);
  assert.equal(el.native, native);
  assert.equal(w.document.forms[0].elements.hub, native, 'the page\'s own select stays the form control');
  assert.equal(el.firstElementChild, native, 'the native select stays first');
  assert.equal(native.className, 'sheen-select-native');
  assert.equal(native.getAttribute('tabindex'), '-1');
  assert.equal(native.getAttribute('aria-hidden'), 'true');
  assert.equal(native.required, true);
  const chevron = el.querySelector(':scope > .sheen-select-chevron');
  assert.deepEqual([...el.children], [native, trigger, chevron, pop], 'native, trigger, chevron, popup');

  assert.equal(trigger.tagName, 'BUTTON');
  assert.equal(trigger.type, 'button');
  assert.equal(trigger.getAttribute('role'), 'combobox');
  assert.equal(trigger.getAttribute('aria-haspopup'), 'listbox');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.ok(list.id);
  assert.equal(trigger.getAttribute('aria-controls'), list.id);
  assert.equal(trigger.getAttribute('aria-required'), 'true');
  assert.equal(chevron.tagName.toLowerCase(), 'svg');
  assert.ok(chevron.classList.contains('sheen-glyph'));
  assert.equal(chevron.getAttribute('aria-hidden'), 'true');
  assert.equal(chevron.getAttribute('width'), '18');

  assert.equal(pop.className, 'sheen-select-pop sheen-menu sheen-glass');
  assert.ok(pop.id && pop.id !== list.id);
  assert.equal(pop.hidden, true);
  assert.equal(list.className, 'sheen-select-list');
  assert.equal(list.getAttribute('tabindex'), '-1');
  assert.equal(list.hasAttribute('aria-multiselectable'), false);

  const all = rows(list);
  assert.deepEqual(all.map(words), ['All hubs', 'Al Barsha', 'Marina', 'Downtown']);
  assert.equal(new Set(all.map((r) => r.id)).size, 4, 'each row has its own id');
  assert.deepEqual(all.map((r) => r.getAttribute('aria-selected')), ['true', 'false', 'false', 'false']);
  assert.deepEqual(all.map((r) => r.getAttribute('aria-disabled')), [null, null, null, 'true']);
  for (const r of all) {
    assert.equal(r.className, 'sheen-select-option');
    const [check, box] = r.children;
    assert.equal(check.className, 'sheen-select-check');
    assert.equal(check.getAttribute('aria-hidden'), 'true');
    assert.equal(box.className, 'sheen-select-words');
  }
  assert.equal(all[2].querySelector('small.sheen-select-hint').textContent, '2 vans');
  assert.equal(all[1].querySelector('.sheen-select-hint'), null, 'no hint, no second line');

  const group = list.querySelector('.sheen-select-group');
  const heading = group.firstElementChild;
  assert.equal(group.getAttribute('role'), 'group');
  assert.equal(heading.className, 'sheen-menu-heading sheen-select-heading');
  assert.equal(heading.getAttribute('role'), 'presentation');
  assert.equal(heading.textContent, 'North');
  assert.equal(group.getAttribute('aria-labelledby'), heading.id);
  assert.deepEqual([...group.querySelectorAll('[role="option"]')].map(words), ['Al Barsha', 'Marina']);
  assert.deepEqual([...list.children].map((c) => c.className), ['sheen-select-option', 'sheen-select-group', 'sheen-select-option'], 'document order');

  assert.deepEqual(plain(el.items.map((i) => [i.value, i.label, i.hint, i.disabled])),
    [['', 'All hubs', '', false], ['b', 'Al Barsha', '', false], ['m', 'Marina', '2 vans', false], ['d', 'Downtown', '', true]]);
  el.items.forEach((i, n) => { assert.equal(i.row, all[n]); assert.equal(i.option, native.options[n]); });
  assert.equal(el.items[0].group, null);
  assert.equal(el.items[1].group, group, 'group is the role=group element');
});

test('select: the field shows the chosen label, or the placeholder when nothing is chosen', () => {
  const { el, native, trigger } = made();
  // The "" option has a label: it shows, but nothing counts as chosen.
  assert.deepEqual(shown(trigger), ['sheen-select-value:All hubs']);
  assert.equal(el.hasAttribute('data-chosen'), false);
  native.value = 'b';
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha']);
  assert.equal(el.hasAttribute('data-chosen'), true);
  native.selectedIndex = -1;
  assert.deepEqual(shown(trigger), ['sheen-select-placeholder:All hubs']);
  assert.equal(el.hasAttribute('data-chosen'), false);
  const blank = made('<sheen-select placeholder="Pick a zone"><select><option value="x"></option><option value="y">Y</option></select></sheen-select>');
  assert.deepEqual(shown(blank.trigger), ['sheen-select-placeholder:Pick a zone'], 'a chosen option with an empty label');
  blank.el.setAttribute('placeholder', 'Any zone');
  assert.deepEqual(shown(blank.trigger), ['sheen-select-placeholder:Any zone'], 'follows the attribute');
});

test('select: FormData and form reset keep the native value; the field follows a reset', async () => {
  const { w, el, native, trigger, list } = made(HUB.replace('<option value="b">', '<option value="b" selected>'));
  const form = w.document.forms[0];
  assert.equal(new w.FormData(form).get('hub'), 'b');
  el.open();
  rows(list)[2].click();
  assert.equal(new w.FormData(form).get('hub'), 'm');
  form.reset();
  assert.equal(native.value, 'b', 'the browser resets the native select');
  await tick(w);
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha'], 'the field follows after the reset');
  assert.deepEqual(rows(list).map((r) => r.getAttribute('aria-selected')), ['false', 'true', 'false', 'false']);
});

test('select: the trigger and the list are named by the native select\'s labels, or by the label attribute', () => {
  // A <label> around the field: its words, not the whole label (that would read the value and the open list in too).
  const { w, trigger, list } = made();
  const words = w.document.querySelector('label > span');
  assert.ok(words.id, 'a part without an id gets one');
  assert.equal(trigger.getAttribute('aria-labelledby'), words.id);
  assert.equal(list.getAttribute('aria-labelledby'), words.id);
  assert.equal(trigger.hasAttribute('aria-label'), false);
  const hinted = made('<label><span>Hub</span><sheen-select><select><option>A</option></select></sheen-select><small>Where the van starts</small></label>');
  const [title, hint] = hinted.w.document.querySelectorAll('label > span, label > small');
  assert.equal(hinted.trigger.getAttribute('aria-labelledby'), title.id + ' ' + hint.id, 'every part outside the field, in order');

  const two = made('<label id="own" for="z">Zone</label><label>Area <sheen-select><select id="z"><option>A</option></select></sheen-select></label>');
  const ids = [...two.w.document.querySelectorAll('label')].map((l) => l.id);
  assert.equal(ids[0], 'own', 'an id the page gave is kept');
  assert.equal(two.trigger.getAttribute('aria-labelledby').split(' ').sort().join(' '), ids.sort().join(' '));

  const named = made('<sheen-select label="Zone"><select><option>A</option></select></sheen-select>');
  assert.equal(named.trigger.getAttribute('aria-label'), 'Zone');
  assert.equal(named.list.getAttribute('aria-label'), 'Zone');
  assert.equal(named.trigger.hasAttribute('aria-labelledby'), false);
  named.el.setAttribute('label', 'Area');
  assert.equal(named.trigger.getAttribute('aria-label'), 'Area', 'follows the attribute');
});

test('select: required, aria-invalid and disabled follow the native select and its fieldset', async () => {
  const { w, el, native, trigger } = made('<form><fieldset><sheen-select><select name="a" required aria-invalid="true"><option value="x">X</option></select></sheen-select></fieldset></form>');
  const fieldset = w.document.querySelector('fieldset');
  assert.equal(trigger.getAttribute('aria-required'), 'true');
  assert.equal(trigger.getAttribute('aria-invalid'), 'true', 'mirrored from the native select');
  native.removeAttribute('aria-invalid');
  native.required = false;
  await tick(w);
  assert.equal(trigger.hasAttribute('aria-invalid'), false);
  assert.equal(trigger.hasAttribute('aria-required'), false);

  native.disabled = true;
  await tick(w);
  assert.equal(trigger.disabled, true);
  assert.equal(el.hasAttribute('data-disabled'), true);
  el.querySelector('.sheen-select-chevron').dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  el.open();
  assert.equal(el.isOpen(), false, 'a disabled select does not open');
  native.disabled = false;
  await tick(w);
  assert.equal(trigger.disabled, false);
  assert.equal(el.hasAttribute('data-disabled'), false);

  fieldset.disabled = true;
  await tick(w);
  assert.equal(trigger.disabled, true, 'a disabled fieldset disables the trigger');
  assert.equal(el.hasAttribute('data-disabled'), true);
  fieldset.disabled = false;
  await tick(w);
  assert.equal(trigger.disabled, false);

  el.open();
  native.disabled = true;
  await tick(w);
  assert.equal(el.isOpen(), false, 'disabling an open select closes it');

  const off = made('<fieldset disabled><sheen-select><select><option>X</option></select></sheen-select></fieldset>');
  assert.equal(off.trigger.disabled, true, 'disabled from the start');
});

test('select: a press on the trigger or the field opens and closes the list as a popup sized to the field', () => {
  const { w, el, native, trigger, pop, list } = made();
  el.getBoundingClientRect = () => ({ left: 100, right: 340, top: 50, bottom: 88, width: 240, height: 38 });
  native.value = 'm';
  trigger.click();
  assert.equal(el.isOpen(), true);
  assert.equal(el.hasAttribute('data-open'), true);
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(pop.hidden, false);
  assert.equal(pop.style.getPropertyValue('--sheen-select-anchor-size'), '240px');
  assert.equal(pop.style.left, '100px', 'placed under the field by the popup helper');
  assert.equal(pop.style.top, '94px');
  assert.deepEqual(active(list), ['Marina'], 'the chosen option is active');
  assert.equal(trigger.getAttribute('aria-activedescendant'), rows(list)[2].id);
  assert.equal(w.document.activeElement, trigger);
  trigger.click();
  assert.equal(el.isOpen(), false);
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(pop.hidden, true);
  assert.equal(trigger.hasAttribute('aria-activedescendant'), false);
  assert.deepEqual(active(list), []);

  const chevron = el.querySelector('.sheen-select-chevron');
  const press = () => chevron.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(press(), false, 'a press on the field box is handled (a <label> around it does nothing more)');
  assert.equal(el.isOpen(), true);
  assert.equal(w.document.activeElement, trigger, 'focus goes to the trigger');
  press();
  assert.equal(el.isOpen(), false);

  native.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.equal(el.isOpen(), false, 'a click a label sends to the native select does not open');
  el.open();
  w.document.body.dispatchEvent(new w.Event('pointerdown', { bubbles: true }));
  assert.equal(el.isOpen(), false, 'a press outside closes');
  native.focus();
  assert.equal(w.document.activeElement, trigger, 'focus sent to the native select (a label, a form check) lands on the trigger');
});

test('select: opening makes the chosen option active, else the first enabled one, and scrolls it into view', () => {
  const { w, el, native, list } = made('<sheen-select><select><option value="a" disabled>A</option><option value="b">B</option><option value="c">C</option></select></sheen-select>');
  const seen = [];
  w.Element.prototype.scrollIntoView = function (o) { seen.push([this.textContent, o && o.block]); };
  native.value = 'c';
  el.open();
  assert.deepEqual(active(list), ['C']);
  assert.deepEqual(seen, [['C', 'nearest']]);
  el.close();
  native.selectedIndex = -1;
  el.open();
  assert.deepEqual(active(list), ['B'], 'nothing chosen: the first enabled option');
  el.close();
  native.value = 'a';
  el.open();
  assert.deepEqual(active(list), ['B'], 'a disabled chosen option is never active');
});

test('select: Down, Up, Enter, Space and Alt+Down open the closed list; Home and End open on the first and last option', () => {
  for (const [k, opts] of [['ArrowDown'], ['ArrowUp'], ['Enter'], [' '], ['ArrowDown', { altKey: true }]]) {
    const { w, el, native, trigger, list } = made();
    native.value = 'b';
    assert.equal(key(w, trigger, k, opts), false, `${k} is handled`);
    assert.equal(el.isOpen(), true, k);
    assert.deepEqual(active(list), ['Al Barsha'], k);
  }
  const home = made();
  home.native.value = 'b';
  key(home.w, home.trigger, 'Home');
  assert.deepEqual(active(home.list), ['All hubs']);
  const end = made();
  key(end.w, end.trigger, 'End');
  assert.equal(end.el.isOpen(), true);
  assert.deepEqual(active(end.list), ['Marina'], 'the disabled last option is skipped');
  const esc = made();
  assert.equal(key(esc.w, esc.trigger, 'Escape'), true, 'Esc on a closed select is left to the page');
  assert.equal(key(esc.w, esc.trigger, 'Tab'), true);
  assert.equal(esc.el.isOpen(), false);
});

test('select: while open, Down and Up move over enabled options and stop at the ends; Home, End, PageDown and PageUp jump', () => {
  const { w, trigger, list } = made();
  key(w, trigger, 'ArrowDown');
  const walk = (k, opts) => { assert.equal(key(w, trigger, k, opts), false, k); return active(list)[0]; };
  assert.equal(walk('ArrowDown'), 'Al Barsha');
  assert.equal(walk('ArrowDown'), 'Marina');
  assert.equal(walk('ArrowDown'), 'Marina', 'stops at the end, the disabled option skipped');
  assert.equal(walk('Home'), 'All hubs');
  assert.equal(walk('ArrowUp'), 'All hubs', 'stops at the start');
  assert.equal(walk('End'), 'Marina');
  assert.equal(trigger.getAttribute('aria-activedescendant'), rows(list)[2].id);

  const options = Array.from({ length: 25 }, (_, i) => `<option value="${i + 1}">Area ${i + 1}</option>`).join('');
  const long = made(`<sheen-select><select>${options}</select></sheen-select>`);
  key(long.w, long.trigger, 'ArrowDown');
  const jump = (k) => { key(long.w, long.trigger, k); return active(long.list)[0]; };
  assert.equal(jump('PageDown'), 'Area 11');
  assert.equal(jump('PageDown'), 'Area 21');
  assert.equal(jump('PageDown'), 'Area 25');
  assert.equal(jump('PageUp'), 'Area 15');
  assert.equal(jump('PageUp'), 'Area 5');
  assert.equal(jump('PageUp'), 'Area 1');
});

test('select: the mouse moves the active option over enabled rows', () => {
  const { w, el, trigger, list } = made();
  el.open();
  const move = (row, x) => row.dispatchEvent(new w.MouseEvent('mousemove', { bubbles: true, clientX: x, clientY: 10 }));
  move(rows(list)[2], 5);
  assert.deepEqual(active(list), ['Marina']);
  assert.equal(trigger.getAttribute('aria-activedescendant'), rows(list)[2].id);
  move(rows(list)[3], 6);
  assert.deepEqual(active(list), ['Marina'], 'a disabled row never becomes active');
  move(rows(list)[1].querySelector('.sheen-select-label'), 7);
  assert.deepEqual(active(list), ['Al Barsha'], 'from any part of the row');
});

test('select: Enter picks the active option in a single list: input then change once, the list closes, focus back on the trigger', () => {
  const { w, el, native, trigger, list } = made();
  const seen = events(w.document.forms[0], native);
  trigger.focus();
  key(w, trigger, 'ArrowDown');
  key(w, trigger, 'ArrowDown');
  key(w, trigger, 'ArrowDown');
  assert.equal(key(w, trigger, 'Enter'), false);
  assert.deepEqual(seen, ['input:m', 'change:m'], 'input then change, once, bubbling');
  assert.equal(el.isOpen(), false);
  assert.equal(w.document.activeElement, trigger);
  assert.equal(native.value, 'm');
  assert.equal(el.value, 'm');
  assert.deepEqual(shown(trigger), ['sheen-select-value:Marina']);
  assert.deepEqual(rows(list).map((r) => r.getAttribute('aria-selected')), ['false', 'false', 'true', 'false']);

  key(w, trigger, 'ArrowDown');
  key(w, trigger, 'ArrowUp');
  assert.equal(key(w, trigger, ' '), false, 'Space on the trigger picks as Enter does');
  assert.deepEqual(seen.slice(2), ['input:b', 'change:b']);
  assert.equal(el.isOpen(), false);

  key(w, trigger, 'ArrowDown');
  key(w, trigger, 'Enter');
  assert.equal(seen.length, 4, 'picking the chosen option fires nothing');
  assert.equal(el.isOpen(), false, 'and closes');

  key(w, trigger, 'ArrowDown');
  key(w, trigger, 'ArrowDown');
  assert.equal(key(w, trigger, 'ArrowUp', { altKey: true }), false);
  assert.deepEqual(seen.slice(4), ['input:m', 'change:m'], 'Alt+Up picks the active option and closes');
  assert.equal(el.isOpen(), false);
  assert.equal(w.document.activeElement, trigger);
});

test('select: a press on an option picks it; a disabled option does nothing; a press inside the list keeps focus where it is', () => {
  const { w, el, native, trigger, list } = made();
  const seen = events(native, native);
  trigger.focus();
  el.open();
  const press = (row) => row.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
  press(rows(list)[3]);
  assert.equal(el.isOpen(), true, 'a disabled option does nothing');
  assert.deepEqual(seen, []);
  assert.equal(rows(list)[2].dispatchEvent(new w.MouseEvent('mousedown', { bubbles: true, cancelable: true })), false, 'mousedown is held, focus never moves into the list');
  assert.equal(press(rows(list)[2].querySelector('.sheen-select-hint')), false, 'the press is handled, so a <label> around it does nothing more');
  assert.deepEqual(seen, ['input:m', 'change:m']);
  assert.equal(el.isOpen(), false);
  assert.equal(w.document.activeElement, trigger);
  el.open();
  press(rows(list)[2]);
  assert.equal(seen.length, 2, 'the chosen option again: nothing fires');
  assert.equal(el.isOpen(), false);
});

test('select: Esc closes one layer: handled, focus back on the trigger; Tab closes and lets focus move on', () => {
  const { w, el, trigger } = made();
  const outer = [];
  w.document.addEventListener('keydown', (e) => outer.push(e.key + ':' + e.defaultPrevented));
  trigger.focus();
  key(w, trigger, 'ArrowDown');
  assert.equal(key(w, trigger, 'Escape'), false);
  assert.equal(el.isOpen(), false);
  assert.equal(w.document.activeElement, trigger);
  assert.equal(outer.at(-1), 'Escape:true', 'a panel around it sees the Esc handled');
  key(w, trigger, 'ArrowDown');
  assert.equal(key(w, trigger, 'Tab'), true, 'Tab is not held');
  assert.equal(el.isOpen(), false);

  el.open();
  w.document.getElementById('after').focus();
  assert.equal(el.isOpen(), false, 'focus moving out closes the list');
  assert.equal(w.document.activeElement.id, 'after', 'and stays where it went');
});

test('select: a multiple list toggles with Enter, Space and a press, and stays open; without "more" the field joins the labels', () => {
  const { w, el, native, trigger, list } = made('<form><sheen-select placeholder="Any zone"><select name="zone" multiple><option value="b">Al Barsha</option><option value="m">Marina</option><option value="d">Downtown</option></select></sheen-select></form>');
  const seen = events(native, native);
  assert.equal(el.hasAttribute('data-multiple'), true);
  assert.equal(list.getAttribute('aria-multiselectable'), 'true');
  assert.deepEqual(shown(trigger), ['sheen-select-placeholder:Any zone']);
  assert.equal(el.hasAttribute('data-chosen'), false);
  key(w, trigger, 'ArrowDown');
  assert.deepEqual(active(list), ['Al Barsha'], 'nothing chosen: the first option');
  key(w, trigger, 'Enter');
  assert.equal(el.isOpen(), true, 'stays open');
  assert.deepEqual(seen, ['input:b', 'change:b']);
  assert.deepEqual(rows(list).map((r) => r.getAttribute('aria-selected')), ['true', 'false', 'false']);
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha']);
  assert.equal(el.hasAttribute('data-chosen'), true);
  key(w, trigger, 'ArrowDown');
  key(w, trigger, ' ');
  assert.deepEqual(plain(el.values), ['b', 'm']);
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha, Marina']);
  key(w, trigger, 'Enter');
  assert.deepEqual(plain(el.values), ['b'], 'toggles off');
  assert.equal(seen.length, 6);
  rows(list)[2].click();
  assert.equal(el.isOpen(), true);
  assert.deepEqual(plain(el.values), ['b', 'd']);
  assert.equal(key(w, trigger, 'ArrowUp', { altKey: true }), false);
  assert.equal(el.isOpen(), false, 'Alt+Up closes');
  assert.deepEqual(plain(el.values), ['b', 'd'], 'without toggling');

  const before = seen.length;
  el.values = ['m', 'd'];
  assert.deepEqual([...native.options].map((o) => o.selected), [false, true, true]);
  assert.deepEqual(shown(trigger), ['sheen-select-value:Marina, Downtown']);
  assert.deepEqual(plain(new w.FormData(w.document.forms[0]).getAll('zone')), ['m', 'd']);
  assert.equal(seen.length, before, 'nothing fires when the page sets the values');
  el.open();
  assert.deepEqual(active(list), ['Marina'], 'opening: the first chosen option is active');
});

test('select: values and value on a single list', () => {
  const { el, native, trigger } = made();
  el.value = 'm';
  assert.equal(native.value, 'm');
  assert.deepEqual(plain(el.values), ['m']);
  el.values = ['b'];
  assert.equal(el.value, 'b');
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha']);
  el.values = [];
  assert.equal(native.selectedIndex, -1);
  assert.deepEqual(shown(trigger), ['sheen-select-placeholder:All hubs']);
});

test('select: type-ahead opens and moves to the first match, case- and accent-blind; one letter repeated cycles; the buffer clears after 500 ms', () => {
  const { w, el, trigger, list } = made('<sheen-select><select><option value="">Any</option><option>Al Barsha</option><option>Al Quoz</option><option>Marina</option><option>Mirdif</option><option>Émirates Hills</option><option>Business Bay</option><option disabled>Deira</option></select></sheen-select>');
  let now = 10000;
  w.Date.now = () => now;
  const type = (k, wait = 100) => { now += wait; key(w, trigger, k); return active(list)[0]; };
  assert.equal(type('m', 0), 'Marina', 'a letter on the closed trigger opens on its first match');
  assert.equal(el.isOpen(), true);
  assert.equal(type('i'), 'Mirdif', 'the letters add up');
  assert.equal(type('e', 600), 'Émirates Hills', 'accent-blind, and the buffer cleared');
  assert.equal(type('A', 600), 'Any', 'case-blind, from the active option on, round the end');
  assert.equal(type('a'), 'Al Barsha', 'the same letter again: the next one with it');
  assert.equal(type('a'), 'Al Quoz');
  assert.equal(type('a'), 'Any', 'and round again');
  now += 600;
  for (const k of ['a', 'l', ' ']) type(k);
  assert.equal(el.isOpen(), true, 'a space inside the typed text does not pick');
  assert.equal(type('q'), 'Al Quoz', 'a space inside the typed text matches');
  assert.equal(type('d', 600), 'Al Quoz', 'a disabled option is never reached');
  assert.equal(key(w, trigger, 'b', { ctrlKey: true }), true, 'a shortcut is no typing');
  assert.equal(active(list)[0], 'Al Quoz');
  key(w, trigger, 'Escape');
  assert.equal(type('b', 600), 'Business Bay');
});

test('select: a framework that sets value, selectedIndex or an option\'s selected by property redraws without events', () => {
  const { w, el, native, trigger, list } = made();
  const seen = events(native, native);
  native.value = 'm';
  assert.equal(native.value, 'm', 'the property still works');
  assert.deepEqual(shown(trigger), ['sheen-select-value:Marina']);
  assert.equal(rows(list)[2].getAttribute('aria-selected'), 'true');
  native.selectedIndex = 1;
  assert.equal(native.selectedIndex, 1);
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha']);
  native.options[0].selected = true;
  assert.equal(native.value, '');
  assert.deepEqual(shown(trigger), ['sheen-select-value:All hubs']);
  assert.deepEqual(rows(list).map((r) => r.getAttribute('aria-selected')), ['true', 'false', 'false', 'false']);
  el.open();
  native.value = 'b';
  assert.equal(el.isOpen(), true, 'an open list stays open');
  assert.equal(rows(list)[1].getAttribute('aria-selected'), 'true');
  assert.deepEqual(seen, [], 'nothing fires');
  // Wrapped for this element alone: on a prototype of its own, between it and the browser's.
  const own = Object.getPrototypeOf(native);
  assert.notEqual(own, w.HTMLSelectElement.prototype);
  assert.equal(Object.getPrototypeOf(own), w.HTMLSelectElement.prototype);
  assert.ok(native instanceof w.HTMLSelectElement);
  assert.notEqual(Object.getPrototypeOf(native.options[1]), w.HTMLOptionElement.prototype);
  const other = w.document.createElement('select');
  other.innerHTML = '<option>A</option>';
  assert.equal(Object.getPrototypeOf(other), w.HTMLSelectElement.prototype, 'another select is untouched');
  assert.equal(Object.getPrototypeOf(other.options[0]), w.HTMLOptionElement.prototype);
  assert.equal(Object.getOwnPropertyDescriptor(w.HTMLSelectElement.prototype, 'value').set.name, 'set value', 'the browser\'s accessor is untouched');
});

test('select: options and groups added, renamed or removed later show up in the list', async () => {
  const { w, el, native, trigger, list } = made();
  const o = w.document.createElement('option');
  o.value = 'j';
  o.textContent = 'Jumeirah';
  native.append(o);
  await tick(w);
  assert.deepEqual(rows(list).map(words), ['All hubs', 'Al Barsha', 'Marina', 'Downtown', 'Jumeirah']);
  assert.equal(el.items.length, 5);
  o.selected = true;
  assert.deepEqual(shown(trigger), ['sheen-select-value:Jumeirah'], 'a new option is wrapped too');
  o.firstChild.data = 'Jumeirah Park';
  await tick(w);
  assert.equal(words(rows(list)[4]), 'Jumeirah Park');
  assert.deepEqual(shown(trigger), ['sheen-select-value:Jumeirah Park']);
  native.options[1].setAttribute('data-hint', '4 vans');
  native.querySelector('optgroup').label = 'North side';
  await tick(w);
  assert.equal(rows(list)[1].querySelector('.sheen-select-hint').textContent, '4 vans');
  assert.equal(list.querySelector('.sheen-select-heading').textContent, 'North side');
  const south = w.document.createElement('optgroup');
  south.label = 'South';
  south.innerHTML = '<option value="q">Al Quoz</option>';
  native.append(south);
  native.options[3].remove();
  await tick(w);
  assert.deepEqual([...list.querySelectorAll('.sheen-select-heading')].map((x) => x.textContent), ['North side', 'South']);
  assert.deepEqual(rows(list).map(words), ['All hubs', 'Al Barsha', 'Marina', 'Jumeirah Park', 'Al Quoz']);
  native.querySelector('optgroup').disabled = true;
  await tick(w);
  assert.deepEqual(rows(list).map((r) => r.getAttribute('aria-disabled')), [null, 'true', 'true', null, null], 'a disabled group disables its options');
});

test('select: without an inner select it makes one from name, multiple and required, and options writes its options', async () => {
  const w = page('<form><sheen-select name="zone" required placeholder="Pick a zone"></sheen-select><sheen-select name="tags" multiple></sheen-select></form>');
  await tick(w);
  const [el, tags] = w.document.querySelectorAll('sheen-select');
  const native = el.select;
  assert.equal(el.firstElementChild, native);
  assert.equal(native.name, 'zone');
  assert.equal(native.required, true);
  assert.equal(native.multiple, false);
  assert.equal(w.document.forms[0].elements.zone, native);
  assert.equal(tags.select.multiple, true);
  assert.equal(tags.hasAttribute('data-multiple'), true);
  el.options = [{ value: 'b', label: 'Al Barsha', group: 'North' }, { value: 'm', label: 'Marina', group: 'North', hint: '2 vans' }, { value: 'd', label: 'Downtown', disabled: true }];
  assert.deepEqual([...native.children].map((c) => c.tagName + ':' + (c.label || '')), ['OPTGROUP:North', 'OPTION:Downtown']);
  assert.equal(native.options[1].getAttribute('data-hint'), '2 vans');
  assert.equal(native.options[2].disabled, true);
  const list = el.querySelector('[role="listbox"]');
  assert.deepEqual(rows(list).map(words), ['Al Barsha', 'Marina', 'Downtown'], 'drawn at once');
  assert.equal(list.querySelector('.sheen-select-heading').textContent, 'North');
  el.value = 'm';
  assert.deepEqual(shown(el.querySelector('.sheen-select-trigger')), ['sheen-select-value:Marina']);
  assert.equal(new w.FormData(w.document.forms[0]).get('zone'), 'm');
  el.options = [{ value: 'x', label: 'Other' }, { value: 'm', label: 'Marina' }];
  assert.equal(el.value, 'm', 'a value still offered stays chosen');
  el.setAttribute('name', 'area');
  assert.equal(native.name, 'area', 'follows its own attributes');
});

test('select: options and value set before the element is built are used when it builds', async () => {
  const w = page('');
  const el = w.document.createElement('sheen-select');
  el.options = [{ value: 'b', label: 'Al Barsha' }, { value: 'm', label: 'Marina' }];
  el.value = 'm';
  w.document.body.append(el);
  await tick(w);
  assert.equal(el.select.value, 'm');
  assert.deepEqual(rows(el.querySelector('[role="listbox"]')).map(words), ['Al Barsha', 'Marina']);
});

test('select: a framework that adds its select after the element connects gets it wrapped, not a second one', async () => {
  const w = page('');
  const el = w.document.createElement('sheen-select');
  w.document.body.append(el);
  const s = w.document.createElement('select');
  s.innerHTML = '<option value="a">A</option>';
  el.append(s);
  await tick(w);
  assert.equal(el.querySelectorAll('select').length, 1);
  assert.equal(el.select, s);
  assert.equal(el.firstElementChild, s);
});

test('select: the core calls the "more" hooks only when they exist, at their moments', () => {
  const w = page('');
  const proto = w.customElements.get('sheen-select').prototype;
  const calls = [];
  proto.setupMore = function () {
    calls.push('setupMore:' + !!(this.native && this.trigger && this.pop && this.list && this.items.length));
    this.pop.prepend(w.document.createElement('input'));
    this.pop.firstChild.className = 'sheen-select-input';
    this.pop.firstChild.addEventListener('keydown', (e) => this.onKey(e));
  };
  proto.drawChosen = function (into) { calls.push('drawChosen:' + (into === this.trigger)); into.append(w.document.createElement('span')); into.lastChild.className = 'sheen-select-chips'; };
  proto.drawClear = function () { calls.push('drawClear'); };
  proto.onOpen = function () { calls.push('onOpen:' + this.isOpen()); this.pop.firstChild.focus(); };
  proto.onClose = function () { calls.push('onClose'); };
  proto.keyMore = function (e) { calls.push('keyMore:' + e.key); return e.key === 'Backspace'; };
  w.document.body.innerHTML = '<sheen-select><select multiple><option value="b">B</option><option value="m" selected>M</option><option value="q">Q</option></select></sheen-select>';
  const el = w.document.querySelector('sheen-select'), trigger = el.trigger, input = el.querySelector('.sheen-select-input');
  assert.equal(calls[0], 'setupMore:true', 'once the DOM and the items are built');
  assert.equal(calls.filter((c) => c.startsWith('setupMore')).length, 1);
  assert.deepEqual(calls.slice(-2), ['drawChosen:true', 'drawClear'], 'the field is drawn with the hooks after setupMore');
  assert.deepEqual(shown(trigger), ['sheen-select-chips:'], 'the chips replace the joined labels');
  calls.length = 0;
  assert.equal(key(w, trigger, 'Backspace'), true);
  assert.deepEqual(calls, ['keyMore:Backspace'], 'a key the hook handled goes no further');
  calls.length = 0;
  key(w, trigger, 'ArrowDown');
  assert.equal(calls[0], 'keyMore:ArrowDown', 'keyMore comes first');
  assert.equal(calls.at(-1), 'onOpen:true', 'onOpen at the end of open()');
  assert.equal(w.document.activeElement, input);
  // With a search input, it carries the active option; the trigger does not.
  assert.equal(input.getAttribute('aria-activedescendant'), el.items[1].row.id);
  assert.equal(trigger.hasAttribute('aria-activedescendant'), false);
  assert.equal(key(w, input, 'ArrowDown'), false, 'the input\'s keys reach the core');
  assert.equal(input.getAttribute('aria-activedescendant'), el.items[2].row.id);
  assert.equal(key(w, input, 'Home'), true, 'Home moves the caret in the input');
  assert.equal(key(w, input, ' '), true, 'Space types a space in the input');
  assert.equal(key(w, input, 'x'), true, 'letters are the search\'s');
  assert.deepEqual(plain(el.values), ['m']);
  key(w, input, 'Enter');
  assert.deepEqual(plain(el.values), ['m', 'q'], 'Enter in the input picks');
  assert.ok(calls.includes('drawChosen:true'));
  calls.length = 0;
  assert.equal(key(w, input, 'Escape'), false);
  assert.deepEqual(calls.filter((c) => c === 'onClose'), ['onClose'], 'onClose in hide()');
  assert.equal(w.document.activeElement, trigger);
  assert.equal(input.hasAttribute('aria-activedescendant'), false);
  assert.equal(key(w, trigger, 'q'), true, 'with a search box a letter on the closed trigger is not held, so it lands in the box');
  assert.equal(el.isOpen(), true);
  assert.equal(w.document.activeElement, input);
  key(w, input, 'Escape');

  w.document.body.innerHTML = '<sheen-select><select><option value="b" selected>B</option></select></sheen-select>';
  assert.equal(calls.includes('drawChosen:true'), false, 'a single select never draws chips');
});

test('select: without "more" there is no search box, no clear button and no chips', () => {
  const { el, native, trigger, pop } = made('<sheen-select search="Search" clear="Clear" empty="No matches" remove="Remove @label"><select multiple><option value="b" selected>Al Barsha</option><option value="m" selected>Marina</option></select></sheen-select>');
  assert.equal(typeof el.setupMore, 'undefined', 'the bundle here has no 76-select-more.js');
  assert.equal(pop.querySelector('input'), null);
  assert.equal(el.querySelector('.sheen-select-clear'), null);
  assert.equal(el.querySelector('.sheen-select-chips'), null);
  assert.deepEqual(shown(trigger), ['sheen-select-value:Al Barsha, Marina']);
  el.open();
  assert.equal(el.isOpen(), true);
  native.options[0].selected = false;
  assert.deepEqual(shown(trigger), ['sheen-select-value:Marina']);
});

test('select: on an Arabic page it works the same, and type-ahead reads Arabic past its marks', () => {
  const { w, el, native, trigger, list } = made('<form><sheen-select placeholder="كل المناطق"><select name="z"><option value="">كل المناطق</option><option value="b">البرشاء</option><option value="m">مَرسى دبي</option><option value="d">ديرة</option></select></sheen-select></form>', 'rtl');
  const seen = events(native, native);
  key(w, trigger, 'ArrowDown');
  key(w, trigger, 'ArrowDown');
  assert.deepEqual(active(list), ['البرشاء']);
  key(w, trigger, 'Enter');
  assert.deepEqual(seen, ['input:b', 'change:b']);
  assert.deepEqual(shown(trigger), ['sheen-select-value:البرشاء']);
  let now = 5000;
  w.Date.now = () => now;
  key(w, trigger, 'م');
  now += 100;
  key(w, trigger, 'ر');
  assert.deepEqual(active(list), ['مَرسى دبي'], 'the fatha between the letters does not stop the match');
  key(w, trigger, 'Escape');
  assert.equal(el.isOpen(), false);
});

test('select: focus leaving the field blurs the native select once, so a form marks it touched', () => {
  const { w, el, native, trigger } = made();
  let blurs = 0, outs = 0;
  native.addEventListener('blur', () => { blurs += 1; });
  native.addEventListener('focusout', () => { outs += 1; });
  trigger.focus();
  el.open();
  assert.equal(blurs, 0, 'opening keeps focus on the trigger: no blur yet');
  w.document.getElementById('after').focus();
  assert.equal(el.isOpen(), false, 'focus that moved on closes the list');
  assert.equal(blurs, 1, 'the native select hears blur once');
  assert.equal(outs, 1, 'and one focusout, which bubbles');
  trigger.focus();
  trigger.blur();
  assert.equal(blurs, 2, 'focus leaving to nothing blurs it too');
});

test('select: taken out of the page it closes; put back it works again', () => {
  const { w, el, trigger } = made();
  el.open();
  const holder = el.parentNode;
  el.remove();
  assert.equal(el.isOpen(), false);
  holder.append(el);
  key(w, trigger, 'ArrowDown');
  assert.equal(el.isOpen(), true);
  assert.equal(el.querySelectorAll('.sheen-select-trigger').length, 1, 'built once');
});
