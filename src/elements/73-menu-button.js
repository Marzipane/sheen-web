// <sheen-menu-button label="Export"></sheen-menu-button>
// <sheen-menu-button label="More actions" glyph="more"></sheen-menu-button>
//   A button with a menu. class="sheen-small" on the element makes its button the small size. With glyph, the button shows only that sheen glyph and label becomes its accessible name.
//   variant="control" draws the button as a find-row control (36px, outlined; square with a glyph);
//   icon="star" puts a glyph before the label, chevron a chevron after it, compact keeps only the icon in a narrow list kit.
//   menu.items = [{id, label, disabled, hint, shortcut, danger, glyph, accent}], plus {separator: true} and {heading: 'Words'}
//   between them. hint is a second line (why an item is off, who can do it); shortcut shows at the end; glyph before the
//   label. Up and Down move and skip disabled items, separators and headings, Enter picks, Esc
//   closes; focus goes back to the button. A press outside or focus leaving closes it and leaves focus where it went.
//   It stays on screen and above everything around it: it opens in the top layer (popover), so no scrolling box, glass
//   (backdrop-filter) box or sticky cell can cut it off, shift it or paint over it; where the popover API is missing it is
//   placed fixed instead. It sits under its button, lines up with the button's other edge near the screen edge, opens
//   upward near the bottom, scrolls when long, follows its button on scroll and resize, and closes once its button
//   scrolls out of the box it sits in. A danger item never takes the first focus.
//   Fires "sheen-menu-select" {id}.
class SheenMenuButton extends HTMLElement {
  connectedCallback() {
    if (this.menu) return;
    var self = this, menuId = uid('menu');
    this._items = this._items || [];
    this.button = h('button', { type: 'button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': menuId, onclick: function () { if (self.menu.hidden) self.open(); else self.close(); } });
    this.look();
    // tabindex -1: a menu with nothing to pick takes focus itself, so its keys still work.
    this.menu = h('div', { role: 'menu', id: menuId, tabindex: '-1', class: 'sheen-menu sheen-glass', 'aria-label': this.getAttribute('label') || '' });
    this.menu.hidden = true;
    this.name(this.getAttribute('label') || '');
    this.replaceChildren(this.button, this.menu);
    this.button.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); self.open(); }
      else if (e.key === 'Escape' && !self.menu.hidden && !e.defaultPrevented) { e.preventDefault(); self.close(); }
    });
    // A handled Esc is marked, so a panel or card around the menu stays open: one Esc closes one layer.
    this.menu.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); self.move(e.key === 'ArrowDown' ? 1 : -1); }
      else if ((e.key === 'Enter' || e.key === ' ') && e.target !== self.menu) { e.preventDefault(); e.target.click(); }
      else if (e.key === 'Escape' && !e.defaultPrevented) { e.preventDefault(); self.close(); }
    });
    this.addEventListener('focusout', function (e) {
      if (!self.menu.hidden && e.relatedTarget && !self.contains(e.relatedTarget)) self.hide();
    });
    this.draw();
  }
  disconnectedCallback() { if (this.menu) this.hide(); }
  static get observedAttributes() { return ['label', 'glyph', 'variant', 'icon', 'chevron', 'compact', 'tone']; }
  attributeChangedCallback(name, was, now) {
    if (!this.menu) return;
    this.look();
    if (!this.hasAttribute('glyph')) this.button.removeAttribute('aria-label');
    this.name(this.getAttribute('label') || '');
  }
  // The button's class from variant: the tonal button (or the 0.5.1 icon button with a glyph), the control, and for a
  // picker in a table cell (0.8.0) the cell's words (text) or a status pill (pill) in its tone: tone="success", "warning"
  // or "danger"; any other tone keeps the plain pill.
  look() {
    var variant = this.getAttribute('variant'), tone = this.getAttribute('tone');
    var pill = 'sheen-pill' + (tone === 'success' || tone === 'warning' || tone === 'danger' ? ' sheen-' + tone : '');
    this.button.className = variant === 'control' ? 'sheen-control' : variant === 'text' ? 'sheen-cell-button' : variant === 'pill' ? pill : this.hasAttribute('glyph') ? 'sheen-icon-button' : 'sheen-button';
    this.button.classList.toggle('sheen-compact-glyph', this.hasAttribute('compact'));
  }
  // The visible text, or for a glyph button the glyph and an accessible name. An icon or a chevron puts the words in a span
  // and names the button by its label, so it keeps a name when compact hides the words.
  name(label) {
    var g = this.getAttribute('glyph'), icon = this.getAttribute('icon');
    if (g) { this.button.replaceChildren(glyph(g, 20)); this.button.setAttribute('aria-label', label); }
    else if (icon || this.hasAttribute('chevron')) {
      var chev = this.hasAttribute('chevron') ? glyph('chevron-down', 16) : null;
      if (chev) chev.classList.add('sheen-control-chevron');
      this.button.replaceChildren.apply(this.button, [icon ? glyph(icon, 16) : null, h('span', { text: label }), chev].filter(Boolean));
      this.button.setAttribute('aria-label', label);
    }
    else this.button.textContent = label;
    this.menu.setAttribute('aria-label', label);
  }
  get items() { return this._items || []; }
  set items(v) { this._items = Array.isArray(v) ? v : []; if (this.menu) this.draw(); }
  rows() { return Array.prototype.slice.call(this.menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')); }
  draw() {
    var self = this;
    this.menu.replaceChildren();
    this.items.forEach(function (item) {
      if (item.separator) { self.menu.appendChild(h('div', { role: 'separator', class: 'sheen-menu-separator' })); return; }
      if (item.heading) { self.menu.appendChild(h('div', { role: 'presentation', class: 'sheen-menu-heading', text: item.heading })); return; }
      var row = h('button', { type: 'button', role: 'menuitem', tabindex: '-1', class: 'sheen-menu-item' + (item.danger ? ' sheen-danger' : '') + (item.accent ? ' sheen-accent' : ''), 'aria-disabled': item.disabled ? 'true' : null, 'aria-keyshortcuts': item.shortcut || null, 'data-id': item.id, onclick: function () { if (!item.disabled) self.pick(item); } });
      // A plain item is its label alone; a glyph goes before it, a hint (why it is off, who can) under it, a shortcut at
      // the end.
      if (item.hint || item.shortcut || item.glyph) {
        if (item.glyph) row.appendChild(glyph(item.glyph, 16));
        var words = h('span', { class: 'sheen-menu-words' }, h('span', { text: item.label }));
        if (item.hint) words.appendChild(h('small', { class: 'sheen-menu-hint', text: item.hint }));
        row.appendChild(words);
        if (item.shortcut) row.appendChild(h('kbd', { class: 'sheen-kbd', text: item.shortcut }));
      } else row.textContent = item.label;
      self.menu.appendChild(row);
    });
  }
  // The menu opens as a popup (00-core.js): in the top layer under the button, following it on scroll and resize, closed by
  // a press outside or once the button scrolls out of its box.
  open() {
    var self = this;
    this.button.setAttribute('aria-expanded', 'true');
    if (!this.shown) this.shown = popup(this.menu, this.button, this, function () { self.hide(); });
    // The first item that is safe to land on: never a danger one, so Enter right after opening can't delete.
    var first = this.rows().filter(function (row) { return !row.classList.contains('sheen-danger'); })[0];
    (first || this.menu).focus();
  }
  // Closes and leaves focus where it is: for a press outside or focus that has moved on.
  hide() {
    if (this.shown) { this.shown.stop(); this.shown = null; }
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
  }
  // Closes and gives focus back to the button: for Esc, a pick or the button itself.
  close() {
    this.hide();
    this.button.focus();
  }
  move(by) {
    var rows = this.rows(), at = rows.indexOf(document.activeElement);
    if (rows.length) rows[(at + by + rows.length) % rows.length].focus();
  }
  pick(item) {
    this.close();
    emit(this, 'sheen-menu-select', { id: item.id });
  }
}
define('sheen-menu-button', SheenMenuButton);
