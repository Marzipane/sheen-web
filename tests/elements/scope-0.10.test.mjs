// 0.10.0: <sheen-scope-picker> as the app mockups draw it (segmented modes, a chip per pick, group counts, the result over
// its hint), a search the page answers for lists that grow, group totals, and the stat tile's mockup look.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page, record, plain, key } from './setup.mjs';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const css = read('dist/sheen.css').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const tokens = JSON.parse(read('tokens/tokens.json'));
const has = (part) => assert.ok(css.includes(part), part);
const tick = (ms = 0) => new Promise((done) => setTimeout(done, ms));

const services = [
  { id: 'cat:clean', label: 'Cleaning', items: [{ id: 's:home', label: 'Home cleaning' }, { id: 's:deep', label: 'Deep cleaning' }, { id: 's:move', label: 'Move-in / move-out' }] },
  { id: 'cat:spec', label: 'Specialist', items: [{ id: 's:sofa', label: 'Sofa & carpet' }, { id: 's:pack', label: 'Packages' }] },
];

function picker(attrs = '', value, groups = services) {
  const w = page(`<sheen-scope-picker label="Services" all-label="All" chosen-label="Only these" except-label="All except" search-label="Search" empty-label="Nothing found" ${attrs}></sheen-scope-picker>`);
  const p = w.document.querySelector('sheen-scope-picker');
  p.groups = groups;
  if (value) p.value = value;
  return { w, p, changes: record(p, 'sheen-scope-change') };
}
const box = (p, id) => p.querySelector(`input[type=checkbox][value="${id}"]`);
const tickBox = (w, b) => { b.checked = !b.checked; b.dispatchEvent(new w.Event('change', { bubbles: true })); };
const type = (w, p, text) => { const s = p.querySelector('input[type=search]'); s.value = text; s.dispatchEvent(new w.Event('input', { bubbles: true })); };
const counts = (p) => [...p.querySelectorAll('.sheen-scope-count')].map((c) => c.textContent);
const chips = (p) => [...p.querySelectorAll('.sheen-scope-chip')].map((c) => c.textContent);

test('scope 0.10: the modes are a segmented bar that is still one radio group under the label', () => {
  const { p } = picker('', { mode: 'all_except', include: [], exclude: [] });
  const bar = p.querySelector('fieldset.sheen-scope-modes > .sheen-scope-segments');
  assert.ok(bar);
  assert.equal(p.querySelector('fieldset.sheen-scope-modes > legend').textContent, 'Services');
  const modes = [...bar.querySelectorAll('label.sheen-scope-mode')];
  assert.deepEqual(modes.map((m) => m.textContent), ['All', 'Only these', 'All except']);
  assert.deepEqual(modes.map((m) => m.querySelector('input[type=radio]').checked), [false, false, true]);
  assert.equal(new Set(modes.map((m) => m.querySelector('input').name)).size, 1);
});

test('scope 0.10: each group row ends in its count, n of the members the rule picks over the total', () => {
  const { p } = picker('', { mode: 'all_except', include: [], exclude: ['s:sofa'] });
  assert.deepEqual(counts(p), ['0 / 3', '1 / 2']);
  assert.equal(p.querySelector('.sheen-scope-count').getAttribute('dir'), 'ltr');
  assert.equal(box(p, 'cat:spec').indeterminate, true);
  p.value = { mode: 'only', include: ['cat:clean'], exclude: [] };
  assert.deepEqual(counts(p), ['3 / 3', '0 / 2']);
  assert.equal(box(p, 'cat:clean').checked, true);
});

test('scope 0.10: a chip per pick under the search names it, and a press removes it', () => {
  const { w, p, changes } = picker('remove-label="Remove @label"', { mode: 'only', include: ['cat:clean', 's:sofa'], exclude: [] });
  assert.deepEqual(chips(p), ['Cleaning', 'Sofa & carpet']);
  const order = [...p.querySelector('.sheen-scope-body').children].map((c) => c.className);
  assert.deepEqual(order.slice(0, 2), ['sheen-scope-tools', 'sheen-scope-chips']);
  const sofa = p.querySelector('.sheen-scope-chip[data-value="s:sofa"]');
  assert.equal(sofa.getAttribute('aria-label'), 'Remove Sofa & carpet');
  assert.equal(sofa.type, 'button');
  sofa.click();
  assert.deepEqual(changes.at(-1), { mode: 'only', include: ['cat:clean'], exclude: [] });
  assert.equal(w.document.activeElement, p.querySelector('.sheen-scope-chip[data-value="cat:clean"]'), 'focus stays on the chips');
  p.querySelector('.sheen-scope-chip').click();
  assert.equal(p.querySelector('.sheen-scope-chips').hidden, true);
  assert.equal(w.document.activeElement, p.querySelector('input[type=search]'), 'the last chip gone, focus goes to the search');
});

test('scope 0.10: a focused chip keeps focus when the page sets the value again, as a framework does after a change', () => {
  const { w, p } = picker('', { mode: 'only', include: ['cat:clean', 's:sofa'], exclude: [] });
  p.querySelector('.sheen-scope-chip[data-value="s:sofa"]').focus();
  p.value = { mode: 'only', include: ['cat:clean', 's:sofa'], exclude: [] };
  assert.equal(w.document.activeElement, p.querySelector('.sheen-scope-chip[data-value="s:sofa"]'));
  // A press removes its pick; the framework then sets the new value, and focus stays on the chip that took its place.
  p.addEventListener('sheen-scope-change', (e) => { p.value = e.detail; });
  p.querySelector('.sheen-scope-chip[data-value="cat:clean"]').focus();
  p.querySelector('.sheen-scope-chip[data-value="cat:clean"]').click();
  assert.equal(w.document.activeElement, p.querySelector('.sheen-scope-chip[data-value="s:sofa"]'));
});

test('scope 0.10: "Select all shown" comes only with its label', () => {
  const { p } = picker('', { mode: 'only', include: [], exclude: [] });
  assert.equal(p.querySelector('.sheen-scope-shown').hidden, true);
  p.setAttribute('select-shown-label', 'Select all shown');
  assert.equal(p.querySelector('.sheen-scope-shown').hidden, false);
  assert.equal(p.querySelector('.sheen-scope-shown').textContent, 'Select all shown');
});

test('scope 0.10: the foot holds the result in bold over the hint, and hides with neither', () => {
  const { p } = picker('', { mode: 'all_except', include: [], exclude: [] });
  const foot = p.querySelector('.sheen-scope-foot');
  assert.equal(foot.hidden, true);
  p.setAttribute('result', 'Applies to 4 of 5 services');
  p.setAttribute('hint', '1 excluded · new items join by themselves');
  assert.equal(foot.hidden, false);
  assert.equal(foot.getAttribute('role'), 'status');
  assert.equal(foot.querySelector('b.sheen-scope-result').textContent, 'Applies to 4 of 5 services');
  assert.equal(foot.querySelector('small.sheen-scope-hint').textContent, '1 excluded · new items join by themselves');
  assert.equal(p.lastElementChild, foot, 'under the list');
});

test('scope 0.10: a group the page loaded in part counts its total and never turns into the group', () => {
  const zones = [{ id: 'hub:b', label: 'Al Barsha hub', total: 12, items: [{ id: 'z:jlt', label: 'JLT' }, { id: 'z:jvc', label: 'JVC' }] }];
  const { w, p, changes } = picker('', { mode: 'only', include: ['z:jlt'], exclude: [] }, zones);
  assert.deepEqual(counts(p), ['1 / 12']);
  assert.equal(box(p, 'hub:b').indeterminate, true);
  tickBox(w, box(p, 'z:jvc'));
  assert.deepEqual(changes.at(-1).include, ['z:jlt', 'z:jvc'], 'every row shown, but not every member: the rows stay by name');
  assert.deepEqual(counts(p), ['2 / 12']);
  tickBox(w, box(p, 'hub:b'));
  assert.deepEqual(changes.at(-1).include, ['hub:b'], 'the group row still picks the whole group');
  assert.deepEqual(counts(p), ['12 / 12']);
});

test('scope 0.10: a group picked whole whose members the picker does not all know keeps its rows ticked and locked', () => {
  const zones = [{ id: 'hub:b', label: 'Al Barsha hub', total: 12, items: [{ id: 'z:jlt', label: 'JLT' }] }];
  const { w, p, changes } = picker('', { mode: 'only', include: ['hub:b'], exclude: [] }, zones);
  const row = box(p, 'z:jlt');
  assert.equal(row.checked, true);
  assert.equal(row.disabled, true);
  tickBox(w, row);
  assert.equal(changes.length, 0);
  assert.deepEqual(plain(p.value).include, ['hub:b']);
});

test('scope 0.10: without a handler the picker filters its own groups at once, as before', () => {
  const { w, p } = picker('', { mode: 'only', include: [], exclude: [] });
  const asks = record(p, 'sheen-scope-query');
  type(w, p, 'sofa');
  assert.equal(asks.length, 1);
  assert.equal(box(p, 's:home'), null);
  assert.ok(box(p, 's:sofa'));
});

test('scope 0.10: a handler that responds takes the search over, and the picker shows what it is given', async () => {
  const { w, p } = picker('delay="0"', { mode: 'only', include: ['z:9'], exclude: [] });
  const asked = [];
  p.addEventListener('sheen-scope-query', (e) => {
    asked.push(e.detail.query);
    assert.ok(e.detail.signal, 'a signal for fetch');
    e.detail.respond([{ id: 'cat:far', label: 'Far away', total: 40, items: [{ id: 'z:9', label: 'Zone nine' }] }]);
  });
  type(w, p, '  Nine ');
  assert.deepEqual(asked, ['Nine'], 'the trimmed query, as typed');
  assert.deepEqual([...p.querySelectorAll('.sheen-scope-group > span')].map((s) => s.textContent), ['Far away']);
  assert.deepEqual(counts(p), ['1 / 40']);
  assert.deepEqual(chips(p), ['Zone nine'], 'a pick takes its name from an answer');
  type(w, p, '');
  assert.deepEqual(asked, ['Nine'], 'an empty search shows the groups again without asking');
  assert.deepEqual([...p.querySelectorAll('.sheen-scope-group > span')].map((s) => s.textContent), ['Cleaning', 'Specialist']);
  assert.deepEqual(chips(p), ['Zone nine'], 'and the pick keeps its name');
  type(w, p, 'x');
  await tick(5);
  assert.deepEqual(asked, ['Nine', 'x'], 'later asks wait for the delay');
});

test('scope 0.10: an answer still out shows the loading words, a newer ask drops the older answer', async () => {
  const { w, p } = picker('delay="0" loading-label="Searching…"', { mode: 'only', include: [], exclude: [] });
  const pending = [];
  p.addEventListener('sheen-scope-query', (e) => {
    let done;
    e.detail.respond(new Promise((resolve) => { done = resolve; }));
    pending.push({ query: e.detail.query, signal: e.detail.signal, done });
  });
  type(w, p, 'a');
  const note = p.querySelector('.sheen-scope-note');
  assert.equal(note.hidden, false);
  assert.equal(note.textContent, 'Searching…');
  assert.equal(p.querySelector('.sheen-scope-list').getAttribute('aria-busy'), 'true');
  type(w, p, 'ab');
  await tick(5);
  assert.equal(pending.length, 2);
  assert.equal(pending[0].signal.aborted, true, 'the older ask is aborted');
  pending[1].done([{ id: 'g:new', label: 'New', items: [{ id: 'n:1', label: 'Newer' }] }]);
  pending[0].done([{ id: 'g:old', label: 'Old', items: [{ id: 'o:1', label: 'Older' }] }]);
  await tick(5);
  assert.ok(box(p, 'n:1'));
  assert.equal(box(p, 'o:1'), null);
  assert.equal(note.hidden, true);
  assert.equal(p.querySelector('.sheen-scope-list').hasAttribute('aria-busy'), false);
});

test('scope 0.10: an answer that fails shows the error words, and Enter asks again', async () => {
  const { w, p } = picker('delay="0" error-label="Couldn\'t search"', { mode: 'only', include: [], exclude: [] });
  let calls = 0;
  p.addEventListener('sheen-scope-query', (e) => {
    calls += 1;
    e.detail.respond(calls === 1 ? Promise.reject(new Error('offline')) : [{ id: 'g', label: 'G', items: [{ id: 'i', label: 'I' }] }]);
  });
  type(w, p, 'g');
  await tick(5);
  const note = p.querySelector('.sheen-scope-note');
  assert.equal(note.textContent, "Couldn't search");
  assert.ok(note.classList.contains('sheen-danger'));
  assert.equal(p.querySelector('.sheen-scope-empty'), null, 'no "nothing found" over a failed search');
  key(w, p.querySelector('input[type=search]'), 'Enter');
  assert.equal(calls, 2);
  assert.ok(box(p, 'i'));
  assert.equal(note.hidden, true);
});

test('scope 0.10: leaving the page aborts the ask that is out', () => {
  const { w, p } = picker('delay="0"', { mode: 'only', include: [], exclude: [] });
  let signal;
  p.addEventListener('sheen-scope-query', (e) => { signal = e.detail.signal; e.detail.respond(new Promise(() => {})); });
  type(w, p, 'q');
  p.remove();
  assert.equal(signal.aborted, true);
});

test('scope 0.10: moved on the page while an ask is out, the picker drops its loading line', () => {
  const { w, p } = picker('delay="0" loading-label="Searching…"', { mode: 'only', include: [], exclude: [] });
  p.addEventListener('sheen-scope-query', (e) => e.detail.respond(new Promise(() => {})));
  type(w, p, 'q');
  assert.equal(p.querySelector('.sheen-scope-note').hidden, false);
  const home = w.document.createElement('div');
  w.document.body.appendChild(home);
  home.appendChild(p);
  assert.equal(p.querySelector('.sheen-scope-note').hidden, true);
  assert.equal(p.querySelector('.sheen-scope-list').hasAttribute('aria-busy'), false);
});

test('scope 0.10: once the page answers, later asks wait for the pause, and only the last query goes', async () => {
  const { w, p } = picker('delay="40"', { mode: 'only', include: [], exclude: [] });
  const asked = [];
  p.addEventListener('sheen-scope-query', (e) => { asked.push(e.detail.query); e.detail.respond([]); });
  type(w, p, 'a');
  assert.deepEqual(asked, ['a'], 'the first ask goes at once');
  type(w, p, 'ab');
  type(w, p, 'abc');
  await tick(10);
  assert.deepEqual(asked, ['a'], 'nothing while the person types');
  await tick(60);
  assert.deepEqual(asked, ['a', 'abc']);
});

test('scope 0.10: the look is ported from the mockup into tokens and rules', () => {
  assert.equal(tokens.size.scopeSegment, 30);
  assert.equal(tokens.size.scopeRow, 30);
  assert.equal(tokens.size.scopeChip, 26);
  assert.equal(tokens.size.scopeList, 260);
  has('--sheen-size-scope-segment:30px;');
  has('sheen-scope-picker{display:flex;flex-direction:column;gap:max(var(--sheen-space-min),8px);min-inline-size:0;font-size:13px}');
  has('.sheen-scope-modes legend{padding:0;margin-block-end:8px;font-weight:500;color:var(--sheen-text-secondary)}');
  has('.sheen-scope-segments{display:flex;inline-size:fit-content;max-inline-size:100%;flex-wrap:wrap;gap:2px;padding:2px;border-radius:11px;background:var(--sheen-tonal)}');
  assert.match(css, /\.sheen-scope-mode\{[^}]*min-block-size:var\(--sheen-size-scope-segment\);padding-inline:12px;border-radius:9px;color:var\(--sheen-text-secondary\);font-weight:600/);
  has('.sheen-scope-mode:has(>input:checked){background:var(--sheen-surface);color:var(--sheen-text);box-shadow:0 1px 2px rgba(0,0,0,.14)}');
  assert.match(css, /\.sheen-scope-search\{[^}]*min-block-size:var\(--sheen-size-control\);padding:0 12px;border:0;border-radius:11px;background:var\(--sheen-background\);box-shadow:inset 0 0 0 1px var\(--sheen-separator\)/);
  assert.match(css, /\.sheen-scope-chip\{[^}]*min-block-size:var\(--sheen-size-scope-chip\);padding-inline:10px;border:0;border-radius:13px;background:var\(--sheen-tonal\);[^}]*font-size:12px;font-weight:600/);
  has('.sheen-scope-chips{display:flex;flex-wrap:wrap;gap:max(var(--sheen-space-min),6px)}');
  assert.match(css, /\.sheen-scope-list\{[^}]*max-block-size:var\(--sheen-scope-list-max,var\(--sheen-size-scope-list\)\);overflow:auto/);
  assert.match(css, /\.sheen-scope-group,\.sheen-scope-item\{display:flex;align-items:center;gap:8px;min-block-size:var\(--sheen-size-scope-row\)/);
  // The label takes the room, so the count sits at the end edge in either direction: its own dir is ltr (for the
  // digits), so a margin-inline-start:auto of its own would push it the wrong way in Arabic.
  has('.sheen-scope-group>span{flex:1;font-weight:700}');
  assert.match(css, /\.sheen-scope-count\{flex:none;[^}]*color:var\(--sheen-text-tertiary\)/);
  assert.doesNotMatch(css.match(/\.sheen-scope-count\{[^}]*\}/)[0], /margin/);
  has('.sheen-scope-items{margin-inline-start:24px}');
  has('.sheen-scope-foot{display:flex;flex-direction:column;margin:0;padding-block-start:8px;border-block-start:1px solid var(--sheen-separator)}');
  has('.sheen-scope-result{font-weight:700}');
  has('.sheen-scope-hint{font-size:smaller;color:var(--sheen-text-tertiary)}');
});

test('scope 0.10: the chosen segment rings after Tab only, and the search draws no ring', () => {
  has('.sheen-scope-mode:has(>input:focus-visible){outline:2px solid var(--sheen-accent-text);outline-offset:2px}');
  has(':root[data-sheen-focus]:not([data-sheen-keyboard]) .sheen-scope-mode:has(>input:focus-visible){outline:none}');
  has('.sheen-scope-search:focus-visible{outline:none}');
});

test('stat tile 0.10: the mockup look, a surface card with no frame, a 13px label, a 26px value and a semibold note', () => {
  has('.sheen-stat{display:flex;flex-direction:column;gap:4px;min-inline-size:0;padding:14px 16px;border-radius:18px;background:var(--sheen-surface);line-height:1.5}');
  assert.doesNotMatch(css.match(/\.sheen-stat\{[^}]*\}/)[0], /inset/, 'no frame');
  has(':root[data-theme="light"] .sheen-stat{box-shadow:0 1px 2px rgba(16,20,30,.05),0 4px 14px rgba(16,20,30,.05)}');
  has('.sheen-stat-label{font-size:13px;font-weight:400;color:var(--sheen-text-secondary)}');
  has('.sheen-stat-value{font-size:26px;font-weight:700;letter-spacing:-.02em;font-variant-numeric:tabular-nums}');
  has('.sheen-stat-note{font-size:12.5px;font-weight:600;color:var(--sheen-text)}');
  has('.sheen-stat-note.sheen-danger{color:var(--sheen-danger)}');
  has('.sheen-stat-note.sheen-success{color:var(--sheen-success)}');
});
