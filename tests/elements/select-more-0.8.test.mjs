// 0.8.0: the rest of <sheen-select>: the search box in the list, the empty line, the clear button and the chips of a
// multiple select (src/elements/76-select-more.js, on top of the core in 75-select.js).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';

const HUBS = '<option value="">All hubs</option>' +
  '<optgroup label="North"><option value="b">Al Barsha</option><option value="m">Marína</option></optgroup>' +
  '<optgroup label="South"><option value="d">Downtown</option><option value="j">Jumeirah</option></optgroup>' +
  '<option value="w" disabled>Waterfront</option>';
const THREE = '<option value="b">Al Barsha</option><option value="m">Marina</option><option value="d">Downtown</option>';

function parts(w, el) {
  return {
    w, el,
    native: el.querySelector('select'),
    trigger: el.querySelector('.sheen-select-trigger'),
    pop: el.querySelector('.sheen-select-pop'),
    list: el.querySelector('.sheen-select-list'),
    input: el.querySelector('.sheen-select-input'),
    clear: el.querySelector('.sheen-select-clear'),
    empty: el.querySelector('.sheen-select-empty')
  };
}

function made(attrs = '', { options = HUBS, multiple = false, dir = 'ltr', around = (s) => s } = {}) {
  const w = page(around(`<sheen-select label="Hub" ${attrs}><select name="hub"${multiple ? ' multiple' : ''}>${options}</select></sheen-select>`), dir);
  return parts(w, w.document.querySelector('sheen-select'));
}

const label = (row) => row.querySelector('.sheen-select-label').textContent;
// the labels of the option rows a person sees: the row and its group not hidden
const shown = (el) => [...el.querySelectorAll('.sheen-select-option')]
  .filter((r) => !r.hidden && !(r.closest('.sheen-select-group') || {}).hidden).map(label);
const active = (el) => el.querySelector('.sheen-select-option.sheen-active');
const chips = (el) => [...el.querySelectorAll('.sheen-select-chip')];
const chipLabels = (el) => chips(el).map((c) => c.firstElementChild.textContent);

function type(w, input, text) {
  input.value = text;
  input.dispatchEvent(new w.Event('input', { bubbles: true }));
}

// the events a choice fires on the native select, in order
function events(native) {
  const seen = [];
  native.addEventListener('input', () => seen.push('input'));
  native.addEventListener('change', () => seen.push('change'));
  return seen;
}

// a mouse press, as a browser sends it
function press(w, target) {
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    target.dispatchEvent(new w.MouseEvent(t, { bubbles: true, cancelable: true, button: 0 }));
  }
}

// ---- search

test('select more: the search box comes only with search, at the top of the list, named by its value', () => {
  const plain = made();
  assert.equal(plain.input, null);
  assert.equal(plain.el.querySelector('.sheen-select-search'), null);

  const { el, pop, list, input } = made('search="Search hubs"');
  const box = el.querySelector('.sheen-select-search');
  assert.equal(box.parentElement, pop);
  assert.equal(box.nextElementSibling, list, 'before the list, so it stays at the top while the options scroll');
  const lead = box.firstElementChild;
  assert.equal(lead.tagName.toLowerCase(), 'svg');
  assert.ok(lead.classList.contains('sheen-glyph'));
  assert.equal(lead.getAttribute('width'), '15');
  assert.equal(input.parentElement, box);
  assert.equal(input.type, 'text');
  assert.equal(input.getAttribute('role'), 'combobox');
  assert.equal(input.getAttribute('aria-expanded'), 'true');
  assert.equal(input.getAttribute('aria-autocomplete'), 'list');
  assert.equal(input.getAttribute('aria-controls'), list.id);
  assert.equal(input.getAttribute('aria-label'), 'Search hubs');
  assert.equal(input.getAttribute('placeholder'), 'Search hubs');
  assert.equal(input.getAttribute('autocomplete'), 'off');
  assert.equal(input.getAttribute('spellcheck'), 'false');
  assert.equal(input.name, '', 'not part of the form data');
});

test('select more: opening puts focus in the search box with an empty query, and names the active option on it', () => {
  const { w, el, trigger, input } = made('search="Search hubs"');
  trigger.focus();
  key(w, trigger, 'ArrowDown');
  assert.ok(el.isOpen());
  assert.equal(w.document.activeElement, input);
  assert.equal(input.value, '');
  assert.ok(active(el));
  assert.equal(input.getAttribute('aria-activedescendant'), active(el).id);
});

test('select more: the search finds labels case- and accent-blind', () => {
  const { w, el, input } = made('search="Search hubs"');
  el.open();
  type(w, input, 'marina');
  assert.deepEqual(shown(el), ['Marína']);
  type(w, input, 'MARÍNA');
  assert.deepEqual(shown(el), ['Marína']);
  type(w, input, 'barsha');
  assert.deepEqual(shown(el), ['Al Barsha']);
  type(w, input, ' barsha ');
  assert.deepEqual(shown(el), ['Al Barsha'], 'spaces around the query are ignored');
  type(w, input, 'wn');
  assert.deepEqual(shown(el), ['Downtown']);
  type(w, input, '');
  assert.deepEqual(shown(el), ['All hubs', 'Al Barsha', 'Marína', 'Downtown', 'Jumeirah', 'Waterfront']);
});

test('select more: Arabic labels match without hamza seats and short vowels', () => {
  const AR = '<option value="b">البرشاء</option><option value="m">مرسى دبي</option><option value="a">أحمد</option><option value="h">مُحَمَّد</option>';
  const { w, el, input } = made('search="ابحث" empty="لا نتائج"', { options: AR, dir: 'rtl' });
  el.open();
  type(w, input, 'مرسى');
  assert.deepEqual(shown(el), ['مرسى دبي']);
  type(w, input, 'احمد');
  assert.deepEqual(shown(el), ['أحمد']);
  type(w, input, 'محمد');
  assert.deepEqual(shown(el), ['مُحَمَّد']);
  type(w, input, 'زز');
  assert.deepEqual(shown(el), []);
  assert.equal(el.querySelector('.sheen-select-empty').hidden, false);
});

test('select more: a group whose options all miss hides with them, and comes back with them', () => {
  const { w, el, input } = made('search="Search hubs"');
  const groups = [...el.querySelectorAll('.sheen-select-group')];
  el.open();
  type(w, input, 'barsha');
  assert.deepEqual(groups.map((g) => g.hidden), [false, true]);
  type(w, input, 'town');
  assert.deepEqual(groups.map((g) => g.hidden), [true, false]);
  type(w, input, 'zzz');
  assert.deepEqual(groups.map((g) => g.hidden), [true, true]);
  type(w, input, '');
  assert.deepEqual(groups.map((g) => g.hidden), [false, false]);
});

test('select more: the empty line shows its words only while the search matches nothing', () => {
  assert.equal(made('search="Search hubs"').empty, null, 'no empty attribute: no line');
  const { w, el, pop, list, input, empty } = made('search="Search hubs" empty="No matches"');
  assert.equal(empty.parentElement, pop);
  assert.equal(empty.previousElementSibling, list, 'after the list');
  assert.equal(empty.textContent, 'No matches');
  assert.equal(empty.hidden, true);
  el.open();
  assert.equal(empty.hidden, true);
  type(w, input, 'zzz');
  assert.equal(empty.hidden, false);
  assert.deepEqual(shown(el), []);
  assert.equal(active(el), null);
  assert.ok(!input.getAttribute('aria-activedescendant'), 'no active option to name');
  type(w, input, 'water');
  assert.deepEqual(shown(el), ['Waterfront'], 'a disabled option still shows when it matches');
  assert.equal(empty.hidden, true);
  assert.equal(active(el), null, 'but never becomes active');
  type(w, input, 'dow');
  assert.equal(empty.hidden, true);
});

test('select more: each query makes the first visible option active; the arrows move over visible options only', () => {
  const { w, el, input } = made('search="Search hubs"');
  el.open();
  const now = () => { const a = active(el); assert.equal(input.getAttribute('aria-activedescendant'), a.id); return label(a); };
  type(w, input, 'r');
  assert.deepEqual(shown(el), ['Al Barsha', 'Marína', 'Jumeirah', 'Waterfront']);
  assert.equal(now(), 'Al Barsha');
  key(w, input, 'ArrowDown');
  assert.equal(now(), 'Marína');
  key(w, input, 'ArrowDown');
  assert.equal(now(), 'Jumeirah', 'Downtown is hidden: skipped');
  key(w, input, 'ArrowDown');
  assert.equal(now(), 'Jumeirah', 'stops at the end: Waterfront is disabled');
  key(w, input, 'ArrowUp');
  assert.equal(now(), 'Marína');
  type(w, input, 'ju');
  assert.equal(now(), 'Jumeirah');
});

test('select more: Esc in the search box closes the list, marks the key handled and puts focus on the trigger', () => {
  const { w, el, trigger, input } = made('search="Search hubs"');
  el.open();
  type(w, input, 'ju');
  assert.equal(key(w, input, 'Escape'), false, 'handled, so a panel around stays open');
  assert.equal(el.isOpen(), false);
  assert.equal(w.document.activeElement, trigger);
});

test('select more: Enter in the search box picks the active option; closing empties the query and shows every option', () => {
  const { w, el, native, input, empty } = made('search="Search hubs" empty="No matches"');
  const seen = events(native);
  el.open();
  type(w, input, 'zzz');
  el.close();
  assert.equal(input.value, '');
  assert.equal(shown(el).length, 6);
  assert.ok([...el.querySelectorAll('.sheen-select-group')].every((g) => !g.hidden));
  assert.equal(empty.hidden, true);
  el.open();
  assert.equal(input.value, '');
  type(w, input, 'ju');
  key(w, input, 'Enter');
  assert.equal(native.value, 'j');
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(el.isOpen(), false);
  assert.equal(input.value, '');
  assert.equal(shown(el).length, 6);
});

test('select more: the search box never submits a form, and its typing never reaches the page as a change', () => {
  const { w, el, input } = made('search="Search hubs"', { around: (s) => `<form>${s}</form>` });
  const form = w.document.querySelector('form');
  const seen = [];
  for (const t of ['input', 'change']) form.addEventListener(t, (e) => seen.push(t + ':' + e.target.tagName));
  el.open();
  type(w, input, 'zzz');
  input.dispatchEvent(new w.Event('change', { bubbles: true }));
  assert.deepEqual(seen, [], 'the page hears the native select only');
  assert.equal(key(w, input, 'Enter'), false, 'Enter with nothing to pick is still handled');
  assert.equal(el.isOpen(), true);
});

test('select more: a key that ends a composition (IME) is left to the input method', () => {
  const { w, el, native, input } = made('search="Search hubs"');
  el.open();
  type(w, input, 'ju');
  assert.equal(key(w, input, 'Enter', { isComposing: true }), true, 'not handled');
  assert.equal(el.isOpen(), true);
  assert.equal(native.value, '');
});

test('select more: options that arrive while the list is open and searched take the query', async () => {
  const { w, el, native, input } = made('search="Search hubs"');
  el.open();
  type(w, input, 'ju');
  native.appendChild(w.document.createElement('option')).textContent = 'Jumeirah Park';
  native.appendChild(w.document.createElement('option')).textContent = 'Business Bay';
  await new Promise((r) => w.setTimeout(r, 0));
  assert.equal(input.value, 'ju');
  assert.deepEqual(shown(el), ['Jumeirah', 'Jumeirah Park']);
  assert.ok(el.querySelector('.sheen-select-group').hidden, 'North has no match');
  assert.equal(label(active(el)), 'Jumeirah');
  assert.equal(input.getAttribute('aria-activedescendant'), active(el).id);
});

test('select more: the search words follow the attributes', () => {
  const { w, el, input } = made('search="Search hubs" empty="No matches"');
  el.setAttribute('search', 'Find a hub');
  el.setAttribute('empty', 'Nothing found');
  el.open();
  assert.equal(input.getAttribute('placeholder'), 'Find a hub');
  assert.equal(input.getAttribute('aria-label'), 'Find a hub');
  type(w, input, 'zzz');
  assert.equal(el.querySelector('.sheen-select-empty').textContent, 'Nothing found');
});

// ---- clear

test('select more: the clear button comes only with clear, after the trigger, out of the tab order, named by its value', () => {
  assert.equal(made().clear, null);
  const { trigger, clear } = made('clear="Clear"');
  assert.equal(clear.tagName, 'BUTTON');
  assert.equal(clear.previousElementSibling, trigger);
  assert.equal(clear.type, 'button');
  assert.equal(clear.getAttribute('tabindex'), '-1');
  assert.equal(clear.getAttribute('aria-label'), 'Clear');
  const g = clear.querySelector('svg.sheen-glyph');
  assert.equal(g.getAttribute('width'), '16');
  assert.equal(g.getAttribute('aria-hidden'), 'true');
});

test('select more: the clear button shows only while something is chosen and the select is enabled', () => {
  const { el, native, clear } = made('clear="Clear"');
  assert.equal(clear.hidden, true, 'the "" option is chosen: nothing to clear');
  native.value = 'b';
  assert.equal(clear.hidden, false);
  native.disabled = true;
  el.sync();
  assert.equal(clear.hidden, true, 'disabled');
  native.disabled = false;
  el.sync();
  assert.equal(clear.hidden, false);
  native.value = '';
  assert.equal(clear.hidden, true);

  const set = made('clear="Clear"', { options: '<option value="">All hubs</option><option value="b" selected>Al Barsha</option>', around: (s) => `<fieldset disabled>${s}</fieldset>` });
  assert.equal(set.clear.hidden, true, 'inside a disabled fieldset');

  const many = made('clear="Clear"', { multiple: true, options: THREE });
  assert.equal(many.clear.hidden, true);
  many.el.values = ['m'];
  assert.equal(many.clear.hidden, false);
});

test('select more: clear in a single select goes to the "" option, fires input then change once, keeps focus on the trigger', () => {
  const { w, el, native, trigger, clear } = made('clear="Clear"');
  native.value = 'm';
  const seen = events(native);
  trigger.focus();
  press(w, clear);
  assert.equal(native.value, '');
  assert.equal(native.selectedIndex, 0);
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(el.isOpen(), false, 'a press on clear never opens the list');
  assert.equal(clear.hidden, true);
  assert.equal(w.document.activeElement, trigger);
});

test('select more: clear in a single select with no "" option chooses none and shows the placeholder', () => {
  const { w, el, native, trigger, clear } = made('clear="Clear" placeholder="All hubs"', { options: '<option value="b">Al Barsha</option><option value="m" selected>Marina</option>' });
  assert.equal(clear.hidden, false);
  const seen = events(native);
  press(w, clear);
  assert.equal(native.selectedIndex, -1);
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(trigger.querySelector('.sheen-select-placeholder').textContent, 'All hubs');
  assert.equal(el.hasAttribute('data-chosen'), false);
  assert.equal(clear.hidden, true);
  assert.equal(w.document.activeElement, trigger, 'focus goes to the trigger even from elsewhere');
});

test('select more: clear in a multiple select chooses none, with one input and one change', () => {
  const { w, el, native, clear } = made('clear="Clear"', { multiple: true, options: THREE });
  el.values = ['b', 'd'];
  const seen = events(native);
  press(w, clear);
  assert.deepEqual([...el.values], []);
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(chips(el).length, 0);
  assert.equal(clear.hidden, true);
  assert.equal(el.isOpen(), false);
});

test('select more: Delete or Backspace on a closed single trigger with clear clears it', () => {
  const { w, el, native, trigger } = made('clear="Clear"');
  native.value = 'm';
  const seen = events(native);
  assert.equal(key(w, trigger, 'Delete'), false, 'handled');
  assert.equal(native.value, '');
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(el.isOpen(), false);
  native.value = 'b';
  key(w, trigger, 'Backspace');
  assert.equal(native.value, '');
  assert.deepEqual(seen, ['input', 'change', 'input', 'change']);
  key(w, trigger, 'Delete');
  assert.deepEqual(seen.length, 4, 'nothing to clear: nothing fires');

  const plain = made();
  plain.native.value = 'm';
  const quiet = events(plain.native);
  key(plain.w, plain.trigger, 'Delete');
  assert.equal(plain.native.value, 'm', 'no clear attribute: Delete does nothing');
  assert.deepEqual(quiet, []);

  native.value = 'm';
  el.open();
  key(w, trigger, 'Delete');
  assert.equal(native.value, 'm', 'open: the list has the keys');
});

// ---- chips

test('select more: a multiple select shows one chip per chosen option, in document order, with a remove mark', () => {
  const { el, trigger } = made('remove="Remove @label"', { multiple: true, options: THREE });
  assert.equal(chips(el).length, 0);
  assert.equal(trigger.querySelector('.sheen-select-chips'), null, 'nothing chosen: no chips box');
  el.values = ['d', 'b'];
  const box = trigger.querySelector('.sheen-select-chips');
  assert.ok(box);
  assert.deepEqual(chips(el).map((c) => c.dataset.value), ['b', 'd']);
  assert.deepEqual(chipLabels(el), ['Al Barsha', 'Downtown']);
  assert.ok(chips(el).every((c) => c.parentElement === box));
  const mark = chips(el)[0].querySelector('.sheen-select-chip-remove');
  assert.equal(mark.getAttribute('aria-hidden'), 'true');
  assert.equal(mark.getAttribute('title'), 'Remove Al Barsha');
  assert.equal(chips(el)[1].querySelector('.sheen-select-chip-remove').getAttribute('title'), 'Remove Downtown');
  assert.equal(mark.querySelector('svg.sheen-glyph').getAttribute('width'), '14');

  const bare = made('', { multiple: true, options: THREE });
  bare.el.values = ['m'];
  assert.equal(bare.el.querySelector('.sheen-select-chip-remove').hasAttribute('title'), false, 'no remove attribute: no tooltip');
});

test('select more: a press on a chip\'s remove mark unselects that option, fires input and change, and leaves the list closed', () => {
  const { w, el, native } = made('remove="Remove @label"', { multiple: true, options: THREE });
  el.values = ['b', 'm', 'd'];
  const seen = events(native);
  press(w, chips(el)[1].querySelector('.sheen-select-chip-remove'));
  assert.deepEqual([...el.values], ['b', 'd']);
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(el.isOpen(), false);
  assert.deepEqual(chipLabels(el), ['Al Barsha', 'Downtown']);
  press(w, chips(el)[0].querySelector('.sheen-select-chip-remove svg'));
  assert.deepEqual([...el.values], ['d'], 'a press on the glyph inside counts');
  assert.deepEqual(seen, ['input', 'change', 'input', 'change']);
  assert.equal(el.isOpen(), false);
});

test('select more: Backspace on a closed multiple trigger removes the last chosen option', () => {
  const { w, el, native, trigger } = made('', { multiple: true, options: THREE });
  el.values = ['b', 'd'];
  const seen = events(native);
  assert.equal(key(w, trigger, 'Backspace'), false, 'handled');
  assert.deepEqual([...el.values], ['b']);
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(el.isOpen(), false);
  key(w, trigger, 'Backspace');
  assert.deepEqual([...el.values], []);
  key(w, trigger, 'Backspace');
  assert.deepEqual(seen.length, 4, 'nothing left: nothing fires');
  el.values = ['m'];
  el.open();
  key(w, trigger, 'Backspace');
  assert.deepEqual([...el.values], ['m'], 'open: the list has the keys');
});

test('select more: a chosen disabled option stays: no remove mark, and Backspace and clear leave it', () => {
  const { w, el, native, trigger, clear } = made('clear="Clear" remove="Remove @label"', { multiple: true,
    options: '<option value="b" selected>Al Barsha</option><option value="m" selected disabled>Marina</option><option value="d">Downtown</option>' });
  assert.deepEqual(chipLabels(el), ['Al Barsha', 'Marina']);
  assert.equal(chips(el)[1].querySelector('.sheen-select-chip-remove'), null);
  assert.equal(clear.hidden, false);
  el.values = ['b', 'm', 'd'];
  key(w, trigger, 'Backspace');
  assert.deepEqual([...el.values], ['b', 'm'], 'the last the person can remove');
  key(w, trigger, 'Backspace');
  assert.deepEqual([...el.values], ['m']);
  const seen = events(native);
  key(w, trigger, 'Backspace');
  assert.deepEqual(seen, [], 'only the disabled one is left: nothing to remove');
  assert.equal(clear.hidden, true, 'nothing the person can clear');
  el.values = ['b', 'm'];
  press(w, clear);
  assert.deepEqual([...el.values], ['m']);
});

test('select more: a disabled multiple select shows its chips without remove marks', () => {
  const { el, native } = made('remove="Remove @label"', { multiple: true, options: THREE });
  el.values = ['b', 'd'];
  native.disabled = true;
  el.sync();
  assert.deepEqual(chipLabels(el), ['Al Barsha', 'Downtown']);
  assert.equal(el.querySelectorAll('.sheen-select-chip-remove').length, 0);
});

// ---- made after the script loaded

test('select more: a select made after the script loaded gets the same parts', () => {
  const w = page('');
  const el = w.document.createElement('sheen-select');
  el.setAttribute('search', 'Search hubs');
  el.setAttribute('clear', 'Clear');
  el.setAttribute('empty', 'No matches');
  el.innerHTML = `<select name="hub">${HUBS}</select>`;
  w.document.body.append(el);
  const p = parts(w, el);
  assert.ok(p.input);
  assert.ok(p.clear);
  assert.ok(p.empty);
  assert.equal(el.querySelectorAll('.sheen-select-search').length, 1);
  el.sync();
  assert.equal(el.querySelectorAll('.sheen-select-search').length, 1, 'sync builds nothing twice');
  assert.equal(el.querySelectorAll('.sheen-select-clear').length, 1);
  el.open();
  type(w, p.input, 'ju');
  assert.deepEqual(shown(el), ['Jumeirah']);
});
