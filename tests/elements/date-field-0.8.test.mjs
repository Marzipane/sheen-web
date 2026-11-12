// 0.8.0: <sheen-date-field> and <sheen-date-range>, the kit's own date fields around the page's native date inputs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key } from './setup.mjs';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const tick = (w) => new Promise((r) => w.setTimeout(r, 5));
// what the element must show: Intl's own words and digits (the test runs on the same Intl as the page)
const at = (iso) => new Date(iso + 'T00:00:00Z');
const fmt = (loc, iso, o = { day: 'numeric', month: 'short', year: 'numeric' }) => new Intl.DateTimeFormat(loc, { ...o, timeZone: 'UTC' }).format(at(iso));
const fmtRange = (loc, a, b) => new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).formatRange(at(a), at(b));

const WORDS = 'placeholder="Pick a date" prev="Previous month" next="Next month" today="2026-10-27" first-day="1"';

function made(html, dir) {
  const w = page(html, dir);
  const el = w.document.querySelector('sheen-date-field, sheen-date-range');
  return { w, d: w.document, el, native: el.querySelector('input'), trigger: el.querySelector('.sheen-date-trigger'), pop: el.querySelector('.sheen-date-pop') };
}
const day = (el, iso) => el.querySelector(`.sheen-cal-day[data-date="${iso}"]`);
const focused = (w) => w.document.activeElement;
function seen(target, types) {
  const out = [];
  for (const t of types) target.addEventListener(t, (e) => out.push(t + ':' + (e.target.name || e.target.tagName)));
  return out;
}

test('date field: wraps the page\'s native date input, which stays first and keeps the form value', () => {
  const { d, el, native, trigger, pop } = made(`<form><label class="sheen-form-field sheen-small"><span>From</span>
    <sheen-date-field ${WORDS} lang="en-GB"><input type="date" name="from" value="2026-10-28" required></sheen-date-field></label></form>`);
  assert.equal(el.firstElementChild, native, 'the native input stays first');
  assert.ok(native.classList.contains('sheen-date-native'));
  assert.equal(native.getAttribute('tabindex'), '-1');
  assert.equal(native.getAttribute('aria-hidden'), 'true');
  assert.equal(native.name, 'from');
  assert.equal(new d.defaultView.FormData(d.querySelector('form')).get('from'), '2026-10-28');
  assert.equal(trigger.tagName, 'BUTTON');
  assert.equal(trigger.type, 'button');
  assert.equal(trigger.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(trigger.getAttribute('aria-controls'), pop.id);
  assert.equal(trigger.getAttribute('aria-required'), 'true');
  assert.equal(trigger.querySelector('.sheen-date-text').textContent, fmt('en-GB', '2026-10-28'));
  assert.equal(trigger.textContent, '28 Oct 2026');
  assert.ok(el.hasAttribute('data-chosen'));
  assert.equal(pop.getAttribute('role'), 'dialog');
  assert.equal(pop.hidden, true);
  // a label around the field names the trigger by its words outside the field, then the value: the whole label would read
  // the open calendar into the name (Chromium does); the popup takes the same words
  const words = d.querySelector('label > span');
  assert.ok(words.id);
  const [name, value] = trigger.getAttribute('aria-labelledby').split(' ');
  assert.equal(name, words.id);
  assert.ok(d.getElementById(value).classList.contains('sheen-date-text'), 'then the value');
  assert.equal(pop.getAttribute('aria-labelledby'), words.id);
  assert.equal(d.querySelector('label').hasAttribute('id'), false, 'the whole label names nothing');
});

test('date field: an empty value shows the placeholder; with no words given the element shows none of its own', () => {
  const { el, trigger } = made(`<sheen-date-field ${WORDS}><input type="date"></sheen-date-field>`);
  const text = trigger.querySelector('.sheen-date-text');
  assert.ok(text.classList.contains('sheen-date-placeholder'));
  assert.equal(text.textContent, 'Pick a date');
  assert.equal(el.hasAttribute('data-chosen'), false);
  const bare = made('<sheen-date-field><input type="date"></sheen-date-field>');
  assert.equal(bare.trigger.textContent, '');
  bare.trigger.click();
  assert.equal(bare.pop.querySelector('.sheen-cal-prev').hasAttribute('aria-label'), false);
  assert.equal(bare.pop.querySelector('.sheen-date-foot'), null, 'no footer without its words');
});

test('date field: a label attribute names it when no <label> does, with the value read after the name', () => {
  const { trigger } = made(`<sheen-date-field ${WORDS} label="Start date" lang="en-GB"><input type="date" value="2026-10-28"></sheen-date-field>`);
  assert.equal(trigger.getAttribute('aria-label'), 'Start date');
  const [self, value] = trigger.getAttribute('aria-labelledby').split(' ');
  assert.equal(self, trigger.id);
  assert.equal(trigger.ownerDocument.getElementById(value).textContent, '28 Oct 2026');
  const { d, trigger: t2 } = made(`<label for="x">Due</label><sheen-date-field ${WORDS}><input id="x" type="date"></sheen-date-field>`);
  const ids = t2.getAttribute('aria-labelledby').split(' ');
  assert.equal(ids[0], d.querySelector('label').id, 'a separate label first');
  assert.ok(d.getElementById(ids[1]).classList.contains('sheen-date-text'), 'then the value');
});

test('date field: opening shows the month of the value, the value selected and focused, today marked, words from attributes', () => {
  const { w, el, trigger, pop } = made(`<sheen-date-field ${WORDS} lang="en-GB"><input type="date" value="2026-10-28"></sheen-date-field>`);
  trigger.click();
  assert.ok(el.hasAttribute('data-open'));
  assert.equal(trigger.getAttribute('aria-expanded'), 'true');
  assert.equal(pop.hidden, false);
  const title = pop.querySelector('.sheen-cal-title');
  assert.equal(title.textContent, fmt('en-GB', '2026-10-01', { month: 'long', year: 'numeric' }));
  assert.equal(title.getAttribute('aria-live'), 'polite');
  const grid = pop.querySelector('[role="grid"]');
  assert.equal(grid.getAttribute('aria-labelledby'), title.id);
  const heads = grid.querySelectorAll('[role="columnheader"]');
  assert.equal(heads.length, 7);
  assert.equal(heads[0].getAttribute('aria-label'), fmt('en-GB', '2026-10-26', { weekday: 'long' }), 'Monday first');
  assert.equal(heads[0].textContent, fmt('en-GB', '2026-10-26', { weekday: 'narrow' }));
  // 1 Oct 2026 is a Thursday: three empty cells before it in a Monday week
  const first = grid.querySelectorAll('[role="row"]')[1];
  assert.equal([...first.children].filter((c) => !c.dataset.date).length, 3);
  const sel = day(el, '2026-10-28');
  assert.equal(sel.getAttribute('role'), 'gridcell');
  assert.equal(sel.getAttribute('aria-selected'), 'true');
  assert.equal(sel.getAttribute('tabindex'), '0');
  assert.equal(sel.textContent, fmt('en-GB', '2026-10-28', { day: 'numeric' }));
  assert.equal(sel.getAttribute('aria-label'), fmt('en-GB', '2026-10-28', { dateStyle: 'full' }));
  assert.equal(focused(w), sel);
  assert.equal(day(el, '2026-10-29').getAttribute('tabindex'), '-1');
  assert.equal(day(el, '2026-10-27').getAttribute('aria-current'), 'date');
  assert.equal(day(el, '2026-10-28').hasAttribute('aria-current'), false);
  const prev = pop.querySelector('.sheen-cal-prev'), next = pop.querySelector('.sheen-cal-next');
  assert.equal(prev.getAttribute('aria-label'), 'Previous month');
  assert.equal(next.getAttribute('aria-label'), 'Next month');
  assert.equal(prev.querySelector('svg').getAttribute('aria-hidden'), 'true');
  next.click();
  assert.equal(title.textContent, fmt('en-GB', '2026-11-01', { month: 'long', year: 'numeric' }));
  prev.click();
  prev.click();
  assert.equal(title.textContent, fmt('en-GB', '2026-09-01', { month: 'long', year: 'numeric' }));
});

test('date field: with no value it opens on today; a press picks, fires input then change on the native input, closes and returns focus', () => {
  const { w, d, el, native, trigger } = made(`<form><sheen-date-field ${WORDS} lang="en-GB"><input type="date" name="due"></sheen-date-field></form>`);
  const log = seen(d.querySelector('form'), ['input', 'change']);
  trigger.click();
  assert.equal(focused(w), day(el, '2026-10-27'), 'today');
  day(el, '2026-10-30').click();
  assert.equal(native.value, '2026-10-30');
  assert.deepEqual(log, ['input:due', 'change:due']);
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(trigger.getAttribute('aria-expanded'), 'false');
  assert.equal(focused(w), trigger);
  assert.equal(trigger.textContent, '30 Oct 2026');
  trigger.click();
  day(el, '2026-10-30').click();
  assert.equal(log.length, 2, 'the same day again fires nothing');
  assert.equal(el.hasAttribute('data-open'), false);
});

test('date field: the page setting the value redraws it and fires nothing (framework sync); reset redraws after the reset', async () => {
  const { w, d, el, native, trigger } = made(`<form><sheen-date-field ${WORDS} lang="en-GB"><input type="date" name="due" value="2026-10-28"></sheen-date-field></form>`);
  const log = seen(d.querySelector('form'), ['input', 'change']);
  native.value = '2026-11-05';
  assert.equal(trigger.textContent, '5 Nov 2026');
  assert.equal(native.value, '2026-11-05', 'the value reads back');
  native.value = '';
  assert.ok(trigger.querySelector('.sheen-date-placeholder'));
  assert.equal(el.hasAttribute('data-chosen'), false);
  native.value = '2026-12-01';
  d.querySelector('form').reset();
  await tick(w);
  assert.equal(trigger.textContent, '28 Oct 2026', 'back to the default value');
  assert.deepEqual(log, []);
  // an open calendar follows too
  trigger.click();
  native.value = '2026-10-12';
  assert.equal(day(el, '2026-10-12').getAttribute('aria-selected'), 'true');
  assert.equal(day(el, '2026-10-28').getAttribute('aria-selected'), 'false');
});

test('date field: disabled on the input or its fieldset disables the trigger; aria-invalid is mirrored', async () => {
  const { w, d, el, native, trigger } = made(`<fieldset><sheen-date-field ${WORDS}><input type="date"></sheen-date-field></fieldset>`);
  native.disabled = true;
  await tick(w);
  assert.equal(trigger.disabled, true);
  assert.ok(el.hasAttribute('data-disabled'));
  native.disabled = false;
  await tick(w);
  assert.equal(trigger.disabled, false);
  d.querySelector('fieldset').disabled = true;
  await tick(w);
  assert.equal(trigger.disabled, true, 'a disabled fieldset');
  d.querySelector('fieldset').disabled = false;
  native.setAttribute('aria-invalid', 'true');
  await tick(w);
  assert.equal(trigger.disabled, false);
  assert.equal(trigger.getAttribute('aria-invalid'), 'true');
  native.removeAttribute('aria-invalid');
  await tick(w);
  assert.equal(trigger.hasAttribute('aria-invalid'), false);
});

test('date field: keys in the grid move by day, week, month and week ends; Enter picks; one Esc closes one layer', () => {
  const { w, el, native, trigger, pop } = made(`<sheen-date-field ${WORDS} lang="en-GB"><input type="date" value="2026-10-28"></sheen-date-field>`);
  trigger.click();
  const at = () => focused(w).dataset.date;
  const press = (k, o) => key(w, focused(w), k, o);
  press('ArrowRight'); assert.equal(at(), '2026-10-29');
  press('ArrowLeft'); assert.equal(at(), '2026-10-28');
  press('ArrowDown'); assert.equal(at(), '2026-11-04');
  assert.equal(pop.querySelector('.sheen-cal-title').textContent, fmt('en-GB', '2026-11-01', { month: 'long', year: 'numeric' }), 'the month follows');
  press('ArrowUp'); assert.equal(at(), '2026-10-28');
  press('PageDown'); assert.equal(at(), '2026-11-28');
  press('PageUp'); assert.equal(at(), '2026-10-28');
  press('PageDown', { shiftKey: true }); assert.equal(at(), '2027-10-28');
  press('PageUp', { shiftKey: true }); assert.equal(at(), '2026-10-28');
  press('Home'); assert.equal(at(), '2026-10-26', 'Monday, the first day of this week');
  press('End'); assert.equal(at(), '2026-11-01', 'Sunday');
  // 31 Jan + one month lands on the last day of February
  native.value = '2027-01-31';
  trigger.click(); trigger.click();
  assert.equal(at(), '2027-01-31');
  press('PageDown'); assert.equal(at(), '2027-02-28');
  assert.equal(press('Enter'), false, 'Enter is handled');
  assert.equal(native.value, '2027-02-28');
  assert.equal(focused(w), trigger);
  trigger.click();
  press('ArrowRight');
  const handled = !press('Escape');
  assert.ok(handled, 'Esc is marked handled, so a panel around it stays open');
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(native.value, '2027-02-28', 'Esc keeps the value');
  assert.equal(focused(w), trigger);
  // ArrowDown on the closed trigger opens
  key(w, trigger, 'ArrowDown');
  assert.ok(el.hasAttribute('data-open'));
  press(' ');
  assert.equal(native.value, '2027-02-28', 'Space picks the focused day');
});

test('date field: arrows follow the reading direction in Arabic; names, digits and the month come from Intl for the page language', () => {
  const { w, el, trigger, pop } = made(`<div lang="ar" dir="rtl"><sheen-date-field ${WORDS}><input type="date" value="2026-10-28"></sheen-date-field></div>`, 'rtl');
  assert.equal(trigger.textContent, fmt('ar', '2026-10-28'));
  trigger.click();
  assert.equal(pop.querySelector('.sheen-cal-title').textContent, fmt('ar', '2026-10-01', { month: 'long', year: 'numeric' }));
  assert.equal(pop.querySelector('[role="columnheader"]').textContent, fmt('ar', '2026-10-26', { weekday: 'narrow' }));
  assert.equal(day(el, '2026-10-28').textContent, fmt('ar', '2026-10-28', { day: 'numeric' }));
  key(w, focused(w), 'ArrowLeft');
  assert.equal(focused(w).dataset.date, '2026-10-29', 'left is forward in Arabic');
  key(w, focused(w), 'ArrowRight');
  assert.equal(focused(w).dataset.date, '2026-10-28');
});

test('date field: the first day of the week comes from the locale, first-day overrides it, weekdays overrides the header words', () => {
  const head = (attrs, lang) => {
    const { el, trigger } = made(`<sheen-date-field today="2026-10-27" lang="${lang}" ${attrs}><input type="date"></sheen-date-field>`);
    trigger.click();
    return [...el.querySelectorAll('[role="columnheader"]')];
  };
  assert.equal(head('', 'en-GB')[0].getAttribute('aria-label'), fmt('en-GB', '2026-10-26', { weekday: 'long' }), 'Monday');
  assert.equal(head('', 'en-US')[0].getAttribute('aria-label'), fmt('en-US', '2026-10-25', { weekday: 'long' }), 'Sunday');
  assert.equal(head('first-day="6"', 'en-GB')[0].getAttribute('aria-label'), fmt('en-GB', '2026-10-24', { weekday: 'long' }), 'Saturday');
  const words = head('first-day="7" weekdays="Mo Tu We Th Fr Sa Su"', 'en-GB').map((c) => c.textContent);
  assert.deepEqual(words, ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']);
});

test('date field: min and max from the native input bound the days, the keys and the month buttons', () => {
  const { w, el, native, trigger, pop } = made(`<sheen-date-field ${WORDS}><input type="date" min="2026-10-10" max="2026-10-20"></sheen-date-field>`);
  trigger.click();
  assert.equal(focused(w).dataset.date, '2026-10-20', 'today is past max: focus starts on max');
  assert.equal(day(el, '2026-10-21').getAttribute('aria-disabled'), 'true');
  assert.equal(day(el, '2026-10-09').getAttribute('aria-disabled'), 'true');
  assert.equal(day(el, '2026-10-15').hasAttribute('aria-disabled'), false);
  day(el, '2026-10-21').click();
  assert.equal(native.value, '', 'a day out of range does nothing');
  key(w, focused(w), 'ArrowRight');
  assert.equal(focused(w).dataset.date, '2026-10-20', 'the keys stop at max');
  key(w, focused(w), 'PageUp');
  assert.equal(focused(w).dataset.date, '2026-10-10', 'and at min');
  const next = pop.querySelector('.sheen-cal-next'), prev = pop.querySelector('.sheen-cal-prev');
  assert.equal(next.getAttribute('aria-disabled'), 'true');
  assert.equal(prev.getAttribute('aria-disabled'), 'true');
  next.click();
  assert.equal(day(el, '2026-10-15') !== null, true, 'a disabled month button does nothing');
  native.max = '2026-12-31';
  trigger.click(); trigger.click();
  assert.equal(pop.querySelector('.sheen-cal-next').hasAttribute('aria-disabled'), false, 'a changed max is read when it opens');
});

test('date field: a press outside closes it and leaves focus there; focus leaving the field blurs the native input (form touched state)', async () => {
  const { w, d, el, native, trigger } = made(`<sheen-date-field ${WORDS}><input type="date"></sheen-date-field><button id="out">Out</button>`);
  const blurs = [];
  native.addEventListener('blur', () => blurs.push('blur'));
  trigger.click();
  d.body.dispatchEvent(new w.MouseEvent('pointerdown', { bubbles: true }));
  assert.equal(el.hasAttribute('data-open'), false);
  trigger.focus();
  trigger.click();
  key(w, focused(w), 'ArrowRight');
  await tick(w);
  assert.deepEqual(blurs, [], 'moving inside the field is no blur');
  d.getElementById('out').focus();
  await tick(w);
  assert.equal(el.hasAttribute('data-open'), false, 'focus moving out closes it');
  assert.deepEqual(blurs, ['blur']);
});

test('date field: focus on the hidden native input (a label press) goes to the trigger; Tab stays inside the open calendar', () => {
  const { w, d, native, trigger, pop } = made(`<label><span>Due</span><sheen-date-field ${WORDS} clear="Clear"><input type="date" value="2026-10-28"></sheen-date-field></label>`);
  const blurs = [];
  native.addEventListener('blur', () => blurs.push('blur'));
  d.querySelector('label > span').click();
  assert.equal(focused(w), trigger, 'a press on the label words');
  assert.deepEqual(blurs, [], 'the native input never took focus, so it has no blur');
  trigger.blur();
  native.focus();
  assert.equal(focused(w), trigger, 'focus put on the native input');
  trigger.click();
  const stops = [...pop.querySelectorAll('button')].filter((b) => b.getAttribute('tabindex') !== '-1');
  const last = stops[stops.length - 1];
  last.focus();
  assert.equal(key(w, last, 'Tab'), false, 'Tab on the last stop is handled');
  assert.equal(focused(w), stops[0], 'and wraps to the first');
  assert.equal(key(w, stops[0], 'Tab', { shiftKey: true }), false);
  assert.equal(focused(w), last);
});

test('date field: clear empties the value, fires input and change, and closes', () => {
  const { w, el, native, trigger, pop } = made(`<sheen-date-field ${WORDS} clear="Clear"><input type="date" name="due" value="2026-10-28"></sheen-date-field>`);
  const log = seen(el, ['input', 'change']);
  trigger.click();
  const clear = pop.querySelector('.sheen-date-foot .sheen-date-clear');
  assert.equal(clear.textContent, 'Clear');
  clear.click();
  assert.equal(native.value, '');
  assert.deepEqual(log, ['input:due', 'change:due']);
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(focused(w), trigger);
});

test('date field: a field whose input arrives after it is connected (a framework) wraps it then', async () => {
  const w = page('');
  const el = w.document.createElement('sheen-date-field');
  el.setAttribute('placeholder', 'Pick a date');
  w.document.body.appendChild(el);
  const input = w.document.createElement('input');
  input.type = 'date';
  el.appendChild(input);
  await tick(w);
  assert.equal(el.firstElementChild, input);
  assert.ok(input.classList.contains('sheen-date-native'));
  assert.equal(el.querySelectorAll('.sheen-date-trigger').length, 1);
  input.value = '2026-10-28';
  assert.notEqual(el.querySelector('.sheen-date-text').textContent, 'Pick a date', 'framework sync works on it');
});

const RANGE = 'placeholder="Any dates" prev="Previous month" next="Next month" today="2026-10-27" first-day="1" from="From" to="To" lang="en-GB"';

test('date range: wraps two native inputs; the first press picks the start, the second the end, then both fire and it closes', () => {
  const { w, d, el, trigger, pop } = made(`<form><sheen-date-range ${RANGE}><input type="date" name="from"><input type="date" name="to"></sheen-date-range></form>`);
  const [a, b] = el.querySelectorAll('input');
  assert.equal(el.children[0], a);
  assert.equal(el.children[1], b);
  assert.ok(b.classList.contains('sheen-date-native'));
  assert.equal(trigger.textContent, 'Any dates');
  const log = seen(d.querySelector('form'), ['input', 'change']);
  trigger.click();
  day(el, '2026-10-28').click();
  assert.deepEqual(log, [], 'nothing fires until the range is whole');
  assert.equal(a.value, '');
  assert.ok(el.hasAttribute('data-open'));
  const ends = pop.querySelectorAll('.sheen-date-end');
  assert.equal(ends[0].querySelector('small').textContent, 'From');
  assert.equal(ends[0].querySelector('b').textContent, '28 Oct 2026');
  assert.equal(ends[1].querySelector('small').textContent, 'To');
  assert.equal(ends[1].querySelector('b').textContent, '');
  day(el, '2026-10-31').click();
  assert.equal(a.value, '2026-10-28');
  assert.equal(b.value, '2026-10-31');
  assert.deepEqual(log, ['input:from', 'change:from', 'input:to', 'change:to']);
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(focused(w), trigger);
  assert.equal(trigger.textContent, fmtRange('en-GB', '2026-10-28', '2026-10-31'));
  assert.equal(new w.FormData(d.querySelector('form')).get('to'), '2026-10-31');
  // the days of the range are selected, its ends drawn as ends
  trigger.click();
  for (const iso of ['2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']) assert.equal(day(el, iso).getAttribute('aria-selected'), 'true', iso);
  assert.equal(day(el, '2026-10-27').getAttribute('aria-selected'), 'false');
  assert.ok(day(el, '2026-10-28').classList.contains('sheen-cal-end'));
  assert.ok(day(el, '2026-10-31').classList.contains('sheen-cal-end'));
  assert.equal(day(el, '2026-10-29').classList.contains('sheen-cal-end'), false);
  assert.equal(focused(w).dataset.date, '2026-10-28', 'it opens on the start');
});

test('date range: an end picked before the start swaps them, so the range always runs forward', () => {
  const { el, trigger } = made(`<sheen-date-range ${RANGE}><input type="date"><input type="date"></sheen-date-range>`);
  const [a, b] = el.querySelectorAll('input');
  trigger.click();
  day(el, '2026-10-31').click();
  day(el, '2026-10-12').click();
  assert.equal(a.value, '2026-10-12');
  assert.equal(b.value, '2026-10-31');
  // one day is a range of one day
  trigger.click();
  day(el, '2026-10-20').click();
  day(el, '2026-10-20').click();
  assert.equal(a.value, '2026-10-20');
  assert.equal(b.value, '2026-10-20');
  assert.equal(trigger.textContent, fmtRange('en-GB', '2026-10-20', '2026-10-20'));
});

test('date range: the page setting either input redraws it; one end alone shows that date', () => {
  const { el, trigger } = made(`<sheen-date-range ${RANGE}><input type="date"><input type="date"></sheen-date-range>`);
  const [a, b] = el.querySelectorAll('input');
  a.value = '2026-11-02';
  assert.equal(trigger.textContent, '2 Nov 2026');
  b.value = '2026-11-09';
  assert.equal(trigger.textContent, fmtRange('en-GB', '2026-11-02', '2026-11-09'));
  assert.deepEqual({ ...el.value }, { start: '2026-11-02', end: '2026-11-09' });
  el.value = { start: '', end: '' };
  assert.equal(trigger.textContent, 'Any dates');
});

test('date range: with apply the picks wait for Apply; Cancel and Esc drop them', () => {
  const { w, el, trigger, pop } = made(`<sheen-date-range ${RANGE} apply="Apply" cancel="Cancel" note="Local time"><input type="date" name="from"><input type="date" name="to"></sheen-date-range>`);
  const [a, b] = el.querySelectorAll('input');
  const log = seen(el, ['change']);
  trigger.click();
  const foot = pop.querySelector('.sheen-date-foot');
  assert.equal(foot.querySelector('.sheen-date-note').textContent, 'Local time');
  assert.equal(foot.querySelector('.sheen-date-cancel').textContent, 'Cancel');
  const apply = foot.querySelector('.sheen-date-apply');
  assert.equal(apply.textContent, 'Apply');
  assert.ok(apply.classList.contains('sheen-button'));
  day(el, '2026-10-28').click();
  day(el, '2026-10-31').click();
  assert.ok(el.hasAttribute('data-open'), 'stays open');
  assert.equal(a.value, '');
  foot.querySelector('.sheen-date-cancel').click();
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(a.value, '');
  assert.equal(focused(w), trigger);
  trigger.click();
  assert.equal(day(el, '2026-10-28').getAttribute('aria-selected'), 'false', 'the dropped picks are gone');
  day(el, '2026-10-28').click();
  day(el, '2026-10-31').click();
  key(w, focused(w), 'Escape');
  assert.equal(a.value, '');
  trigger.click();
  day(el, '2026-10-28').click();
  day(el, '2026-10-31').click();
  pop.querySelector('.sheen-date-apply').click();
  assert.equal(a.value, '2026-10-28');
  assert.equal(b.value, '2026-10-31');
  assert.deepEqual(log, ['change:from', 'change:to']);
  assert.equal(el.hasAttribute('data-open'), false);
});

test('date range: presets sit beside the calendar; one picks its range, the field then shows its label; custom is checked otherwise', () => {
  const { w, el, trigger, pop } = made(`<sheen-date-range ${RANGE} custom="Custom range"><input type="date"><input type="date"></sheen-date-range>`);
  const [a, b] = el.querySelectorAll('input');
  el.presets = [{ label: 'Today', start: '2026-10-27', end: '2026-10-27' }, { label: 'Next 7 days', start: '2026-10-27', end: '2026-11-02' }];
  assert.ok(el.hasAttribute('data-presets'));
  trigger.click();
  const group = pop.querySelector('.sheen-date-presets');
  assert.equal(group.getAttribute('role'), 'radiogroup');
  const rows = [...group.querySelectorAll('[role="radio"]')];
  assert.deepEqual(rows.map((r) => r.textContent), ['Today', 'Next 7 days', 'Custom range']);
  assert.deepEqual(rows.map((r) => r.getAttribute('aria-checked')), ['false', 'false', 'false'], 'nothing chosen: none checked');
  rows[1].click();
  assert.equal(a.value, '2026-10-27');
  assert.equal(b.value, '2026-11-02');
  assert.equal(el.hasAttribute('data-open'), false);
  assert.equal(trigger.textContent, 'Next 7 days');
  trigger.click();
  const again = [...pop.querySelectorAll('.sheen-date-preset')];
  assert.deepEqual(again.map((r) => r.getAttribute('aria-checked')), ['false', 'true', 'false']);
  // the arrows move between presets
  again[1].focus();
  key(w, again[1], 'ArrowDown');
  assert.equal(focused(w), again[2]);
  key(w, again[2], 'ArrowUp');
  assert.equal(focused(w), again[1]);
  // custom puts focus in the grid on the start
  again[2].click();
  assert.equal(focused(w).dataset.date, '2026-10-27');
  day(el, '2026-10-28').click();
  day(el, '2026-10-30').click();
  assert.equal(trigger.textContent, fmtRange('en-GB', '2026-10-28', '2026-10-30'));
  trigger.click();
  assert.deepEqual([...pop.querySelectorAll('.sheen-date-preset')].map((r) => r.getAttribute('aria-checked')), ['false', 'false', 'true']);
});

test('date range: min and max of both inputs bound the days', () => {
  const { el, trigger } = made(`<sheen-date-range ${RANGE}><input type="date" min="2026-10-05"><input type="date" max="2026-10-25"></sheen-date-range>`);
  trigger.click();
  assert.equal(day(el, '2026-10-04').getAttribute('aria-disabled'), 'true');
  assert.equal(day(el, '2026-10-26').getAttribute('aria-disabled'), 'true');
  assert.equal(day(el, '2026-10-05').hasAttribute('aria-disabled'), false);
  assert.equal(day(el, '2026-10-25').hasAttribute('aria-disabled'), false);
});

test('date field: variant control draws the find-row control with a calendar glyph; the rest stays the dense field', () => {
  const { trigger } = made(`<sheen-date-range ${RANGE} variant="control" compact><input type="date"><input type="date"></sheen-date-range>`);
  assert.ok(trigger.classList.contains('sheen-control'));
  assert.ok(trigger.classList.contains('sheen-compact-glyph'));
  assert.ok(trigger.querySelector('.sheen-date-icon'));
  assert.ok(trigger.querySelector('.sheen-control-chevron'));
  const dense = made(`<sheen-date-field ${WORDS}><input type="date"></sheen-date-field>`).trigger;
  assert.equal(dense.classList.contains('sheen-control'), false);
  assert.equal(dense.querySelector('.sheen-date-icon'), null);
  assert.ok(dense.querySelector('.sheen-date-chevron'));
});

test('date fields: the looks are in the built CSS, sizes from tokens, rings only after Tab', () => {
  for (const t of ['--sheen-size-calendar-day:30px', '--sheen-size-date-presets:168px', '--sheen-size-date-range-pop:540px', '--sheen-size-date-end:42px']) assert.ok(css.includes(t), t);
  for (const part of [
    '.sheen-date-native{',
    'sheen-date-range[data-presets] .sheen-date-body{display:grid;grid-template-columns:var(--sheen-size-date-presets) 1fr;gap:10px}',
    '.sheen-cal-day{',
    '.sheen-cal-day.sheen-cal-end{background:var(--sheen-accent);color:var(--sheen-on-accent);border-radius:8px;font-weight:700}',
    '.sheen-cal-day[aria-current="date"]:not(.sheen-cal-end){box-shadow:inset 0 0 0 1px var(--sheen-accent-text);border-radius:8px}',
    '.sheen-cal-day[aria-selected="true"]',
    '.sheen-date-trigger:not(.sheen-control)[aria-invalid="true"]{box-shadow:inset 0 0 0 2px var(--sheen-danger)}',
  ]) assert.ok(css.includes(part), part);
  assert.match(css, /\.sheen-cal-day\{[^}]*block-size:var\(--sheen-size-calendar-day\)/);
  assert.match(css, /\.sheen-date-trigger:not\(\.sheen-control\)\{[^}]*min-block-size:var\(--sheen-size-field\)[^}]*border-radius:11px/);
  // (the normalised CSS has lost the space before :is)
  assert.match(css, /@media not \(forced-colors:active\)\{:root\[data-sheen-focus\]:not\(\[data-sheen-keyboard\]\) ?:is\([^)]*\.sheen-date-trigger[^)]*\.sheen-cal-day\):focus-visible\{outline:none\}/);
  assert.match(css, /\[dir="rtl"\] ?:is\(\.sheen-cal-prev,\.sheen-cal-next\)>svg\{transform:scaleX\(-1\)\}/);
  // the gaps between boxes keep the kit's minimum
  assert.match(css, /\.sheen-date-foot\{[^}]*gap:max\(var\(--sheen-space-min\),8px\)/);
  assert.match(css, /\.sheen-date-pop\{[^}]*gap:max\(var\(--sheen-space-min\),4px\)/);
});
