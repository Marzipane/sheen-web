// <sheen-command-palette label="Command bar" placeholder="Type a command or search…" hotkey
//                        empty="Nothing found" submit-label="Run “@q”">
//   A ⌘K palette in a modal <dialog>: one text box over a grouped list. The list is a listbox the box controls
//   (aria-activedescendant), so ↑ ↓ Home End move, Enter picks, Esc closes; typing filters on label, hint and keywords.
//   palette.items = [{id, group, label, hint, keywords, glyph, disabled, reason}] (reason is shown when disabled).
//   palette.open(text?) / palette.close() / palette.value.
//   With submit-label, a first row runs what was typed as free text ("@q" is the text) and fires "sheen-submit"
//   {text}; picking an item fires "sheen-select" {item, text}. With hotkey, ⌘K / Ctrl+K opens it anywhere.
//   Put extra content (a plan preview, sample prompts) in palette.aside: it is shown under the list.
class SheenCommandPalette extends HTMLElement {
  connectedCallback() {
    if (this.dialog) return;
    var self = this, listId = uid('cmd-list');
    this._items = this._items || [];
    this.active = 0;
    this.input = h('input', { type: 'text', class: 'sheen-cmd-input', role: 'combobox', 'aria-expanded': 'true',
      'aria-controls': listId, 'aria-autocomplete': 'list', autocomplete: 'off', spellcheck: 'false',
      placeholder: this.getAttribute('placeholder') || '', 'aria-label': this.getAttribute('label') || '' });
    this.list = h('div', { class: 'sheen-cmd-list', role: 'listbox', id: listId, 'aria-label': this.getAttribute('label') || '' });
    this.aside = h('div', { class: 'sheen-cmd-aside' });
    this.dialog = h('dialog', { class: 'sheen-cmd sheen-glass', 'aria-label': this.getAttribute('label') || '' },
      h('div', { class: 'sheen-cmd-head' }, glyph('search', 22), this.input,
        h('kbd', { class: 'sheen-kbd', 'aria-hidden': 'true', text: 'esc' })),
      this.list, this.aside);
    this.replaceChildren(this.dialog);
    this.input.addEventListener('input', function () { self.active = 0; self.render(); });
    this.input.addEventListener('keydown', function (e) { self.onKey(e); });
    this.dialog.addEventListener('click', function (e) { if (e.target === self.dialog) self.close(); });
    this.dialog.addEventListener('close', function () { emit(self, 'sheen-close', {}); });
    this.onHotkey = function (e) {
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); self.dialog.open ? self.close() : self.open(); }
    };
    if (this.hasAttribute('hotkey')) document.addEventListener('keydown', this.onHotkey);
    this.render();
  }
  disconnectedCallback() { document.removeEventListener('keydown', this.onHotkey); }
  get items() { return this._items || []; }
  set items(v) { this._items = Array.isArray(v) ? v : []; if (this.list) this.render(); }
  get value() { return this.input ? this.input.value : ''; }
  set value(v) { if (this.input) { this.input.value = v; this.active = 0; this.render(); } }
  get isOpen() { return !!(this.dialog && this.dialog.open); }
  open(text) {
    if (text != null) this.value = text;
    if (!this.dialog.open) {
      if (typeof this.dialog.showModal === 'function') this.dialog.showModal(); else this.dialog.setAttribute('open', '');
    }
    this.input.focus();
    this.input.select();
    emit(this, 'sheen-open', {});
  }
  close() {
    if (typeof this.dialog.close === 'function' && this.dialog.open) this.dialog.close(); else this.dialog.removeAttribute('open');
  }
  matches() {
    var q = this.value.trim().toLowerCase();
    var words = q ? q.split(/\s+/) : [];
    return this.items.filter(function (it) {
      if (!words.length) return !it.hideUntilTyped;
      var hay = [it.label, it.hint, it.group, (it.keywords || []).join(' ')].join(' ').toLowerCase();
      return words.every(function (w) { return hay.indexOf(w) !== -1; });
    });
  }
  rows() {
    var rows = [], q = this.value.trim();
    if (q && this.getAttribute('submit-label')) rows.push({ free: true, label: fill(this.getAttribute('submit-label'), { q: q }), glyph: 'sparkle' });
    return rows.concat(this.matches().slice(0, 60));
  }
  render() {
    var self = this, rows = this.rows(), group = null;
    this._rows = rows;
    this.active = clamp(this.active, 0, Math.max(0, rows.length - 1));
    var nodes = [];
    rows.forEach(function (r, i) {
      if (!r.free && r.group && r.group !== group) {
        group = r.group;
        nodes.push(h('div', { class: 'sheen-cmd-group', role: 'presentation', text: r.group }));
      }
      var id = self.list.id + '-' + i;
      var row = h('div', { class: 'sheen-cmd-row' + (r.free ? ' sheen-cmd-free' : ''), role: 'option', id: id,
          'aria-selected': i === self.active ? 'true' : 'false', 'aria-disabled': r.disabled ? 'true' : null },
        r.glyph ? glyph(r.glyph, 20) : h('span', { class: 'sheen-cmd-dot', 'aria-hidden': 'true' }),
        h('span', { class: 'sheen-cmd-label' }, h('span', { text: r.label }),
          r.disabled && r.reason ? h('small', { class: 'sheen-tertiary', text: r.reason })
            : r.hint ? h('small', { class: 'sheen-secondary', text: r.hint }) : null),
        r.shortcut ? h('kbd', { class: 'sheen-kbd', text: r.shortcut }) : null);
      row.addEventListener('pointermove', function () { if (self.active !== i) { self.active = i; self.mark(); } });
      row.addEventListener('click', function () { self.active = i; self.pick(); });
      nodes.push(row);
    });
    if (!rows.length && this.getAttribute('empty')) nodes.push(h('div', { class: 'sheen-cmd-empty sheen-secondary', text: this.getAttribute('empty') }));
    this.list.replaceChildren.apply(this.list, nodes);
    this.mark();
  }
  mark() {
    var opts = this.list.querySelectorAll('[role="option"]'), self = this;
    opts.forEach(function (o, i) { o.setAttribute('aria-selected', i === self.active ? 'true' : 'false'); });
    var cur = opts[this.active];
    if (cur) { this.input.setAttribute('aria-activedescendant', cur.id); if (cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' }); }
    else this.input.removeAttribute('aria-activedescendant');
  }
  onKey(e) {
    var n = (this._rows || []).length;
    if (e.key === 'ArrowDown') { e.preventDefault(); this.active = n ? (this.active + 1) % n : 0; this.mark(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.active = n ? (this.active - 1 + n) % n : 0; this.mark(); }
    else if (e.key === 'Home' && e.ctrlKey) { e.preventDefault(); this.active = 0; this.mark(); }
    else if (e.key === 'End' && e.ctrlKey) { e.preventDefault(); this.active = Math.max(0, n - 1); this.mark(); }
    else if (e.key === 'Enter') { e.preventDefault(); this.pick(); }
  }
  pick() {
    var r = (this._rows || [])[this.active];
    if (!r || r.disabled) return;
    if (r.free) emit(this, 'sheen-submit', { text: this.value.trim() });
    else emit(this, 'sheen-select', { item: r, text: this.value.trim() });
  }
}
define('sheen-command-palette', SheenCommandPalette);
