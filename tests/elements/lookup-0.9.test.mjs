// 0.9.0: <sheen-lookup> (src/elements/78-lookup.js), the select whose options the page brings per query: the debounced
// ask with its signal and respond(), answers that arrive late or fail, the status line, the choice kept when an answer
// lacks it, chips in the order chosen, el.chosen, clear, the keys it changes, forms, input methods and Arabic.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page, key, plain } from './setup.mjs';

const WORDS = 'placeholder="Any hub" search="Search hubs" loading="Searching…" empty="No matches" error="Couldn\'t load the hubs" retry="Try again" more="@count of @total shown"';
const HUBS = [{ value: 'b', label: 'Old Town' }, { value: 'm', label: 'Riverside', hint: '2 vans' }, { value: 'd', label: 'Hillside' }];

async function made(attrs = WORDS, { multiple = false, dir = 'ltr', inner = '', around = (s) => s } = {}) {
  const w = page(around(`<sheen-lookup name="hub" label="Hub" delay="20" ${multiple ? 'multiple ' : ''}${attrs}>${inner}</sheen-lookup>`), dir);
  const el = w.document.querySelector('sheen-lookup');
  // the asks the element makes, in order: their query, signal and respond
  const asks = [];
  el.addEventListener('sheen-lookup-query', (e) => asks.push(e.detail));
  return { w, el, asks, parts: () => parts(el) };
}

function parts(el) {
  return {
    native: el.querySelector('select'),
    trigger: el.querySelector('.sheen-select-trigger'),
    pop: el.querySelector('.sheen-select-pop'),
    list: el.querySelector('.sheen-select-list'),
    input: el.querySelector('.sheen-select-input'),
    line: el.querySelector('.sheen-lookup-status'),
    words: el.querySelector('.sheen-lookup-words'),
    retry: el.querySelector('.sheen-lookup-retry'),
    spin: el.querySelector('.sheen-lookup-spin'),
    glass: el.querySelector('.sheen-select-search>.sheen-glyph:not(.sheen-lookup-spin)'),
    clear: el.querySelector('.sheen-select-clear')
  };
}

const tick = (w, ms = 0) => new Promise((r) => w.setTimeout(r, ms));
const rows = (el) => [...el.querySelectorAll('.sheen-select-option')].map((r) => r.querySelector('.sheen-select-label').textContent);
const active = (el) => { const a = el.querySelector('.sheen-select-option.sheen-active'); return a && a.querySelector('.sheen-select-label').textContent; };
const chips = (el) => [...el.querySelectorAll('.sheen-select-chip')].map((c) => c.firstElementChild.textContent);
const field = (el) => el.querySelector('.sheen-select-trigger').textContent;
// what the status line says, or null while it is quiet
const says = (el) => { const p = parts(el); return p.line.hasAttribute('data-quiet') ? null : p.words.textContent; };
const busy = (el) => { const p = parts(el); return { spin: !p.spin.hasAttribute('hidden'), glass: !p.glass.hasAttribute('hidden'), aria: p.list.getAttribute('aria-busy') }; };

function type(w, input, text, opts = {}) {
  input.value = text;
  input.dispatchEvent(new w.InputEvent('input', { bubbles: true, ...opts }));
}

function events(native) {
  const seen = [];
  native.addEventListener('input', () => seen.push('input'));
  native.addEventListener('change', () => seen.push('change'));
  return seen;
}

function press(w, target) {
  for (const t of ['pointerdown', 'mousedown', 'pointerup', 'mouseup', 'click']) {
    target.dispatchEvent(new w.MouseEvent(t, { bubbles: true, cancelable: true, button: 0 }));
  }
}

// opens the list and answers its first ask
async function opened(m, answer = HUBS) {
  m.el.open();
  m.asks.at(-1).respond(answer);
  await tick(m.w);
}

// ---- the frame

test('lookup: it is the select with a search box always, a quiet status line and a single "" option first', async () => {
  const { el, w } = await made('placeholder="Any hub"');
  const p = parts(el);
  assert.ok(el instanceof w.customElements.get('sheen-select'), 'built on the select');
  assert.equal(p.native.name, 'hub');
  assert.equal(p.native.multiple, false);
  assert.equal(p.trigger.getAttribute('role'), 'combobox');
  assert.equal(p.list.getAttribute('role'), 'listbox');
  assert.ok(p.input, 'the search box comes without the search attribute');
  assert.equal(p.input.closest('.sheen-select-search').nextElementSibling, p.list);
  // the "" option: first, hidden, no words, chosen
  assert.equal(p.native.options.length, 1);
  const none = p.native.options[0];
  assert.equal(none.value, '');
  assert.equal(none.hidden, true);
  assert.ok(none.hasAttribute('data-none'));
  assert.equal(none.textContent, '');
  assert.equal(p.native.selectedIndex, 0);
  assert.equal(rows(el).length, 0, 'the "" option gets no row');
  assert.equal(field(el), 'Any hub');
  assert.equal(el.hasAttribute('data-chosen'), false);
  // the status line sits under the rows, a polite live region, quiet
  assert.equal(p.line.previousElementSibling, p.list);
  assert.equal(p.line.getAttribute('role'), 'status');
  assert.equal(p.line.getAttribute('aria-live'), 'polite');
  assert.equal(says(el), null);
  assert.equal(p.retry.hidden, true);
  assert.equal(p.retry.getAttribute('tabindex'), '-1');
  // the spinner waits beside the search glyph, hidden
  assert.equal(p.spin.previousElementSibling, p.glass);
  assert.equal(p.spin.getAttribute('width'), '15');
  assert.deepEqual(busy(el), { spin: false, glass: true, aria: null });
});

test('lookup: the search box is named by search, else by the field\'s own name', async () => {
  const own = await made('search="Search hubs"');
  assert.equal(parts(own.el).input.getAttribute('aria-label'), 'Search hubs');
  assert.equal(parts(own.el).input.hasAttribute('aria-labelledby'), false);
  const bare = await made('', { around: (s) => `<label><span>Hub</span>${s}</label>` });
  const p = parts(bare.el);
  assert.ok(p.trigger.getAttribute('aria-labelledby'));
  assert.equal(p.input.getAttribute('aria-labelledby'), p.trigger.getAttribute('aria-labelledby'));
});

// ---- asking

test('lookup: opening asks for "" at once with a signal and respond, and shows the spinner and the loading line', async () => {
  const { el, w, asks } = await made();
  el.open();
  assert.equal(asks.length, 1);
  assert.equal(asks[0].query, '');
  assert.ok(asks[0].signal instanceof w.AbortSignal);
  assert.equal(asks[0].signal.aborted, false);
  assert.equal(typeof asks[0].respond, 'function');
  assert.equal(w.document.activeElement, parts(el).input);
  assert.deepEqual(busy(el), { spin: true, glass: false, aria: 'true' });
  assert.equal(el.hasAttribute('data-loading'), true);
  assert.equal(says(el), 'Searching…', 'loading words while no rows are drawn');
});

test('lookup: an answer draws the rows, makes the first active and ends the loading', async () => {
  const m = await made();
  await opened(m);
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside', 'Hillside']);
  assert.equal(active(m.el), 'Old Town');
  const input = parts(m.el).input;
  assert.equal(input.getAttribute('aria-activedescendant'), m.el.querySelector('.sheen-select-option.sheen-active').id);
  assert.equal(m.el.querySelector('.sheen-select-hint').textContent, '2 vans');
  assert.deepEqual(busy(m.el), { spin: false, glass: true, aria: null });
  assert.equal(m.el.hasAttribute('data-loading'), false);
  assert.equal(says(m.el), null);
});

test('lookup: typing asks once the person pauses, for the trimmed query, and not again for the same query', async () => {
  const m = await made();
  await opened(m);
  const input = parts(m.el).input;
  type(m.w, input, 'm');
  type(m.w, input, 'ma');
  type(m.w, input, ' mar ');
  assert.equal(m.asks.length, 1, 'nothing asked while typing');
  assert.deepEqual(busy(m.el), { spin: true, glass: false, aria: 'true' }, 'the spinner shows from the first key');
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside', 'Hillside'], 'the last answer\'s rows stay meanwhile');
  assert.equal(says(m.el), null, 'no loading line over rows');
  await tick(m.w, 40);
  assert.deepEqual(m.asks.map((a) => a.query), ['', 'mar']);
  m.asks[1].respond([HUBS[1]]);
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['Riverside']);
  type(m.w, input, 'mar  ');
  await tick(m.w, 40);
  assert.equal(m.asks.length, 2, 'the same query after trimming asks nothing');
  assert.deepEqual(busy(m.el), { spin: false, glass: true, aria: null });
});

test('lookup: delay sets the pause; without it the pause is 250 ms', async () => {
  const m = await made(WORDS.replace('', ''));
  m.el.setAttribute('delay', '60');
  await opened(m);
  type(m.w, parts(m.el).input, 'a');
  await tick(m.w, 30);
  assert.equal(m.asks.length, 1);
  await tick(m.w, 50);
  assert.equal(m.asks.length, 2);
  m.el.removeAttribute('delay');
  assert.equal(m.el.delay(), 250);
  m.el.setAttribute('delay', 'soon');
  assert.equal(m.el.delay(), 250);
});

test('lookup: a newer ask aborts the older signal, and the older answer arriving late is dropped', async () => {
  const m = await made();
  m.el.open();
  const first = m.asks[0];
  type(m.w, parts(m.el).input, 'down');
  await tick(m.w, 40);
  assert.equal(first.signal.aborted, true);
  first.respond(HUBS);
  await tick(m.w);
  assert.deepEqual(rows(m.el), [], 'the "" answer came after the "down" ask: dropped');
  assert.equal(says(m.el), 'Searching…');
  m.asks[1].respond(Promise.resolve([HUBS[2]]));
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['Hillside']);
  // respond once: a second call changes nothing
  m.asks[1].respond(HUBS);
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['Hillside']);
});

test('lookup: el.options is the answer to the current ask, without respond', async () => {
  const { el, w } = await made();
  el.addEventListener('sheen-lookup-query', (e) => { el.options = e.detail.query ? [] : HUBS; });
  el.open();
  assert.deepEqual(rows(el), ['Old Town', 'Riverside', 'Hillside']);
  assert.deepEqual(busy(el), { spin: false, glass: true, aria: null });
  type(w, parts(el).input, 'zz');
  await tick(w, 40);
  assert.deepEqual(rows(el), []);
  assert.equal(says(el), 'No matches');
});

test('lookup: groups, disabled entries, a value twice and a "" value come out as a select draws them', async () => {
  const m = await made();
  await opened(m, [{ value: 'b', label: 'Old Town', group: 'North' }, { value: 'm', label: 'Riverside', group: 'North' },
    { value: 'd', label: 'Hillside', group: 'South', disabled: true }, { value: 'b', label: 'Again' }, { value: '', label: 'Nothing' }, { value: 7, label: 'Seven' }]);
  assert.deepEqual([...m.el.querySelectorAll('.sheen-select-heading')].map((x) => x.textContent), ['North', 'South']);
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside', 'Hillside', 'Seven']);
  assert.equal(m.el.querySelectorAll('.sheen-select-option')[2].getAttribute('aria-disabled'), 'true');
  assert.equal(parts(m.el).native.options[0].hasAttribute('data-none'), true, 'the "" option stays first');
});

// ---- the status line

test('lookup: an empty answer says empty; fewer rows than total say more with @count and @total', async () => {
  const m = await made();
  await opened(m, []);
  assert.equal(says(m.el), 'No matches');
  type(m.w, parts(m.el).input, 'a');
  await tick(m.w, 40);
  m.asks[1].respond({ options: HUBS.slice(0, 2), total: 3214 });
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside']);
  assert.equal(says(m.el), '2 of 3,214 shown', 'numbers written for the page\'s language');
  assert.equal(m.el.querySelector('.sheen-select-list').hidden, false, 'the rows stay under the more line');
  type(m.w, parts(m.el).input, 'al');
  await tick(m.w, 40);
  m.asks[2].respond({ options: HUBS.slice(0, 1), total: 1 });
  await tick(m.w);
  assert.equal(says(m.el), null, 'all of them shown: quiet');
});

test('lookup: a state without its attribute leaves the line quiet', async () => {
  const m = await made('placeholder="Any hub"');
  m.el.open();
  assert.equal(says(m.el), null, 'no loading words');
  m.asks[0].respond([]);
  await tick(m.w);
  assert.equal(says(m.el), null, 'no empty words');
  m.el.close();
  m.el.open();
  m.asks[1].respond(Promise.reject(new Error('down')));
  await tick(m.w);
  assert.equal(says(m.el), null, 'no error words');
  assert.equal(parts(m.el).retry.hidden, true, 'no retry words');
});

test('lookup: a failed answer shows the error line and a retry button; Enter or the button asks again', async () => {
  const m = await made();
  m.el.open();
  m.asks[0].respond(Promise.reject(new Error('502')));
  await tick(m.w);
  const p = parts(m.el);
  assert.equal(says(m.el), 'Couldn\'t load the hubs');
  assert.equal(p.retry.hidden, false);
  assert.equal(p.retry.textContent, 'Try again');
  assert.ok(p.retry.classList.contains('sheen-link-button'));
  assert.deepEqual(busy(m.el), { spin: false, glass: true, aria: null });
  assert.equal(key(m.w, p.input, 'Enter'), false, 'Enter is handled');
  assert.deepEqual(m.asks.map((a) => a.query), ['', '']);
  assert.equal(says(m.el), 'Searching…');
  m.asks[1].respond(Promise.reject(new Error('502')));
  await tick(m.w);
  press(m.w, p.retry);
  assert.equal(m.asks.length, 3);
  assert.equal(m.w.document.activeElement, p.input, 'focus stays in the search box');
  m.asks[2].respond(HUBS);
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside', 'Hillside']);
  assert.equal(says(m.el), null);
  assert.equal(p.retry.hidden, true);
});

test('lookup: a rejection after the signal was aborted shows no error', async () => {
  const m = await made();
  m.el.open();
  const first = m.asks[0];
  type(m.w, parts(m.el).input, 'x');
  await tick(m.w, 40);
  first.respond(Promise.reject(new m.w.DOMException('aborted', 'AbortError')));
  await tick(m.w);
  assert.equal(says(m.el), 'Searching…');
  m.el.close();
  const second = m.asks[1];
  assert.equal(second.signal.aborted, true, 'closing aborts the ask that is out');
  second.respond(Promise.reject(new Error('late')));
  await tick(m.w);
  m.el.open();
  assert.equal(says(m.el), 'Searching…');
});

// ---- picking and the choice

test('lookup: Enter while an ask is out picks nothing; once answered it picks', async () => {
  const m = await made();
  await opened(m);
  const { input, native } = parts(m.el);
  const seen = events(native);
  type(m.w, input, 'dow');
  assert.equal(key(m.w, input, 'Enter'), false, 'handled, so no form submits');
  assert.equal(native.value, '');
  assert.equal(m.el.isOpen(), true);
  await tick(m.w, 40);
  m.asks[1].respond([HUBS[2]]);
  await tick(m.w);
  key(m.w, input, 'Enter');
  assert.equal(native.value, 'd');
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(m.el.isOpen(), false);
  assert.equal(field(m.el), 'Hillside');
});

test('lookup: a single choice stays chosen when an answer lacks it, and takes a new answer\'s words', async () => {
  const m = await made();
  await opened(m);
  const { input, native } = parts(m.el);
  key(m.w, input, 'ArrowDown');
  key(m.w, input, 'Enter');
  assert.equal(native.value, 'm');
  assert.equal(m.el.isOpen(), false);
  assert.deepEqual(rows(m.el), [], 'closing drops the rows');
  const kept = [...native.options].filter((o) => o.value === 'm');
  assert.equal(kept.length, 1);
  assert.equal(kept[0].hidden, true);
  assert.ok(kept[0].hasAttribute('data-kept'));
  assert.equal(field(m.el), 'Riverside');
  assert.equal(m.el.hasAttribute('data-chosen'), true);
  await opened(m, [HUBS[0], HUBS[2]]);
  assert.deepEqual(rows(m.el), ['Old Town', 'Hillside']);
  assert.equal(native.value, 'm');
  assert.equal(field(m.el), 'Riverside');
  m.el.close();
  await opened(m, [{ value: 'm', label: 'Riverside North' }, HUBS[0]]);
  assert.deepEqual(rows(m.el), ['Riverside North', 'Old Town']);
  assert.equal(m.el.querySelector('.sheen-select-option').getAttribute('aria-selected'), 'true');
  assert.equal(active(m.el), 'Riverside North', 'the chosen row is active');
  assert.equal(field(m.el), 'Riverside North');
  assert.equal(native.querySelector('option[value="m"]').hasAttribute('data-kept'), false);
});

test('lookup: a multiple lookup keeps its chips when an answer lacks them, in the order they were chosen', async () => {
  const m = await made(WORDS + ' remove="Remove @label"', { multiple: true });
  const { native } = parts(m.el);
  assert.equal(native.multiple, true);
  assert.equal(native.options.length, 0, 'no "" option in a multiple lookup');
  await opened(m, [HUBS[2], HUBS[0], HUBS[1]]);
  const input = parts(m.el).input;
  const seen = events(native);
  key(m.w, input, 'ArrowDown');
  key(m.w, input, 'Enter');
  key(m.w, input, 'ArrowUp');
  key(m.w, input, 'Enter');
  assert.deepEqual(chips(m.el), ['Old Town', 'Hillside'], 'the order chosen');
  assert.deepEqual(seen, ['input', 'change', 'input', 'change']);
  assert.equal(m.el.isOpen(), true, 'a multiple list stays open');
  type(m.w, input, 'mar');
  await tick(m.w, 40);
  m.asks[1].respond([HUBS[1]]);
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['Riverside']);
  assert.deepEqual(chips(m.el), ['Old Town', 'Hillside']);
  key(m.w, input, 'Enter');
  assert.deepEqual(chips(m.el), ['Old Town', 'Hillside', 'Riverside']);
  assert.deepEqual(plain(m.el.values).sort(), ['b', 'd', 'm']);
  m.el.close();
  assert.deepEqual(chips(m.el), ['Old Town', 'Hillside', 'Riverside'], 'closing keeps every chip');
  assert.equal(m.el.querySelector('.sheen-select-chip-remove').getAttribute('title'), 'Remove Old Town');
  // Backspace on the closed field takes the last one chosen; a chip's mark takes its own
  key(m.w, parts(m.el).trigger, 'Backspace');
  assert.deepEqual(chips(m.el), ['Old Town', 'Hillside']);
  m.el.querySelector('.sheen-select-chip[data-value="b"] .sheen-select-chip-remove').dispatchEvent(new m.w.MouseEvent('click', { bubbles: true, cancelable: true }));
  assert.deepEqual(chips(m.el), ['Hillside']);
  assert.deepEqual(plain(m.el.values), ['d']);
});

test('lookup: el.chosen sets the choice with its labels, without events, and reads it back', async () => {
  const m = await made(WORDS + ' clear="Clear"');
  const { native } = parts(m.el);
  const seen = events(native);
  m.el.chosen = [{ value: 42, label: 'Riverside' }];
  assert.equal(native.value, '42');
  assert.equal(field(m.el), 'Riverside');
  assert.deepEqual(plain(m.el.chosen), [{ value: '42', label: 'Riverside' }]);
  assert.deepEqual(seen, [], 'no events');
  assert.equal(parts(m.el).clear.hidden, false);
  // a single lookup takes the first entry only; [] chooses nothing
  m.el.chosen = [{ value: 'b', label: 'Old Town' }, { value: 'd', label: 'Hillside' }];
  assert.deepEqual(plain(m.el.chosen), [{ value: 'b', label: 'Old Town' }]);
  m.el.chosen = [];
  assert.equal(native.value, '');
  assert.equal(field(m.el), 'Any hub');
  assert.deepEqual(plain(m.el.chosen), []);
  const many = await made(WORDS, { multiple: true });
  many.el.chosen = [{ value: 'd', label: 'Hillside' }, { value: 'b', label: 'Old Town' }, { value: 'd', label: 'Twice' }];
  assert.deepEqual(chips(many.el), ['Hillside', 'Old Town'], 'the order given, a value twice once');
  assert.deepEqual(plain(many.el.values).sort(), ['b', 'd']);
});

test('lookup: a choice set before the element is built is used when it builds', async () => {
  const w = page('');
  const el = w.document.createElement('sheen-lookup');
  el.setAttribute('name', 'hub');
  el.chosen = [{ value: 'm', label: 'Riverside' }];
  assert.deepEqual(plain(el.chosen), [{ value: 'm', label: 'Riverside' }]);
  w.document.body.appendChild(el);
  await tick(w);
  assert.equal(el.querySelector('select').value, 'm');
  assert.equal(field(el), 'Riverside');
});

test('lookup: in the markup the chosen options are the starting choice and the others go', async () => {
  const { el } = await made(WORDS, { inner: '<select name="hub"><option value="">All hubs</option><option value="m" selected>Riverside</option><option value="d">Hillside</option></select>' });
  const native = el.querySelector('select');
  assert.deepEqual([...native.options].map((o) => o.value), ['', 'm']);
  assert.ok(native.options[0].hasAttribute('data-none'), 'the page\'s "" option is the "" option, without words');
  assert.equal(native.options[0].textContent, '');
  assert.equal(native.value, 'm');
  assert.equal(field(el), 'Riverside');
});

test('lookup: clear goes to the "" option once, and Delete on the closed field does the same', async () => {
  const m = await made(WORDS + ' clear="Clear"');
  const { native, clear, trigger } = parts(m.el);
  m.el.chosen = [{ value: 'm', label: 'Riverside' }];
  const seen = events(native);
  press(m.w, clear);
  assert.equal(native.value, '');
  assert.equal(native.selectedIndex, 0);
  assert.deepEqual(seen, ['input', 'change']);
  assert.equal(clear.hidden, true);
  assert.equal(m.w.document.activeElement, trigger);
  m.el.chosen = [{ value: 'm', label: 'Riverside' }];
  key(m.w, trigger, 'Delete');
  assert.equal(native.value, '');
  assert.equal(seen.length, 4);
});

test('lookup: closing aborts the ask that is out and drops the rows; Esc closes one layer', async () => {
  const m = await made();
  await opened(m);
  const { input, trigger } = parts(m.el);
  type(m.w, input, 'b');
  await tick(m.w, 40);
  const out = m.asks[1];
  assert.equal(key(m.w, input, 'Escape'), false);
  assert.equal(m.el.isOpen(), false);
  assert.equal(out.signal.aborted, true);
  assert.deepEqual(rows(m.el), []);
  assert.equal(m.w.document.activeElement, trigger);
  assert.equal(input.value, '');
  assert.deepEqual(busy(m.el), { spin: false, glass: true, aria: null });
  // an answer to the closed ask changes nothing
  out.respond(HUBS);
  await tick(m.w);
  assert.deepEqual(rows(m.el), []);
  // a pause timer set before closing asks nothing
  m.el.open();
  type(m.w, parts(m.el).input, 'q');
  m.el.close();
  await tick(m.w, 40);
  assert.deepEqual(m.asks.map((a) => a.query), ['', 'b', '']);
});

test('lookup: a letter on the closed field opens the list and searches with it', async () => {
  const m = await made();
  const { trigger, input } = parts(m.el);
  trigger.focus();
  assert.equal(key(m.w, trigger, 'd'), true, 'the letter is not held, so it lands in the search box');
  assert.equal(m.el.isOpen(), true);
  assert.equal(m.w.document.activeElement, input);
  type(m.w, input, 'd');
  await tick(m.w, 40);
  assert.deepEqual(m.asks.map((a) => a.query), ['', 'd']);
});

test('lookup: an input method composing asks nothing until the composition ends', async () => {
  const m = await made();
  await opened(m);
  const input = parts(m.el).input;
  input.dispatchEvent(new m.w.CompositionEvent('compositionstart', { bubbles: true }));
  type(m.w, input, 'ما', { isComposing: true });
  await tick(m.w, 40);
  assert.equal(m.asks.length, 1);
  input.value = 'الضفة';
  input.dispatchEvent(new m.w.CompositionEvent('compositionend', { bubbles: true }));
  await tick(m.w, 40);
  assert.deepEqual(m.asks.map((a) => a.query), ['', 'الضفة']);
});

test('lookup: the query\'s own events stay inside the element', async () => {
  const m = await made();
  await opened(m);
  const seen = [];
  m.w.document.addEventListener('input', () => seen.push('input'));
  m.w.document.addEventListener('change', () => seen.push('change'));
  type(m.w, parts(m.el).input, 'ma');
  parts(m.el).input.dispatchEvent(new m.w.Event('change', { bubbles: true }));
  assert.deepEqual(seen, []);
});

// ---- forms, pages and Arabic

test('lookup: the native select is the form value; required with nothing chosen is missing', async () => {
  const { el, w } = await made(WORDS + ' required', { around: (s) => `<form>${s}</form>` });
  const native = el.querySelector('select');
  assert.equal(native.required, true);
  assert.equal(native.validity.valueMissing, true);
  el.chosen = [{ value: 'm', label: 'Riverside' }];
  assert.equal(native.validity.valueMissing, false);
  assert.equal(new w.FormData(w.document.querySelector('form')).get('hub'), 'm');
  w.document.querySelector('form').reset();
  await tick(w);
  assert.equal(native.value, '');
  assert.equal(field(el), 'Any hub');
});

test('lookup: a made select that turns multiple loses its "" option, and gets it back when it turns single', async () => {
  const m = await made();
  m.el.chosen = [{ value: 'm', label: 'Riverside' }];
  m.el.setAttribute('multiple', '');
  const native = m.el.querySelector('select');
  assert.equal(native.multiple, true);
  assert.deepEqual([...native.options].map((o) => o.value), ['m']);
  assert.deepEqual(chips(m.el), ['Riverside']);
  m.el.removeAttribute('multiple');
  assert.deepEqual([...native.options].map((o) => o.value), ['', 'm']);
  assert.equal(native.value, 'm');
});

test('lookup: taken out of the page it stops asking; put back it works again', async () => {
  const m = await made();
  m.el.open();
  const out = m.asks[0];
  const holder = m.el.parentElement;
  m.el.remove();
  assert.equal(out.signal.aborted, true);
  assert.equal(m.el.isOpen(), false);
  holder.appendChild(m.el);
  await opened(m);
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside', 'Hillside']);
});

test('lookup: on an Arabic page the query goes as typed and the words come from the attributes', async () => {
  const m = await made('placeholder="أي مركز" search="ابحث في المراكز" loading="جارٍ البحث…" empty="لا نتائج" more="@count من @total"', { dir: 'rtl', around: (s) => `<div lang="ar-u-nu-arab">${s}</div>` });
  m.el.open();
  assert.equal(says(m.el), 'جارٍ البحث…');
  assert.equal(parts(m.el).input.getAttribute('placeholder'), 'ابحث في المراكز');
  type(m.w, parts(m.el).input, ' الضِّفة ');
  await tick(m.w, 40);
  assert.equal(m.asks[1].query, 'الضِّفة', 'marks and hamza seats are the server\'s to match');
  m.asks[1].respond({ options: [{ value: 'm', label: 'الضفة' }], total: 4 });
  await tick(m.w);
  assert.deepEqual(rows(m.el), ['الضفة']);
  assert.equal(says(m.el), '١ من ٤', 'the digits of the nearest lang (ar-u-nu-arab: Arabic-Indic)');
});

test('lookup: Alt+Up picks nothing while an ask is out, as Enter', async () => {
  const m = await made();
  await opened(m);
  const { input, native } = parts(m.el);
  key(m.w, input, 'ArrowDown');
  type(m.w, input, 'zz');
  assert.equal(key(m.w, input, 'ArrowUp', { altKey: true }), false, 'handled');
  assert.equal(native.value, '', 'no row of the older answer is picked');
  assert.equal(m.el.isOpen(), true);
  await tick(m.w, 40);
  m.asks[1].respond([HUBS[2]]);
  await tick(m.w);
  key(m.w, input, 'ArrowUp', { altKey: true });
  assert.equal(native.value, 'd', 'once answered, Alt+Up picks and closes');
  assert.equal(m.el.isOpen(), false);
});

test('lookup: el.chosen reuses an option the select already holds, so a value is never there twice', async () => {
  const m = await made();
  await opened(m);
  const native = parts(m.el).native;
  m.el.chosen = [{ value: 'm', label: 'Riverside East' }];
  m.el.chosen = [{ value: 'm', label: 'Riverside East' }];
  const ms = [...native.options].filter((o) => o.value === 'm');
  assert.equal(ms.length, 1);
  assert.equal(ms[0].hidden, false, 'the answer\'s own row, not a kept copy');
  assert.equal(native.value, 'm');
  assert.deepEqual(rows(m.el), ['Old Town', 'Riverside East', 'Hillside'], 'the row takes the new words');
  m.el.close();
  m.el.chosen = [{ value: 'm', label: 'Riverside East' }];
  assert.equal([...native.options].filter((o) => o.value === 'm').length, 1, 'kept, still once');
});

// ---- the look

const css = readFileSync(new URL('../../dist/sheen.css', import.meta.url), 'utf8').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const cssRules = [...css.replace(/\/\*.*?\*\//g, '').replace(/@media[^{]*\{((?:[^{}]*\{[^}]*\})*)\}/g, '$1').matchAll(/([^{}]+)\{([^}]*)\}/g)].map((x) => [x[1].trim(), x[2]]);
const selectorsOf = (body) => cssRules.filter(([, b]) => b === body).map(([s]) => s);

test('lookup css: every kit rule that names the sheen-select tag names sheen-lookup in the same list', () => {
  const lists = cssRules.map(([s]) => s.split(/,(?![^(]*\))/)).filter((parts) => parts.some((p) => /(^|[\s>])sheen-select(?![-\w])/.test(p)));
  assert.ok(lists.length >= 12, 'the field, the control, disabled, open, the rings and the chevron');
  for (const parts of lists) {
    for (const p of parts.filter((x) => /(^|[\s>])sheen-select(?![-\w])/.test(x))) {
      assert.ok(parts.includes(p.replace(/sheen-select(?![-\w])/, 'sheen-lookup')), `${p} has its sheen-lookup twin`);
    }
  }
});

test('lookup css: the status line has the empty line look, fits the retry button in 36px and keeps quiet in the tree', () => {
  assert.ok(css.includes('.sheen-lookup-status,.sheen-select-empty{display:flex;align-items:center;min-block-size:36px;padding:6px 10px;color:var(--sheen-text-tertiary)}'));
  assert.ok(css.includes('.sheen-lookup-status{gap:max(var(--sheen-space-min),8px);flex-wrap:wrap}'));
  assert.ok(css.includes('.sheen-lookup-status:has(>.sheen-lookup-retry:not([hidden])){padding-block:3px}'), '30px link button + 3 + 3');
  assert.ok(css.includes('.sheen-lookup-status[data-quiet]{position:absolute;inline-size:1px;block-size:1px;min-block-size:0;margin:0;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}'), 'clipped, not display:none');
  assert.ok(!/\.sheen-lookup-status\[data-quiet\]\{[^}]*display:none/.test(css));
});

test('lookup css: the spinner turns as the bulk bar\'s, stops with less motion, and hidden parts leave', () => {
  assert.ok(css.includes('.sheen-lookup-spin{animation:sheen-bulk-spin 1s linear infinite}'));
  assert.match(css, /@media \(prefers-reduced-motion:reduce\)\{\.sheen-lookup-spin\{animation:none\}\}/);
  assert.ok(css.includes(':where(.sheen-select-search>.sheen-glyph,.sheen-lookup-retry)[hidden]{display:none!important}'));
  assert.ok(selectorsOf('inline-size:15px;block-size:15px;flex:none;color:var(--sheen-text-secondary)').some((s) => s.includes('.sheen-select-search>.sheen-glyph')), 'the spinner is a 15px search glyph');
});

test('select css: rows and groups keep their height in a list long enough to scroll', () => {
  assert.ok(css.includes('.sheen-select-list>*{flex-shrink:0}'));
  const w = page('<div class="sheen-select-list"><div class="sheen-select-option"></div><div class="sheen-select-group"></div></div>');
  for (const c of w.document.querySelector('.sheen-select-list').children) assert.ok(c.matches('.sheen-select-list>*'));
});
