// 0.8.0 the shared popup(): an open popup follows its anchor and its own size, so a field that grows (chips that wrap)
// or a list that shrinks (a search) never leaves the popup covering the field or floating away from it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page } from './setup.mjs';

// jsdom has no ResizeObserver: a stand-in that records what it watches and lets the test fire it.
function observers(w) {
  const made = [];
  w.ResizeObserver = class {
    constructor(cb) { this.cb = cb; this.watched = []; this.off = false; made.push(this); }
    observe(el) { this.watched.push(el); }
    disconnect() { this.off = true; this.watched = []; }
  };
  return made;
}

test('popup: an open menu is placed again when its button or itself changes size, and stops watching once closed', () => {
  const w = page('<sheen-menu-button label="Views"></sheen-menu-button>');
  const made = observers(w);
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'a', label: 'A' }];
  const button = m.querySelector('button'), list = m.querySelector('[role="menu"]');
  let bottom = 86;
  button.getBoundingClientRect = () => ({ left: 100, right: 210, top: 50, bottom, width: 110, height: bottom - 50 });
  list.getBoundingClientRect = () => ({ left: 0, right: 200, top: 0, bottom: 100, width: 200, height: 100 });
  button.click();
  assert.equal(list.style.top, '92px');
  assert.equal(made.length, 1);
  assert.deepEqual(made[0].watched, [list, button], 'it watches the popup and its anchor');
  bottom = 180;   // the anchor grew, as a field whose chips wrap
  made[0].cb([]);
  assert.equal(list.style.top, '186px', 'placed under the anchor as it is now');
  button.click();
  assert.equal(made[0].off, true, 'closing stops the watch');
});

test('popup: without ResizeObserver it still opens and places as before', () => {
  const w = page('<sheen-menu-button label="Views"></sheen-menu-button>');
  delete w.ResizeObserver;
  const m = w.document.querySelector('sheen-menu-button');
  m.items = [{ id: 'a', label: 'A' }];
  const button = m.querySelector('button'), list = m.querySelector('[role="menu"]');
  button.getBoundingClientRect = () => ({ left: 100, right: 210, top: 50, bottom: 86, width: 110, height: 36 });
  list.getBoundingClientRect = () => ({ left: 0, right: 200, top: 0, bottom: 100, width: 200, height: 100 });
  button.click();
  assert.equal(list.style.top, '92px');
  assert.equal(list.hidden, false);
});
