import { test } from 'node:test';
import assert from 'node:assert/strict';
import { page, key, record } from './setup.mjs';

const items = [
  { id: 'p1', group: 'Presets', label: 'Clean up recording', keywords: ['pauses'] },
  { id: 'p2', group: 'Presets', label: 'Make shorts', hint: 'vertical clips' },
  { id: 's1', group: 'Settings', label: 'AI provider', disabled: true, reason: 'Needs an AI provider' },
];

test('typing filters on label, hint and keywords; arrows move the active row', () => {
  const w = page('<sheen-command-palette label="Command bar" placeholder="Type…"></sheen-command-palette>');
  const p = w.document.querySelector('sheen-command-palette');
  p.items = items;
  p.open();
  assert.equal(p.input.getAttribute('role'), 'combobox');
  assert.equal(p.querySelectorAll('[role="option"]').length, 3);
  p.value = 'pauses';
  assert.deepEqual([...p.querySelectorAll('[role="option"]')].map((o) => o.textContent), ['Clean up recording']);
  p.value = '';
  key(w, p.input, 'ArrowDown');
  const active = p.input.getAttribute('aria-activedescendant');
  assert.equal(w.document.getElementById(active).getAttribute('aria-selected'), 'true');
  assert.match(w.document.getElementById(active).textContent, /Make shorts/);
  key(w, p.input, 'ArrowUp'); key(w, p.input, 'ArrowUp');
  assert.match(w.document.getElementById(p.input.getAttribute('aria-activedescendant')).textContent, /AI provider/, 'wraps around');
});

test('Enter picks an item; free text runs as a command; a disabled item shows why and is not picked', () => {
  const w = page('<sheen-command-palette submit-label="Run “@q”"></sheen-command-palette>');
  const p = w.document.querySelector('sheen-command-palette');
  p.items = items;
  const picked = record(p, 'sheen-select'), submitted = record(p, 'sheen-submit');
  p.open('make');
  const rows = p.querySelectorAll('[role="option"]');
  assert.equal(rows[0].textContent, 'Run “make”');
  key(w, p.input, 'Enter');
  assert.deepEqual(submitted, [{ text: 'make' }]);
  key(w, p.input, 'ArrowDown');
  key(w, p.input, 'Enter');
  assert.equal(picked[0].item.id, 'p2');
  p.value = 'provider';
  key(w, p.input, 'ArrowDown');
  key(w, p.input, 'Enter');
  assert.equal(picked.length, 1, 'the disabled row is not picked');
  assert.match(p.textContent, /Needs an AI provider/);
});

test('the hotkey opens and closes it', () => {
  const w = page('<sheen-command-palette hotkey></sheen-command-palette>');
  const p = w.document.querySelector('sheen-command-palette');
  assert.equal(p.isOpen, false);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
  assert.equal(p.isOpen, true);
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  assert.equal(p.isOpen, false);
});
