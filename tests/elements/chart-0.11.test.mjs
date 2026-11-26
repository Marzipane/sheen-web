// 0.11.0: <sheen-chart> (a bar or line chart as the app mockups draw a report card's), the date fields' formatDate (the
// page's own words for a date) and the info tone of the status pill.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { page } from './setup.mjs';

const read = (p) => readFileSync(new URL('../../' + p, import.meta.url), 'utf8');
const css = read('dist/sheen.css').replace(/\s+/g, ' ').replace(/\s*([{};:,])\s*/g, '$1');
const tokens = JSON.parse(read('tokens/tokens.json'));
const has = (part) => assert.ok(css.includes(part), part);

// The app mockups' chart drawing, written apart from the element: a 600-wide viewBox,
// the axis 18px over the bottom, the scale 15% past the highest value or the limit, 12px of room over it.
function mockup(v, H, lim = 0) {
  const W = 600, n = v.length, max = Math.max(...v, lim) * 1.15, bw = W / n, base = H - 18;
  const top = (x) => base - (x / max) * (H - 30);
  return { base, top, bw, x: (i) => ((i + 0.5) / n * 100).toFixed(2) + '%', pts: v.map((x, i) => [(i + 0.5) * bw, top(x)]) };
}

function chart(attrs, points, html = (a) => `<div lang="en"><sheen-chart ${a}></sheen-chart></div>`, dir) {
  const w = page(html(attrs), dir);
  const c = w.document.querySelector('sheen-chart');
  if (points) c.points = points;
  return { w, c, plot: c.querySelector('.sheen-chart-plot'), table: c.querySelector('table') };
}
const texts = (root, sel) => [...root.querySelectorAll(sel)].map((e) => e.textContent);

const RATINGS = [4.7, 4.8, 4.9, 4.8, 4.9, 5, 4.9, 4.9];
const WEEKS = RATINGS.map((value, i) => ({ label: 'W' + (i + 1), value }));

test('chart: a line draws the mockup\'s geometry, the value over each point and the label under it', () => {
  const { c, plot } = chart('kind="line" label="Rating by week" height="160"', WEEKS);
  const m = mockup(RATINGS, 160);
  const svg = plot.querySelector('svg');
  assert.equal(svg.getAttribute('viewBox'), '0 0 600 160');
  assert.equal(svg.getAttribute('preserveAspectRatio'), 'none', 'the drawing stretches to the width');
  const axis = svg.querySelector('.sheen-chart-axis');
  assert.equal(+axis.getAttribute('y1'), m.base);
  assert.equal(+axis.getAttribute('x2'), 600);
  const line = 'M ' + m.pts.map((p) => p.join(' ')).join(' L ');
  assert.equal(svg.querySelector('.sheen-chart-line').getAttribute('d'), line);
  assert.equal(svg.querySelector('.sheen-chart-area').getAttribute('d'),
    `M ${m.pts[0][0]} ${m.base} L ` + m.pts.map((p) => p.join(' ')).join(' L ') + ` L ${m.pts[7][0]} ${m.base} Z`);
  assert.equal(plot.querySelectorAll('.sheen-chart-bar').length, 0);
  const values = [...plot.querySelectorAll('.sheen-chart-value')];
  assert.deepEqual(values.map((v) => v.textContent), ['4.7', '4.8', '4.9', '4.8', '4.9', '5', '4.9', '4.9']);
  values.forEach((v, i) => {
    assert.equal(v.style.getPropertyValue('--sheen-chart-x'), m.x(i));
    assert.equal(v.style.top, (m.top(RATINGS[i]) - 17).toFixed(1).replace(/\.0$/, '') + 'px');
  });
  const labels = [...plot.querySelectorAll('.sheen-chart-label')];
  assert.deepEqual(labels.map((l) => l.textContent), WEEKS.map((p) => p.label));
  labels.forEach((l) => assert.equal(l.style.top, '145px'));
  assert.equal(c.style.getPropertyValue('--sheen-chart-height'), '160px');
  assert.equal(c.querySelector('.sheen-chart-limit'), null);
});

test('chart: bars sit 60% of their slot wide, a highlighted bar keeps the accent, a limit is a dashed line with its words', () => {
  const v = [91, 86, 84, 79, 74, 70, 62];
  const { plot } = chart('height="220" highlight="0" unit="%" limit="90" limit-label="Limit 90%"',
    v.map((value, i) => ({ label: 'V' + i, value })));
  const m = mockup(v, 220, 90);
  const bars = [...plot.querySelectorAll('.sheen-chart-bar')];
  assert.equal(bars.length, 7);
  bars.forEach((b, i) => {
    assert.equal(b.style.getPropertyValue('--sheen-chart-x'), ((i + 0.2) / 7 * 100).toFixed(2) + '%');
    assert.equal(b.style.getPropertyValue('--sheen-chart-w'), (0.6 / 7 * 100).toFixed(2) + '%');
    assert.equal(parseFloat(b.style.top), +m.top(v[i]).toFixed(1));
    assert.equal(parseFloat(b.style.height), +(m.base - m.top(v[i])).toFixed(1));
    assert.equal(b.classList.contains('sheen-chart-dim'), i !== 0, 'every bar but the highlighted one dims');
  });
  assert.deepEqual(texts(plot, '.sheen-chart-value'), ['91%', '86%', '84%', '79%', '74%', '70%', '62%'], 'the unit follows each value');
  const lim = plot.querySelector('svg .sheen-chart-limit');
  assert.equal(+lim.getAttribute('y1'), m.top(90));
  const words = plot.querySelector('.sheen-chart-limit-label');
  assert.equal(words.textContent, 'Limit 90%');
  assert.equal(parseFloat(words.style.top), +(m.top(90) - 16).toFixed(1));
});

test('chart: without a highlight no bar dims; values group their thousands in the nearest lang; a page text wins', () => {
  const { w, c, plot } = chart('', [{ label: 'Sun', value: 15200 }, { label: 'Mon', value: 980, text: '980 visits' }, { label: 'Tue', value: 0 }]);
  assert.equal(plot.querySelectorAll('.sheen-chart-dim').length, 0);
  assert.deepEqual(texts(plot, '.sheen-chart-value'), ['15,200', '980 visits', '0']);
  assert.equal(c.querySelector('svg').getAttribute('viewBox'), '0 0 600 180', 'the size token\'s height without one given');
  assert.equal(c.style.getPropertyValue('--sheen-chart-height'), '', 'the stylesheet\'s height stays the page\'s');
  c.setAttribute('height', '220');
  assert.equal(c.style.getPropertyValue('--sheen-chart-height'), '220px');
  assert.equal(c.querySelector('svg').getAttribute('viewBox'), '0 0 600 220');
  c.removeAttribute('height');
  assert.equal(c.style.getPropertyValue('--sheen-chart-height'), '', 'without the attribute it falls back again');
  assert.equal(c.querySelector('svg').getAttribute('viewBox'), '0 0 600 180');
  c.setAttribute('lang', 'ar');
  assert.equal(plot.isConnected, false, 'a change of lang draws it again');
  assert.equal(c.querySelector('.sheen-chart-value').textContent, new w.Intl.NumberFormat('ar').format(15200));
  c.setAttribute('highlight', '2');
  assert.equal(c.querySelectorAll('.sheen-chart-bar').length, 3, 'a zero bar is still a bar');
  assert.equal(c.querySelectorAll('.sheen-chart-dim').length, 2, 'the others dim');
  assert.equal(c.querySelectorAll('.sheen-chart-bar')[2].classList.contains('sheen-chart-dim'), false);
  c.setAttribute('highlight', '9');
  assert.equal(c.querySelectorAll('.sheen-chart-dim').length, 0, 'an index past the points highlights nothing');
});

test('chart: a gap draws no bar and breaks the line; a value below 0 sits on the axis and keeps its number', () => {
  const pts = [{ label: 'A', value: 3 }, { label: 'B', value: null }, { label: 'C', value: 4 }, { label: 'D', value: 5 }, { label: 'E', value: -2 }];
  const bars = chart('', pts);
  const all = bars.plot.querySelectorAll('.sheen-chart-bar');
  assert.equal(all.length, 4);
  assert.equal(parseFloat(all[3].style.height), 0, 'the bar below 0 has no height');
  assert.equal(parseFloat(all[3].style.top), 180 - 18, 'and sits on the axis');
  const minus = new Intl.NumberFormat('en').format(-2);
  assert.deepEqual(texts(bars.plot, '.sheen-chart-value'), ['3', '4', '5', minus]);
  assert.equal(bars.table.querySelectorAll('td')[4].textContent, minus, 'screen readers hear the real number');
  assert.deepEqual(texts(bars.plot, '.sheen-chart-label'), ['A', 'B', 'C', 'D', 'E'], 'a gap keeps its label');
  const lines = chart('kind="line"', pts);
  assert.equal(lines.plot.querySelectorAll('.sheen-chart-line').length, 2);
  assert.equal(lines.plot.querySelectorAll('.sheen-chart-area').length, 2);
  assert.ok(lines.plot.querySelectorAll('.sheen-chart-line')[0].getAttribute('d').split(' L ').length === 1, 'a lone point is its own run');
});

test('chart: screen readers read a table of the labels and values, not the drawing; the element writes no words of its own', () => {
  const { c, plot, table } = chart('highlight="1" unit="%" limit="90" limit-label="Limit 90%" label="By van"',
    [{ label: 'V1', value: 91 }, { label: 'V2', value: 86 }]);
  assert.equal(plot.getAttribute('aria-hidden'), 'true');
  assert.ok(table.classList.contains('sheen-visually-hidden'));
  assert.equal(table.querySelector('caption').textContent, 'By van');
  const rows = [...table.querySelectorAll('tbody tr')];
  assert.deepEqual(rows.map((r) => [r.querySelector('th').textContent, r.querySelector('td').textContent]), [['V1', '91%'], ['V2', '86%']]);
  assert.equal(rows[0].querySelector('th').getAttribute('scope'), 'row');
  assert.equal(rows[1].getAttribute('aria-current'), 'true');
  assert.equal(rows[0].hasAttribute('aria-current'), false);
  assert.equal(c.querySelector('p.sheen-visually-hidden').textContent, 'Limit 90%');
  const bare = chart('', []);
  assert.equal(bare.table.querySelector('caption'), null);
  assert.equal(bare.table.querySelectorAll('tr').length, 0);
  assert.equal(bare.c.textContent, '', 'no points, no words');
  assert.ok(bare.plot.querySelector('.sheen-chart-axis'), 'only the axis');
  const lim = chart('unit="%" limit="90"', [{ label: 'V1', value: 91 }]);
  assert.equal(lim.plot.querySelector('.sheen-chart-limit-label').textContent, '90%', 'a limit without words shows its value');
  const line = chart('kind="line" highlight="0"', [{ label: 'V1', value: 91 }, { label: 'V2', value: 86 }]);
  assert.equal(line.table.querySelectorAll('[aria-current]').length, 0, 'a line has no highlight to read out');
});

test('chart: points a framework set before the element was defined are kept; a new list draws again', () => {
  const w = page('');
  const c = w.document.createElement('sheen-chart');
  // as if set before the element was defined: an own property hides the accessor
  Object.defineProperty(c, 'points', { value: WEEKS, writable: true, configurable: true, enumerable: true });
  w.document.body.appendChild(c);
  assert.equal(c.querySelectorAll('.sheen-chart-label').length, 8);
  c.points = WEEKS.slice(0, 3);
  assert.equal(c.querySelectorAll('.sheen-chart-label').length, 3);
  c.points = 'nothing';
  assert.equal(c.points.length, 0);
  assert.equal(c.querySelectorAll('.sheen-chart-label').length, 0);
});

test('chart CSS: the mockups\' look from tokens; Arabic mirrors the drawing and centres the words from the right', () => {
  assert.equal(tokens.size.chart, 180);
  has('--sheen-size-chart:180px');
  has('sheen-chart{display:block;position:relative;block-size:var(--sheen-chart-height,var(--sheen-size-chart))');
  has('sheen-chart[hidden]{display:none}');
  // :dir() follows the chart's own direction, so a left-to-right block inside an Arabic page keeps its line under its labels
  has('.sheen-chart-plot:dir(rtl)>svg{transform:scaleX(-1)}');
  has('.sheen-chart-at{position:absolute;inset-inline-start:var(--sheen-chart-x);transform:translateX(-50%)');
  has('.sheen-chart-at:dir(rtl){transform:translateX(50%)}');
  assert.ok(!css.includes('[dir="rtl"] .sheen-chart'), 'no [dir] ancestor rule');
  has('.sheen-chart-bar{position:absolute;inset-inline-start:var(--sheen-chart-x);inline-size:var(--sheen-chart-w);border-radius:4px;background:var(--sheen-accent)}');
  has('.sheen-chart-bar.sheen-chart-dim{background:color-mix(in srgb,var(--sheen-accent) 35%,var(--sheen-track))}');
  has('.sheen-chart-line{fill:none;stroke:var(--sheen-accent);stroke-width:2.5');
  has('.sheen-chart-area{fill:color-mix(in srgb,var(--sheen-accent) 14%,transparent)}');
  has('.sheen-chart-limit{stroke:var(--sheen-danger);stroke-width:1.5;stroke-dasharray:6 5');
  has('.sheen-chart-axis{stroke:var(--sheen-separator)');
  has('.sheen-chart-value{font-weight:600;color:var(--sheen-text-secondary);font-variant-numeric:tabular-nums}');
  has('.sheen-chart-label{color:var(--sheen-text-tertiary)}');
  has('.sheen-chart-limit-label{position:absolute;inset-inline-end:0');
  const own = read('src/css/23-chart.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.ok(!/#[0-9a-f]{3,8}\b|rgba?\(/i.test(own), 'colours come from tokens');
});

// ---- the date fields' formatDate

const DATE = 'placeholder="Pick a date" prev="Previous month" next="Next month" today="2026-11-14" first-day="1" lang="en-GB"';
const RANGE = DATE + ' from="From" to="To"';
const short = (iso) => {
  const d = new Date(iso + 'T00:00:00Z');
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()] + ' ' + d.getUTCDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getUTCMonth()];
};

test('date field: formatDate writes the date in the page\'s words; without it the field writes Intl\'s, as before', () => {
  const w = page(`<sheen-date-field ${DATE}><input type="date" value="2026-11-14"></sheen-date-field>`);
  const el = w.document.querySelector('sheen-date-field'), text = el.querySelector('.sheen-date-text');
  assert.equal(text.textContent, '14 Nov 2026', 'the default is unchanged');
  el.formatDate = short;
  assert.equal(el.formatDate, short);
  assert.equal(text.textContent, 'Sat 14 Nov');
  el.querySelector('input').value = '2026-11-02';
  assert.equal(text.textContent, 'Mon 2 Nov', 'a new value takes the same words');
  el.formatDate = null;
  assert.equal(el.formatDate, null);
  assert.equal(text.textContent, '2 Nov 2026');
  el.formatDate = 'not a function';
  assert.equal(el.formatDate, null);
  el.querySelector('input').value = '';
  el.formatDate = short;
  assert.equal(text.textContent, 'Pick a date', 'no date, the placeholder');
  // the calendar's names for screen readers stay Intl's full date
  el.querySelector('input').value = '2026-11-14';
  el.querySelector('.sheen-date-trigger').click();
  assert.equal(el.querySelector('.sheen-cal-day[data-date="2026-11-14"]').getAttribute('aria-label'),
    new Intl.DateTimeFormat('en-GB', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date('2026-11-14T00:00:00Z')));
});

test('date range: formatDate writes both ends, joined by a dash, in the field and under the calendar', () => {
  const w = page(`<sheen-date-range ${RANGE}><input type="date" value="2026-11-14"><input type="date" value="2026-11-20"></sheen-date-range>`);
  const el = w.document.querySelector('sheen-date-range'), text = el.querySelector('.sheen-date-text');
  el.formatDate = short;
  assert.equal(text.textContent, 'Sat 14 Nov – Fri 20 Nov');
  el.querySelector('.sheen-date-trigger').click();
  assert.deepEqual([...el.querySelectorAll('.sheen-date-end b')].map((b) => b.textContent), ['Sat 14 Nov', 'Fri 20 Nov']);
  el.querySelectorAll('input')[0].value = '';
  assert.equal(text.textContent, 'Fri 20 Nov', 'an end alone');
  el.presets = [{ label: 'This week', start: '2026-11-14', end: '2026-11-20' }];
  el.querySelectorAll('input')[0].value = '2026-11-14';
  assert.equal(text.textContent, 'This week', 'a preset keeps its label');
});

test('date field: formatDate and presets a framework set before the element was defined are kept', () => {
  const w = page('');
  const el = w.document.createElement('sheen-date-range');
  for (const [p, v] of [['formatDate', short], ['presets', [{ label: 'This week', start: '2026-11-14', end: '2026-11-20' }]]]) {
    Object.defineProperty(el, p, { value: v, writable: true, configurable: true, enumerable: true });
  }
  el.innerHTML = '<input type="date" value="2026-11-16"><input type="date" value="2026-11-17">';
  el.setAttribute('placeholder', 'Any dates');
  w.document.body.appendChild(el);
  assert.equal(el.querySelector('.sheen-date-text').textContent, 'Mon 16 Nov – Tue 17 Nov');
  assert.equal(el.presets.length, 1);
  assert.ok(el.hasAttribute('data-presets'));
});

// ---- the info tone

test('status pill: an info tone in the accent, as the mockups draw a booking; the menu button\'s pill takes it too', () => {
  has('.sheen-pill.sheen-info{background:color-mix(in srgb,var(--sheen-accent) 14%,transparent);color:var(--sheen-accent-text)}');
  const w = page('<sheen-menu-button variant="pill" tone="info" label="Booked"></sheen-menu-button><sheen-menu-button variant="pill" tone="loud" label="Other"></sheen-menu-button>');
  const [info, other] = w.document.querySelectorAll('sheen-menu-button');
  assert.equal(info.querySelector('button').className, 'sheen-pill sheen-info');
  assert.equal(other.querySelector('button').className, 'sheen-pill', 'any other tone keeps the plain pill');
  assert.match(read('resources/views/components/pill.blade.php'), /\| info/);
});

// The version check moved to palette-0.11.1.test.mjs with 0.11.1.
