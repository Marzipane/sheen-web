import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';

test('the video scrubber is a slider; J and L seek, I and O set the kept range', () => {
  const w = page('<sheen-video keys duration="60" seek-label="Position" play-label="Play" pause-label="Pause"></sheen-video>');
  const v = w.document.querySelector('sheen-video');
  assert.equal(v.scrub.getAttribute('role'), 'slider');
  assert.equal(v.scrub.getAttribute('aria-label'), 'Position');
  assert.equal(v.playBtn.getAttribute('aria-label'), 'Play');
  const times = record(v, 'sheen-time');
  v.seek(20);
  key(w, v.video, 'l');
  assert.equal(v.currentTime, 25);
  key(w, v.video, 'j'); key(w, v.video, 'j');
  assert.equal(v.currentTime, 15);
  key(w, v.video, 'i');
  v.seek(40);
  key(w, v.video, 'o');
  assert.equal(v.inPoint, 15);
  assert.equal(v.outPoint, 40);
  assert.equal(v.range.hidden, false);
  assert.ok(times.length >= 4);
  key(w, v.scrub, 'ArrowRight');
  assert.equal(v.scrub.getAttribute('aria-valuenow'), '45');
  key(w, v.scrub, 'Home');
  assert.equal(v.currentTime, 0);
});

test('in a right-to-left page the arrow keys follow the reading direction', () => {
  const w = page('<sheen-video duration="60"></sheen-video><sheen-waveform duration="60" label="Audio"></sheen-waveform>', 'rtl');
  const v = w.document.querySelector('sheen-video'), wave = w.document.querySelector('sheen-waveform');
  v.seek(30);
  key(w, v.scrub, 'ArrowLeft');
  assert.equal(v.currentTime, 35, 'left is forward in RTL');
  const seeks = record(wave, 'sheen-seek');
  key(w, wave, 'ArrowLeft');
  assert.deepEqual(seeks, [{ time: 5 }]);
});

test('the waveform is a labelled slider that seeks', () => {
  const w = page('<sheen-waveform duration="90" label="Audio position" progress="10"></sheen-waveform>');
  const wave = w.document.querySelector('sheen-waveform');
  wave.peaks = [0.1, 0.5, 1];
  assert.equal(wave.getAttribute('role'), 'slider');
  assert.equal(wave.getAttribute('aria-label'), 'Audio position');
  assert.equal(wave.getAttribute('aria-valuetext'), '0:10 / 1:30');
  const seeks = record(wave, 'sheen-seek');
  key(w, wave, 'ArrowRight', { shiftKey: true });
  assert.deepEqual(seeks, [{ time: 11 }]);
  wave.seekTo(500);
  assert.equal(wave.progress, 90, 'clamped to the duration');
});

test('compare: a slider between before and after', () => {
  const w = page('<sheen-compare before="a.jpg" after="b.jpg" label="Compare" before-label="Before" after-label="After"></sheen-compare>');
  const c = w.document.querySelector('sheen-compare');
  assert.equal(c.handle.getAttribute('role'), 'slider');
  assert.equal(c.handle.getAttribute('aria-valuenow'), '50');
  key(w, c.handle, 'ArrowRight');
  assert.equal(c.position, 52);
  key(w, c.handle, 'ArrowLeft', { shiftKey: true });
  assert.equal(c.position, 42);
  c.position = 140;
  assert.equal(c.position, 100);
  assert.equal(c.style.getPropertyValue('--sheen-compare'), '100%');
  assert.match(c.textContent, /Before.*After/);
});
