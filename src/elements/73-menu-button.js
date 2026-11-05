// <sheen-menu-button label="Export"></sheen-menu-button>
//   A button with a menu. menu.items = [{id, label, disabled}]. Up and Down move and skip disabled items, Enter picks, Esc
//   closes; focus goes back to the button. Fires "sheen-menu-select" {id}.
class SheenMenuButton extends HTMLElement {
  connectedCallback() {
    if (this.menu) return;
    var self = this, menuId = uid('menu');
    this._items = this._items || [];
    this.button = h('button', { type: 'button', class: 'sheen-button', 'aria-haspopup': 'menu', 'aria-expanded': 'false', 'aria-controls': menuId, text: this.getAttribute('label') || '', onclick: function () { if (self.menu.hidden) self.open(); else self.close(); } });
    this.menu = h('div', { role: 'menu', id: menuId, class: 'sheen-menu sheen-glass', 'aria-label': this.getAttribute('label') || '' });
    this.menu.hidden = true;
    this.replaceChildren(this.button, this.menu);
    this.button.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); self.open(); }
    });
    this.menu.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); self.move(e.key === 'ArrowDown' ? 1 : -1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.activeElement.click(); }
      else if (e.key === 'Escape') { e.preventDefault(); self.close(); }
    });
    this.draw();
  }
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
    this.menu.classList.remove('sheen-menu-flip');
    var box = this.menu.getBoundingClientRect();
    if (box.left < 0 || box.right > window.innerWidth) this.menu.classList.add('sheen-menu-flip');
    var rows = this.rows();
    if (rows.length) rows[0].focus();
  }
  close() {
    this.menu.hidden = true;
    this.button.setAttribute('aria-expanded', 'false');
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
