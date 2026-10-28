import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record, plain } from './setup.mjs';

const tracks = () => [
  { id: 'v', label: 'Video', kind: 'video', clips: [{ id: 'c1', start: 0, end: 20, label: 'Talk' }] },
  { id: 'a', label: 'Audio', kind: 'audio', peaks: [0.2, 0.8], clips: [{ id: 'a1', start: 0, end: 20, label: '' }] },
];

test('timeline: clips are named buttons; S splits at the playhead; Delete removes', () => {
  const w = page('<sheen-timeline duration="20" playhead="8" label="Timeline" split-label="Split"></sheen-timeline>');
  const tl = w.document.querySelector('sheen-timeline');
  tl.tracks = tracks();
  const clip = tl.querySelector('[data-clip="c1"]');
  assert.equal(clip.tagName, 'BUTTON');
  assert.equal(clip.getAttribute('aria-label'), 'Talk 0:00.0 – 0:20.0');
  const splits = record(tl, 'sheen-split');
  key(w, clip, 's');
  assert.equal(splits.length, 1);
  assert.deepEqual(plain(tl.tracks[0].clips.map((c) => [c.start, c.end])), [[0, 8], [8, 20]]);
  const dels = record(tl, 'sheen-clipdelete');
  key(w, tl.querySelectorAll('[data-clip]')[1], 'Delete');
  assert.equal(dels.length, 1);
  assert.equal(tl.tracks[0].clips.length, 1);
});

test('timeline: Alt or Shift with arrows trims a clip, never past its neighbours', () => {
  const w = page('<sheen-timeline duration="20"></sheen-timeline>');
  const tl = w.document.querySelector('sheen-timeline');
  tl.tracks = [{ id: 'v', kind: 'video', clips: [{ id: 'x', start: 2, end: 10 }, { id: 'y', start: 12, end: 18 }] }];
  const changes = record(tl, 'sheen-clipchange');
  key(w, tl.querySelector('[data-clip="x"]'), 'ArrowRight', { altKey: true });
  assert.equal(tl.tracks[0].clips[0].start, 2.5);
  for (let i = 0; i < 10; i++) key(w, tl.querySelector('[data-clip="x"]'), 'ArrowRight', { shiftKey: true });
  assert.equal(tl.tracks[0].clips[0].end, 12, 'stops at the next clip');
  assert.equal(changes.length, 11);
  const seeks = record(tl, 'sheen-seek');
  key(w, tl.querySelector('[data-clip="y"]'), 'ArrowRight');
  assert.deepEqual(seeks, [{ time: 1 }]);
});

const words = () => [
  { text: 'So', start: 0, end: 0.4, kind: 'word' }, { text: 'um', start: 0.4, end: 0.8, kind: 'filler' },
  { text: '1.2 s', start: 0.8, end: 2, kind: 'pause' }, { text: 'hello', start: 2, end: 2.5, kind: 'word' },
];

test('transcript: a click jumps to the word; Delete cuts the selection and puts it back', () => {
  const w = page('<sheen-transcript label="Transcript" removed-label="cut"></sheen-transcript>');
  const t = w.document.querySelector('sheen-transcript');
  t.words = words();
  assert.equal(t.getAttribute('role'), 'listbox');
  assert.equal(t.getAttribute('aria-multiselectable'), 'true');
  const seeks = record(t, 'sheen-seek'), edits = record(t, 'sheen-edit');
  t.querySelector('[data-i="3"]').dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
  assert.deepEqual(seeks, [{ time: 2 }]);
  key(w, t, 'ArrowLeft', { shiftKey: true });
  key(w, t, 'ArrowLeft', { shiftKey: true });
  assert.equal(t.querySelectorAll('[aria-selected="true"]').length, 3);
  key(w, t, 'Delete');
  assert.deepEqual(edits[0], { removed: [1, 2, 3], restored: [] });
  assert.equal(t.querySelector('[data-i="1"]').getAttribute('aria-label'), 'um, cut');
  key(w, t, 'Backspace');
  assert.deepEqual(edits[1], { removed: [], restored: [1, 2, 3] });
});

test('transcript: remove every filler at once; the word being spoken is marked', () => {
  const w = page('<sheen-transcript current="2.2"></sheen-transcript>');
  const t = w.document.querySelector('sheen-transcript');
  t.words = words();
  assert.ok(t.querySelector('[data-i="3"]').classList.contains('sheen-now'));
  const edits = record(t, 'sheen-edit');
  assert.deepEqual(plain(t.removeKind('filler')), [1]);
  assert.deepEqual(edits, [{ removed: [1], restored: [] }]);
  assert.deepEqual(plain(t.removeKind('filler')), [], 'nothing left to cut');
  assert.ok(t.querySelector('[data-i="1"]').classList.contains('sheen-removed'));
});
