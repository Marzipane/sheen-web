// <sheen-scope-picker label="Zones" all-label="All" chosen-label="Only these" except-label="All except"
//                     search-label="Search" select-shown-label="Select all shown" empty-label="Nothing found"
//                     result="Applies to 43 of 46 zones">
//   Chooses a rule, not a list. picker.groups = [{id, label, items: [{id, label}]}].
//   picker.value = {mode: 'all'|'only'|'all_except', include: [ids], exclude: [ids]}. A whole group is stored as the
//   group's id, so something added to that group later joins the rule. The page works out the result line and sets it.
//   A value carries only the list its mode reads (none for all); the picks of the other modes are kept inside, so
//   switching back restores them. Fires "sheen-scope-change" with the value.
class SheenScopePicker extends HTMLElement {
  connectedCallback() {
    if (this.list) return;
    var self = this, name = uid('scope');
    this._groups = this._groups || [];
    this._value = this._value || { mode: 'all', include: [], exclude: [] };
    this.query = '';
    this.radios = [['all', 'all-label'], ['only', 'chosen-label'], ['all_except', 'except-label']].map(function (m) {
      return h('label', { class: 'sheen-scope-mode' }, h('input', { type: 'radio', name: name, value: m[0], onchange: function () { self.setMode(m[0]); } }), self.getAttribute(m[1]) || '');
    });
    this.search = h('input', { type: 'search', 'aria-label': this.getAttribute('search-label') || '', placeholder: this.getAttribute('search-label') || '', oninput: function (e) { self.query = e.target.value.trim().toLowerCase(); self.draw(); } });
    this.shown = h('button', { type: 'button', class: 'sheen-button sheen-small sheen-scope-shown', text: this.getAttribute('select-shown-label') || '', onclick: function () { self.selectShown(); } });
    this.tools = h('div', { class: 'sheen-row sheen-scope-tools' }, h('label', { class: 'sheen-field' }, this.search), this.shown);
    this.list = h('div', { class: 'sheen-scope-list' });
    this.status = h('p', { class: 'sheen-footnote sheen-secondary', role: 'status', text: this.getAttribute('result') || '' });
    this.replaceChildren(h('fieldset', { class: 'sheen-scope-modes' }, h('legend', { text: this.getAttribute('label') || '' }), this.radios[0], this.radios[1], this.radios[2]), this.tools, this.list, this.status);
    this.draw();
  }
  static get observedAttributes() { return ['result', 'label', 'all-label', 'chosen-label', 'except-label', 'search-label', 'select-shown-label', 'empty-label']; }
  attributeChangedCallback(name, was, now) {
    if (!this.status) return;
    var text = now || '';
    if (name === 'result') this.status.textContent = text;
    else if (name === 'label') this.querySelector('legend').textContent = text;
    else if (name === 'search-label') { this.search.setAttribute('aria-label', text); this.search.placeholder = text; }
    else if (name === 'select-shown-label') this.shown.textContent = text;
    else if (name === 'empty-label') this.draw();
    else this.radios[['all-label', 'chosen-label', 'except-label'].indexOf(name)].lastChild.textContent = text;
  }
  get groups() { return this._groups || []; }
  set groups(v) { this._groups = Array.isArray(v) ? v : []; if (this.list) this.draw(); }
  get value() { return this.rule(); }
  set value(v) { this._value = { mode: v.mode, include: (v.include || []).slice(), exclude: (v.exclude || []).slice() }; if (this.list) this.draw(); }
  // In "only" the picks live in include, in "all except" in exclude.
  get picks() { return this._value.mode === 'only' ? this._value.include : this._value.exclude; }
  set picks(v) { if (this._value.mode === 'only') this._value.include = v; else this._value.exclude = v; }
  picked(group, item) { return this.picks.indexOf(group.id) >= 0 || (item != null && this.picks.indexOf(item.id) >= 0); }
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
  visible(group) {
    var q = this.query;
    if (!q || group.label.toLowerCase().indexOf(q) >= 0) return group.items;
    return group.items.filter(function (i) { return i.label.toLowerCase().indexOf(q) >= 0; });
  }
  setGroup(group, on) {
    var inGroup = group.items.map(function (i) { return i.id; }).concat(group.id);
    var rest = this.picks.filter(function (p) { return inGroup.indexOf(p) < 0; });
    this.picks = on ? rest.concat(group.id) : rest;
  }
  setItem(group, item, on) {
    var ids = group.items.filter(function (i) { return this.picked(group, i); }, this).map(function (i) { return i.id; });
    ids = on ? ids.concat(item.id) : ids.filter(function (id) { return id !== item.id; });
    if (ids.length === group.items.length) { this.setGroup(group, true); return; }
    this.setGroup(group, false);
    this.picks = this.picks.concat(ids);
  }
  selectShown() {
    this.groups.forEach(function (group) {
      var shown = this.visible(group);
      if (!shown.length) return; // a group with nothing on screen is never picked unseen
      if (shown.length === group.items.length) this.setGroup(group, true);
      else shown.forEach(function (i) { this.setItem(group, i, true); }, this);
    }, this);
    this.draw();
    this.changed();
  }
  box(group, id, label, checked, change, cls) {
    var input = h('input', { type: 'checkbox', value: id, 'data-group': group.id, onchange: change });
    input.checked = checked;
    return { input: input, row: h('label', { class: cls }, input, label) };
  }
  draw() {
    var self = this, mode = this._value.mode, choosing = mode !== 'all';
    var a = document.activeElement, focused = this.list.contains(a) ? { value: a.value, group: a.getAttribute('data-group') } : null;
    this.radios.forEach(function (r) { var i = r.querySelector('input'); i.checked = i.value === mode; });
    this.tools.hidden = !choosing;
    this.list.hidden = !choosing;
    this.list.replaceChildren();
    if (!choosing) return;
    this.groups.forEach(function (group) {
      var shown = self.visible(group);
      if (!shown.length) return;
      var count = group.items.filter(function (i) { return self.picked(group, i); }).length;
      var head = self.box(group, group.id, group.label, count === group.items.length, function (e) { self.setGroup(group, e.target.checked); self.draw(); self.changed(); }, 'sheen-scope-group');
      head.input.indeterminate = count > 0 && count < group.items.length;
      var rows = shown.map(function (item) {
        return self.box(group, item.id, item.label, self.picked(group, item), function (e) { self.setItem(group, item, e.target.checked); self.draw(); self.changed(); }, 'sheen-scope-item').row;
      });
      var items = h('div', { class: 'sheen-scope-items' });
      rows.forEach(function (row) { items.appendChild(row); });
      self.list.appendChild(h('div', { role: 'group', 'aria-label': group.label }, head.row, items));
    });
    if (!this.list.children.length) this.list.appendChild(h('p', { class: 'sheen-footnote sheen-secondary sheen-scope-empty', role: 'status', text: this.getAttribute('empty-label') || '' }));
    // Drawing replaces every row, so the row a keyboard user just ticked gets its focus back: the same id in the same
    // group, since one id may sit in two groups.
    if (focused) {
      var back = Array.prototype.find.call(this.list.querySelectorAll('input'), function (input) { return input.value === focused.value && input.getAttribute('data-group') === focused.group; });
      if (back) back.focus();
    }
  }
}
define('sheen-scope-picker', SheenScopePicker);
