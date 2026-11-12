// <sheen-date-field placeholder="Pick a date" prev="Previous month" next="Next month">
//   <input type="date" name="due" min="2026-01-01">
// </sheen-date-field>
// <sheen-date-range placeholder="Any dates" prev="…" next="…" from="From" to="To" [apply="Apply" cancel="Cancel" note="…"]>
//   <input type="date" name="from"><input type="date" name="to">
// </sheen-date-range>
//   The kit's own date field (0.8.0) around the page's native date input(s), which stay the form value: name, min, max,
//   required, disabled (its own or a fieldset's), form reset and FormData are the native input's, and a framework binds the
//   input as it binds any date input. Values are ISO yyyy-mm-dd. The element draws a button that shows the date, formatted
//   by Intl.DateTimeFormat for the nearest lang (month and weekday names and digits are the locale's), and a calendar popup.
//   Words come from attributes only: placeholder, label (the name when no <label> names the input), prev, next, clear (a
//   footer button that empties the value), and for a range from and to (the two ends under the calendar), apply and cancel
//   (picks wait for Apply), note (a line in the footer) and custom (the preset row checked when no preset matches).
//   first-day (1 Monday … 7 Sunday) overrides the locale's first day of the week; weekdays="Mo Tu We Th Fr Sa Su" (from
//   Monday) overrides Intl's narrow weekday names; today="yyyy-mm-dd" sets the day marked as today (a market's own time).
//   variant="control" draws the find-row control (a calendar glyph, the value, a chevron); compact keeps only the glyph in a
//   narrow list kit. A range takes presets = [{label, start, end}], shown beside the calendar.
//   In the grid: arrows move by day and week (mirrored in Arabic), PageUp and PageDown by month (with Shift by year), Home
//   and End to the week's ends, Enter or Space picks, Esc closes (marked handled: one Esc closes one layer), Tab stays in
//   the popup. A range's second pick before its first swaps them. A pick sets the native input(s) and fires input then
//   change on each one that changed, bubbling, as the browser's own field does; nothing fires when the page sets a value.
var NATIVE_PROPS = ['value', 'valueAsDate', 'valueAsNumber'];
var NATIVE_VALUE = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
var DAY_MS = 864e5;
var A_MONDAY = '2024-01-01';

function isoTime(s) {
  var m = /^(\d{4,})-(\d{2})-(\d{2})$/.exec(s || '');
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}
function isoOf(t) {
  var d = new Date(t);
  return String(d.getUTCFullYear()).padStart(4, '0') + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
}
function isoDate(s) { return isoTime(s) == null ? '' : s; }
function addDays(iso, n) { return isoOf(isoTime(iso) + n * DAY_MS); }
function monthDays(y, m) { return new Date(Date.UTC(y, m + 1, 0)).getUTCDate(); }
// The same day n months on, or the month's last day when it is shorter (31 Jan + 1 → 28 Feb).
function addMonths(iso, n) {
  var d = new Date(isoTime(iso)), y = d.getUTCFullYear(), m = d.getUTCMonth() + n;
  var ty = y + Math.floor(m / 12), tm = ((m % 12) + 12) % 12;
  return isoOf(Date.UTC(ty, tm, Math.min(d.getUTCDate(), monthDays(ty, tm))));
}
function monthOf(iso) { return iso.slice(0, 8) + '01'; }
function lastOfMonth(iso) { var d = new Date(isoTime(iso)); return isoOf(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), monthDays(d.getUTCFullYear(), d.getUTCMonth()))); }
function isoWeekday(iso) { return new Date(isoTime(iso)).getUTCDay() || 7; }
function fire(input, type) { input.dispatchEvent(new Event(type, { bubbles: true })); }
function mark(el, off) { if (off) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled'); }

class SheenDateBase extends HTMLElement {
  static get observedAttributes() { return ['placeholder', 'label', 'prev', 'next', 'clear', 'apply', 'cancel', 'note', 'from', 'to', 'custom', 'first-day', 'weekdays', 'today', 'variant', 'compact', 'lang']; }
  connectedCallback() {
    if (this.trigger) return;
    var self = this;
    if (!this.found()) {
      // A framework may connect the element before it appends the input(s): wrap them once they arrive.
      if (!this.waiting) {
        this.waiting = new MutationObserver(function () { if (self.found()) { self.waiting.disconnect(); self.waiting = null; self.build(); } });
        this.waiting.observe(this, { childList: true, subtree: true });
      }
      return;
    }
    this.build();
  }
  disconnectedCallback() { if (this.shown) this.hide(); }
  attributeChangedCallback() { if (this.trigger) this.refresh(); }
  // The page's native date inputs, in order: one for a field, two for a range.
  found() {
    var list = Array.prototype.filter.call(this.querySelectorAll('input'), function (i) { return !i.closest('.sheen-date-pop'); });
    return list.length >= this.ends ? list.slice(0, this.ends) : null;
  }
  build() {
    var self = this;
    this.inputs = this.found();
    this._presets = this._presets || [];
    this.text = h('span', { class: 'sheen-date-text', id: uid('date-value') });
    this.trigger = h('button', { type: 'button', id: uid('date-trigger'), 'aria-haspopup': 'dialog', 'aria-expanded': 'false' });
    // tabindex -1: a press on the popup's padding keeps focus inside it.
    this.pop = h('div', { class: 'sheen-date-pop sheen-menu sheen-glass', role: 'dialog', id: uid('date-pop'), tabindex: '-1' });
    this.pop.hidden = true;
    this.trigger.setAttribute('aria-controls', this.pop.id);
    this.appendChild(this.trigger);
    this.appendChild(this.pop);
    this.inputs.forEach(function (input) { self.wrap(input); });
    // A press on a <label> of the inputs would focus the hidden input first (and blur it at once): the button takes it.
    this.inputs.forEach(function (input) {
      Array.prototype.forEach.call(input.labels || [], function (label) {
        label.addEventListener('click', function (e) {
          if (self.contains(e.target)) return;
          e.preventDefault();
          if (!self.trigger.disabled) self.trigger.focus();
        });
      });
    });
    var fieldset = this.closest('fieldset');
    this.watcher = new MutationObserver(function () { self.sync(); });
    this.inputs.forEach(function (input) { self.watcher.observe(input, { attributes: true, attributeFilter: ['disabled', 'readonly', 'required', 'min', 'max', 'aria-invalid', 'value'] }); });
    if (fieldset) this.watcher.observe(fieldset, { attributes: true, attributeFilter: ['disabled'] });
    this.trigger.addEventListener('click', function () { if (self.shown) self.close(); else self.open(); });
    this.trigger.addEventListener('keydown', function (e) {
      if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !self.shown) { e.preventDefault(); self.open(); }
    });
    this.pop.addEventListener('click', function (e) { self.press(e); });
    this.pop.addEventListener('keydown', function (e) { self.key(e); });
    this.pop.addEventListener('pointerover', function (e) {
      var cell = e.target.closest && e.target.closest('.sheen-cal-day');
      if (self.picking === 1 && cell && self.hover !== cell.dataset.date) { self.hover = cell.dataset.date; self.paint(); }
    });
    this.pop.addEventListener('pointerleave', function () { if (self.hover) { self.hover = null; self.paint(); } });
    // Focus leaving the whole field closes it and blurs the native input(s), so a form marks them touched.
    this.addEventListener('focusin', function () { self.inside = true; });
    this.addEventListener('focusout', function () {
      if (self.building) return;
      window.setTimeout(function () {
        var now = document.activeElement;
        if (self.contains(now)) return;
        if (self.shown && now && now !== document.body) self.hide();
        if (self.inside) {
          self.inside = false;
          self.inputs.forEach(function (input) { input.dispatchEvent(new FocusEvent('blur')); input.dispatchEvent(new FocusEvent('focusout', { bubbles: true })); });
        }
      }, 0);
    });
    this.refresh();
  }
  // The native input stays in the form, hidden; setting its value by property (a framework) redraws the field.
  wrap(input) {
    var self = this;
    input.classList.add('sheen-date-native');
    input.setAttribute('tabindex', '-1');
    input.setAttribute('aria-hidden', 'true');
    NATIVE_PROPS.forEach(function (p) {
      var desc = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, p);
      if (!desc || !desc.set) return;
      Object.defineProperty(input, p, { configurable: true, enumerable: true,
        get: function () { return desc.get.call(this); },
        set: function (v) { desc.set.call(this, v); self.sync(); } });
    });
    // A press on a label lands on the native input: the field's button takes the focus.
    input.addEventListener('focus', function () { if (!self.trigger.disabled) self.trigger.focus(); });
    if (input.form) input.form.addEventListener('reset', function () { window.setTimeout(function () { self.sync(); }, 0); });
  }
  get presets() { return this._presets || []; }
  set presets(v) {
    this._presets = Array.isArray(v) ? v.filter(function (p) { return p && isoDate(p.start) && isoDate(p.end); }) : [];
    this.toggleAttribute('data-presets', this.ends === 2 && this._presets.length > 0);
    if (this.trigger) this.refresh();
  }
  // The native values as they are now: [start] or [start, end].
  values() { return (this.inputs || []).map(function (i) { return isoDate(NATIVE_VALUE.get.call(i)); }); }
  word(name) { return this.getAttribute(name); }
  locale() {
    var holder = this.closest('[lang]'), lang = holder ? holder.getAttribute('lang') : '';
    try { new Intl.DateTimeFormat(lang || undefined); return lang || undefined; } catch (e) { return undefined; }
  }
  format(opts) { return new Intl.DateTimeFormat(this.locale(), Object.assign({ timeZone: 'UTC' }, opts)); }
  firstDay() {
    var n = parseInt(this.getAttribute('first-day'), 10);
    if (n >= 1 && n <= 7) return n;
    try {
      var loc = new Intl.Locale(this.locale() || new Intl.DateTimeFormat().resolvedOptions().locale);
      var info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
      if (info && info.firstDay) return info.firstDay;
    } catch (e) { /* no week data: ISO weeks */ }
    return 1;
  }
  today() {
    var set = isoDate(this.getAttribute('today'));
    if (set) return set;
    var n = new Date();
    return isoOf(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }
  // The days a pick may take: within every input's min and max.
  bounds() {
    var lo = '', hi = '';
    (this.inputs || []).forEach(function (i) {
      var a = isoDate(i.getAttribute('min')), b = isoDate(i.getAttribute('max'));
      if (a && (!lo || a > lo)) lo = a;
      if (b && (!hi || b < hi)) hi = b;
    });
    return { lo: lo, hi: hi };
  }
  allowed(iso) { var b = this.bounds(); return !(b.lo && iso < b.lo) && !(b.hi && iso > b.hi); }
  clampDay(iso) { var b = this.bounds(); return b.lo && iso < b.lo ? b.lo : b.hi && iso > b.hi ? b.hi : iso; }
  disabledNow() {
    return this.inputs.some(function (i) { return i.disabled || !!i.closest('fieldset[disabled]'); });
  }
  isOpen() { return !!this.shown; }

  refresh() {
    this.look();
    this.name();
    this.frame();
    if (this.shown) { this.drawMonth(); this.paint(); }
    this.sync();
  }
  // The trigger's look: the dense field, or the find-row control with a calendar glyph.
  look() {
    var control = this.getAttribute('variant') === 'control';
    this.trigger.className = (control ? 'sheen-control ' : '') + 'sheen-date-trigger';
    this.trigger.classList.toggle('sheen-compact-glyph', control && this.hasAttribute('compact'));
    var chev = glyph('chevron-down', control ? 15 : 18);
    chev.classList.add('sheen-date-chevron', 'sheen-control-chevron');
    var icon = control ? glyph('calendar', 15) : null;
    if (icon) icon.classList.add('sheen-date-icon');
    this.trigger.replaceChildren.apply(this.trigger, [icon, this.text, chev].filter(Boolean));
  }
  // Names: the <label>s of the (first) native input, by labelIds() (00-core.js): a <label> around the field by its parts
  // outside the field, so the open calendar never reads into the name; else the label attribute. The value is read
  // after the name, unless a label around the field with bare words names it whole and already holds the value.
  name() {
    var self = this, labels = Array.prototype.slice.call(this.inputs[0].labels || []);
    var t = this.trigger, label = this.word('label');
    t.removeAttribute('aria-label');
    this.pop.removeAttribute('aria-label');
    if (labels.length) {
      var ids = labelIds(labels, this);
      var whole = labels.some(function (l) { return l.contains(self) && ids.indexOf(l.id) >= 0; });
      t.setAttribute('aria-labelledby', ids.join(' ') + (whole ? '' : ' ' + this.text.id));
      this.pop.setAttribute('aria-labelledby', ids.join(' '));
    } else if (label) {
      t.setAttribute('aria-label', label);
      t.setAttribute('aria-labelledby', t.id + ' ' + this.text.id);
      this.pop.removeAttribute('aria-labelledby');
      this.pop.setAttribute('aria-label', label);
    } else {
      t.removeAttribute('aria-labelledby');
      this.pop.removeAttribute('aria-labelledby');
    }
  }
  // The popup's parts: presets (a range with presets), the calendar's head and grid, the two ends, the footer.
  frame() {
    var w = this.word.bind(this), body = h('div', { class: 'sheen-date-body' });
    this.presetBox = null;
    if (this.ends === 2 && this.presets.length) {
      this.presetBox = h('div', { class: 'sheen-date-presets', role: 'radiogroup' });
      var rows = this.presets.map(function (p, i) { return { label: p.label, at: i }; });
      if (w('custom')) rows.push({ label: w('custom'), at: -1 });
      var box = this.presetBox;
      rows.forEach(function (r) {
        box.appendChild(h('button', { type: 'button', role: 'radio', class: 'sheen-date-preset', 'aria-checked': 'false', tabindex: '-1', 'data-preset': String(r.at) },
          h('span', { class: 'sheen-date-tick', 'aria-hidden': 'true' }), h('span', { text: r.label })));
      });
      body.appendChild(box);
    }
    this.prevButton = h('button', { type: 'button', class: 'sheen-cal-prev', 'aria-label': w('prev') }, glyph('back', 16));
    this.nextButton = h('button', { type: 'button', class: 'sheen-cal-next', 'aria-label': w('next') }, glyph('chevron', 16));
    this.heading = h('b', { class: 'sheen-cal-title', id: uid('cal-title'), 'aria-live': 'polite' });
    this.grid = h('div', { class: 'sheen-cal-grid', role: 'grid', 'aria-labelledby': this.heading.id });
    var cal = h('div', { class: 'sheen-cal' }, h('div', { class: 'sheen-cal-head' }, this.prevButton, this.heading, this.nextButton), this.grid);
    this.endBox = null;
    if (this.ends === 2 && (w('from') || w('to'))) {
      this.endBox = h('div', { class: 'sheen-date-ends' },
        h('span', { class: 'sheen-date-end' }, h('small', { text: w('from') || '' }), h('b')),
        h('span', { class: 'sheen-date-end' }, h('small', { text: w('to') || '' }), h('b')));
      cal.appendChild(this.endBox);
    }
    body.appendChild(cal);
    var parts = [body];
    if (w('note') || w('clear') || w('apply')) {
      parts.push(h('div', { class: 'sheen-date-foot' },
        w('note') ? h('small', { class: 'sheen-date-note', text: w('note') }) : null,
        w('clear') ? h('button', { type: 'button', class: 'sheen-link-button sheen-date-clear', text: w('clear') }) : null,
        w('apply') && w('cancel') ? h('button', { type: 'button', class: 'sheen-link-button sheen-date-cancel', text: w('cancel') }) : null,
        w('apply') ? h('button', { type: 'button', class: 'sheen-button sheen-small sheen-glass-prominent sheen-date-apply', text: w('apply') }) : null));
    }
    this.building = true;
    this.pop.replaceChildren.apply(this.pop, parts);
    this.building = false;
    if (!this.pop.hasAttribute('aria-label') && !this.pop.hasAttribute('aria-labelledby')) this.pop.setAttribute('aria-labelledby', this.heading.id);
  }

  // Redraws the field and an open calendar from the native inputs; marks disabled, required and invalid from them.
  sync() {
    if (!this.trigger) return;
    var vals = this.values(), off = this.disabledNow();
    this.trigger.disabled = off;
    this.toggleAttribute('data-disabled', off);
    var readonly = this.inputs.some(function (i) { return i.readOnly; });
    this.toggleAttribute('data-readonly', readonly);
    if (this.inputs.some(function (i) { return i.required; })) this.trigger.setAttribute('aria-required', 'true');
    else this.trigger.removeAttribute('aria-required');
    if (this.inputs.some(function (i) { return i.getAttribute('aria-invalid') === 'true'; })) this.trigger.setAttribute('aria-invalid', 'true');
    else this.trigger.removeAttribute('aria-invalid');
    this.drawField(vals);
    if (this.shown) {
      if (off) { this.hide(); return; }
      this.pending = vals;
      this.picking = 0;
      this.paint();
    }
  }
  // The field's words: the date, a preset's label, the range, or the placeholder.
  drawField(vals) {
    var shown = this.fieldText(vals), chosen = vals.some(Boolean);
    this.text.textContent = shown != null ? shown : this.word('placeholder') || '';
    this.text.classList.toggle('sheen-date-placeholder', shown == null);
    this.toggleAttribute('data-chosen', chosen);
  }
  fieldText(vals) {
    var f = this.format({ day: 'numeric', month: 'short', year: 'numeric' }), s = vals[0], e = vals[1];
    if (this.ends === 2) {
      var preset = this.matching(vals);
      if (preset) return preset.label;
      if (s && e) return typeof f.formatRange === 'function' ? f.formatRange(new Date(isoTime(s)), new Date(isoTime(e))) : f.format(new Date(isoTime(s))) + ' – ' + f.format(new Date(isoTime(e)));
      if (e) return f.format(new Date(isoTime(e)));
    }
    return s ? f.format(new Date(isoTime(s))) : null;
  }
  matching(vals) {
    if (!vals[0] || !vals[1]) return null;
    return this.presets.filter(function (p) { return p.start === vals[0] && p.end === vals[1]; })[0] || null;
  }

  open() {
    if (this.shown || this.trigger.disabled || this.hasAttribute('data-readonly')) return;
    var self = this;
    this.pending = this.values();
    this.picking = 0;
    this.hover = null;
    this.focusDay = this.clampDay(this.pending[0] || this.pending[1] || this.today());
    this.month = monthOf(this.focusDay);
    this.setAttribute('data-open', '');
    this.trigger.setAttribute('aria-expanded', 'true');
    this.pop.style.setProperty('--sheen-date-anchor-size', (this.trigger.getBoundingClientRect().width || 0) + 'px');
    this.frame();
    this.drawMonth();
    this.paint();
    this.shown = popup(this.pop, this.trigger, this, function () { self.hide(); });
    this.focusOn(this.focusDay);
  }
  // Closes and leaves focus where it is (a press outside, focus that moved on); picks not yet applied are dropped.
  hide() {
    if (this.shown) { this.shown.stop(); this.shown = null; }
    this.pop.hidden = true;
    this.pending = null;
    this.removeAttribute('data-open');
    this.trigger.setAttribute('aria-expanded', 'false');
  }
  // Closes and gives focus back to the field's button: Esc, a pick, Apply, Cancel, the button itself.
  close() { this.hide(); this.trigger.focus(); }

  // The month's grid: a row of weekday names, then its weeks, the days before the 1st left empty.
  drawMonth() {
    var first = this.month, start = this.firstDay();
    var full = this.format({ dateStyle: 'full' }), num = this.format({ day: 'numeric' });
    var narrow = this.format({ weekday: 'narrow' }), long = this.format({ weekday: 'long' });
    var names = (this.word('weekdays') || '').trim().split(/\s*,\s*|\s+/);
    if (names.length !== 7) names = null;
    this.heading.textContent = this.format({ month: 'long', year: 'numeric' }).format(new Date(isoTime(first)));
    var rows = [], head = h('div', { class: 'sheen-cal-row sheen-cal-weekdays', role: 'row' });
    for (var i = 0; i < 7; i++) {
      var wd = ((start - 1 + i) % 7) + 1, ref = new Date(isoTime(addDays(A_MONDAY, wd - 1)));
      head.appendChild(h('small', { role: 'columnheader', 'aria-label': long.format(ref), text: names ? names[wd - 1] : narrow.format(ref) }));
    }
    rows.push(head);
    var lead = (isoWeekday(first) - start + 7) % 7, count = monthDays(+first.slice(0, 4), +first.slice(5, 7) - 1);
    var cells = [];
    for (var b = 0; b < lead; b++) cells.push(h('span', { role: 'gridcell', class: 'sheen-cal-blank' }));
    for (var d = 0; d < count; d++) {
      var iso = addDays(first, d), at = new Date(isoTime(iso));
      cells.push(h('button', { type: 'button', role: 'gridcell', class: 'sheen-cal-day', tabindex: '-1', 'data-date': iso, 'aria-label': full.format(at) }, num.format(at)));
    }
    while (cells.length % 7) cells.push(h('span', { role: 'gridcell', class: 'sheen-cal-blank' }));
    for (var r = 0; r < cells.length; r += 7) rows.push(h.apply(null, ['div', { class: 'sheen-cal-row', role: 'row' }].concat(cells.slice(r, r + 7))));
    this.building = true;
    this.grid.replaceChildren.apply(this.grid, rows);
    this.building = false;
    // A month button whose month lies wholly outside min or max is off (aria-disabled: it keeps focus if it has it).
    var bounds = this.bounds();
    mark(this.prevButton, !!(bounds.lo && bounds.lo >= first));
    mark(this.nextButton, !!(bounds.hi && bounds.hi <= lastOfMonth(first)));
    if (this.shown) this.shown.place();
  }
  // The days' states: selected (the date, or every day of the range), the range's ends, a range being drawn, today,
  // out of min and max; the presets' check; the ends under the calendar.
  paint() {
    if (!this.pending) return;
    var p = this.pending, s = p[0] || '', e = this.ends === 2 ? p[1] || '' : '', today = this.today(), self = this;
    var lo = s, hi = e || s;
    var preview = this.ends === 2 && this.picking === 1 && s ? (this.hover || this.focusDay) : '';
    var pa = preview && preview < s ? preview : s, pb = preview && preview > s ? preview : s;
    Array.prototype.forEach.call(this.grid.querySelectorAll('.sheen-cal-day'), function (cell) {
      var iso = cell.dataset.date;
      var selected = !!s && iso >= lo && iso <= hi;
      cell.setAttribute('aria-selected', selected ? 'true' : 'false');
      cell.classList.toggle('sheen-cal-end', !!iso && (iso === s || iso === e));
      cell.classList.toggle('sheen-cal-in', !!preview && !selected && iso >= pa && iso <= pb);
      if (iso === today) cell.setAttribute('aria-current', 'date'); else cell.removeAttribute('aria-current');
      mark(cell, !self.allowed(iso));
      cell.setAttribute('tabindex', iso === self.focusDay ? '0' : '-1');
    });
    if (this.presetBox) {
      var match = this.matching(p), rows = Array.prototype.slice.call(this.presetBox.children), any = p.some(Boolean);
      rows.forEach(function (row) {
        var at = +row.dataset.preset;
        var on = at >= 0 ? !!match && self.presets[at] === match : any && !match;
        row.setAttribute('aria-checked', on ? 'true' : 'false');
      });
      var stop = rows.filter(function (row) { return row.getAttribute('aria-checked') === 'true'; })[0] || rows[0];
      rows.forEach(function (row) { row.setAttribute('tabindex', row === stop ? '0' : '-1'); });
    }
    if (this.endBox) {
      var f = this.format({ day: 'numeric', month: 'short', year: 'numeric' });
      Array.prototype.forEach.call(this.endBox.querySelectorAll('b'), function (b, i) { b.textContent = p[i] ? f.format(new Date(isoTime(p[i]))) : ''; });
    }
  }
  // Moves the grid's focus to a day (kept within min and max), turning the month when it lies in another.
  focusOn(iso) {
    iso = this.clampDay(iso);
    this.focusDay = iso;
    if (monthOf(iso) !== this.month) { this.month = monthOf(iso); this.building = true; this.drawMonth(); }
    this.paint();
    var cell = this.grid.querySelector('.sheen-cal-day[data-date="' + iso + '"]');
    if (cell) cell.focus();
    this.building = false;
  }
  turn(by) {
    var btn = by < 0 ? this.prevButton : this.nextButton;
    if (btn.getAttribute('aria-disabled') === 'true') return;
    this.month = monthOf(addMonths(this.month, by));
    var day = this.clampDay(addMonths(this.focusDay, by));
    this.focusDay = monthOf(day) === this.month ? day : this.clampDay(this.month);
    this.drawMonth();
    this.paint();
  }
  pick(iso) {
    if (!this.allowed(iso)) return;
    if (this.ends === 1) this.pending = [iso];
    else if (this.picking !== 1) { this.pending = [iso, '']; this.picking = 1; }
    else {
      var s = this.pending[0];
      this.pending = iso < s ? [iso, s] : [s, iso];
      this.picking = 0;
    }
    this.focusDay = iso;
    this.hover = null;
    if (this.picking === 0 && !this.hasAttribute('apply')) { this.commit(this.pending); this.close(); return; }
    this.paint();
    // the picked day takes the grid's focus (a press doesn't move it everywhere)
    if (this.grid.contains(document.activeElement)) this.focusOn(iso);
  }
  // Writes the values into the native inputs and fires input then change on each one that changed.
  commit(vals) {
    var changed = [];
    this.inputs.forEach(function (input, i) {
      var v = vals[i] || '';
      if (NATIVE_VALUE.get.call(input) !== v) { NATIVE_VALUE.set.call(input, v); changed.push(input); }
    });
    changed.forEach(function (input) { fire(input, 'input'); fire(input, 'change'); });
    this.sync();
  }
  press(e) {
    // A press inside a <label> around the field would also reach the native input: the popup keeps it.
    e.preventDefault();
    var t = e.target, cell = t.closest('.sheen-cal-day');
    if (cell) { this.pick(cell.dataset.date); return; }
    if (t.closest('.sheen-cal-prev')) return this.turn(-1);
    if (t.closest('.sheen-cal-next')) return this.turn(1);
    var row = t.closest('.sheen-date-preset');
    if (row) {
      var at = +row.dataset.preset;
      if (at < 0) { this.picking = 0; this.focusOn(this.pending[0] || this.focusDay); return; }
      var p = this.presets[at];
      this.pending = [p.start, p.end];
      this.picking = 0;
      if (!this.hasAttribute('apply')) { this.commit(this.pending); this.close(); return; }
      this.focusDay = this.clampDay(p.start);
      this.month = monthOf(this.focusDay);
      this.drawMonth();
      this.paint();
      return;
    }
    if (t.closest('.sheen-date-clear')) { this.commit(this.inputs.map(function () { return ''; })); this.close(); return; }
    if (t.closest('.sheen-date-cancel')) { this.close(); return; }
    if (t.closest('.sheen-date-apply')) { this.commit(this.pending); this.close(); }
  }
  key(e) {
    if (e.key === 'Escape') {
      if (!e.defaultPrevented) { e.preventDefault(); this.close(); }
      return;
    }
    if (e.key === 'Tab') return this.trap(e);
    var t = e.target;
    if (t.classList && t.classList.contains('sheen-date-preset')) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        var rows = Array.prototype.slice.call(this.presetBox.children), at = rows.indexOf(t);
        rows[(at + (e.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length].focus();
      }
      return;
    }
    if (!t.classList || !t.classList.contains('sheen-cal-day')) return;
    var d = this.focusDay, rtl = isRtl(this), start = this.firstDay(), into = (isoWeekday(d) - start + 7) % 7, to = null;
    if (e.key === 'ArrowRight') to = addDays(d, rtl ? -1 : 1);
    else if (e.key === 'ArrowLeft') to = addDays(d, rtl ? 1 : -1);
    else if (e.key === 'ArrowDown') to = addDays(d, 7);
    else if (e.key === 'ArrowUp') to = addDays(d, -7);
    else if (e.key === 'PageDown') to = addMonths(d, e.shiftKey ? 12 : 1);
    else if (e.key === 'PageUp') to = addMonths(d, e.shiftKey ? -12 : -1);
    else if (e.key === 'Home') to = addDays(d, -into);
    else if (e.key === 'End') to = addDays(d, 6 - into);
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.pick(d); return; }
    if (to) { e.preventDefault(); this.focusOn(to); }
  }
  // Tab and Shift+Tab go round the popup's stops: it is a dialog, and Esc is the way out.
  trap(e) {
    var stops = Array.prototype.filter.call(this.pop.querySelectorAll('button'), function (b) { return b.getAttribute('tabindex') !== '-1' && !b.disabled; });
    if (!stops.length) return;
    var first = stops[0], last = stops[stops.length - 1], now = document.activeElement;
    if (e.shiftKey && (now === first || now === this.pop)) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && now === last) { e.preventDefault(); first.focus(); }
  }
}

class SheenDateField extends SheenDateBase {
  get ends() { return 1; }
  get input() { return this.inputs ? this.inputs[0] : this.querySelector('input'); }
  get value() { return this.input ? isoDate(NATIVE_VALUE.get.call(this.input)) : ''; }
  set value(v) { if (this.input) { NATIVE_VALUE.set.call(this.input, v || ''); this.sync(); } }
}
class SheenDateRange extends SheenDateBase {
  get ends() { return 2; }
  get value() { var v = this.values(); return { start: v[0] || '', end: v[1] || '' }; }
  set value(v) {
    if (!this.inputs) return;
    NATIVE_VALUE.set.call(this.inputs[0], (v && v.start) || '');
    NATIVE_VALUE.set.call(this.inputs[1], (v && v.end) || '');
    this.sync();
  }
}
define('sheen-date-field', SheenDateField);
define('sheen-date-range', SheenDateRange);
