// <sheen-menu-button label="Export"></sheen-menu-button>
//   A button with a menu. menu.items = [{id, label, disabled}]. Up and Down move and skip disabled items, Enter picks, Esc
//   closes; focus goes back to the button. A press outside or focus leaving closes it and leaves focus where it went.
//   It stays on screen: it flips to the other inline edge, opens upward near the bottom, and scrolls when long.
//   Fires "sheen-menu-select" {id}.
class SheenMenuButton extends HTMLElement {
  connectedCallback() {
    if (this.menu) return;
    var self = this, menuId = uid('menu');
    this._items = this._items || [];
    this.button = h('button', { type: 'button', class: 'sheen-button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': menuId, text: this.getAttribute('label') || '', onclick: function () { if (self.menu.hidden) self.open(); else self.close(); } });
    // tabindex -1: a menu with nothing to pick takes focus itself, so its keys still work.
    this.menu = h('div', { role: 'menu', id: menuId, tabindex: '-1', class: 'sheen-menu sheen-glass', 'aria-label': this.getAttribute('label') || '' });
    this.menu.hidden = true;
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
    this.draw();
  }
  disconnectedCallback() { if (this.menu) this.hide(); }
  static get observedAttributes() { return ['label']; }
  attributeChangedCallback(name, was, now) {
    if (!this.menu) return;
    this.button.textContent = now || '';
    this.menu.setAttribute('aria-label', now || '');
  }
  get items() { return this._items || []; }
  set items(v) { this._items = Array.isArray(v) ? v : []; if (this.menu) this.draw(); }
  rows() { return Array.prototype.slice.call(this.menu.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])')); }
  draw() {
    var self = this;
    this.menu.replaceChildren();
    this.items.forEach(function (item) {
      self.menu.appendChild(h('button', { type: 'button', role: 'menuitem', tabindex: '-1', class: 'sheen-menu-item', 'aria-disabled': item.disabled ? 'true' : null, text: item.label, onclick: function () { if (!item.disabled) self.pick(item); } }));
    });
  }
  open() {
    this.menu.hidden = false;
    this.button.setAttribute('aria-expanded', 'true');
    this.menu.classList.remove('sheen-menu-flip', 'sheen-menu-up');
    var box = this.menu.getBoundingClientRect();
    if (box.left < 0 || box.right > window.innerWidth) this.menu.classList.add('sheen-menu-flip');
    if (box.bottom > window.innerHeight) this.menu.classList.add('sheen-menu-up');
    document.addEventListener('pointerdown', this.onOutside, true);
    var rows = this.rows();
    (rows.length ? rows[0] : this.menu).focus();
  }
  // Closes and leaves focus where it is: for a press outside or focus that has moved on.
  hide() {
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', this.onOutside, true);
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
