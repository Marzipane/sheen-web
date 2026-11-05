import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';

test('a glyph is decorative unless it has a label, and a typo throws', () => {
  const w = page('<sheen-glyph name="play"></sheen-glyph><sheen-glyph name="scissors" label="Cut"></sheen-glyph>');
  const [a, b] = w.document.querySelectorAll('sheen-glyph svg');
  assert.equal(a.getAttribute('aria-hidden'), 'true');
  assert.equal(b.getAttribute('role'), 'img');
  assert.equal(b.getAttribute('aria-label'), 'Cut');
  assert.throws(() => w.sheenElements.glyph('nope'), /Unknown sheen glyph/);
  // the sheen icons and the media glyphs are both there
  for (const n of ['search', 'sparkle', 'play', 'timeline', 'captions']) assert.ok(w.sheenElements.glyphNames().includes(n), n);
});

test('the progress ring is a progressbar with a value, or spins without one', () => {
  const w = page('<sheen-progress-ring value="0.42" label="Rendering" show-value></sheen-progress-ring><sheen-progress-ring label="Waiting"></sheen-progress-ring>');
  const [r, spin] = w.document.querySelectorAll('sheen-progress-ring');
  assert.equal(r.getAttribute('role'), 'progressbar');
  assert.equal(r.getAttribute('aria-valuenow'), '42');
  assert.equal(r.getAttribute('aria-label'), 'Rendering');
  assert.equal(r.textContent, '42%');
  assert.equal(spin.hasAttribute('aria-valuenow'), false);
  assert.ok(spin.classList.contains('sheen-spin'));
  r.value = 1.5;
  assert.equal(r.getAttribute('aria-valuenow'), '100');
});

test('the drop zone is a button named by its words, opens the chooser by keyboard and hands over files', () => {
  const w = page('<sheen-drop-zone label="Drop a video" hint="or press Enter" accept="video/*"></sheen-drop-zone>');
  const z = w.document.querySelector('sheen-drop-zone');
  assert.equal(z.getAttribute('role'), 'button');
  assert.equal(z.getAttribute('tabindex'), '0');
  assert.equal(z.getAttribute('aria-label'), 'Drop a video, or press Enter');
  let opened = 0;
  z.input.click = () => { opened += 1; };
  key(w, z, 'Enter');
  key(w, z, ' ');
  assert.equal(opened, 2);
  const got = record(z, 'sheen-files');
  const f1 = new w.File(['a'], 'a.mp4'), f2 = new w.File(['b'], 'b.mp4');
  z.take([f1, f2]);
  assert.equal(got.length, 1);
  assert.equal(got[0].files.length, 1, 'one file unless multiple');
});

test('toasts queue up, show only the words given, and the next one waits for a free place', () => {
  const w = page('<sheen-toaster close-label="Dismiss" max="2"></sheen-toaster>');
  const t = w.document.querySelector('sheen-toaster');
  assert.equal(t.getAttribute('aria-live'), 'polite');
  const ids = [1, 2, 3].map((n) => t.show({ title: 'T' + n, message: 'M' + n, timeout: 0 }));
  assert.equal(t.querySelectorAll('.sheen-toast').length, 2);
  assert.equal(t.textContent.replace(/\s/g, ''), 'T1M1T2M2');
  assert.equal(t.querySelector('.sheen-toast-close').getAttribute('aria-label'), 'Dismiss');
  t.dismiss(ids[0]);
  assert.deepEqual([...t.querySelectorAll('.sheen-toast b')].map((b) => b.textContent), ['T2', 'T3']);
  const id = t.show({ title: 'Bad', tone: 'danger', timeout: 0 });
  t.dismiss(ids[1]);
  assert.equal(t.querySelector('#' + id).getAttribute('role'), 'alert');
});

test('the elements carry no words of their own', () => {
  const w = page(`<sheen-drop-zone></sheen-drop-zone><sheen-command-palette></sheen-command-palette>
    <sheen-video></sheen-video><sheen-timeline duration="10"></sheen-timeline><sheen-tour></sheen-tour>
    <sheen-node-graph></sheen-node-graph><sheen-compare></sheen-compare><sheen-transcript></sheen-transcript>`);
  // only times ("0:00") and the esc key cap may appear when no words were passed in
  const letters = w.document.body.textContent.replace(/esc|\d|[:/.\s–]/g, '');
  assert.equal(letters, '');
});

test('a sheen-range slider fills up to its thumb: on load, when added later, and as it moves', async () => {
  const w = page('<input type="range" class="sheen-range" min="0.1" max="1.1" value="0.85">');
  const r = w.document.querySelector('input');
  assert.equal(r.style.getPropertyValue('--sheen-range-fill'), '75%');
  r.value = '0.35';
  r.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.equal(r.style.getPropertyValue('--sheen-range-fill'), '25%');
  const later = w.document.createElement('input');
  later.type = 'range'; later.className = 'sheen-range'; later.value = '30';
  w.document.body.append(later);
  await new Promise((done) => w.setTimeout(done, 0));          // the observer runs after the insert
  assert.equal(later.style.getPropertyValue('--sheen-range-fill'), '30%');
});
