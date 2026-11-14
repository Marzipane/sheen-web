// <sheen-scope-picker label="Zones" all-label="All" chosen-label="Only these" except-label="All except"
//                     search-label="Search" empty-label="Nothing found" remove-label="Remove @label"
//                     loading-label="Searching…" error-label="Couldn't search" result="Applies to 43 of 46 zones"
//                     hint="New items stay out until added">
//   Chooses a rule, not a list. picker.groups = [{id, label, items: [{id, label}], total}].
//   picker.value = {mode: 'all'|'only'|'all_except', include: [ids], exclude: [ids]}. A whole group is stored as the
//   group's id, so something added to that group later joins the rule. The page works out the result line and its hint
//   and sets them. A value carries only the list its mode reads (none for all); the picks of the other modes are kept
//   inside, so switching back restores them. Fires "sheen-scope-change" with the value.
//   0.10.0, the look of the mockups: the modes are a segmented bar (still one radio group: arrows move, Tab enters once),
//   a chip per pick under the search (a press removes it; remove-label, "@label" filled, names it), each group row ends
//   in its count ("1 / 3"), and the foot holds the result in bold over the hint. select-shown-label adds the "Select all
//   shown" button of 0.4.0; without it the button stays hidden.
//   Lists that grow: a group's total is how many members it has in all, so a group the page loaded only in part still
//   counts "1 / 12" and picking every row it shows never turns into the whole group. Typing fires sheen-scope-query
//   {query, signal, respond} once the person stops for delay ms (250 by default; the first ask goes at once). A handler
//   that calls respond(groups), or respond with a promise of them, takes the search over: the picker shows the groups it
//   is given and no longer filters its own. A newer ask aborts the signal and drops the older answer. While an answer is
//   out the list is aria-busy and loading-label shows; a promise that rejects shows error-label, and Enter asks again.
//   Without a handler the picker filters groups itself, as before. An empty search shows groups again without asking.
//   The picker counts and names only what it was given (groups and every answer), so the page gives it each picked item
//   in its group; a group picked whole whose members it doesn't all know keeps its rows ticked and locked.
class SheenScopePicker extends HTMLElement {
  connectedCallback() {
    // Back on the page (moved by a framework): leaving it aborted the ask that was out, so its loading line goes.
    if (this.list) { this.draw(); return; }
    var self = this, name = uid('scope');
    this._groups = this._groups || [];
    this._value = this._value || { mode: 'all', include: [], exclude: [] };
    this.known = this.known || {};
    this.learn(this._groups);
    this.query = '';
    this.asked = '';
    this.answer = null;
    this.seq = 0;
    this.radios = [['all', 'all-label'], ['only', 'chosen-label'], ['all_except', 'except-label']].map(function (m) {
      return h('label', { class: 'sheen-scope-mode' }, h('input', { type: 'radio', name: name, value: m[0], onchange: function () { self.setMode(m[0]); } }), h('span', { text: self.getAttribute(m[1]) || '' }));
    });
    this.search = h('input', { type: 'search', class: 'sheen-scope-search', autocomplete: 'off', 'aria-label': this.getAttribute('search-label') || '', placeholder: this.getAttribute('search-label') || '',
      oninput: function (e) { self.typed(e.target.value); },
      onkeydown: function (e) { if (e.key === 'Enter' && self.failed) { e.preventDefault(); self.ask(); } } });
    this.shown = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-scope-shown', text: this.getAttribute('select-shown-label') || '', onclick: function () { self.selectShown(); } });
    this.shown.hidden = !this.getAttribute('select-shown-label');
    this.tools = h('div', { class: 'sheen-scope-tools' }, this.search, this.shown);
    this.chips = h('div', { class: 'sheen-scope-chips' });
    this.note = h('p', { class: 'sheen-scope-note', 'aria-live': 'polite' });
    this.list = h('div', { class: 'sheen-scope-list' });
    this.body = h('div', { class: 'sheen-scope-body' }, this.tools, this.chips, this.note, this.list);
    this.result = h('b', { class: 'sheen-scope-result', text: this.getAttribute('result') || '' });
    this.hint = h('small', { class: 'sheen-scope-hint', text: this.getAttribute('hint') || '' });
    this.status = h('p', { class: 'sheen-scope-foot', role: 'status' }, this.result, this.hint);
    var bar = h('div', { class: 'sheen-scope-segments' }, this.radios[0], this.radios[1], this.radios[2]);
    this.replaceChildren(h('fieldset', { class: 'sheen-scope-modes' }, h('legend', { text: this.getAttribute('label') || '' }), bar), this.body, this.status);
    this.draw();
  }
  disconnectedCallback() { this.halt(); this.busy = false; }
  static get observedAttributes() { return ['result', 'hint', 'label', 'all-label', 'chosen-label', 'except-label', 'search-label', 'select-shown-label', 'empty-label', 'remove-label', 'loading-label', 'error-label']; }
  attributeChangedCallback(name, was, now) {
    if (!this.status) return;
    var text = now || '';
    if (name === 'result') { this.result.textContent = text; this.drawFoot(); }
    else if (name === 'hint') { this.hint.textContent = text; this.drawFoot(); }
    else if (name === 'label') this.querySelector('legend').textContent = text;
    else if (name === 'search-label') { this.search.setAttribute('aria-label', text); this.search.placeholder = text; }
    else if (name === 'select-shown-label') { this.shown.textContent = text; this.shown.hidden = !text; }
    else if (name === 'empty-label' || name === 'remove-label' || name === 'loading-label' || name === 'error-label') this.draw();
    else this.radios[['all-label', 'chosen-label', 'except-label'].indexOf(name)].lastChild.textContent = text;
  }
  get groups() { return this._groups || []; }
  // New groups add to what the picker knows: a framework sets them again with every value, and a member an earlier answer
  // brought must keep its name and its place in its group's count.
  set groups(v) { this._groups = Array.isArray(v) ? v : []; this.known = this.known || {}; this.learn(this._groups); if (this.list) this.draw(); }
  get value() { return this.rule(); }
  set value(v) { this._value = { mode: v.mode, include: (v.include || []).slice(), exclude: (v.exclude || []).slice() }; if (this.list) this.draw(); }
  // In "only" the picks live in include, in "all except" in exclude.
  get picks() { return this._value.mode === 'only' ? this._value.include : this._value.exclude; }
  set picks(v) { if (this._value.mode === 'only') this._value.include = v; else this._value.exclude = v; }
  // What the picker knows of each group, from groups and every answer: its label, its total and the members it has seen.
  learn(groups) {
    var known = this.known;
    (groups || []).forEach(function (g) {
      if (!g || g.id == null) return;
      var k = known[g.id] || (known[g.id] = { label: g.label, total: 0, members: {}, order: [] });
      k.label = g.label;
      (g.items || []).forEach(function (i) { if (!(i.id in k.members)) k.order.push(i.id); k.members[i.id] = i.label; });
      if (g.total != null) k.total = g.total;
    });
  }
  members(group) { var k = this.known[group.id]; return k ? k.order : group.items.map(function (i) { return i.id; }); }
  // The page's total when it gave one, else the members the picker has seen.
  total(group) {
    var k = this.known[group.id];
    if (group.total != null) return group.total;
    return k && k.total ? k.total : this.members(group).length;
  }
  whole(group) { return this.picks.indexOf(group.id) >= 0; }
  picked(group, item) { return this.whole(group) || (item != null && this.picks.indexOf(item.id) >= 0); }
  // How many of the group's members the rule picks.
  count(group) {
    if (this.whole(group)) return this.total(group);
    var picks = this.picks;
    return this.members(group).filter(function (id) { return picks.indexOf(id) >= 0; }).length;
  }
  // A group picked whole can be split into its other members only when the picker knows every one of them.
  locked(group) { return this.whole(group) && this.members(group).length < this.total(group); }
  label(id) {
    var known = this.known, found = null;
    if (known[id]) return known[id].label;
    Object.keys(known).some(function (g) { if (id in known[g].members) { found = known[g].members[id]; return true; } return false; });
    return found != null ? found : String(id);
  }
  setMode(mode) {
    this._value.mode = mode;
    this.draw();
    this.changed();
  }
  rule() {
    var v = this._value;
    return { mode: v.mode, include: v.mode === 'only' ? v.include.slice() : [], exclude: v.mode === 'all_except' ? v.exclude.slice() : [] };
  }
  changed() { emit(this, 'sheen-scope-change', this.rule()); }
  // The groups on screen: the page's answer to the search, or groups filtered here.
  current() { return this.answer || this.groups; }
  visible(group) {
    if (this.answer) return group.items || [];
    var q = this.query;
    if (!q || group.label.toLowerCase().indexOf(q) >= 0) return group.items;
    return group.items.filter(function (i) { return i.label.toLowerCase().indexOf(q) >= 0; });
  }
  setGroup(group, on) {
    var inGroup = this.members(group).concat(group.id);
    var rest = this.picks.filter(function (p) { return inGroup.indexOf(p) < 0; });
    this.picks = on ? rest.concat(group.id) : rest;
  }
  setItem(group, item, on) {
    if (this.locked(group)) return;
    var picks = this.picks, whole = this.whole(group);
    var ids = this.members(group).filter(function (id) { return whole || picks.indexOf(id) >= 0; });
    ids = on ? (ids.indexOf(item.id) < 0 ? ids.concat(item.id) : ids) : ids.filter(function (id) { return id !== item.id; });
    // Every member picked turns into the group, but only when the picker knows them all: a group loaded in part keeps
    // its rows by name.
    if (ids.length === this.total(group) && this.members(group).length >= this.total(group)) { this.setGroup(group, true); return; }
    this.setGroup(group, false);
    this.picks = this.picks.concat(ids);
  }
  selectShown() {
    this.current().forEach(function (group) {
      var shown = this.visible(group);
      if (!shown.length) return; // a group with nothing on screen is never picked unseen
      if (shown.length === this.total(group) && this.members(group).length >= this.total(group)) this.setGroup(group, true);
      else shown.forEach(function (i) { this.setItem(group, i, true); }, this);
    }, this);
    this.draw();
    this.changed();
  }
  // A chip's press: the pick goes, and drawing moves focus to the next chip (or the search box after the last one). The
  // chip takes focus first, as a press doesn't focus a button in every browser.
  unpick(id, chip) {
    chip.focus();
    this.picks = this.picks.filter(function (p) { return p !== id; });
    this.draw();
    this.changed();
  }
  // ---- the search the page answers
  typed(text) {
    this.query = text.trim().toLowerCase();
    this.asked = text.trim();
    this.halt();
    this.failed = false;
    if (!this.asked) { this.answer = null; this.busy = false; this.draw(); return; }
    if (!this.remote) { if (!this.ask()) this.draw(); return; }
    var self = this, delay = parseInt(this.getAttribute('delay'), 10);
    this.busy = true;
    this.draw();
    this.timer = setTimeout(function () { self.timer = null; self.ask(); }, isNaN(delay) ? 250 : Math.max(0, delay));
  }
  // Fires one ask; true when a handler answered it (at once or with a promise).
  ask() {
    var self = this, seq = ++this.seq, ctl = typeof AbortController === 'function' ? new AbortController() : null, said = false;
    this.drop();
    this.ctl = ctl;
    this.failed = false;
    this.dispatchEvent(new CustomEvent('sheen-scope-query', { bubbles: true, detail: { query: this.asked, signal: ctl && ctl.signal, respond: function (answer) { said = true; self.take(seq, ctl, answer); } } }));
    return said;
  }
  take(seq, ctl, answer) {
    var self = this;
    if (seq !== this.seq || (ctl && ctl.signal.aborted)) return;
    this.remote = true;
    if (answer && typeof answer.then === 'function') {
      this.busy = true;
      this.draw();
      answer.then(function (a) { self.take(seq, ctl, a); }, function () {
        if (seq !== self.seq || (ctl && ctl.signal.aborted)) return;
        self.busy = false;
        self.failed = true;
        self.draw();
      });
      return;
    }
    var groups = Array.isArray(answer) ? answer : [];
    this.busy = false;
    this.learn(groups);
    this.answer = this.asked ? groups : null;
    this.draw();
  }
  // Stops the wait before the next ask and the ask that is out.
  halt() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    this.drop();
  }
  // Aborts the ask that is out, so its answer never shows.
  drop() {
    if (this.ctl) { this.ctl.abort(); this.ctl = null; }
  }
  // ---- drawing
  box(group, id, label, checked, change, cls) {
    var input = h('input', { type: 'checkbox', value: id, 'data-group': group.id, onchange: change });
    input.checked = checked;
    return { input: input, row: h('label', { class: cls }, input, h('span', { text: label })) };
  }
  drawFoot() { this.status.hidden = !this.result.textContent && !this.hint.textContent; }
  drawChips() {
    var self = this, words = this.getAttribute('remove-label');
    this.chips.replaceChildren();
    this.picks.forEach(function (id) {
      var label = self.label(id);
      self.chips.appendChild(h('button', { type: 'button', class: 'sheen-scope-chip', 'data-value': id, 'aria-label': words ? fill(words, { label: label }) : null, title: words ? fill(words, { label: label }) : null, onclick: function (e) { self.unpick(id, e.currentTarget); } },
        h('span', { text: label }), glyph('close', 12)));
    });
    this.chips.hidden = !this.chips.children.length;
  }
  draw() {
    var self = this, mode = this._value.mode, choosing = mode !== 'all';
    var a = document.activeElement, focused = this.list.contains(a) ? { value: a.value, group: a.getAttribute('data-group') } : null;
    var chip = a && a.parentNode === this.chips ? { value: a.getAttribute('data-value'), index: Array.prototype.indexOf.call(this.chips.children, a) } : null;
    this.radios.forEach(function (r) { var i = r.querySelector('input'); i.checked = i.value === mode; });
    this.body.hidden = !choosing;
    this.list.replaceChildren();
    this.drawFoot();
    if (!choosing) { this.chips.replaceChildren(); this.note.hidden = true; return; }
    this.drawChips();
    // Drawing replaces the chips too (a framework sets value again after every change), so a focused chip keeps focus:
    // the same pick, else the chip now in its place, else the search box once none is left.
    if (chip) {
      var chips = this.chips.children;
      var same = Array.prototype.find.call(chips, function (c) { return c.getAttribute('data-value') === chip.value; });
      (same || chips[Math.min(chip.index, chips.length - 1)] || this.search).focus();
    }
    var waiting = this.busy && this.getAttribute('loading-label'), failed = this.failed && this.getAttribute('error-label');
    this.note.textContent = failed || waiting || '';
    this.note.hidden = !this.note.textContent;
    this.note.classList.toggle('sheen-danger', !!failed);
    if (this.busy) this.list.setAttribute('aria-busy', 'true'); else this.list.removeAttribute('aria-busy');
    this.current().forEach(function (group) {
      var shown = self.visible(group);
      if (!shown.length) return;
      var count = self.count(group), total = self.total(group), locked = self.locked(group);
      var head = self.box(group, group.id, group.label, total > 0 && count === total, function (e) { self.setGroup(group, e.target.checked); self.draw(); self.changed(); }, 'sheen-scope-group');
      head.input.indeterminate = count > 0 && count < total;
      head.row.appendChild(h('small', { class: 'sheen-scope-count', dir: 'ltr', text: count + ' / ' + total }));
      var items = h('div', { class: 'sheen-scope-items' });
      shown.forEach(function (item) {
        var row = self.box(group, item.id, item.label, self.picked(group, item), function (e) {
          var still = self.locked(group);
          if (!still) self.setItem(group, item, e.target.checked);
          self.draw();
          if (!still) self.changed();
        }, 'sheen-scope-item');
        row.input.disabled = locked;
        items.appendChild(row.row);
      });
      self.list.appendChild(h('div', { class: 'sheen-scope-group-box', role: 'group', 'aria-label': group.label }, head.row, items));
    });
    if (!this.list.children.length && !this.busy && !this.failed) this.list.appendChild(h('p', { class: 'sheen-scope-empty', role: 'status', text: this.getAttribute('empty-label') || '' }));
    // Drawing replaces every row, so the row a keyboard user just ticked gets its focus back: the same id in the same
    // group, since one id may sit in two groups.
    if (focused) {
      var back = Array.prototype.find.call(this.list.querySelectorAll('input'), function (input) { return input.value === focused.value && input.getAttribute('data-group') === focused.group; });
      if (back) back.focus();
    }
  }
}
define('sheen-scope-picker', SheenScopePicker);
