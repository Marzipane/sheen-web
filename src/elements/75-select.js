// <sheen-select placeholder="All areas"><select name="area">…options and optgroups…</select></sheen-select> (0.8.0)
//   A select whose list the page draws with its own tokens (light, dark, Arabic) instead of the browser's. The native
//   select inside stays the form control: name, multiple, required, disabled (its own or a fieldset's), form, form reset
//   and FormData work as before, and a framework binds it as it binds any select (Angular's formControlName, (change)).
//   Without the script it shows as it is.
//   Without an inner select it makes one from its own name, multiple and required attributes, and
//   el.options = [{value, label, disabled, hint, meta, group}] writes its options (inside <optgroup label> for group).
//   placeholder shows while nothing is chosen; label names it when no <label> names the select; data-hint on an option is
//   a second line under its label, and data-meta (0.9.1) a short text at the row's end edge, as a Filters panel option's
//   count; variant="control" is the find-row look of a Filters panel.
//   el.select is the native select; el.value and el.values (every chosen value) read and set it; open(), close(), sync().
//   A choice the person makes fires input then change on the native select, as a native select does. Nothing fires when
//   the page sets the value itself, by property or attribute: the element just redraws.
//   Keys, as a select-only combobox: Down, Up, Enter, Space and Alt+Down open; Home and End open on the first and last
//   option; a letter opens on the next option that starts with the letters typed (type-ahead). While open: Down, Up,
//   Home, End, PageDown and PageUp move; Enter or Space picks (a multiple list toggles and stays open); Esc closes and is
//   marked handled; Tab closes and moves on; Alt+Up picks and closes. Focus stays on the trigger, never in the list.
//   76-select-more.js adds the search box, the clear button and the chips through the hooks setupMore, drawChosen,
//   drawClear, onOpen, onClose and keyMore; the element works without them.

// The prototypes this file put under one element each, to tell them from the browser's.
var selectWraps = new WeakSet();

// The browser's own accessor of a property, past the wrapper this file put under an element.
function selectAccessor(el, name) {
  for (var p = Object.getPrototypeOf(el); p; p = Object.getPrototypeOf(p)) {
    if (selectWraps.has(p)) continue;
    var d = Object.getOwnPropertyDescriptor(p, name);
    if (d) return d;
  }
  return null;
}

// Sets a property through the browser's own accessor, so no redraw runs for it.
function selectRaw(el, name, v) { selectAccessor(el, name).set.call(el, v); }

// Wraps properties of this one element: reads and writes go to the browser's accessors, and a write then calls after().
// A framework that sets select.value or option.selected is seen this way; nothing else tells. The wrappers sit on a
// prototype of the element's own, put between it and the browser's, so no other element changes. (Own properties would
// do in a browser, but jsdom refuses a write through an accessor that a select holds itself, and apps test in jsdom.)
function selectFollow(el, names, after) {
  var base = Object.getPrototypeOf(el);
  if (selectWraps.has(base)) return;
  var wrap = Object.create(base);
  names.forEach(function (name) {
    var d = selectAccessor(el, name);
    if (!d || !d.set) return;
    Object.defineProperty(wrap, name, { configurable: true, enumerable: d.enumerable,
      get: function () { return d.get.call(this); },
      set: function (v) { d.set.call(this, v); after(); } });
  });
  selectWraps.add(wrap);
  Object.setPrototypeOf(el, wrap);
}

// Sets an attribute, or removes it for null.
function selectPut(el, name, v) {
  if (v == null) el.removeAttribute(name);
  else el.setAttribute(name, v);
}

// The words type-ahead compares: no case, no accents or other marks (É to e, مَ to م).
function selectFold(s) { return String(s).normalize('NFD').replace(/\p{M}+/gu, '').toLocaleLowerCase(); }

class SheenSelect extends HTMLElement {
  static get observedAttributes() { return ['placeholder', 'label', 'name', 'multiple', 'required']; }

  connectedCallback() {
    if (this.trigger) { this.watch(); this.sync(); return; }
    var self = this;
    // A property a framework set before this element was defined sits on the instance and hides the accessor: set it again.
    ['options', 'values', 'value'].forEach(function (p) {
      if (!Object.prototype.hasOwnProperty.call(self, p)) return;
      var v = self[p];
      delete self[p];
      self[p] = v;
    });
    if (this.querySelector('select')) this.build();
    // Angular appends the children of an element that is already in the page, so the select may come right after:
    // wait one microtask before making one.
    else Promise.resolve().then(function () { if (self.isConnected && !self.trigger) self.build(); });
  }

  disconnectedCallback() {
    if (!this.trigger) return;
    this.hide();
    this.unwatch();
  }

  attributeChangedCallback(name) {
    if (!this.trigger) return;
    // A select this element made follows its name, multiple and required; the page's own select keeps its own.
    if (this.made && name === 'name') selectPut(this.native, 'name', this.getAttribute('name'));
    else if (this.made && (name === 'multiple' || name === 'required')) this.native.toggleAttribute(name, this.hasAttribute(name));
    this.sync();
  }

  // The frame around the native select: the trigger (role=combobox), the chevron and the popup with the listbox.
  build() {
    var native = this.querySelector('select');
    if (!native) {
      native = h('select', { name: this.getAttribute('name'), multiple: this.hasAttribute('multiple'), required: this.hasAttribute('required') });
      this.made = true;
      this.prepend(native);
    }
    this.native = native;
    native.classList.add('sheen-select-native');
    native.setAttribute('tabindex', '-1');
    native.setAttribute('aria-hidden', 'true');
    var listId = uid('sheen-select-list');
    this.trigger = h('button', { type: 'button', class: 'sheen-select-trigger', role: 'combobox', 'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-controls': listId });
    var chevron = glyph('chevron-down', 18);
    chevron.classList.add('sheen-select-chevron');
    this.list = h('div', { class: 'sheen-select-list', role: 'listbox', id: listId, tabindex: '-1' });
    this.pop = h('div', { class: 'sheen-select-pop sheen-menu sheen-glass', id: uid('sheen-select-pop') }, this.list);
    this.pop.hidden = true;
    this.append(this.trigger, chevron, this.pop);
    this.items = [];
    this.listen();
    // What the page set before the build: the options first, then the value.
    if (this._options) this.writeOptions();
    if (this._values) this.choose(this._values);
    else if (this._value != null) selectRaw(native, 'value', this._value);
    var self = this;
    selectFollow(native, ['value', 'selectedIndex'], function () { self.redraw(); });
    this.drawList();
    this.name();
    // The hooks of 76-select-more.js run on the whole frame, the field last.
    if (this.setupMore) this.setupMore();
    this.redraw();
    this.watch();
  }

  listen() {
    var self = this;
    this.trigger.addEventListener('keydown', function (e) { if (!(self.keyMore && self.keyMore(e))) self.onKey(e); });
    // A button clicks on the keyup of Space; the keydown already acted.
    this.trigger.addEventListener('keyup', function (e) { if (e.key === ' ') e.preventDefault(); });
    this.addEventListener('click', function (e) { self.press(e); });
    // A press in the popup keeps focus where it is (the trigger or the search box): focus never moves into the list.
    this.pop.addEventListener('mousedown', function (e) { if (!e.target.closest('.sheen-select-input')) e.preventDefault(); });
    // The mouse moves the active option; a move without the pointer moving (the list scrolled under it) does not.
    this.list.addEventListener('mousemove', function (e) {
      if (e.clientX === self.mouseX && e.clientY === self.mouseY) return;
      self.mouseX = e.clientX;
      self.mouseY = e.clientY;
      var item = self.itemOf(e.target.closest('.sheen-select-option'));
      if (item && !item.disabled && item !== self.active) self.mark(item);
    });
    // A <label> or a form check puts focus on the native select: it belongs on the trigger.
    this.native.addEventListener('focus', function () { self.trigger.focus(); });
    // Focus leaving the whole field closes the list, and the native select hears blur and focusout as if it had held the
    // focus, so a form marks it touched (Angular's select accessor listens for blur). The focusout it fires bubbles back
    // here and is let through.
    this.addEventListener('focusout', function (e) {
      if (e.target === self.native) return;
      if (e.relatedTarget && self.contains(e.relatedTarget)) return;
      if (self.isOpen() && e.relatedTarget) self.hide();
      self.native.dispatchEvent(new FocusEvent('blur'));
      self.native.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    });
    this.onReset = function (e) {
      // The browser resets the options after the reset event: redraw once it has.
      if (e.target === self.native.form) setTimeout(function () { self.redraw(); }, 0);
    };
  }

  // Watches the native select: options and groups added, removed or renamed, its own attributes, and the fieldsets around
  // it (disabled). Undone while the element is out of the page.
  watch() {
    var self = this;
    if (!this.watcher && window.MutationObserver) this.watcher = new MutationObserver(function (records) { self.changed(records); });
    if (this.watcher) {
      this.watcher.observe(this.native, { childList: true, subtree: true, characterData: true, attributes: true });
      for (var f = this.native.parentElement; f; f = f.parentElement) {
        if (f.tagName === 'FIELDSET') this.watcher.observe(f, { attributes: true, attributeFilter: ['disabled'] });
      }
    }
    document.addEventListener('reset', this.onReset, true);
  }

  unwatch() {
    if (this.watcher) this.watcher.disconnect();
    document.removeEventListener('reset', this.onReset, true);
  }

  // A change inside the select (an option or a group) builds the list again; one on the select itself (disabled,
  // required, aria-invalid, a framework's classes) or a fieldset only redraws, so an open, searched list stays as it is.
  changed(records) {
    var native = this.native;
    var deep = records.some(function (r) { return r.type !== 'attributes' || (r.target !== native && native.contains(r.target)); });
    if (deep) this.sync();
    else this.redraw();
  }

  // Draws everything again from the native select: the list, the names, the field and the states.
  sync() {
    if (!this.trigger) return;
    this.drawList();
    this.name();
    this.redraw();
  }

  // The rows: one role=option per option (a hidden option has none, as in a native list), and one role=group with its
  // heading per optgroup, in document order. this.items lists them; the active option stays active when it is still there.
  drawList() {
    var self = this, was = this.active && this.active.option, rows = [];
    this.items = [];
    this.active = null;
    Array.prototype.forEach.call(this.native.children, function (c) {
      if (c.tagName === 'OPTION') rows.push(self.row(c, null, null));
      else if (c.tagName === 'OPTGROUP') rows.push(self.group(c));
    });
    this.list.replaceChildren.apply(this.list, rows.filter(Boolean));
    var again = this.items.filter(function (i) { return i.option === was; })[0];
    if (this.isOpen()) this.mark(again && !again.disabled ? again : null);
  }

  group(optgroup) {
    var id = uid('sheen-select-heading');
    var box = h('div', { class: 'sheen-select-group', role: 'group', 'aria-labelledby': id },
      h('div', { class: 'sheen-menu-heading sheen-select-heading', id: id, role: 'presentation', text: optgroup.label }));
    for (var o = optgroup.firstElementChild; o; o = o.nextElementSibling) {
      if (o.tagName !== 'OPTION') continue;
      var row = this.row(o, optgroup, box);
      if (row) box.appendChild(row);
    }
    return box;
  }

  row(option, optgroup, box) {
    var self = this;
    selectFollow(option, ['selected'], function () { self.redraw(); });
    if (option.hidden) return null;
    var label = option.label, hint = option.getAttribute('data-hint') || '', meta = option.getAttribute('data-meta') || '';
    var disabled = option.disabled || !!(optgroup && optgroup.disabled);
    var row = h('div', { class: 'sheen-select-option', role: 'option', id: uid('sheen-select-option'), 'aria-selected': 'false', 'aria-disabled': disabled ? 'true' : null },
      h('span', { class: 'sheen-select-check', 'aria-hidden': 'true' }),
      h('span', { class: 'sheen-select-words' }, h('span', { class: 'sheen-select-label', text: label }), hint ? h('small', { class: 'sheen-select-hint', text: hint }) : null),
      meta ? h('small', { class: 'sheen-select-meta', text: meta }) : null);
    this.items.push({ option: option, row: row, value: option.value, label: label, hint: hint, disabled: disabled, group: box });
    return row;
  }

  // aria-labelledby lists the native select's <label>s, by labelIds() (00-core.js): a <label> around the field by its
  // parts outside the field. Without one, the label attribute is the aria-label. The trigger and the listbox carry the
  // same name.
  name() {
    var ids = labelIds(this.native.labels, this).join(' ');
    var label = ids ? null : this.getAttribute('label');
    [this.trigger, this.list].forEach(function (el) {
      selectPut(el, 'aria-labelledby', ids || null);
      selectPut(el, 'aria-label', label);
    });
  }

  // The field, the rows' aria-selected and the states, from the native select as it is now. A select that became disabled
  // closes.
  redraw() {
    if (!this.trigger) return;
    var n = this.native, off = n.matches(':disabled');
    this.toggleAttribute('data-multiple', n.multiple);
    this.toggleAttribute('data-disabled', off);
    this.trigger.disabled = off;
    selectPut(this.trigger, 'aria-required', n.required ? 'true' : null);
    selectPut(this.trigger, 'aria-invalid', n.getAttribute('aria-invalid') === 'true' ? 'true' : null);
    selectPut(this.list, 'aria-multiselectable', n.multiple ? 'true' : null);
    this.items.forEach(function (i) { i.row.setAttribute('aria-selected', i.option.selected ? 'true' : 'false'); });
    this.drawField();
    if (off) this.hide();
  }

  // The trigger's content: the chosen label (a multiple list joins them, or "more" draws chips), else the placeholder.
  // data-chosen marks a choice the clear button can take away: in a multiple list any chosen option, in a single list a
  // chosen option with a value (the "" option, "All areas", is no choice).
  drawField() {
    var n = this.native, picked = this.picked(), t = this.trigger;
    this.toggleAttribute('data-chosen', n.multiple ? picked.length > 0 : !!(picked[0] && picked[0].value !== ''));
    var text = picked.map(function (o) { return o.label; }).filter(Boolean).join(', ');
    t.replaceChildren();
    if (n.multiple && picked.length && this.drawChosen) this.drawChosen(t);
    else if (text) t.appendChild(h('span', { class: 'sheen-select-value', text: text }));
    else t.appendChild(h('span', { class: 'sheen-select-placeholder', text: this.getAttribute('placeholder') || '' }));
    if (this.drawClear) this.drawClear();
  }

  picked() { return Array.prototype.filter.call(this.native.options, function (o) { return o.selected; }); }

  // Writes this._options into the native select: an option per entry, inside one <optgroup label> per group name, in the
  // order the groups first appear. The values chosen before stay chosen where they are still offered.
  writeOptions() {
    var n = this.native, keep = this.picked().map(function (o) { return o.value; }), groups = Object.create(null), nodes = [];
    this._options.forEach(function (o) {
      var option = h('option', { value: o.value == null ? '' : String(o.value), disabled: !!o.disabled, 'data-hint': o.hint || null,
        'data-meta': o.meta == null || o.meta === '' ? null : String(o.meta), text: o.label == null ? '' : String(o.label) });
      if (o.group == null || o.group === '') { nodes.push(option); return; }
      if (!groups[o.group]) nodes.push(groups[o.group] = h('optgroup', { label: String(o.group) }));
      groups[o.group].appendChild(option);
    });
    n.replaceChildren.apply(n, nodes);
    var offered = Array.prototype.map.call(n.options, function (o) { return o.value; });
    keep = keep.filter(function (v) { return offered.indexOf(v) >= 0; });
    if (keep.length) this.choose(keep);
  }

  // Chooses exactly these values, through the browser's own accessors (the caller redraws once).
  choose(values) {
    var n = this.native, want = values.map(String);
    if (n.multiple) {
      Array.prototype.forEach.call(n.options, function (o) { selectRaw(o, 'selected', want.indexOf(o.value) >= 0); });
      return;
    }
    var hit = Array.prototype.filter.call(n.options, function (o) { return want.indexOf(o.value) >= 0; })[0];
    selectRaw(n, 'selectedIndex', hit ? hit.index : -1);
  }

  get select() { return this.native || null; }
  get value() { return this.native ? this.native.value : (this._value != null ? String(this._value) : ''); }
  set value(v) {
    if (this.native) { this.native.value = v; return; }
    this._value = v;
    this._values = null;
  }
  get values() {
    if (this.native) return this.picked().map(function (o) { return o.value; });
    return this._values ? this._values.slice() : [];
  }
  set values(list) {
    var want = Array.isArray(list) ? list.map(String) : [];
    if (!this.native) { this._values = want; this._value = null; return; }
    this.choose(want);
    this.redraw();
  }
  set options(list) {
    this._options = Array.isArray(list) ? list : [];
    if (!this.trigger) return;
    this.writeOptions();
    // Drawn at once, so the page can set the value right after; the observer's records of this write are dropped.
    if (this.watcher) this.watcher.takeRecords();
    this.sync();
  }

  itemOf(row) { return row ? this.items.filter(function (i) { return i.row === row; })[0] || null : null; }

  // The options the arrows reach: enabled, and not hidden by the search of "more" (the row or its group).
  visibleItems() {
    return this.items.filter(function (i) { return !i.disabled && !i.row.hidden && !(i.group && i.group.hidden); });
  }

  // The active option: the one the arrows or the mouse reached, marked sheen-active and named by aria-activedescendant on
  // what has focus: the search box of "more" while the list is open, else the trigger.
  mark(item) {
    var input = this.pop.querySelector('.sheen-select-input');
    if (this.active) this.active.row.classList.remove('sheen-active');
    this.active = item || null;
    this.trigger.removeAttribute('aria-activedescendant');
    if (input) input.removeAttribute('aria-activedescendant');
    if (!item) return;
    item.row.classList.add('sheen-active');
    (input && this.isOpen() ? input : this.trigger).setAttribute('aria-activedescendant', item.row.id);
  }

  activate(item) {
    this.mark(item);
    if (item && item.row.scrollIntoView) item.row.scrollIntoView({ block: 'nearest' });
  }

  isOpen() { return !!this.shown; }

  // Opens as a popup (00-core.js) under the field, at least as wide as the field, on the chosen option (the first chosen
  // one in a multiple list), else on the first enabled one.
  open() {
    if (!this.trigger || this.isOpen() || this.native.matches(':disabled')) return;
    var self = this;
    this.pop.style.setProperty('--sheen-select-anchor-size', this.getBoundingClientRect().width + 'px');
    this.setAttribute('data-open', '');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.shown = popup(this.pop, this, this, function () { self.hide(); });
    if (document.activeElement !== this.trigger) this.trigger.focus();
    var reach = this.visibleItems();
    this.activate(reach.filter(function (i) { return i.option.selected; })[0] || reach[0] || null);
    if (this.onOpen) this.onOpen();
  }

  // Closes and leaves focus where it is: for a press outside, Tab, or focus that moved on.
  hide() {
    if (!this.shown) return;
    this.shown.stop();
    this.shown = null;
    this.removeAttribute('data-open');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.mark(null);
    this.typed = '';
    if (this.onClose) this.onClose();
  }

  // Closes and gives focus back to the trigger: for Esc, a pick or the trigger itself.
  close() {
    this.hide();
    if (this.trigger) this.trigger.focus();
  }

  // A press on the field box (the trigger, the chevron, the padding) opens or closes; a press on a row picks it. Either is
  // marked handled, so a <label> around the field does nothing more. The clear button and a chip's remove mark are
  // "more"'s, and a click a <label> sends to the native select is left alone.
  press(e) {
    var t = e.target;
    if (t === this.native) return;
    if (this.pop.contains(t)) {
      e.preventDefault();
      var item = this.itemOf(t.closest('.sheen-select-option'));
      if (item) this.pick(item);
      return;
    }
    if (t.closest('.sheen-select-clear, .sheen-select-chip-remove')) return;
    e.preventDefault();
    if (this.isOpen()) this.close();
    else this.open();
  }

  // Picks an option as a person does. A single list closes (focus back on the trigger), then fires input and change
  // unless the option was already chosen; closing first lets a change handler move focus on. A multiple list toggles the
  // option and stays open. A disabled option does nothing.
  pick(item) {
    if (!item || item.disabled) return;
    var o = item.option;
    if (this.native.multiple) {
      selectRaw(o, 'selected', !o.selected);
      this.commit();
      return;
    }
    var same = o.selected;
    if (!same) selectRaw(o, 'selected', true);
    this.close();
    if (!same) this.commit();
  }

  // After a person changed the native options: input then change on the native select, as a native select fires them,
  // then the field and the rows.
  commit() {
    this.native.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    this.native.dispatchEvent(new Event('change', { bubbles: true }));
    this.redraw();
  }

  move(by) {
    var reach = this.visibleItems(), at = reach.indexOf(this.active);
    if (!reach.length) return;
    this.activate(reach[at < 0 ? (by > 0 ? 0 : reach.length - 1) : clamp(at + by, 0, reach.length - 1)]);
  }

  // Whether letters typed in the last 500 ms are still being added up.
  typing() { return !!this.typed && Date.now() - this.typedAt < 500; }

  // Type-ahead: the letters typed less than 500 ms apart move to the next option whose label starts with them, case- and
  // accent-blind, from the active one on; one letter typed again and again steps through the options that start with it.
  typeAhead(ch) {
    var now = Date.now();
    this.typed = (this.typing() ? this.typed : '') + selectFold(ch);
    this.typedAt = now;
    var typed = this.typed, reach = this.visibleItems(), at = reach.indexOf(this.active);
    var one = Array.from(typed).every(function (c) { return c === typed[0]; });
    var find = one ? typed[0] : typed, start = one ? at + 1 : Math.max(at, 0);
    for (var i = 0; i < reach.length; i++) {
      var item = reach[(start + i) % reach.length];
      if (selectFold(item.label).indexOf(find) === 0) { this.activate(item); return; }
    }
  }

  // The keys, from the trigger and (through "more") from the search box, where Home and End move the caret, Space types a
  // space and letters search.
  onKey(e) {
    if (e.defaultPrevented || e.isComposing || !this.trigger) return;
    var k = e.key, inInput = e.target !== this.trigger;
    var letter = /^.$/u.test(k) && !e.ctrlKey && !e.metaKey && !e.altKey;
    if (!this.isOpen()) {
      if (inInput) return;
      if (k === 'ArrowDown' || k === 'ArrowUp' || k === 'Enter' || k === ' ') { e.preventDefault(); this.open(); }
      else if (k === 'Home' || k === 'End') { e.preventDefault(); this.open(); this.ends(k); }
      else if (letter) {
        this.open();
        // With a search box ("more") focus is in it now, and the letter, not held, lands there and searches.
        if (document.activeElement === this.pop.querySelector('.sheen-select-input')) return;
        e.preventDefault();
        this.typeAhead(k);
      }
      return;
    }
    if (k === 'ArrowDown' || (k === 'ArrowUp' && !e.altKey)) { e.preventDefault(); this.move(k === 'ArrowDown' ? 1 : -1); }
    else if (k === 'ArrowUp') {
      e.preventDefault();
      if (this.native.multiple || !this.active) this.close();
      else this.pick(this.active);
    }
    else if ((k === 'Home' || k === 'End') && !inInput) { e.preventDefault(); this.ends(k); }
    else if (k === 'PageDown' || k === 'PageUp') { e.preventDefault(); this.move(k === 'PageDown' ? 10 : -10); }
    else if (k === 'Enter' || (k === ' ' && !inInput && !this.typing())) { e.preventDefault(); if (this.active) this.pick(this.active); }
    else if (k === 'Escape') { e.preventDefault(); this.close(); }
    else if (k === 'Tab') this.hide();
    // A space while letters are being typed is part of them ("Al B").
    else if (letter && !inInput) { e.preventDefault(); this.typeAhead(k); }
  }

  // Home or End: the first or the last option the arrows reach.
  ends(k) {
    var reach = this.visibleItems();
    this.activate(k === 'Home' ? reach[0] : reach[reach.length - 1]);
  }
}
define('sheen-select', SheenSelect);
