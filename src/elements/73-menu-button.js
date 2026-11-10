// <sheen-menu-button label="Export"></sheen-menu-button>
// <sheen-menu-button label="More actions" glyph="more"></sheen-menu-button>
//   A button with a menu. class="sheen-small" on the element makes its button the small size. With glyph, the button shows only that sheen glyph and label becomes its accessible name.
//   menu.items = [{id, label, disabled, hint, shortcut, danger}], plus {separator: true} and {heading: 'Words'} between them.
//   hint is a second line (why an item is off, who can do it); shortcut shows at the end. Up and Down move and skip
//   disabled items, separators and headings, Enter picks, Esc
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
    this.button = h('button', { type: 'button', class: this.hasAttribute('glyph') ? 'sheen-icon-button' : 'sheen-button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': menuId, onclick: function () { if (self.menu.hidden) self.open(); else self.close(); } });
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
    this.onOutside = function (e) { if (!self.contains(e.target)) self.hide(); };
    // A menu on the screen would stay put while the page moves under it, so it follows its button on any scroll but its own,
    // and closes once the button has left the box that scrolled (or the screen).
    this.onScroll = function (e) {
      var t = e.target;
      if (t && t.nodeType === 1 && self.menu.contains(t)) return;
      if (self.outside(t && t.nodeType === 1 && t.contains(self) ? t.getBoundingClientRect() : { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight })) return self.hide();
      self.replace();
    };
    this.onResize = function () { self.replace(); };
    this.draw();
  }
  disconnectedCallback() { if (this.menu) this.hide(); }
  static get observedAttributes() { return ['label', 'glyph']; }
  attributeChangedCallback(name, was, now) {
    if (!this.menu) return;
    this.button.className = this.hasAttribute('glyph') ? 'sheen-icon-button' : 'sheen-button';
    if (!this.hasAttribute('glyph')) this.button.removeAttribute('aria-label');
    this.name(this.getAttribute('label') || '');
  }
  // The visible text, or for a glyph button the glyph and an accessible name.
  name(label) {
    var g = this.getAttribute('glyph');
    if (g) { this.button.replaceChildren(glyph(g, 20)); this.button.setAttribute('aria-label', label); }
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
      var row = h('button', { type: 'button', role: 'menuitem', tabindex: '-1', class: 'sheen-menu-item' + (item.danger ? ' sheen-danger' : ''), 'aria-disabled': item.disabled ? 'true' : null, 'aria-keyshortcuts': item.shortcut || null, 'data-id': item.id, onclick: function () { if (!item.disabled) self.pick(item); } });
      // A plain item is its label alone; a hint (why it is off, who can) goes under it, a shortcut at the end.
      if (item.hint || item.shortcut) {
        var words = h('span', { class: 'sheen-menu-words' }, h('span', { text: item.label }));
        if (item.hint) words.appendChild(h('small', { class: 'sheen-menu-hint', text: item.hint }));
        row.appendChild(words);
        if (item.shortcut) row.appendChild(h('kbd', { class: 'sheen-kbd', text: item.shortcut }));
      } else row.textContent = item.label;
      self.menu.appendChild(row);
    });
  }
  open() {
    this.menu.hidden = false;
    if (typeof this.menu.showPopover === 'function') { this.menu.setAttribute('popover', 'manual'); this.menu.showPopover(); }
    this.button.setAttribute('aria-expanded', 'true');
    this.replace();
    document.addEventListener('pointerdown', this.onOutside, true);
    window.addEventListener('scroll', this.onScroll, true);
    window.addEventListener('resize', this.onResize);
    // The first item that is safe to land on: never a danger one, so Enter right after opening can't delete.
    var first = this.rows().filter(function (row) { return !row.classList.contains('sheen-danger'); })[0];
    (first || this.menu).focus();
  }
  replace() {
    this.menu.classList.remove('sheen-menu-flip', 'sheen-menu-up');
    this.place();
  }
  // Whether the button has wholly left this box.
  outside(box) {
    var b = this.button.getBoundingClientRect();
    return b.bottom <= box.top || b.top >= box.bottom || b.right <= box.left || b.left >= box.right;
  }
  // The menu is placed from the screen (the top layer, or fixed), under the button at its start edge, measured where
  // nothing narrows it. It lines up with the button's end edge when it would leave the screen, and opens upward when it
  // doesn't fit below and there is more room above.
  place() {
    var at = placeUnder(this.menu, this.button.getBoundingClientRect(), isRtl(this));
    this.menu.classList.toggle('sheen-menu-flip', at.flip);
    this.menu.classList.toggle('sheen-menu-up', at.up);
  }
  // Closes and leaves focus where it is: for a press outside or focus that has moved on.
  hide() {
    // A removed menu has already left the top layer, and hiding it again would throw.
    if (this.menu.hasAttribute('popover') && this.menu.isConnected && !this.menu.hidden) this.menu.hidePopover();
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', this.onOutside, true);
    window.removeEventListener('scroll', this.onScroll, true);
    window.removeEventListener('resize', this.onResize);
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
