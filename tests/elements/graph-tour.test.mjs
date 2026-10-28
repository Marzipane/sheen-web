import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record, plain } from './setup.mjs';

const nodes = () => [
  { id: 'a', label: 'Remove pauses', x: 0, y: 0 }, { id: 'b', label: 'Even volume', x: 240, y: 0 },
  { id: 'c', label: 'Export', x: 480, y: 0 },
];

test('node graph: C then Enter connects by keyboard; one way in and out per node; order follows the edges', () => {
  const w = page('<sheen-node-graph label="Pipeline" connect-label="Connect from @name" connected-label="@from → @to"></sheen-node-graph>');
  const g = w.document.querySelector('sheen-node-graph');
  g.nodes = nodes();
  g.edges = [{ from: 'a', to: 'c' }];
  const changes = record(g, 'sheen-graphchange');
  key(w, g.querySelector('[data-node="a"]'), 'c');
  assert.ok(g.classList.contains('sheen-connecting'));
  assert.equal(g.live.textContent, 'Connect from Remove pauses');
  key(w, g.querySelector('[data-node="b"]'), 'Enter');
  key(w, g.querySelector('[data-node="b"]'), 'c');
  key(w, g.querySelector('[data-node="c"]'), 'Enter');
  assert.deepEqual(plain(g.edges), [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }]);
  assert.deepEqual(plain(g.order()), ['a', 'b', 'c']);
  assert.equal(changes.length, 2);
  assert.equal(g.live.textContent, 'Even volume → Export');
});

test('node graph: arrows move a node, Delete removes it and its edges', () => {
  const w = page('<sheen-node-graph></sheen-node-graph>', 'rtl');
  const g = w.document.querySelector('sheen-node-graph');
  g.nodes = nodes();
  g.edges = [{ from: 'a', to: 'b' }, { from: 'b', to: 'c' }];
  key(w, g.querySelector('[data-node="b"]'), 'ArrowLeft');
  assert.equal(g.nodes[1].x, 250, 'left moves towards the inline end in RTL');
  key(w, g.querySelector('[data-node="b"]'), 'ArrowDown', { shiftKey: true });
  assert.equal(g.nodes[1].y, 40);
  key(w, g.querySelector('[data-node="b"]'), 'Delete');
  assert.deepEqual(plain(g.nodes.map((n) => n.id)), ['a', 'c']);
  assert.deepEqual(plain(g.edges), []);
});

test('tour: steps with their words, Back and Next, Esc ends it unfinished, the last step finishes it', () => {
  const w = page(`<button id="one">One</button><sheen-tour next-label="Next" back-label="Back" done-label="Done"
      skip-label="Skip" step-label="@n of @all"></sheen-tour>`);
  const tour = w.document.querySelector('sheen-tour');
  tour.steps = [{ target: '#one', title: 'Hello', text: 'First' }, { target: '#missing', title: 'Two', text: 'Second' }];
  const ends = record(tour, 'sheen-tour-end');
  tour.start();
  assert.equal(tour.hidden, false);
  assert.equal(tour.countEl.textContent, '1 of 2');
  assert.equal(tour.back.hidden, true);
  assert.equal(tour.next.textContent, 'Next');
  tour.next.click();
  assert.equal(tour.titleEl.textContent, 'Two');
  assert.ok(tour.card.classList.contains('sheen-tour-center'), 'a missing target puts the card in the middle');
  assert.equal(tour.next.textContent, 'Done');
  key(w, tour.card, 'Escape');
  assert.deepEqual(ends, [{ completed: false }]);
  tour.start(1);
  tour.next.click();
  assert.deepEqual(ends[1], { completed: true });
  assert.equal(tour.card.getAttribute('role'), 'dialog');
});

test('tour: a target as tall as the window gets the card beside it, on the reading side, also right to left', () => {
  for (const dir of ['ltr', 'rtl']) {
    const w = page(`<nav id="rail">Rail</nav><sheen-tour next-label="Next" back-label="Back" done-label="Done"></sheen-tour>`, dir);
    const W = w.innerWidth, H = w.innerHeight;
    // an 84px rail down the inline-start edge: the left in LTR, the right in RTL
    const box = dir === 'ltr' ? { left: 0, right: 84 } : { left: W - 84, right: W };
    w.document.getElementById('rail').getBoundingClientRect = () => ({ ...box, top: 0, bottom: H, width: 84, height: H });
    const tour = w.document.querySelector('sheen-tour');
    tour.steps = [{ target: '#rail', title: 'Rail', text: 'All screens' }];
    tour.start();
    assert.equal(tour.card.style.top, '12px', dir);
    assert.equal(tour.card.style.insetInlineStart, '100px', `${dir}: 84px rail + 16px gap, counted from the inline start`);
  }
});
